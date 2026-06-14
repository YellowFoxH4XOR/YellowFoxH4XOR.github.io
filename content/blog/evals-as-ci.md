---
title: "Evals as CI: Catching Agent Regressions Before They Ship"
date: "2026-05-05"
excerpt: "LLM features rot silently — a prompt tweak or model upgrade quietly breaks a case you fixed weeks ago. The fix: run evals in CI like tests."
tags: ["llm", "evals", "agents", "testing"]
---

There's a class of bug I've come to dread more than a null pointer or a missing
index. It's the quiet one: a retrieval tweak that quietly drops answer quality
on medical disclaimers, a model upgrade that starts hallucinating entity names
it used to handle cleanly, a prompt refactor that regresses a workflow nobody
noticed until a user complained two weeks later. No stack trace. No alert. Just
a slow erosion in what the system actually does.

LLM features rot silently, and the standard "it works on my test prompt" bar
does nothing to catch it. The fix I've landed on — and now won't ship without —
is treating evals like tests and wiring them into CI.

## The lab-vs-prod gap is real and measured

The naive loop is: run a benchmark, hit a good number, ship. [Kili Technology's
breakdown of AI benchmarks](https://kili-technology.com/blog/ai-benchmarks-guide-the-top-evaluations-in-2026-and-why-theyre-not-enough)
makes the problem concrete: the models that dominate MMLU and HELM often
underperform in real deployments because benchmarks reward clean, templated
inputs. Your users send fragmented queries, multi-intent messages, and edge
cases the benchmark authors never thought of.

The gap isn't theoretical. On one project I inherited, retrieval F1 was solid
on the evaluation set, but 30% of live sessions ended with the agent refusing
to answer or citing the wrong document — because the benchmark queries were
well-formed and the real ones weren't. The benchmark was a confidence trap.

## Build a golden dataset from production traces, not vibes

The eval suite is only as good as its inputs. What I've started doing:

- Pull real user sessions from production logs, strip PII, label the ones that
  represent distinct intents.
- Add the hard cases: the refusals that shouldn't have been, the hallucinations
  that slipped through, the format failures from previous incidents.
- Include boring successes too — regressions often come from the model
  over-fitting to edge cases you added and quietly breaking the common path.

I aim for ~200 cases that cover the distribution I actually see, not the
distribution I wish I had. Anything curated from vibes drifts toward what the
author finds interesting, not what users actually do.

## Five rubrics that carry most of the signal

You don't need fifty metrics. These five cover most failure modes I've hit:

- **Faithfulness** — is the answer grounded in the retrieved context, or did
  the model confabulate something plausible-sounding? For RAG features, this
  is usually the first place things go wrong.
- **Task completion** — did the user's actual goal get met? Not just "did the
  agent produce text" but "would the user have needed to follow up?"
- **Refusal handling** — did the agent refuse when it shouldn't have (over-
  refusal tanks utility) or answer when it should have declined (under-refusal
  is a safety issue)? Both directions matter.
- **Safety** — did the output avoid harmful content? For most enterprise
  deployments this is table stakes.
- **Completeness** — did the response cover all the parts the user asked for,
  or did it silently drop one leg of a multi-part question?

These aren't equally weighted for every product. For an internal tool, task
completion and completeness dominate. For a consumer-facing agent, refusal
handling and safety move up. Know which rubrics your product actually cares
about and tune the thresholds accordingly.

## Three levels of assessment

There's a useful hierarchy in [the MLflow guide on production-ready
agents](https://mlflow.org/articles/building-production-ready-ai-agents-in-2026/):
evaluate at the right altitude or you'll fix the wrong thing.

- **End-to-end** — did the task succeed? This is the user-facing signal. High
  failure rate here means something is broken; it doesn't tell you what.
- **Trajectory** — was the path sound? Did the agent call the right tools in
  the right order, or did it take three unnecessary retrieval hops before
  answering? Trajectory evals catch inefficiency and tool misuse that
  end-to-end success can mask.
- **Component** — which retriever, which sub-agent, which prompt step is the
  actual failure point? This is where you go after end-to-end flags a problem.

I run end-to-end in CI on every PR. Trajectory and component checks run on
diff-gated paths — retrieval changes trigger component evals, agent logic
changes trigger trajectory evals.

## LLM-as-judge, calibrated by humans

For rubrics like faithfulness and task completion, an LLM judge is the only
scalable option. But raw LLM judgments drift. The judge model you trusted in
January may grade differently after an update, or may have latent biases toward
verbose answers. [Confident AI's agent evaluation guide](https://www.confident-ai.com/blog/llm-agent-evaluation-complete-guide)
covers this well: the judge needs periodic calibration against human labels —
not for every run, but enough to keep the inter-rater agreement honest.

My practice: human-label a 50-case calibration set monthly, compute agreement
with the judge, and alert if it drops below 80%. When it does, I re-examine the
judge prompt before I trust its verdicts again.

## Wire it into CI as a regression gate

This is the step most teams skip. They build the evals, run them manually once,
declare success, and ship. Then a prompt change three weeks later silently drops
faithfulness from 0.87 to 0.71, nobody sees it, and users start complaining.

The minimal CI gate I use looks like this:

```yaml
# .github/workflows/eval-gate.yml
- name: Run eval suite
  run: python scripts/run_evals.py --dataset golden_v3.jsonl --out results.json

- name: Check regression thresholds
  run: |
    python scripts/check_thresholds.py results.json \
      --faithfulness 0.85 \
      --task-completion 0.80 \
      --refusal-f1 0.90
```

`check_thresholds.py` exits non-zero if any metric falls below the floor. The
build fails. The PR doesn't merge. This is the same contract we've always had
with unit tests — you don't ship code that breaks the suite.

The thresholds aren't arbitrary: I seed them from the baseline on the last known
good release and tighten them incrementally as I trust the suite more. Starting
strict and relaxing later is harder than starting permissive and tightening.

This pairs naturally with the work I covered in [making RAG testable](/blog/testable-rag-python) —
once retrieval is unit-testable, component-level evals in CI become cheap to
add. And if you're deciding whether you need an agent at all, the framing in
[when to use an agent vs plain code](/blog/llm-agent-vs-code) applies here too:
more complex orchestration means more eval coverage, not less.

## Don't stop at pre-deploy: online evals

The golden dataset covers the distribution you knew about when you built it.
Distributions drift. Users discover new intents, documents age out of the
corpus, model behavior shifts after a provider update. Pre-deploy evals catch
regressions against known cases; they don't catch new failure modes.

The other layer is online evaluation: sampling live sessions, scoring them with
the same rubrics, and alerting on sustained drops. A 5% week-over-week decline
in faithfulness on live traffic is a signal that something changed upstream,
even if every CI check is green.

## The core principle

You can't make the model deterministic — I covered that in [deterministic AI](/blog/deterministic-ai).
But you can make its quality measurable and gated. That's the contract with
evals as CI: every prompt change, model swap, or retrieval update has to pass
the same bar as code changes always have. The feature either meets the rubric or
it doesn't ship. Quiet rot isn't a force of nature. It's what happens when you
treat evals as a one-time checkpoint instead of a continuous gate.
