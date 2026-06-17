# ruby-idioms

Write and review idiomatic Ruby — Enumerable-driven, expression-oriented style (blocks, guard
clauses, safe navigation, keyword args) and the manual loops and nil checks it replaces.

## What's in it

| Component | File | What it does |
|-----------|------|--------------|
| **Skill** | [`skills/writing-idiomatic-ruby/SKILL.md`](skills/writing-idiomatic-ruby/SKILL.md) | Ruby idioms and the patterns they replace; pulled in when writing or reviewing Ruby. |
| **Command** | [`commands/ruby-review.md`](commands/ruby-review.md) | `/ruby-review [file]` — reviews a file for idiomatic improvements. |
| **Manifest** | [`.claude-plugin/plugin.json`](.claude-plugin/plugin.json) | Name, version, author, license, keywords. |

## Try it (Claude Code)

```
/plugin marketplace add meaganewaller/rosetta
/plugin install ruby-idioms@rosetta
/ruby-review app/models/user.rb
```

## Category

`Ruby` — see the [taxonomy](../../docs/categories.md).
