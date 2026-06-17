# typescript-idioms

Write and review idiomatic TypeScript — get value from the type system (discriminated unions,
narrowing, `satisfies`, `readonly`) and avoid the escape hatches (`any`, unchecked `as`, `!`)
that silently defeat it. Assumes `strict: true`.

## What's in it

| Component | File | What it does |
|-----------|------|--------------|
| **Skill** | [`skills/writing-idiomatic-typescript/SKILL.md`](skills/writing-idiomatic-typescript/SKILL.md) | Type-system idioms and the soundness anti-patterns to avoid. |
| **Command** | [`commands/ts-review.md`](commands/ts-review.md) | `/ts-review [file]` — reviews a file for type idioms and soundness. |
| **Manifest** | [`.claude-plugin/plugin.json`](.claude-plugin/plugin.json) | Name, version, author, license, keywords. |

## Try it (Claude Code)

```
/plugin marketplace add meaganewaller/rosetta
/plugin install typescript-idioms@rosetta
/ts-review src/load.ts
```

## Category

`TypeScript` — see the [taxonomy](../../docs/categories.md).
