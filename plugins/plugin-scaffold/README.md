# plugin-scaffold

Scaffold a new catalog plugin in the canonical Claude Code format — manifest, README, and
component stubs that pass the validator out of the box. The fastest way to start a new plugin.

## What's in it

| Component | File | What it does |
|-----------|------|--------------|
| **Command** | [`commands/scaffold-plugin.md`](commands/scaffold-plugin.md) | `/scaffold-plugin <name> [category]` — generates a spec-compliant plugin skeleton under `plugins/<name>/`. |
| **Skill** | [`skills/plugin-authoring/SKILL.md`](skills/plugin-authoring/SKILL.md) | The canonical plugin layout, manifest fields, component frontmatter, and authoring rules. |
| **Manifest** | [`.claude-plugin/plugin.json`](.claude-plugin/plugin.json) | Name, version, author, license, keywords. |

This is a **dogfooding** plugin: install it into Claude Code and use it to author the rest of
the catalog.

## Try it (Claude Code)

```
/plugin marketplace add meaganewaller/rosetta
/plugin install plugin-scaffold@rosetta
/scaffold-plugin my-plugin Utilities
```

## Category

`Development` — see the [taxonomy](../../docs/categories.md).
