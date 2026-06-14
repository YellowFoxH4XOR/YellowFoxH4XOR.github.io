---
title: "Python or Go? How I Actually Choose for a Backend Service"
date: "2026-01-27"
excerpt: "A practical decision framework from shipping real services in both — concrete tiebreakers most teams underweight before they're forced to care."
tags: ["python", "go", "backend", "architecture"]
---

I've built services in both Python and Go in production. Not toy repos — actual systems
handling real traffic, owned by real teams, with on-call rotations behind them. The
question "which one?" comes up constantly, and the honest answer is: it depends, but not
on the things most people argue about.

Here's how I actually decide.

## The question nobody asks first: what is the service's main job?

Before language ergonomics, before ecosystem, before team opinion — what does this service
spend most of its time doing?

If the answer is **transforming data, calling AI APIs, gluing ML models together, or
handling I/O-bound traffic where latency tolerance is moderate** — Python is almost always
the right default. FastAPI with asyncio genuinely handles thousands of concurrent
connections with code that a junior engineer can read and modify without six months of
ramp-up. The RAG pipelines and LLM agent services I've built at CBA India live here.
Reaching for the AI ecosystem in Python means dependencies that actually exist, are
maintained, and have documentation. Reimplementing LangChain or LlamaIndex in Go would be
a second full-time job with no business justification.

If the answer is **processing a high volume of events under strict latency constraints,
serving thousands of concurrent connections with predictable tail latency, or shipping a
self-contained binary that runs in a constrained environment** — Go earns its complexity
tax fast. I chose Go for a high-volume event pipeline
that was pushing ~100k events per day and needed sub-200ms end-to-end with predictable
p99 behavior. Python asyncio would have gotten close, but goroutines gave me a concurrency
model that reasoned about clearly, and the single-binary deploy cut the operational surface
area to almost nothing.

## The tiebreakers people underweight

Most language debates fixate on benchmarks. The real tiebreakers are operational.

**Team familiarity is not a soft consideration.** A service owned by engineers who've never
debugged a goroutine leak or wired up a Go HTTP middleware chain will have a worse
production track record than an identical service in the language they know well. The
language doesn't hold the pager — the team does. If your team writes Python every day, the
Go service needs a compelling reason to exist.

**The library ecosystem is the whole point for AI/data work.** The
[Pragmatic Engineer's 2026 AI tooling survey](https://newsletter.pragmaticengineer.com/p/ai-tooling-2026)
makes this clear: the most widely used AI infrastructure is Python-first, and often
Python-only. Choosing Go for a service that integrates with vector databases, embedding
models, and LLM SDKs means you're either wrapping Python subprocesses or maintaining your
own bindings. Neither is a win.

**Go's operational simplicity is genuinely underrated.** No virtual environments, no
dependency hell, no runtime version mismatches between dev and prod. A Go binary ships as
a single file. Container images are small. Startup time is near-instant, which matters
enormously for serverless and for services that scale to zero. I've wrestled with Python
packaging on more than one deploy; Go's toolchain makes that class of problem essentially
disappear.

**Concurrency model matters at scale, not just throughput.** Python asyncio is
cooperative — one stalled coroutine can hold up the event loop. Go goroutines are
preemptive, and the scheduler handles them correctly by default. For a service where a
slow downstream call is a common case rather than an edge case, that difference shows up
in your tail latency. It also showed up in database performance work,
where the Go service's predictable scheduling made profiling much easier — what you measure
is what's actually happening.

**Hiring shapes long-term maintainability.** Python engineers are abundant and their
range is wide — data, backend, DevOps, ML. Go engineers are more specialized. If the team
will grow, Python lowers the hiring bar without lowering the quality bar for most backend
work.

## Where each language earns its place

Reach for **Python** when:
- The service integrates with ML, AI, or data tooling as its primary job
- Rapid iteration is more important than maximum throughput
- The team is already Python-fluent
- I/O-bound workloads where asyncio's concurrency model is sufficient

Reach for **Go** when:
- You need high, predictable throughput with strict p99 targets
- Heavy concurrency where goroutines' scheduling model gives you clarity
- Single-binary deploys matter — serverless, edge, resource-constrained infra
- The service has a long lifetime and a small, stable API surface

Neither language wins on code aesthetics alone. Both have rough edges. Python's typing
story in production is still a headache at the edges of complex type hierarchies. Go's
verbosity is real — error handling by hand, no generics until recently, interfaces
that are structural but not explicit. These are real tradeoffs, but they're secondary to
the operational context the service lives in.

## If you're genuinely unsure, default to Python

Here's my actual stance: if you can't articulate a concrete reason Go serves this specific
service's requirements — throughput numbers, latency targets, deploy constraints — write it
in Python. FastAPI is genuinely excellent. asyncio handles I/O concurrency well enough for
most backend services. The AI and data ecosystems are Python-native and that's not
changing in the near term.

Go is the right choice when you know what problem it's solving. Python is the right choice
when you don't yet know which problems you'll have. Ship the service, measure it, and
revisit if you hit the ceiling — which, for most services, you never will.
