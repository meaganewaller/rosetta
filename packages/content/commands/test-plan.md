---
description: Produce a focused, proportional test plan for the current change.
argument-hint: "[path-or-base-branch]"
allowed-tools: "Bash(git diff:*), Bash(git log:*), Read, Glob, Grep"
---

Produce a test plan for **$1** (default: the working diff against the repo's default branch).

Steps:

1. Scope the change: `git diff $1 --stat` for breadth, then read the changed code to
   understand behavior — inputs, outputs, side effects, and error paths.
2. Apply the `test-design-heuristics` skill to decide *what* deserves a test and at *which*
   level.
3. Output a plan with:
   - **What to test** — the behaviors and contracts that matter, as a checklist.
   - **Level** — for each, unit / integration / end-to-end, with a one-line why.
   - **Edge cases** — boundaries, empty/null, error paths, concurrency, idempotency — only
     the ones that actually apply here.
   - **Skip** — what is *not* worth testing (framework code, trivial getters), so the plan
     stays honest.

Keep it **proportional**: a small change gets a small plan. Don't pad. This produces a plan,
not the tests — offer to write them as a follow-up if the author wants.
