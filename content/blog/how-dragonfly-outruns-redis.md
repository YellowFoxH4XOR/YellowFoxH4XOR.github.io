---
title: "How Dragonfly Outruns Redis — A Backend Engineer's Tour"
date: "2026-06-20"
excerpt: "Dragonfly serves millions of QPS on a single box where Redis caps around 100k. I read the source to find out which three decisions — and one fast-path trick — actually do the work."
tags: ["systems", "architecture", "performance", "databases", "cpp"]
---

I'd heard the claim enough times that I stopped believing it: a single Dragonfly
instance serves millions of commands per second on commodity hardware, where
Redis tops out somewhere around a hundred thousand. The usual explanation —
"it's multi-threaded" — didn't satisfy me. Multi-threaded in-memory stores have
been tried for twenty years, and most of them lose to Redis on latency, fall
over under contention, or both. So I went and read the source.

What I found is that Dragonfly's throughput isn't one trick. It's three
orthogonal design decisions that happen to compose, plus one optimization that
keeps the common case from paying for the machinery the hard cases need:

1. **Shared-nothing sharding** — the keyspace is split into N shards, one thread
   owns each, no mutexes on data.
2. **Fibers, not threads** — thousands of client connections per core, all
   cooperative, all non-blocking.
3. **io_uring for the I/O layer** — batched async syscalls integrated with the
   fiber scheduler.
4. **A VLL-based transaction model with an inline fast path** — multi-key
   atomicity when you need it, but most commands skip the coordination entirely.

I'll walk through each one, weave in how Redis and Valkey do it differently, and
finish by tracing a single `SET key val` all the way through the machine. The
source files are linked as I go — they point straight at the Dragonfly repo, so
you can open a tab and read along.

## Decision #1 — Don't share, and you don't need locks

The foundational decision. Dragonfly splits the keyspace into `N` shards, where
`N` is at most the number of threads. Each shard is owned by exactly one thread,
and that thread is the only one allowed to touch the shard's data structures.
No mutexes guard the hot path, because none are needed — there is no sharing.

