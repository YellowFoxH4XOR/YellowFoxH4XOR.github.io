---
title: "Building a RAG Pipeline in Python You Can Actually Test"
date: "2026-01-20"
excerpt: "RAG feels untestable because generation is non-deterministic — the move is to decompose the pipeline into layers and test each one differently."
tags: ["rag", "llm", "python", "testing"]
---

Every team I've talked to about RAG has the same confession: they shipped it
without real tests and hoped the demos held up. I've done it too. The excuse
you reach for is that generation is non-deterministic, so what would you even
assert? But that excuse is hiding a structural problem. The pipeline isn't one
untestable blob — it's three distinct stages with completely different test
strategies, and only one of them is genuinely non-deterministic.

## The decomposition that makes it testable

A RAG pipeline is retrieval → prompt assembly → generation. Mentally flatten it
into a single "ask the AI" call and you're right that it's hard to test. Keep
the layers separate and the problem dissolves.

### Layer 1: Retrieval is deterministic

Given a fixed index and a fixed query, a vector similarity search returns the
same documents every time. That's a pure function. Test it like one.

The right artifact here is a small golden set: a collection of `(query,
expected_doc_id)` pairs written by hand against your actual corpus. If you
can't write twenty of these, you don't understand your own retrieval problem
well enough to build on top of it.

```python
# tests/test_retrieval.py
import pytest
from app.retrieval import build_index, retrieve

GOLDEN_PAIRS = [
    ("how do I reset my password?",   "doc-42"),
    ("what is the refund window?",    "doc-17"),
    ("explain the late-fee policy",   "doc-91"),
]

@pytest.fixture(scope="module")
def index():
    return build_index("tests/fixtures/corpus.jsonl")

@pytest.mark.parametrize("query,expected_doc_id", GOLDEN_PAIRS)
def test_recall_at_5(index, query, expected_doc_id):
    results = retrieve(index, query, k=5)
    doc_ids = [r.id for r in results]
    assert expected_doc_id in doc_ids, (
        f"Expected {expected_doc_id} in top-5 for query: {query!r}\n"
        f"Got: {doc_ids}"
    )
```

A few things matter here. The fixture loads once per session so the test suite
isn't slow. The failure message tells you exactly what the retriever pulled so
you can diagnose chunking and embedding issues without printf-debugging. And k=5
is a deliberate choice — you're not testing position, you're testing recall.
Track precision separately if ranking matters.

When we ran this discipline on a document Q&A system — iterating on chunk size,
switching from flat FAISS to a hybrid retrieval setup with a reranker — answer
relevance on complex multi-hop queries improved roughly 85% and retrieval
latency dropped around 60%. Not guesses. Measured against the same golden set
every time we tuned a parameter.

### Layer 2: Prompt assembly is a pure function

Context documents plus a question go in; a prompt string comes out. No I/O, no
randomness. There is no reason this shouldn't have a snapshot test.

```python
# tests/test_prompt.py
from app.prompts import build_rag_prompt

def test_prompt_snapshot(snapshot):
    docs = [
        {"id": "doc-42", "text": "Passwords reset via Settings > Security."},
    ]
    prompt = build_rag_prompt(docs, "How do I reset my password?")
    assert prompt == snapshot
```

Use [pytest-snapshot](https://github.com/joseph-roitman/pytest-snapshot) or
just a golden file you commit. When the prompt template changes, the test
breaks. That's the point — prompt changes are model behavior changes, and you
want them to be deliberate, reviewed, and visible in your diff.

### Layer 3: Generation needs a rubric, not an assertion

Here's where teams get stuck: they try to assert that the answer equals some
expected string. It never does. The model paraphrases, restructures, adds a
disclaimer. String comparison is a dead end.

The correct move is to test a *property* of the output, not its exact form. For
RAG specifically, the property you care most about is faithfulness: is the
answer grounded in the retrieved context, or is the model confabulating? You
can score that with an LLM-as-judge prompt run against a fixed eval set.

```python
# evals/faithfulness.py
from openai import OpenAI

JUDGE_PROMPT = """
You are evaluating a QA system. Given the context and a generated answer,
score faithfulness on a scale of 1–5. A 5 means every claim in the answer
is directly supported by the context. A 1 means the answer introduces facts
not present in the context.

Context: {context}
Answer: {answer}

Output only the integer score.
"""

def score_faithfulness(context: str, answer: str, client: OpenAI) -> int:
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": JUDGE_PROMPT.format(
            context=context, answer=answer
        )}],
        temperature=0,
    )
    return int(resp.choices[0].message.content.strip())
```

Run this over your eval set on each deploy. Track the mean score. Gate merges
when it drops below a threshold. This is the whole idea behind treating evals as
CI — the eval isn't a one-time check, it's a signal that
lives in your pipeline and tells you when a model swap or prompt edit regressed
quality.

The eval set itself matters. It should be fixed, cover the distribution of
queries you actually get, and include a handful of adversarial cases where the
answer isn't in the context at all. Those are the cases where hallucination is
most likely and the ones your golden retrieval tests won't catch.

## The model is the only non-deterministic part

This is the framing that unlocks the whole thing. It's also the framing behind
context engineering: everything that goes into the
model call — the retrieved docs, the assembled prompt, the system message — is
deterministic. You control all of it. Test all of it. The model's output is a
distribution you characterize with scoring, not a value you assert.

When you structure a RAG pipeline this way, you end up with something useful:
retrieval regressions surface immediately in CI because the golden-set test
fails, prompt template changes are visible in code review because the snapshot
diff shows up, and generation quality is a tracked metric rather than a
feeling. You deploy with evidence, not hope.

The industry is moving toward more agentic retrieval patterns — multi-hop,
iterative, query rewriting — as pieces like [LlamaIndex's take on agentic
retrieval](https://www.llamaindex.ai/blog/rag-is-dead-long-live-agentic-retrieval)
describe. The decomposition stays the same, it just recurses. Each retrieval
step is deterministic. Each prompt assembly is a pure function. The model is
still the smallest non-deterministic part. Test accordingly.
