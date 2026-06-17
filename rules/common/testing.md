# Testing

## Coverage target

Aim for 80%+ line and branch coverage. Coverage is a floor, not a goal — prioritize testing behavior that would cause real problems if broken over chasing the number.

## Test types

All three are required:

- **Unit** — individual functions and components in isolation
- **Integration** — API endpoints, database operations, service interactions
- **E2E** — critical user-facing flows only; reserve for paths where breakage would be severe

Language-specific rules cover the test frameworks and conventions for each stack.

## Workflow

Write the test before the implementation. Run it first to confirm it fails for the right reason — a test that was never failing doesn't prove anything. Write the minimal implementation to make it pass, then refactor. Use the **tester** agent for new features and bug fixes; it enforces this cycle.

## When tests fail

Fix the implementation, not the test — unless the test is genuinely wrong. Check test isolation first: shared state between tests is the most common cause of intermittent failures. Verify mocks match the real interface they're standing in for.