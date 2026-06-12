---
description: Review a TypeScript file for type-system idioms and soundness.
argument-hint: "[file]"
allowed-tools: "Read, Grep, Glob, Edit"
---

Review the TypeScript in **$1** (default: the files in the current change) for idiomatic, sound
use of the type system.

Apply the `writing-idiomatic-typescript` skill. Prioritize **soundness escape hatches** —
`any`, unchecked `as` casts, non-null `!`, `@ts-ignore` — and show the narrowing or type change
that removes each. Then note modeling improvements (discriminated unions, `readonly`,
`satisfies`, utility types). Report **file:line** + the rewrite, and offer to apply fixes with
`Edit`. Don't change runtime behavior to satisfy types — fix the types. Keep it proportional.
