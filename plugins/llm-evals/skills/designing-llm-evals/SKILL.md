---
name: designing-llm-evals
description: >-
  Use when building or reviewing an evaluation for an LLM feature — assembling a representative
  test set, choosing pass criteria (exact match, programmatic checks, rubric, or LLM-as-judge),
  and catching regressions. Use when asking "how do I know this prompt or model change is better?"
---

# Designing LLM evals

If you can't measure it, you're tuning by vibes. Decide how you'll know the output is good
**before** you start changing prompts or models.

## Build a real test set

- Draw cases from **real inputs**, including edge cases and known past failures. A handful of
  representative cases beats a thousand synthetic near-duplicates.
- Keep a **holdout** you don't tune against, so you can detect overfitting to the eval.
- Label the expected behavior (exact answer, or what "good" means) per case.

## Choose the cheapest valid criterion

In order of preference — use the strongest that fits the task:

1. **Exact / structural match** — classification, extraction, JSON shape. Cheap and objective.
2. **Programmatic checks** — does it compile, parse, satisfy invariants, stay under length?
3. **Rubric** — score against explicit criteria for open-ended output.
4. **LLM-as-judge** — last resort for open-ended quality. **Calibrate it against human labels**
   and watch for judge bias (favoring length, position, its own style).

## Score honestly

- Report the **pass rate and the specific failures**, broken down by category — not a single
  aggregate number that hides which class of input is broken.
- Re-run the eval on **every prompt or model change** (regression). Pin the test set.
- Offline eval is necessary but not sufficient: also **sample and review production outputs**.

## Anti-patterns to flag

- Vibes-only evaluation; tiny non-representative sets.
- Judging on the same examples you tuned on (overfit).
- One aggregate score masking a category that regressed.
- An uncalibrated LLM-judge treated as ground truth.

> Out of scope: which model to use, pricing, and batch/eval APIs are **provider-specific** —
> this skill is about eval design, not the runner.
