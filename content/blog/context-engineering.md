---
title: "Context Engineering Is the New Prompt Engineering"
date: "2026-02-03"
excerpt: "Prompt engineering tunes the question; context engineering controls what tokens the model even sees — and the job is keeping that set ruthlessly small."
tags: ["ai", "llm", "context-engineering", "agents"]
---

There's a shift happening in how people think about wrangling LLMs, and it's
overdue. For a while the dominant mental model was: if the model gives you the
wrong answer, you need a better prompt. Tweak the wording, add a system message,
sprinkle in some chain-of-thought. That's prompt engineering — optimizing the
question.

Context engineering is different. It's not about the question. It's about the
conditions under which the model answers: which tokens are in the window, in what
order, and why. And the counterintuitive discovery you hit fairly quickly when
you build real RAG pipelines or multi-step agents is that *more context is almost
always worse*.

## Context rot is real

The empirical picture is uncomfortable. Models degrade in correctness well before
they hit their advertised context limits — correctness drops noticeably in the
low tens of thousands of tokens, not at 128k or wherever the spec says the
ceiling is. On top of that, the ["lost in the middle"
effect](https://arxiv.org/abs/2307.03172) is well-documented: information buried
in the middle of a long context gets systematically underweighted compared to
content at the start or end. You can stuff a 60-page document into the window and
the model will coherently ignore the page that mattered.

This means the job is not "how do I fit more in?" The job is "what is the minimum
set of high-signal tokens for this exact step, and how do I select them
reliably?"

That's an engineering discipline, not a prompting trick. [Agentic systems in 2026
are increasingly built around this idea](https://thenewstack.io/5-key-trends-shaping-agentic-development-in-2026/) —
that the orchestration layer's primary responsibility is context management, not
just tool dispatch.

## What this looks like in practice

When I'm building a RAG pipeline, the naive version retrieves the top-k chunks
by similarity score and concatenates them before the query. It works well enough
in demos. In production, it falls apart because similarity is a proxy for
relevance, not relevance itself, and concatenating chunks from five different
sections of a document produces a context that looks comprehensive and reads like
noise.

The discipline I've landed on:

**Retrieval followed by reranking, not retrieval alone.** Embed-and-fetch gets
you candidates. A cross-encoder reranker — or a lightweight LLM call that scores
candidates against the actual query — cuts the set down to the genuinely relevant
few. You're paying a small latency penalty to prevent the model from drowning in
marginally-related text. Worth it every time.

**History compaction instead of raw transcript replay.** In agents that span
multiple turns or tool calls, the naive approach is to carry the full message
history forward. The session grows, the model's attention spreads thin, and by
turn fifteen it's forgetting what it decided in turn three. Summarizing completed
steps — a compressed "what we established" rather than the raw exchange — cuts
token count while preserving the semantically dense parts. This is analogous to
how you'd compress a call stack: you care about the current frame and the return
addresses, not every intermediate expression.

**Structured context over prose.** A paragraph explaining a user's subscription
status and billing history is more expensive and less reliable than a small JSON
object with the same fields. The model can attend to key-value pairs more
predictably than it can parse embedded facts from a narrative paragraph. This is
especially true when you're injecting tool results or database lookups — returning
structured data and letting the model reason over it beats pre-narrating what the
data means.

**Treat retrieval as a conditional policy, not a fixed pipeline.** Different
steps in an agent workflow need different context. A step that's classifying
intent needs the user's message and maybe recent history. A step that's drafting
a response to a refund request needs the transaction record, the policy excerpt,
and the user's prior contacts — not the entire help center. Pulling context
conditionally based on what the current step actually requires is the difference
between a focused worker and one who reads the whole company wiki before answering
each email.

## The analogy that stuck

The mental model I find most useful: treat the context window the same way you
treat a function's input surface. A function that takes 40 parameters is hard to
reason about, hard to test, and almost always doing too many things. A function
that takes three well-typed inputs and does one thing is legible. The model's
context window is its input surface. Keep it small for the same reasons.

This connects to how I think about [making RAG testable](/blog/testable-rag-python) — if
your retrieval step is pulling 30 chunks every time regardless of the query,
you've made the system's behavior nearly impossible to pin down in a test. Narrow
the input surface and you narrow the behavior space. Both things get easier at
once.

It's also related to [when to reach for an agent versus plain code](/blog/llm-agent-vs-code).
A lot of the "my agent hallucinates" problems I've seen aren't model quality
issues — they're context quality issues. The agent has accumulated twelve turns of
mixed tool outputs, user corrections, and intermediate reasoning, and the model is
doing its best with a window full of conflicting signals. The fix isn't a smarter
model. It's a cleaner context.

## The discipline that's emerging

[What's becoming clear](https://thenewstack.io/5-key-trends-shaping-agentic-development-in-2026/)
is that context engineering is where a lot of the real leverage sits in 2026. The
models themselves are good enough for most tasks. The thing that separates a
production system from a demo is whether the orchestration layer reliably delivers
the right tokens — and only those tokens — to each call.

This is plumbing work. It doesn't have the glamour of fine-tuning or the
impressiveness of a long system prompt. But it's where I spend most of my time on
agent infrastructure, because it's the work that determines whether the model
behaves consistently or just sometimes. And consistent is the only version that
ships.
