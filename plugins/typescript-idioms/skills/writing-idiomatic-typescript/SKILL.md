---
name: writing-idiomatic-typescript
description: >-
  Use when writing or reviewing TypeScript — getting value from the type system (unknown over
  any, discriminated unions, narrowing, satisfies, readonly) and avoiding the escape hatches
  (any, unchecked as casts, non-null !) that silently defeat it.
---

# Writing idiomatic TypeScript

The point of TypeScript is to make illegal states unrepresentable and let the compiler catch
mistakes. Idiomatic TS works *with* the type system instead of around it. Assume `strict: true`.

## Model the domain in types

- **Discriminated unions** for "one of N shapes" (`{ kind: "ok"; value } | { kind: "err"; error }`),
  then `switch` on the tag — the compiler checks exhaustiveness.
- `type` aliases for unions/functions/mapped types; `interface` for object shapes that may be
  extended or merged. Be consistent.
- Prefer **union string literals** (`type Mode = "r" | "w"`) over `enum`.
- Mark data `readonly` where it shouldn't mutate; use `as const` for literal tuples/objects.
- Reach for utility types (`Pick`, `Omit`, `Partial`, `Record`, `ReturnType`) before restating shapes.

## Stay sound

- **`unknown`, not `any`**, at boundaries (JSON, `catch`) — then narrow with type guards.
- Avoid `as` casts; when unavoidable, cast to the narrowest type and comment why. Never
  double-cast through `unknown` to silence an error.
- Avoid the non-null assertion `!`; narrow instead (`if (x == null) return`).
- Use `satisfies` to check a value against a type without widening it.
- Type guards (`x is T`) and `in`/`typeof`/`instanceof` narrowing over manual casts.

## Functions & async

- Let inference do the work for locals; annotate parameters and public return types.
- `async/await` over raw `.then` chains; never leave a promise unawaited (handle or `void` it).
- Prefer immutable transforms (`map`/`filter`/`reduce`) over mutation when it reads clearly.

## Anti-patterns to flag

- `any` (especially implicit), unchecked `as`, `!`, `@ts-ignore` without a justification.
- `enum` where a string-literal union would do; `Function`/`Object`/`{}` as types.
- Optional-everything interfaces that don't reflect real invariants.

American English in identifiers and comments.
