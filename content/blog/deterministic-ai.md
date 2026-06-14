---
title: "Deterministic AI: Let the Model Interpret, Let Code Decide"
date: "2026-06-14"
excerpt: "The reliable way to ship LLM features isn't a better prompt — it's shrinking the model's job until everything around it is plain, testable code."
tags: ["ai", "llm", "systems", "architecture"]
---

I keep coming back to one rule when I put an LLM into a production service: the
model should be the smallest replaceable part of the system. A
[Zapier piece on deterministic AI](https://zapier.com/blog/deterministic-ai/)
nudged me to write down why — because it names the thing a lot of teams stumble
into the hard way.

## The problem isn't intelligence, it's repeatability

A function is deterministic if the same input always produces the same output.
That's the property every backend engineer quietly relies on — it's what makes
code testable, debuggable, and safe to retry. LLMs break it by design. Same
prompt, same model, and you can still get a different answer because the thing
is sampling from a distribution, not executing logic.

For a brainstorm, that variance is the feature. For a workflow that approves a
refund, routes a ticket, or writes to a database, it's a liability. You can't
write a meaningful test against a component whose output you can't predict, and
you can't explain a decision to an auditor when the reasoning changes run to
run.

So the goal isn't to make the model deterministic. It's to make the *system*
deterministic, with a probabilistic model contained inside it.

## Interpret, structure, enforce

The pattern that's held up for me has three phases, and only the first one
touches the model:

1. **Interpret** — the LLM reads something messy a human wrote (an email, a
   support message, a free-text form) and turns it into structured signals.
2. **Structure** — you pin that interpretation to a schema and validate it.
   Now it's data, not prose.
3. **Enforce** — ordinary deterministic code takes that data and decides what
   actually happens.

The model never *decides*. It *informs* a decision that plain code makes. If
you can draw a line in your architecture where the LLM's output stops being
language and becomes a typed value, everything downstream of that line is
testable the way it always was.

## Where this lands in a backend

Concretely, the moves I reach for:

- **Constrain the output, not just the prompt.** Force structured output — a
  JSON schema, a tool/function signature, an enum of allowed actions — and
  validate it. A free-text answer you then parse with a regex is a bug waiting
  for a Friday. An enum the model has to choose from collapses an infinite
  output space into a handful of branches you can actually cover with tests.

- **Don't let the model route.** It's tempting to ask the LLM "which of these
  20 things should we do?" Classification, fine. But the dispatch itself —
  picking the handler, calling the API, writing the row — belongs in code,
  because that's the part that has to be right every single time.

- **Make side effects idempotent.** A non-deterministic component upstream
  means retries are inevitable. If the LLM hiccups and you re-run the chain,
  the deterministic layer should produce the same write, not a second refund.

- **Keep the model's blast radius small.** The narrower the slice of work you
  hand it, the easier it is to swap models, add a cheaper one for the easy
  cases, or fall back to a rule when confidence is low. A small,
  well-bounded model call is a dependency you control. A model that orchestrates
  your whole flow is a dependency that controls you.

## Agents discover, systems decide

None of this is anti-AI. The interpretation step is genuinely hard and the
models are genuinely good at it — pulling intent out of a paragraph, sorting
ambiguous input, summarizing a thread. That's where the leverage is. The
mistake is letting that same probabilistic step also own the irreversible
action at the end.

The version that ships and keeps working tends to look the same: an agent
discovers and recommends, deterministic code decides and executes, and there's
a clean, typed boundary between the two. Put the intelligence where you need
judgment. Put everything you need to *trust* in code.
