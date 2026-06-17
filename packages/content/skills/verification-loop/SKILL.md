---
name: verification-loop
description: Comprehensive verification pattern for Claude Code sessions — build, types, lint, tests, security, and diff review.
---

# Verification Loop

Run after completing a feature, before a PR, after refactoring, or any time you want a full quality check.

## Phases

Run in order. Stop at build failure — the rest is meaningless if the build is broken.

**Build** — determine the project's build command and run it. If it fails, stop and fix.

**Type check** — run the project's type checker (if applicable). Report all errors; fix critical ones before continuing.

**Lint** — run the linter. Report warnings and errors.

**Tests** — run the full test suite with coverage. Report pass/fail count and coverage percentage. Target: 80% minimum.

**Security** — scan for hardcoded secrets, credentials, and debug logging left in source. Use whatever static analysis tools the project has configured; fall back to grep patterns.

**Diff review** — `git diff --stat` and `git diff HEAD~1 --name-only`. Review each changed file for unintended changes, missing error handling, and potential edge cases.

## Output

After all phases, report each phase's status (pass/fail with counts), list issues to fix, and give an overall verdict: ready for PR or not.

## When to run

- After completing a feature or significant change
- Before opening a PR
- After refactoring
- As a checkpoint during long sessions — after each major milestone, before switching tasks