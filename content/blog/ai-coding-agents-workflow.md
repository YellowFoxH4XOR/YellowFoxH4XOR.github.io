---
title: "Two AI Coding Agents, Not One: How I Actually Ship"
date: "2026-05-26"
excerpt: "Most engineers now run Cursor and Claude Code in parallel — here's how I split the work between them, and why code-review discipline matters more than ever."
tags: ["ai", "tools", "productivity", "engineering"]
---

A year ago I ran one AI coding tool. Today I run two, simultaneously, on almost
every feature I ship. That's not redundancy — it's how the workflow actually
fits together.

I'm not alone in this. A [recent survey of AI coding tool usage in
2026](https://www.aibuilderclub.com/blog/best-ai-coding-agent-2026) puts Claude
Code at the top of the most-loved agent list at around 46%, while roughly 65%
of working engineers report using two AI tools daily. The Cursor + Claude Code
combination self-reports the highest productivity numbers of any pairing. That
matches my experience, and I think I understand why — the two tools operate at
fundamentally different altitudes.

## Two altitudes of work

Here's the mental model I've settled on: Cursor lives at the line level, Claude
Code lives at the feature level.

Cursor is where I spend most of my keystrokes. Tab-completion that actually
understands context, inline edits that land cleanly, quick refactors on the
function in front of me. The feedback loop is measured in seconds. I'm steering
the ship and Cursor is handling the rigging — it makes me faster without
changing who's making decisions.

Claude Code is different. I open it when I need something done across five files
at once: wire up a new endpoint end-to-end, scaffold a service layer, migrate a
schema and update all the callers. The unit of work is a feature slice, not a
line. One turn of the conversation can do what would take me thirty minutes of
jumping between files. The iteration cycle is slower per turn, but the
throughput per turn is dramatically higher.

The mistake I see is people trying to use one tool for both altitudes. They ask
Claude Code to autocomplete inline and get frustrated by latency. Or they ask
Cursor to implement a whole feature and get something that half-works in the
file they're looking at but misses everything it touches upstream. Matching the
tool to the altitude of the task is the unlock.

## The part people skip: you own every line

This is where I want to push back on the default posture I see around AI
coding tools. The productivity gains are real — I'm not arguing otherwise — but
there's a mental model that treats agent output as "done" when it compiles. That
model will eventually hurt you.

I treat every agent-generated PR the same way I'd treat a PR from a talented
but junior engineer. That means:

- **I read the diff.** All of it. Not skimming for obvious errors — actually
  reading it. The agent confidently writes code I can't defend in a review, and
  that code becomes my problem the moment I merge it.
- **I don't merge what I can't explain.** If I look at a block the agent wrote
  and I can't articulate what it does and why it's correct, it doesn't ship. I
  ask the agent to explain it, or I rewrite it myself.
- **I keep diffs small.** The bigger the agent's output, the harder the review.
  I give Claude Code bounded tasks — not "implement the whole auth flow," but
  "add the token refresh endpoint and its tests." Smaller scope means I can
  actually verify the output.

[Pragmatic Engineer's coverage of AI tooling in
2026](https://newsletter.pragmaticengineer.com/p/ai-tooling-2026) makes a point
worth repeating: the productivity ceiling for AI-assisted coding correlates
strongly with the engineer's ability to critically review the output. The tool
amplifies what you already bring.

## Where agents fail

I've seen all of these, usually on a Friday:

**Confidently wrong refactors.** The agent restructures something that looked
redundant but was load-bearing — a timeout value, a retry boundary, a specific
error type that a caller catches. The code looks cleaner. It's wrong. Tests
catch this sometimes; production catches it the rest of the time.

**Silent scope creep.** You ask for one thing and the agent also "improves" two
adjacent functions while it's in the file. Sometimes that's fine. Sometimes it
introduces a subtle behavior change in code you weren't thinking about.

**Plausible-but-broken edge cases.** The happy path works perfectly. The edge
case where input is empty, or the network is slow, or the transaction rolls
back — the agent writes something that looks right and isn't. Tests that only
cover the happy path don't catch it.

My guards against these: small tasks with clear acceptance criteria, tests
written before or alongside (not after), and actually running the thing before I
declare it done. Not revolutionary. Just discipline.

## Who benefits, and who doesn't

These tools are a genuine multiplier if you already have a clear picture of what
"good" looks like. If you know the correct design before you start, the agent
gets you there faster. If you can spot a wrong refactor on sight, you catch it
before it ships. The value of the tool is proportional to the value you bring
to reviewing its output.

They're a liability if you don't. An engineer who can't evaluate the output
can't catch the bugs the agent introduces, and those bugs are less obvious than
the ones they'd write themselves — because agent code often looks polished. The
code passes review, accumulates, and eventually bites someone.

This connects to something I wrote about [when to use an agent vs plain
code](/blog/llm-agent-vs-code): the agent is a powerful component, but it
still needs a senior engineer deciding what to build and verifying what came
out. Same principle applies when the agent is writing your backend as when it's
running inside it.

The two-tool setup — Cursor for the fast loop, Claude Code for the heavy
lift — is the current answer to shipping more without shipping garbage. But the
discipline around reviewing output is what makes the difference between
a multiplier and a mess. That part's still on you, the same way it always was
when choosing between [Python or Go for a backend service](/blog/python-or-go-backend):
the tool doesn't make the call, you do.
