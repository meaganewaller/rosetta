---
name: writing-idiomatic-ruby
description: >-
  Use when writing or reviewing Ruby — Enumerable-driven, expression-oriented idioms (blocks,
  guard clauses, safe navigation, keyword arguments, predicate methods) and the manual loops,
  nil checks, and temporary variables they replace.
---

# Writing idiomatic Ruby

Idiomatic Ruby reads like intent. Lean on Enumerable and blocks, treat almost everything as an
expression, and let objects answer questions about themselves.

## Enumerable over manual loops

- `map` / `select` / `reject` / `reduce` / `each_with_object` instead of building an array with
  `<<` inside a `while`/`for`. Use `for` essentially never.
- `sum`, `min_by`, `max_by`, `group_by`, `partition`, `tally`, `flat_map` — reach for the
  specific method before hand-rolling.
- `each_with_object({})` or `to_h` to build hashes; `filter_map` to map-and-compact in one pass.

## Expressions and flow

- Everything returns a value — assign from `if`/`case`, and let the last expression be the
  return (drop explicit `return` except for guard clauses).
- **Guard clauses** with trailing `if`/`unless` and early `return`/`next` over nested
  conditionals.
- `case`/`when` (and pattern matching `case/in` in 3.x) over long `elsif` chains.
- Prefer `&&`/`||`, `||=`, and the safe-navigation `&.` over verbose nil checks.

## Objects and methods

- Predicate methods end in `?` and return booleans; bang methods (`!`) mutate or raise.
- Keyword arguments for clarity when a method takes more than one or two options; avoid boolean
  positional flags.
- `attr_reader`/`attr_accessor` over hand-written accessors. Symbols for identifiers/keys.
- `tap` for side effects in a chain; `then`/`yield_self` to pipe a value through a transform.

## Hygiene

- `# frozen_string_literal: true` at the top of files.
- Two-space indentation; `do…end` for multiline blocks, `{…}` for one-liners.
- Don't rescue `Exception` — rescue `StandardError` (the default) or a specific class.

Run RuboCop for formatting and lint — this skill is about the idioms above, not whitespace.
American English in identifiers and comments.
