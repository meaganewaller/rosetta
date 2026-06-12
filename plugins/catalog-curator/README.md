# catalog-curator

Validate a plugin against the catalog quality bar, explain any failures in plain language, and
register it in `marketplace.json` with a valid category. Dogfoods the contribution gate.

## What's in it

| Component | File | What it does |
|-----------|------|--------------|
| **Command** | [`commands/check-plugin.md`](commands/check-plugin.md) | `/check-plugin [name]` — runs the validator and explains errors + warnings. |
| **Skill** | [`skills/catalog-quality-bar/SKILL.md`](skills/catalog-quality-bar/SKILL.md) | The quality bar the validator can't fully check, plus the marketplace registration rules. |
| **Manifest** | [`.claude-plugin/plugin.json`](.claude-plugin/plugin.json) | Name, version, author, license, keywords. |

A **dogfooding** plugin — it checks the very plugins we author, including itself.

## Try it (Claude Code)

```
/plugin marketplace add meaganewaller/agents
/plugin install catalog-curator@rosetta
/check-plugin changelog
```

## Category

`Quality` — see the [taxonomy](../../docs/categories.md).
