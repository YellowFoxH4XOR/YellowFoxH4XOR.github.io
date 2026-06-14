---
title: "Cutting PostgreSQL Query Latency on a Reporting Endpoint"
date: "2026-02-17"
excerpt: "A slow reporting endpoint, a missing composite index, an unsargable predicate, and what EXPLAIN ANALYZE actually told us — a debugging walkthrough."
tags: ["postgres", "backend", "performance", "systems"]
---

The alert wasn't dramatic. P95 latency on a reporting endpoint crept from 180ms
to over 900ms across several weeks. No deployment happened. Traffic grew, data
grew, and the query that was fast in staging quietly fell apart under real load.
That's usually how it goes.

This is the loop we ran to cut data-retrieval time by roughly 30%.

## Measure first — don't guess

The worst thing you can do when a query is slow is immediately reach for an
index. Nine times out of ten the engineer who already tried that made the wrong
one, and now the table has an index nobody uses and the query is still slow.

We pulled the slow query log (log_min_duration_statement = 200 in our case) and
found the offender inside two minutes. It was a reporting endpoint that filtered
on `created_at`, `region_id`, and `status`, then sorted and paginated the
results. Nothing exotic. But it was doing it on a table with tens of millions of
rows.

Before touching anything, we captured the baseline: wall-clock time from the
application, plus the raw query in psql for the next step.

## Read the plan — EXPLAIN (ANALYZE, BUFFERS)

I've seen teams spend hours hypothesising about indexes when they haven't read a
single query plan. [PostgreSQL's EXPLAIN documentation](https://www.postgresql.org/docs/current/using-explain.html)
covers the flags, but the short version: `EXPLAIN (ANALYZE, BUFFERS)` runs the
query for real and tells you where time and I/O actually went.

The plan on this query looked roughly like this:

```
Gather  (cost=... rows=... width=...) (actual time=1240.3..1243.1 rows=500 loops=1)
  ->  Sort  (cost=... rows=...) (actual time=1239.4..1239.5 rows=500 loops=1)
        Sort Key: created_at DESC
        Sort Method: external merge  Disk: 18432kB
        ->  Seq Scan on events  (cost=... rows=...) (actual time=0.1..980.6 rows=2140000 loops=1)
              Filter: ((status = 'active') AND (region_id = 7) AND (date_trunc('day', created_at) = '2026-01-15'))
              Rows Removed by Filter: 19860000
```

Three problems announced themselves in that output:

1. **Sequential scan** across 22 million rows, discarding 19.8M of them.
2. **Sort spilling to disk** — 18 MB of temp space. The query had no index to
   pre-sort and was doing it in memory until it ran out.
3. **Unsargable predicate**: `date_trunc('day', created_at) = '2026-01-15'`.
   Wrapping a column in a function makes it opaque to the planner — it can't
   walk a btree index on `created_at` when you've applied a transform to it.

## The culprits in detail

### Missing composite index

We had a single-column index on `created_at`. Useful for range scans in
isolation, useless when the planner also needs to filter on `region_id` and
`status` in the same pass. [Use The Index, Luke](https://use-the-index-luke.com/)
covers this well: column order in a composite index matters. You put the
equality predicates first (the columns with low cardinality that you always
filter on), then the range or sort column last.

```sql
CREATE INDEX CONCURRENTLY idx_events_region_status_created
  ON events (region_id, status, created_at DESC);
```

`CONCURRENTLY` because the table was live and we weren't taking a maintenance
window for an index build.

### Unsargable predicate

`date_trunc('day', created_at) = '2026-01-15'` needed to become a range:

```sql
-- Before
WHERE date_trunc('day', created_at) = '2026-01-15'

-- After
WHERE created_at >= '2026-01-15 00:00:00'
  AND created_at <  '2026-01-16 00:00:00'
```

Same semantic, but now the planner can use the index to seek directly to the
range boundary instead of evaluating the function on every row. Small change,
large impact.

### N+1 from the ORM

While we were in the code, we noticed the ORM layer was issuing a separate query
per row to fetch a related `user` record — classic N+1. For a page of 50 rows,
that was 51 queries. We replaced it with a single joined fetch. This wasn't the
dominant cost, but it was free to fix and visible in the application traces.

### Stale planner statistics

We ran `ANALYZE events` after the index was in place. The planner's row-count
estimates were wildly off (it guessed ~8000 rows for a predicate that actually
matched 2.1 million), because autovacuum hadn't caught up with the write volume.
An explicit `ANALYZE` refreshed the statistics immediately. Without it the
planner might still have chosen the sequential scan even with the index
available.

## The after plan

After the composite index, the predicate rewrite, and `ANALYZE`:

```
Index Scan using idx_events_region_status_created on events
  (cost=... rows=... width=...) (actual time=0.2..8.7 rows=500 loops=1)
  Index Cond: ((region_id = 7) AND (status = 'active')
               AND (created_at >= '2026-01-15 00:00:00')
               AND (created_at <  '2026-01-16 00:00:00'))
```

No sequential scan, no disk sort. Data retrieval dropped from ~980ms to ~67ms
in the query plan, and P95 at the endpoint fell from 900ms to around 620ms once
we also fixed the pagination.

### Keyset pagination instead of OFFSET

The endpoint was using `LIMIT 50 OFFSET 5000`. At large offsets Postgres still
has to read and discard the first 5000 rows before returning yours. We switched
to keyset (seek) pagination — passing the last seen `created_at` and `id` as
cursor values and filtering on them directly:

```sql
WHERE region_id = 7
  AND status = 'active'
  AND created_at >= '2026-01-15 00:00:00'
  AND created_at <  '2026-01-16 00:00:00'
  AND (created_at, id) < (:last_created_at, :last_id)
ORDER BY created_at DESC, id DESC
LIMIT 50
```

That removed the offset overhead entirely for the deep pages that were
responsible for the worst tail latency.

## The tradeoff you can't skip

Every index you add taxes writes. An insert into `events` now has to update the
composite index as well as the table. For a write-heavy table you pay for this
on every insert, update, and delete. We have other tables where we made the
deliberate call not to add an index because the write rate didn't justify it.

The discipline: add indexes one at a time, verify with `EXPLAIN (ANALYZE,
BUFFERS)` that the planner actually uses them, and re-measure at the application
level. An index the planner ignores is just write overhead.

## The loop that actually works

Measure → EXPLAIN → one change at a time → re-measure. That's it. Not "add an
index and hope" and not "rewrite the query from intuition." Read the plan. The
plan tells you what's wrong.

The same careful approach applies when you're choosing the technology underneath
the data layer — if you're weighing [Python or Go for a backend service](/blog/python-or-go-backend),
the read/write access patterns on your database should be part of that decision.
And if you're dealing with high-volume event streams that feed into reporting
tables like this one, the design of the upstream event pipeline
shapes what your queries even look like at the end of the chain.
