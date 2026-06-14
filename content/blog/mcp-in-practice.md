---
title: "MCP in Practice: Tools for an Agent Without the N×M Mess"
date: "2026-03-17"
excerpt: "MCP collapses the N×M agent-tool integration problem into one server per tool — here's what that means for how you actually design and scope tool contracts."
tags: ["mcp", "agents", "llm", "tools"]
---

If you've ever built more than one LLM agent, you've felt the N×M problem before
you had a name for it. Agent host A needs to talk to tool server X — fine, you
write the glue. Then host B needs the same tool, and host A needs tool Y, and
suddenly you're maintaining a matrix of bespoke integrations that all do roughly
the same thing in slightly different ways. Every new axis multiplies the work.

Model Context Protocol (MCP) is the answer the industry has converged on: one
server per tool, one client per host, and a standard wire format between them. Any
host speaks to any server without custom glue. The matrix collapses to a list.

## Where MCP stands now

I'm writing this in early 2026, which matters for this conversation because the
"is it safe to build on?" question has a clear answer now. [MCP adoption is
near-universal across major agent platforms](https://www.digitalapplied.com/blog/mcp-adoption-statistics-2026-model-context-protocol)
— OpenAI and Google are both on board — and governance has moved to a Linux
Foundation effort after the protocol was donated in late 2025. That last bit is
the tell: when a protocol gets foundation governance, it's infrastructure, not a
vendor bet. Build on it.

## What an MCP server actually exposes

Strip away the framing and an MCP server exposes **tools with typed schemas** —
input types, output types, a description the model uses to decide when to call
the thing. That's it. If you've done function calling with any LLM, the model is
identical. The protocol difference is that a standalone server handles discovery,
transport, and execution in a way any compliant host can speak to, instead of
you baking that into each agent.

This matters for how you design the tool contract. The same discipline that makes
function calling reliable — constrained, schema-validated output rather than
free-form prose — applies here. Your MCP tool should return a typed value the
agent's code can act on, not a paragraph it has to interpret. A tool that returns
`{"status": "created", "id": "ord_123"}` is a good tool. A tool that returns
`"Your order has been created with ID ord_123"` is a footgun that your agent will
occasionally misparse. The same instinct I wrote about in [context engineering](/blog/context-engineering)
applies: give the model structure it can reason over, not string wrangling it has
to do.

## Keep the tool surface small

This is where most teams go wrong the first time. You have 40 internal APIs; you
wrap all 40 as MCP tools because "now the agent can do anything." In practice,
you've handed the model a context-bloat problem and a worse decision problem.

Every tool you expose costs tokens in the system prompt for its description and
schema. More importantly, the model has to pick the right tool. With 40 choices,
selection quality drops. With 8 tightly scoped choices that cover the actual use
cases, the model almost always picks correctly. [The 2026 MCP roadmap](https://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/)
acknowledges this with work on server-side tool filtering — but that's a feature
for managing already-oversized surfaces, not an excuse to build one.

The right question when adding a tool isn't "could the agent use this?" It's
"does the agent's current task set require this, and is the alternative a worse
design?" If the tool's job can be expressed in two or three clear verbs (fetch,
create, update), ship it. If you're squinting to describe what it does, split or
cut it.

## Auth and security: you are handing a machine real capabilities

An MCP server is a capability boundary. When an agent calls one of your tools,
something real happens — a row gets written, an email goes out, an API call with
your credentials fires. Treat the tool surface the same way you'd treat an API
you're exposing to an external party.

A few things I don't skip:

- **Scope at the server level, not just the tool level.** If the tool only needs
  read access, the credentials it runs with shouldn't have write access. Don't
  rely on prompt instructions to prevent writes when you can prevent them in the
  IAM policy.
- **Audit every call.** Agent behavior at runtime surprises you. Log tool name,
  caller, inputs, and outputs. You'll need this when something goes sideways.
- **Rate-limit and bound.** An agent in a loop with an unbounded delete tool is a
  bad day. Put hard limits on mutation tools, and fail loudly when they're hit
  rather than silently continuing.

## When NOT to build an MCP server

MCP exists to solve the integration matrix. If you don't have a matrix, you might
not need it.

A single internal Python service calling three internal functions isn't N×M
anything. Wrapping those in an MCP server adds a transport layer, a schema
serialization round-trip, and a new process to monitor, in exchange for
interoperability you don't need yet. That's the kind of thing I'd consider
using a direct function call for, rather than an agent abstraction at all.
Build the server when a second host needs the tool, or when you genuinely expect
that to happen. Not before.

## The actual value

MCP is plumbing. That's meant sincerely, not dismissively — good plumbing is what
makes buildings livable. The protocol standardizes the boring part: discovery,
transport, schema negotiation, error signaling. Those aren't the hard problems in
building a useful agent. They're the problems that eat your time when they're
not solved uniformly.

Standardizing them means you can focus on what actually determines whether the
agent is worth running: the quality of its judgment, the design of its tool
contracts, and the architecture that keeps the irreversible actions outside the
model's probabilistic reach. That last piece connects back to the same
[determinism instinct](/blog/context-engineering) that governs every other part of
working with LLMs in production — the protocol handles the plumbing so you can
keep the decisions where they belong.
