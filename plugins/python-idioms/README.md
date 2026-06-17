# python-idioms

Write and review idiomatic modern Python (3.10+) — typing, data modeling, control flow, and
standard-library use, plus the anti-patterns to catch.

## What's in it

| Component | File | What it does |
| ----------- | ------ | -------------- |
| **Skill** | [`skills/writing-idiomatic-python/SKILL.md`](skills/writing-idiomatic-python/SKILL.md) | Modern Python idioms and the anti-patterns to avoid; pulled in when writing or reviewing Python. |
| **Command** | [`commands/python-review.md`](commands/python-review.md) | `/python-review [file]` — reviews a file for idiomatic improvements. |
| **Manifest** | [`.claude-plugin/plugin.json`](.claude-plugin/plugin.json) | Name, version, author, license, keywords. |

## Try it (Claude Code)

```
/plugin marketplace add meaganewaller/rosetta
/plugin install python-idioms@rosetta
/python-review path/to/module.py
```

## Category

`Python` — see the [taxonomy](../../docs/categories.md).
