---
name: tdd-workflow
description: Enforces test-driven development with 80%+ coverage — unit, integration, and E2E. Use when writing new features, fixing bugs, or refactoring.
---

# TDD Workflow

Write tests first. Always.

## The cycle

1. **Write a failing test** that specifies the desired behavior — run it to confirm it fails for the right reason
2. **Write minimal implementation** to make it pass
3. **Refactor** while keeping tests green
4. **Check coverage** — add tests if below 80%

Never skip the failing step. A test that was never red doesn't prove anything.

## Test types

**Unit** — individual functions and modules in isolation. Mock external dependencies at the boundary.

**Integration** — where components connect: API handlers, database operations, service interactions. Test the wiring, not just the units.

**E2E** — critical user-facing flows only. Slow and expensive; reserve for paths where breakage would be severe.

## Coverage

80% line and branch coverage minimum. Coverage is a floor, not a goal — a well-tested critical path matters more than padding an untested utility to hit a number.

Use the project's existing test framework and coverage tooling. Match the conventions already in the codebase.

## What to test

For every non-trivial function: the happy path, null/empty/boundary inputs, and error paths. Test observable behavior, not implementation details — tests that assert on internal state break during refactoring and provide no safety guarantee.