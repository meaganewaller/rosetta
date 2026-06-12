---
description: Produce an eval plan for an LLM feature.
argument-hint: "[feature]"
allowed-tools: "Read, Grep, Glob, Write"
---

Design an evaluation for the LLM feature **$1** using the `designing-llm-evals` skill.

Produce a concrete eval plan:

1. **Test set** — where the cases come from (real inputs, edge cases, known failures), roughly
   how many, and a holdout. List a few representative cases if the feature is clear.
2. **Criteria** — the cheapest valid method per case type (exact / programmatic / rubric /
   LLM-judge), and for any LLM-judge, how it'll be calibrated.
3. **Scoring** — pass rate plus per-category breakdown; what a regression looks like.
4. **Cadence** — when it runs (every prompt/model change) and how production sampling complements it.

Offer to scaffold the plan or a starter test-set file with `Write`. Don't prescribe a specific
model or runner — those are provider choices.
