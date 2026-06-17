# Gemini CLI adapter

Translates a canonical (Claude Code format) plugin into [Gemini CLI](https://geminicli.com)'s
native project files. Gemini's structure is the most distinct so far — **TOML commands** and a
`settings.json` for MCP — but it has converged with the others on native skills and subagents.

> **Verified against [geminicli.com/docs](https://geminicli.com/docs) in June 2026.** Formats
> evolve; the golden-file tests (`tests/gemini.test.ts`) catch output drift, but the *mapping*
> below needs a human re-check against the live docs.

## Component mapping

| Canonical component | Gemini target | Fidelity | What transfers / what's lost |
| --------------------- | --------------- | ---------- | ------------------------------ |
| **Skill** (`skills/<n>/SKILL.md`) | `.gemini/skills/<n>/SKILL.md` | **NATIVE** | Gemini Agent Skills use the same `SKILL.md` format (also reads the `.agents/skills/` alias). |
| **Command** (`commands/<n>.md`) | `.gemini/commands/<n>.toml` | **NATIVE** or **DEMOTED** | TOML with `description` + `prompt`. `$ARGUMENTS` is rewritten to Gemini's `{{args}}`. **DEMOTED** when the body uses positional `$1..$9` (Gemini injects *all* args via `{{args}}`) or `allowed-tools` (no command-level equivalent). |
| **Agent** (`agents/<n>.md`) | `.gemini/agents/<n>.md` | **NATIVE** or **DEMOTED** | Gemini subagents are Markdown + frontmatter (`name`, `description`, body = system prompt). The subagent concept is preserved. **DEMOTED** when the source sets `model` or `tools` (Gemini has its own model ids and tool names). |
| **MCP** (`.mcp.json`) | `.gemini/settings.json` (`mcpServers`) | **NATIVE** or **DEMOTED** | Same `mcpServers` shape. **DEMOTED** if it uses `${CLAUDE_PLUGIN_ROOT}`. Merge `mcpServers` into an existing `settings.json` if present. |
| **Hook** (`hooks/hooks.json`) | — | **SKIPPED** | No Gemini equivalent. Reported, never silently dropped. |

## Worked example — `changelog`

```
$ node src/cli.ts inspect changelog --harness gemini

changelog → gemini

  ✓ NATIVE  skill:keep-a-changelog → .gemini/skills/keep-a-changelog/SKILL.md
  ~ DEMOTED command:changelog → .gemini/commands/changelog.toml
            ↳ positional args ($1..$9) — Gemini injects all args via {{args}}; allowed-tools has no Gemini command equivalent
  ~ DEMOTED agent:release-notes-writer → .gemini/agents/release-notes-writer.md
            ↳ model (sonnet) dropped — Gemini uses its own model ids; tool list dropped — Gemini uses its own tool names

  3 file(s); 1 native, 2 demoted
```

Output is locked under [`tests/golden/gemini/changelog/`](../../tests/golden/gemini/changelog).

## Verified facts (June 2026)

- **Commands** — TOML files in `.gemini/commands/` (subdirs namespace the command, e.g.
  `git/commit.toml` → `/git:commit`); fields `description` + `prompt`; arguments via `{{args}}`.
- **Subagents** — Markdown + YAML frontmatter in `.gemini/agents/`; fields `name`, `description`,
  optional `kind`, `tools`, `model`, `temperature`, `max_turns`, `timeout_mins`; body is the
  system prompt.
- **Skills** — `.gemini/skills/<name>/SKILL.md` with `name` + `description` frontmatter (also the
  `.agents/skills/` alias).
- **MCP** — `mcpServers` object in `.gemini/settings.json` (`command` / `url` / `args` / `env` /
  `cwd` / `timeout` / `trust`).

Sources: [Gemini custom commands](https://geminicli.com/docs/cli/custom-commands/),
[subagents](https://geminicli.com/docs/core/subagents/),
[skills](https://geminicli.com/docs/cli/skills/),
[MCP servers](https://geminicli.com/docs/tools/mcp-server/).

## Known limitations

- **Positional arguments aren't translated.** `$ARGUMENTS` → `{{args}}` is exact, but `$1..$9`
  have no Gemini equivalent (`{{args}}` injects the whole argument string), so they're left
  in place and flagged.
- **`settings.json` is overwritten, not merged.** MCP output is a standalone `settings.json`
  with just `mcpServers`; the report flags that it must be merged into an existing one.
- **Agent `model`/`tools` are dropped, not translated.** Claude model names and tool lists
  don't map onto Gemini's ids and tool names.
