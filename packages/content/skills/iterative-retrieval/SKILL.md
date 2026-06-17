---
name: iterative-retrieval
description: Pattern for progressively refining context retrieval to solve the subagent context problem.
---

# Iterative Retrieval

Solves the subagent context problem: subagents don't know what files or terminology they need until they start working. Sending everything exceeds context limits; guessing is usually wrong.

## The pattern

A loop of up to 3 cycles, stopping early when context is sufficient:

**Dispatch** — broad initial query: glob patterns, keywords, excludes.

**Evaluate** — score each retrieved file for relevance to the task (0–1). Identify what context is still missing.

**Refine** — update the query based on findings: add terminology and patterns discovered in high-relevance files, exclude confirmed irrelevant paths, target identified gaps.

**Repeat** — run at most 3 cycles. Stop early when you have 3+ high-relevance files (≥0.7) and no critical gaps.

## Relevance scoring

- **0.8–1.0** — directly implements the target functionality
- **0.5–0.7** — contains related patterns or types
- **0.2–0.4** — tangentially related
- **0–0.2** — not relevant; exclude from future cycles

## Key principles

Start broad — the first cycle often reveals the codebase's actual terminology (e.g. "throttle" instead of "rate limit"), which drives better subsequent queries. Track gaps explicitly: knowing what's missing is what makes refinement useful. Three high-relevance files beat ten mediocre ones — stop when context is good enough.