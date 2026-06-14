---
title: "When to Use an LLM Agent vs Plain Code"
date: "2026-04-14"
excerpt: "Agents add latency, non-determinism, and real cost per run — so plain code is the default. Here's the decision framework I actually use."
tags: ["ai", "agents", "llm", "architecture"]
---

Every few months I see a team rewrite a deterministic ETL pipeline as a multi-agent
system, spend three weeks debugging it, then quietly rewrite it back. The problem
isn't that agents are bad. The problem is that agents are expensive to run, hard
to reason about, and almost always over-applied.

So before anything else, let's name the cost. An LLM call adds latency (tens to
hundreds of milliseconds at best), burns tokens on every invocation, and produces
output you can't predict run-to-run. A *chain* of calls multiplies all of that.
Any time you reach for an agent, you're signing up for non-determinism,
harder debugging, and a bill that scales with traffic. The bar to clear should
be high.

## The default is plain code

If you can enumerate the steps, write the branches. Ordinary code is fast,
testable, and free to run. Even where natural language is involved, a single
constrained LLM call — structured output, one round trip — is almost always
better than a loop with tools. The mechanics of keeping models
contained come down to one rule: the model
interprets, code decides.

"But what if the user input is complex?" Structure it. Give the model an enum and
a JSON schema, validate the response, and hand a typed value to your pipeline.
That's a call, not an agent. Most classification and extraction tasks live here.

## When an agent actually earns its place

There's a narrower class of problems where agents are the right tool, and the
signal is usually one of three things:

**The task space is open-ended and you can't enumerate the steps up front.** If
you genuinely don't know at write-time what sequence of actions will reach the
goal — because the right path depends on what the environment looks like at
runtime — then iterative planning earns its cost. Code-generation with
test-and-fix loops, research tasks that branch on what's found, automated
debugging where the next step depends on the previous error: these are real
agent problems.

**Success requires combining multiple tools across iterations.** A single call
can invoke a tool. An agent loops: call a tool, read the result, decide what to
call next, loop. If your task genuinely needs that feedback loop — not just
parallel API calls that could be dispatched deterministically — an agent is the
natural fit.

**The input is ambiguous enough to need interpretation at each step.** When a
user's intent can only be resolved against live context (the state of a document,
a code repository, an external system), and that context shapes what the next
action should be, you have a case for agentic behavior. The model's ability to
read context and plan is the point.

## The checklist

Before reaching for an agent framework, I run through this:

- [ ] Can I enumerate the steps at write-time? → Write the steps. No agent.
- [ ] Is this one call with structured output? → One call. No agent.
- [ ] Does the next action depend on the result of the previous one in a way I
      can't pre-code? → Agent is worth considering.
- [ ] Does the task require tool use + planning + multiple iterations to
      reach an open-ended goal? → Agent is the right fit.
- [ ] Do I need this to be reproducible, cheap, and fast? → Plain code wins. If
      you need a model, reach for [routing between LLMs](/blog/llm-model-routing-budget)
      to keep cost down instead of adding agentic complexity.

## A caution on multi-agent systems

[LangChain's State of Agent Engineering report](https://www.langchain.com/state-of-agent-engineering)
notes that multi-agent architectures are the fastest-growing pattern in production
deployments. I'd read that as a warning, not a recommendation.

Most problems don't need a swarm. Coordinator agents, sub-agents, review agents —
every hop adds latency, multiplies token cost, and introduces another surface where
things go wrong silently. When a multi-agent chain fails, you usually have no good
stack trace, no single point to instrument, and a context window full of
intermediate steps you have to manually reconstruct to debug.

A single well-scoped agent almost always beats an orchestra you can't observe. If
you do need multiple agents, treat it as a systems architecture problem: explicit
message contracts between agents, observable intermediate states, and a way to
replay or short-circuit a step when it goes wrong. The same discipline you'd apply
to a distributed system applies here, but the failure modes are weirder because the
components are probabilistic.

[Firecrawl's writeup on agentic AI trends](https://www.firecrawl.dev/blog/agentic-ai-trends)
makes a point I agree with: the teams getting reliable results from agents aren't
the ones with the most agents, they're the ones with the tightest tool definitions
and the clearest success criteria per run.

## The two levers that make agents affordable

If you've decided an agent is justified, two things determine whether it stays
affordable:

**Routing.** Not every step in a loop needs the most capable (and expensive) model.
A cheap, fast model handles the easy hops; you escalate to a larger one only when
complexity demands it. [Routing between LLMs](/blog/llm-model-routing-budget) is
the single biggest cost lever I've found in production agent work.

**Tight tool definitions.** The tighter the tool surface an agent can call, the
fewer bad paths it can take, and the cheaper each iteration is. An agent with ten
narrow, well-typed tools costs less and misbehaves less than one with three broad,
open-ended tools. If you find yourself giving an agent shell access or a generic
HTTP call, treat that as a smell.

## The summary

Agents are a real pattern for a real class of problems. They're not a better
version of plain code — they're a different tradeoff: more capable on open-ended
tasks, more expensive everywhere else. Default to code. Use one constrained LLM
call when you need language understanding. Reach for an agent only when the task
genuinely needs iterative planning over live context. And when you do build one,
keep it single-agent until you have a concrete reason to split it.

The same principle holds even
inside an agentic system: let the model plan and interpret, let deterministic code
enforce the side effects. The boundary between probabilistic and deterministic is
where reliability lives, whether you're using one call or twenty.
