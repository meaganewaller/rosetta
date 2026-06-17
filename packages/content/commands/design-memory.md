---
description: Design a memory and context strategy for an agent.
argument-hint: "[system]"
allowed-tools: "Read, Grep, Glob, Write"
---

Design a memory strategy for the agent/system **$1** using the `agent-memory-patterns` skill.

Produce a concrete plan:

1. **What to persist** — the durable signal (decisions, facts, preferences, task state) vs. what
   to recompute. Be specific to this system.
2. **Scope** — session vs. durable, and the namespacing (per user / per project) that prevents leakage.
3. **Retrieval** — how relevant memories are selected and how much is injected per turn.
4. **Compaction** — when/how history is summarized to fit the budget, preserving decisions and
   open threads.
5. **Freshness & bounds** — how memories are timestamped, verified before use, expired, and capped.

Offer to scaffold the plan with `Write`. Don't prescribe a specific store, embedding model, or
provider API — those are implementation choices below this strategy.
