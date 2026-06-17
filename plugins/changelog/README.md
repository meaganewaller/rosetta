# changelog

> Reference plugin — a registered catalog entry that also serves as the worked example for
> the [plugin spec](../../docs/plugin-spec.md), showing all the moving parts in one place.

Generate and maintain a [Keep a Changelog](https://keepachangelog.com/)–style `CHANGELOG.md`
from your git history, and turn tag ranges into polished release notes.

## What's in it

This plugin deliberately exercises three of the canonical component types so it doubles as a
spec demo:

| Component | File | What it does |
| ----------- | ------ | -------------- |
| **Command** | [`commands/changelog.md`](commands/changelog.md) | `/changelog [version]` — builds/updates `CHANGELOG.md` from commits since the last tag. |
| **Skill** | [`skills/keep-a-changelog/SKILL.md`](skills/keep-a-changelog/SKILL.md) | The Keep a Changelog formatting conventions, pulled in automatically when editing a changelog. |
| **Agent** | [`agents/release-notes-writer.md`](agents/release-notes-writer.md) | A subagent that turns a commit range into human-readable release notes grouped by theme. |
| **Manifest** | [`.claude-plugin/plugin.json`](.claude-plugin/plugin.json) | Name, version, author, license, keywords. |

There are intentionally **no hooks or MCP servers** here — keeping it to the components that
translate cleanly across all harnesses (see [portability](../../docs/architecture.md#components-and-how-they-translate)).

## How it translates

| Component | Claude Code | Codex CLI / OpenCode | Cursor | Gemini CLI | Copilot |
| ----------- | ------------- | ---------------------- | -------- | ------------ | --------- |
| `/changelog` command | native | custom prompt | command | TOML command | `*.prompt.md` |
| `keep-a-changelog` skill | native | `AGENTS.md` section | `.cursor/rules/*.mdc` | `GEMINI.md` section | `copilot-instructions.md` |
| `release-notes-writer` agent | native | agent / demoted | demoted to command | demoted | custom agent / demoted |

The table is **intended** translation — fidelity per harness is validated during
[Phase 2 adapter work](../../ROADMAP.md#phase-2--adapter-layer-cli-installer), and every
real install prints a translation report showing what actually landed.

## Try it (Claude Code)

```
/plugin marketplace add meaganewaller/rosetta
/plugin install changelog@rosetta
/changelog 1.2.0
```

## Category

`Documentation` — see the [taxonomy](../../docs/categories.md).
