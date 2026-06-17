---
name: agent-memory-patterns
description: >-
  Use when designing memory or persistent context for an agent — deciding what to persist vs.
  recompute, how to retrieve only what's relevant, and how to summarize/compact history to fit
  the context window. Use when an agent forgets, bloats its context, or repeats work.
---

# Agent memory patterns

Memory is leverage, but unbounded memory is a liability — it degrades retrieval, inflates cost,
and ages into wrong answers. Be deliberate about what goes in, how it comes out, and when it dies.

## What to persist

- Store **durable signal**: decisions and their rationale, stable facts, user preferences, and
  task state. Not raw transcripts.
- If something is cheap to recompute or easily re-derived from source, **don't store it** —
  recompute it. Memory is for what you can't cheaply reconstruct.

## Scope it

- Separate **session** (ephemeral, this run) from **durable** (cross-session) memory.
- **Namespace** by user and project so memories never leak across boundaries — a hard
  correctness and privacy requirement, not a nicety.

## Retrieve by relevance

- Fetch what's relevant to the **current task** (recency + similarity), not everything you have.
- **Cap** how much memory you inject per turn; injecting it all crowds the context and dilutes
  attention. More retrieved memory is not better.

## Compact, don't truncate

- As history approaches the context budget, **summarize older turns** — preserve decisions and
  open threads, drop resolved back-and-forth.
- **Append** the summary; never silently drop content. Make the compaction visible.

## Keep it fresh and bounded

- A memory reflects a **point in time** — record when it was written. Before relying on a fact
  (a file, a flag, a config), **verify it still holds**; stale memory confidently asserted is
  worse than no memory.
- **Bound growth**: dedupe, expire, and cap size. Old, unused memories should age out.

## Anti-patterns to flag

- Persisting whole transcripts; injecting all memory every turn.
- Never expiring; trusting a stale memory as current.
- Memory that crosses user/project boundaries.
- Truncating context silently instead of compacting deliberately.

> Out of scope: specific vector stores, embedding models, and provider context/compaction APIs —
> this skill is the strategy, not the storage backend.
