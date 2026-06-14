---
title: "Routing Between LLMs Without Blowing the Budget"
date: "2026-01-06"
excerpt: "How I built a routing layer for a bank's GenAI chatbot that cut resolution time ~30% while keeping model spend controlled — and when not to bother."
tags: ["llm", "ai", "architecture", "cost"]
---

The first version of the chatbot was simple: every question from the network-operations team went straight to a frontier model. Response quality was high. The bill was not. At a rough $0.015 per 1K output tokens and a team that ran a few hundred queries a day, it adds up fast — and more importantly, the latency on complex queries bled into the latency on trivially easy ones. A question like "what's the BGP peer status on router X?" took just as long as "explain why OSPF adjacency can flap after a link-state database overflow."

Those two questions are not equally hard. Treating them the same is waste.

## The model-tier problem

The [LLM landscape today](https://llm-stats.com/) has sprawled into tiers: frontier models (GPT-5.1, Claude Opus 4.5, Gemini 3) that are slow and expensive but genuinely good at reasoning; smaller, faster models (Claude Haiku, GPT-5 mini, Gemini Flash) that handle well-structured, low-ambiguity queries just fine; and a growing middle tier of specialized fine-tunes. The gap between tiers is real but so is [the price gap](https://www.codingscape.com/blog/most-powerful-llms-large-language-models) — often 5–20x per token between the cheapest and most capable options.

Routing is the bet that you can classify a query's difficulty *before* you pay for the answer.

## What we built

The stack: FastAPI backend, Qdrant for the vector store, LiteLLM as the unified model interface, and Portkey sitting in front as the gateway. LiteLLM gives you a single client that speaks to any provider, which matters when your routing policy changes and you don't want to rewrite call sites. Portkey handles caching, request logging, provider fallbacks, and budget guardrails — the operational layer you'd otherwise have to build yourself.

The routing logic itself was intentionally boring. We started with heuristics:

- Query length under ~40 tokens with no technical jargon → small model
- Query matches a pattern we've seen before within some similarity threshold → cache hit, no model call at all
- Anything else → frontier model

The semantic cache alone cut a surprising chunk of spend. Network-ops teams ask repetitive questions. "Is the firewall rule for 10.x.x.x/24 still active?" gets asked, in five slightly different phrasings, multiple times per shift. With Qdrant storing embeddings of prior Q&A pairs and a cosine similarity threshold around 0.93, we were serving cached responses for roughly 22% of queries within the first two weeks.

For uncached queries, the heuristic router was good enough to start. We briefly considered training a tiny classifier — a fine-tuned BERT variant on our own labeled query set — but the heuristic was already handling ~65% of traffic to the cheap tier with acceptable quality. The complexity cost of maintaining a classifier wasn't worth it at that volume. If we'd been at 10x the scale, I'd have made a different call.

## Portkey and the fallback story

The fallback behavior was the part that surprised me most. Before Portkey, we had a naive retry loop with exponential backoff. What we didn't have was clean *provider* fallback — if the frontier model's provider was rate-limiting us or having a partial outage, we'd just fail. With Portkey's fallback config, we defined a priority chain: try provider A, if that fails within N seconds or returns a rate-limit error, try provider B with the same model, then fall back to a smaller model with an acknowledgment in the response that it's best-effort.

This is closer to how you'd treat it like an agent decision — not a single call but a policy with fallback states. The difference is the policy lives in config, not in prompt chains.

The logging that Portkey gives you out of the box is what made the routing tunable. We could see exactly which queries were hitting which tier, what the cost per-query was, and where the small model was producing answers the ops team flagged as wrong. That last signal is what you need to tighten or loosen the routing threshold.

## When not to bother

Routing adds latency. The classification step, even a fast heuristic, is a round-trip before the actual model call. If your query volume is low — say, an internal tool that gets 50 queries a day — the engineering overhead of building and maintaining a routing layer will dwarf any savings. Just pick one good model, set a budget alert, and revisit at 10x volume.

Routing also fails if your query distribution is genuinely unpredictable. If every question from your users is novel and complex, routing everything to the frontier model is already the right answer. The signal that routing helps is a *bimodal* distribution: a mass of repetitive or simple queries, and a tail of hard ones.

You also need to treat evals like CI before you touch the routing threshold. If you don't have a way to measure answer quality per tier, you'll optimize for cost and accidentally degrade the experience. We ran a manual eval on 100 queries per week for the first month, tagging which tier handled them and whether the answer was acceptable. That's how we discovered that "acceptable" on a small model meant "good enough for status lookups, not good enough for root-cause analysis."

## What actually changed

After two months: domain Q&A resolution time down about 30%, primarily because routine lookups now responded in under a second instead of three-plus. Model spend stayed roughly flat despite higher query volume, because the cache and the cheap-tier routing absorbed most of the growth. The frontier model now sees a more interesting slice of queries — genuinely hard ones — which is a better use of it anyway.

The thing I'd have done differently: instrument before you optimize. We didn't have per-query cost logging for the first three weeks, which meant the first routing thresholds were guesses. Portkey's logging would have paid for itself in week one if we'd wired it up from the start.

If you're early in a similar build and tempted to add routing "just in case," don't. Pick a capable model, log everything, and add routing when your logs show you which queries don't need it. The data will tell you when the moment is right.
