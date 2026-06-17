# prompt-engineering

Write and review effective LLM prompts — specificity, structure, examples, explicit output
contracts, and the failure modes to design against. Provider-agnostic prompt craft.

## What's in it

| Component | File | What it does |
|-----------|------|--------------|
| **Skill** | [`skills/effective-prompting/SKILL.md`](skills/effective-prompting/SKILL.md) | How to make a prompt specific, structured, and testable; pulled in when writing or reviewing prompts. |
| **Command** | [`commands/prompt-review.md`](commands/prompt-review.md) | `/prompt-review [file]` — reviews a prompt and proposes a tightened rewrite. |
| **Manifest** | [`.claude-plugin/plugin.json`](.claude-plugin/plugin.json) | Name, version, author, license, keywords. |

Model selection and API knobs (temperature, token limits, thinking/effort) are deliberately out
of scope — those are provider-specific. This plugin is about the prompt itself.

## Try it (Claude Code)

```
/plugin marketplace add meaganewaller/rosetta
/plugin install prompt-engineering@rosetta
/prompt-review prompts/classify.md
```

## Category

`AI & ML` — see the [taxonomy](../../docs/categories.md).
