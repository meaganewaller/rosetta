---
name: test-design-heuristics
description: >-
  Use when deciding what to test for a change. Covers the test pyramid, risk-based
  prioritization, boundary and equivalence partitioning, the edge cases worth checking,
  and — just as important — what not to test.
---

# Test design heuristics

The goal of a test is to catch a regression that matters, cheaply. Optimize for **signal per
test**, not for a coverage number.

## Pick the level (the pyramid)

- **Unit** — fast, many, isolated. Pure logic, branching, transformations. Most tests live here.
- **Integration** — fewer. Real boundaries: a DB, a queue, an HTTP client, the file system.
  Test the seam, not the whole world.
- **End-to-end** — fewest. One or two happy-path journeys that prove the pieces connect.

Push each behavior to the *lowest* level that can meaningfully exercise it.

## Prioritize by risk

Test first where a bug would hurt most and is most likely: money, auth, data loss,
irreversible actions, and the code that just changed. Don't spend the same effort on a
log-formatting helper as on a payment path.

## Find the cases

- **Equivalence classes** — one representative per class of input, not every value.
- **Boundaries** — 0, 1, n, n+1, max, just-over-max. Off-by-one lives here.
- **Empty / null / missing** — empty list, null field, absent config, zero-length string.
- **Error paths** — what happens when the dependency throws, times out, or returns garbage.
- **Idempotency & concurrency** — only when the code is retried or runs in parallel.

## What NOT to test

- Framework or library internals — trust them; test *your* use of them.
- Trivial getters/setters and pass-through wrappers with no logic.
- The same logic at three levels — pick one level and assert it well.
- Implementation details that aren't part of the contract — they make refactors painful.

A test plan that says "this part needs no test, here's why" is more credible than one that
tries to test everything.
