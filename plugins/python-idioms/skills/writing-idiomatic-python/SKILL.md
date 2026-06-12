---
name: writing-idiomatic-python
description: >-
  Use when writing or reviewing Python (3.10+) — modern idioms for typing, data modeling,
  control flow, and standard-library use, plus the anti-patterns to avoid (mutable default
  args, bare except, manual index loops, string-built paths).
---

# Writing idiomatic Python

Idiomatic Python is readable, explicit where it counts, and leans on the standard library and
the language's protocols rather than reinventing them. Target 3.10+.

## Typing

- Add type hints to public functions and dataclass fields. Use built-in generics (`list[int]`,
  `dict[str, int]`), `X | None` over `Optional[X]`, and `from __future__ import annotations`
  only when you need forward refs.
- Prefer `@dataclass` (or `typing.NamedTuple`) over hand-written `__init__`/`__eq__`.
- Use `typing.Protocol` for structural typing instead of forcing inheritance.

## Control flow

- **EAFP over LBYL**: `try/except` around the operation rather than pre-checking, when the
  happy path dominates.
- Use comprehensions and generator expressions for map/filter; reach for a loop when there are
  side effects. Don't build a list just to iterate it once — use a generator.
- Use `match` for structural dispatch over long `isinstance` chains.
- Guard clauses and early `return` over deep nesting.

## Standard library

- `pathlib.Path` for filesystem paths, never string concatenation or `os.path` for new code.
- `enumerate` / `zip` instead of `range(len(...))` index gymnastics.
- `with` (context managers) for files, locks, and any acquire/release pair.
- `collections` (`defaultdict`, `Counter`), `itertools`, and `functools` (`cache`, `reduce`)
  before hand-rolling.
- `f"…"` for formatting; `logging`, not `print`, for diagnostics.

## Anti-patterns to flag

- **Mutable default arguments** (`def f(x=[])`) — use `None` and create inside.
- **Bare `except:`** or `except Exception` that swallows — catch specific types, re-raise or log.
- Comparing to `None`/`True` with `==` instead of `is`.
- Manually closing files instead of `with`.
- `import *`; deep wildcard imports.

Run a formatter and linter (Black/Ruff) — idioms are about the patterns above, not whitespace.
American English in identifiers and comments.
