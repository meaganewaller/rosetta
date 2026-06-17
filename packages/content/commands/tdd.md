---
description: Enforce test-driven development. Scaffold interfaces, write failing tests first, implement minimal code to pass, refactor, verify coverage.
---

# TDD

Invokes the **tester** agent to enforce the Red-Green-Refactor cycle.

## What happens

1. Define interfaces and types for the feature
2. Write failing tests (Red) — run them to confirm they fail for the right reason
3. Write minimal implementation to make tests pass (Green)
4. Refactor while keeping tests green
5. Check coverage — add tests if below 80%

## The cycle

```
RED → GREEN → REFACTOR → REPEAT
```

Never skip Red. Never write implementation before tests.

## Coverage targets

- 80% minimum across all code
- 100% for financial calculations, auth logic, and other security-critical paths