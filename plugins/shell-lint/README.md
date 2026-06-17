# shell-lint

Lint and harden shell scripts: run shellcheck, fix the findings, and apply robust-bash
conventions (strict mode, quoting, cleanup traps, portability).

## What's in it

| Component | File | What it does |
|-----------|------|--------------|
| **Command** | [`commands/shell-lint.md`](commands/shell-lint.md) | `/shell-lint [file]` — runs shellcheck on a script and applies fixes. |
| **Skill** | [`skills/writing-robust-bash/SKILL.md`](skills/writing-robust-bash/SKILL.md) | Strict mode, quoting, traps, safe patterns, and bash-vs-POSIX portability. |
| **Manifest** | [`.claude-plugin/plugin.json`](.claude-plugin/plugin.json) | Name, version, author, license, keywords. |

No hooks or MCP servers — only the components that translate cleanly across every harness.
The `/shell-lint` command expects `shellcheck` on the `PATH`; without it, the script is
reviewed manually against the skill.

## Try it (Claude Code)

```
/plugin marketplace add meaganewaller/rosetta
/plugin install shell-lint@rosetta
/shell-lint ./scripts/deploy.sh
```

## Category

`Bash / Shell` — see the [taxonomy](../../docs/categories.md).