This is the single thing that unlocks everything else. Once data isn't shared,
you don't need locks on the data path, and throughput scales roughly linearly
with cores. You can see it being set up in `EngineShardSet::Init` at
[`engine_shard_set.cc:106`](https://github.com/dragonflydb/dragonfly/blob/main/src/server/engine_shard_set.cc#L106):

```cpp
// engine_shard_set.cc:114 — trimmed
pp_->AwaitFiberOnAll([this](uint32_t index, ProactorBase* pb) {
  if (index < size_) {
    InitThreadLocal(pb);   // creates EngineShard on this thread's heap
  }
});
// ...then on each shard thread:
shard->StartPeriodicHeartbeatFiber(pb);
shard->StartPeriodicShardHandlerFiber(pb, shard_handler);
```

Every thread ends up with zero or one `EngineShard` it owns, plus a set of
connection fibers it will serve. The same thread can both handle I/O and own a
shard — there's no separate "I/O thread pool" vs "worker thread pool"
distinction. One thread, many fibers, one shard.

```
 single process, N threads — each owns one shard and the fibers serving it
 ┌────────────┬────────────┬────────────┬────────────┐
 │  Thread 0  │  Thread 1  │  Thread 2  │  Thread 3  │
 │  IO+shard  │  IO+shard  │  IO+shard  │  IO+shard  │
 ├────────────┼────────────┼────────────┼────────────┤
 │ conn A     │ conn C     │   ...      │   ...      │
 │ conn B     │ conn D     │            │            │
 │ heartbeat  │ heartbeat  │            │            │
 │ shard-queue│ shard-queue│            │            │
 │ DbSlice[0] │ DbSlice[1] │ DbSlice[2] │ DbSlice[3] │
 └────────────┴────────────┴────────────┴────────────┘
```

Redis goes the other way. It's single-threaded by design: one core does
all the work, in-memory operations are fast, and the simplicity gives you
predictable latency and free atomicity for multi-key commands. The ceiling is
one core's worth of throughput — call it ~100k QPS for non-pipelined commands on
a modern box (pipelining lifts both Redis and Dragonfly far past that; the
per-core number is the honest single-command figure). Valkey and
Redis 7 add I/O threading so parsing and socket writes happen on other cores,
but the *data model* stays serialized: only one thread touches the dict at a
time. You get more bytes pushed across the wire, but the command execution
engine is still one core.

Dragonfly's bet is the opposite: make the data model parallel, and accept the
cost that multi-key commands now need a coordinator. That cost is what decision
#4 deals with.

## Decision #2 — Fibers, not threads

If every client connection is going to run on one of N threads, you can't use a
real OS thread per connection. A few thousand connections × real threads means
context-switch overhead and stack memory that eats you alive. The answer is
**fibers**: lightweight, user-space coroutines that cooperatively yield to each
other on a single OS thread. Fiber stacks are ~40KB (see `kFiberDefaultStackSize`
in [`dfly_main.cc:165`](https://github.com/dragonflydb/dragonfly/blob/main/src/server/dfly_main.cc#L165)), switching is a function call, and there can be thousands
of them per thread.

A connection's entire life runs inside one fiber. You can see the entry in
`Connection::HandleRequests` at [`dragonfly_connection.cc:867`](https://github.com/dragonflydb/dragonfly/blob/main/src/facade/dragonfly_connection.cc#L867): TLS handshake,
HTTP detection, then the main `ConnectionFlow` loop that reads, parses,
dispatches, and replies — all in one fiber, all non-blocking.

The catch that bites people: fibers don't magically make blocking code
non-blocking. If a fiber calls `write(fd, buf, 1000000)`, or
`pthread_mutex_lock`, the *whole thread* stalls and every other fiber on it
freezes with it. This is why Dragonfly's `AGENTS.md` is blunt about it:
never `std::thread`, never `std::mutex`. The codebase uses fiber-friendly
primitives from the `helio` library — `util::fb2::Mutex`, `util::fb2::Fiber`,
`util::fb2::EventCount`, `util::fb2::CondVar`, `BlockingCounter` — all of which
yield the fiber instead of blocking the thread. (Dragonfly layers its own
fiber-aware types on top of these too, like `Transaction::BatonBarrier` for
blocking commands.)

Redis never has to think about any of this. Its single-threaded event loop
sidesteps the blocking-thread problem by not having parallelism at all: there's
one thread, one event loop, and every operation is non-blocking by construction.
Dragonfly wants parallelism *and* non-blocking, so it layers fibers on top of a
proactor (next section) and enforces the discipline through conventions and
primitives. It's more rope to hang yourself with as a contributor, but it's the
only way to get the throughput.

## Decision #3 — io_uring is the I/O layer

On Linux 5.10+, Dragonfly uses io_uring as its I/O backend. io_uring is a pair
of kernel-shared ring buffers for submitting and completing async syscalls —
you queue a `recv`, a `send`, an `accept` to the submission queue, the kernel
works through them, and completions land on the completion queue. No syscall
per operation, no mode switch per I/O, and you can batch.

Each Dragonfly thread runs one **proactor** that drives the fiber scheduler
*and* the io_uring ring in a single loop. Submit a batch of I/O, reap
completions, resume the fibers that were waiting on them, run ready fibers
until they block, repeat. A fiber blocked on `Recv` doesn't stall the thread —
the scheduler just runs another fiber. The integration between scheduler and
poll loop is the thing `helio` actually provides; it's not something you can
trivially assemble yourself from `boost::fibers` + liburing.

There's an optional zero-copy path too: per-thread buffer rings
(`RegisterBufRings` at [`dfly_main.cc:776`](https://github.com/dragonflydb/dragonfly/blob/main/src/server/dfly_main.cc#L776)) let the kernel place received data
directly into a shared buffer that the fiber reads from, no copy. It's behind a
flag and needs kernel 6.2+, but it's there for the throughput-obsessed.

On older kernels or macOS dev, Dragonfly falls back to epoll. You lose the
batching and zero-copy wins but the programming model stays identical — the
proactor abstraction hides the backend.

Redis, meanwhile, sticks with a traditional event loop (`epoll`/`kqueue`/`select`)
and one syscall per operation. That's fine at ~100k QPS on one core. At
millions of QPS across many cores, the syscall overhead and context switches
become real, and io_uring's batching is one of the levers Dragonfly pulls to
get there.

## Decision #4 — The trick that makes multi-key safe

This is the interesting one. Shared-nothing sharding is great until you need
`MSET k1 k2` where `k1` lives on thread 2 and `k2` lives on thread 4. How do you
get atomicity without a global lock?

Dragonfly's answer is adapted from a paper called [Very Lightweight
Locking (VLL)](https://www.cs.umd.edu/~abadi/papers/vldbj-vll.pdf). The model
works like this:

- A client connection fiber acts as the **coordinator** for each command it
  runs. The coordinator *never* touches shard data directly. Instead it sends
  **hop** callbacks to the relevant shard threads and waits for them to ack.
- Each shard has a **TxQueue**: a doubly-linked list of pending transactions,
  ordered by a globally-assigned monotonic `TxId`.
- Each shard has a **LockTable** of `IntentLock`s keyed by 64-bit key
  fingerprints. An `IntentLock` has shared and exclusive *counters* — they
  record how many queued transactions intend to read or write a key. They are
  **not** blocking locks; they don't stall the scheduling flow.
- A transaction runs in two phases: **schedule** (acquire intent locks on the
  keys, maybe insert into the TxQueue) → **execute** (run hop callbacks on each
  shard; on the final hop, release locks and dequeue).

So far, so 2012. The thing that makes Dragonfly fast is the optimization layered
on top: **single-shard, uncontended commands run the callback inline during
scheduling.** No TxId is allocated, no TxQueue insertion happens, the global
atomic counter is never touched. You can see this in `Transaction::ScheduleInShard`
at [`transaction.cc:1200`](https://github.com/dragonflydb/dragonfly/blob/main/src/server/transaction.cc#L1200) — the `OPTIMISTIC_EXECUTION` flag is set, the callback
runs, locks are acquired and released immediately, and the function returns.

This is the most important performance fact in the whole codebase: **the
majority of real Redis workloads are single-key commands on uncontended keys**,
which means the majority of commands never pay the coordination tax. They get a
single message dispatched to one shard, an inline callback, and done. The
global counter — which would otherwise be a contention point in an otherwise
shared-nothing design — stays off the critical path.

When a command *does* need ordering (multi-shard, or single-shard but
contended), it falls back to the full path: allocate a TxId, insert into each
shard's TxQueue, execute hops in parallel, wait on a `BlockingCounter`, release
on the final hop. There's also an out-of-order optimization: a transaction can
run ahead of its queue position if its keys are uncontended, and an inline
execution optimization that skips message dispatch entirely when the
coordinator fiber happens to be on the shard's own thread (gated on "the
callback won't suspend," which has historically been a source of subtle bugs
when new features violate it).

Redis, remember, gets multi-key atomicity for free from single-threading —
everything is atomic because nothing runs in parallel. Valkey's multi-threaded
mode still serializes commands against each other. Dragonfly buys strict
serializability *and* parallelism by making the common case skip the machinery
entirely and only paying for coordination when it's actually needed. The
[transaction docs](https://github.com/dragonflydb/dragonfly/blob/main/docs/transaction.md)
are the authoritative reference if you want the full algorithm.

## DashTable — a hash table built for the model

You can't just drop `std::unordered_map` into this design. Even though each
shard's table is only touched by one thread, a generic hash table isn't
cache-optimized for the access pattern, and segment-splitting under heavy load
is where generic implementations fall over.

Dragonfly's answer is **DashTable** (`src/core/dash.h`): cache-segmented,
open-addressed, with in-place segment splits. It's purpose-built for "one
thread hammers its own table, the table stays cache-friendly under that load,
and growth doesn't stall." The design doc is
[worth a read](https://github.com/dragonflydb/dragonfly/blob/main/docs/dashtable.md).

The values are `CompactObj` (`src/core/compact_object.cc`) — a tagged union
holding any Redis type: strings (with small-string optimization via
`SmallString`), lists (`QList`), sets (`StringSet`/`OAHSet`), hashes
(`StringMap`), zsets (`SortedMap` + `ScoreMap`), streams, JSON, search docs.
Memory is accounted per type, which is what lets `INFO` and the heartbeat
eviction logic do their jobs.

Redis' dict is a perfectly good hash table for one thread hitting it. DashTable
is built for the per-shard workload specifically. Neither is
magical; both are fit-for-purpose. Dragonfly's purpose just includes "N threads
each hitting their own table at millions of QPS."

## Life of `SET key val` — the payoff

Time to see all four decisions compose. Here's what happens when a client sends
`SET key val`:

1. **Accept.** A `Listener` accepts the socket and dispatches it to a proactor
   thread (round-robin, or by source IP for affinity). A `Connection` fiber is
   spawned on that thread.
2. **Parse.** `RedisParser` turns the RESP bytes into a `ParsedCommand`. The
   fiber enters `ConnectionFlow` ([`dragonfly_connection.cc:1241`](https://github.com/dragonflydb/dragonfly/blob/main/src/facade/dragonfly_connection.cc#L1241)), the
   recv→parse→dispatch→reply loop.
3. **Dispatch.** `Service::DispatchCommand` at [`main_service.cc:1430`](https://github.com/dragonflydb/dragonfly/blob/main/src/server/main_service.cc#L1430) looks up
   the `CommandId` for `SET` in the `CommandRegistry`, verifies state (ACL,
   cluster slot ownership, not in LOADING), and builds a `Transaction`.
4. **Schedule + execute (inline).** The coordinator figures out which shard
   owns `key` (`hash(key) % N`), sends a hop there. Keys uncontended → **inline
   fast path**: `DbSlice::AddOrFind` at [`db_slice.cc:687`](https://github.com/dragonflydb/dragonfly/blob/main/src/server/db_slice.cc#L687) inserts into the
   DashTable, the command's callback writes the `CompactObj` value, intent
   locks are acquired and released in one step. No TxId, no TxQueue, no global
   counter.
5. **Reply.** The coordinator unblocks, `RedisReplyBuilder::SendSimpleString("OK")`
   writes the RESP frame, the IoLoop flushes it to the socket.

On the fast path that's *one message to one shard, one inline callback, done.*
That's where the millions of QPS come from. For a multi-shard command like
`MSET k1 v1 k2 v2`, the coordinator allocates a TxId, schedules on both
shards, runs the hop in parallel across them, and waits on a `BlockingCounter`
until both ack — a few extra round-trips, but strictly serializable.

Here's the command registration pattern, which is the shape every Redis command
takes in the source — [`string_family.cc:1832`](https://github.com/dragonflydb/dragonfly/blob/main/src/server/string_family.cc#L1832):

```cpp
// string_family.cc:1832 — trimmed
*registry << CI{"SET", CO::JOURNALED | CO::DENYOOM | CO::NO_AUTOJOURNAL,
                -3, 1, 1}.SetAsyncHandler(...)
```

And the API a family handler actually calls to run a transaction —
[`transaction.h:195`](https://github.com/dragonflydb/dragonfly/blob/main/src/server/transaction.h#L195):

```cpp
// transaction.h:195 — trimmed
OpStatus ScheduleSingleHop(RunnableType cb);
```

That one call is what `SET`, `GET`, `HSET`, and friends boil down to. Everything
else in `*_family.cc` is parsing arguments and building the callback.

## The catch — what Dragonfly trades for this

I'd be selling this short if I skipped the trade-offs — and to its credit,
Dragonfly's own docs don't skip them either.

- **Multi-key cross-shard commands pay extra hops.** A `MSET` across two shards
  costs a schedule round-trip plus an execute round-trip, where Redis'
  single-threaded answer is instant. The trade is favorable because
  single-key commands dominate real workloads, but it's a trade.
- **Global commands serialize everything.** `FLUSHDB`, `SAVE`, `MOVE` run as
  "global transactions" that take the shard-level lock on every shard. Avoid
  them in hot paths.
- **Linux-first.** io_uring wants kernel 5.10+ (6.2+ for the zero-copy buffer
  rings). macOS is dev-only. The epoll fallback works but loses the batching
  and zero-copy wins.
- **The inline-execution rule is a footgun for contributors.** Inline execution
  skips message dispatch by running the callback on the coordinator fiber —
  but only if the callback won't suspend. Every time a new feature adds a
  preemption point to a shard callback (journal callbacks, DbSlice change
  callbacks, loading state), inlining has to be disabled or correctness breaks.
  The transaction docs flag this explicitly as a recurring source of design
  bugs.

Why the trade is worth it: real workloads are dominated by single-key commands
on uncontended keys, so you trade a small per-multi-key cost for near-linear
scaling across cores. For most cache and store workloads, that's a great deal.
