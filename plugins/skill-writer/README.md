# skill-writer

Write `SKILL.md` files that actually fire. Skills are model-invoked off their description, so
this plugin focuses on trigger-quality descriptions and progressive-disclosure bodies — the
highest-leverage authoring skill, since `SKILL.md` is now native across all five harnesses.

## What's in it

| Component | File | What it does |
|-----------|------|--------------|
| **Command** | [`commands/write-skill.md`](commands/write-skill.md) | `/write-skill <name>` — drafts a trigger-quality `SKILL.md`. |
| **Skill** | [`skills/writing-effective-skills/SKILL.md`](skills/writing-effective-skills/SKILL.md) | How to write descriptions that trigger reliably and bodies built for progressive disclosure. |
| **Manifest** | [`.claude-plugin/plugin.json`](.claude-plugin/plugin.json) | Name, version, author, license, keywords. |

A **dogfooding** plugin — used to raise the quality of every other skill in the catalog.

## Try it (Claude Code)

```
/plugin marketplace add meaganewaller/rosetta
/plugin install skill-writer@rosetta
/write-skill keep-a-changelog
```

## Category

`Documentation` — see the [taxonomy](../../docs/categories.md).
