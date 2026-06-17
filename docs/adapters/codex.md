# Codex CLI adapter

Translates a canonical (Claude Code format) plugin into [OpenAI Codex CLI](https://developers.openai.com/codex)'s
native project files. This is the second adapter, and it stresses the [contract](../architecture.md#the-adapter-layer)
differently than [Cursor](cursor.md): Codex now has its own **Skills** and **Subagents**, so
the fidelity profile is almost the inverse of Cursor's.

> **Verified against [developers.openai.com/codex](https://developers.openai.com/codex) in
> June 2026.** Formats evolve; the golden-file tests (`tests/codex.test.ts`) catch output
> drift, but the *mapping* below needs a human re-check against the live docs.

## Component mapping

| Canonical component | Codex target | Fidelity | What transfers / what's lost |
| --------------------- | -------------- | ---------- | ------------------------------ |
| **Skill** (`skills/<n>/SKILL.md`) | `.agents/skills/<n>/SKILL.md` | **NATIVE** | Codex skills use the **same `SKILL.md` format** (name + description frontmatter + body). Essentially a 1:1 relocation. |
| **Command** (`commands/<n>.md`) | `.agents/skills/<n>/SKILL.md` | **DEMOTED** | Codex has **no project-scoped slash command** — custom prompts live only in `~/.codex/prompts` and are deprecated. Mapped to an explicitly-invokable skill; `allowed-tools` and `$1`/`$ARGUMENTS` are not represented. |
| **Agent** (`agents/<n>.md`) | `.codex/agents/<n>.toml` | **NATIVE** or **DEMOTED** | Codex **has subagents** (`name` / `description` / `developer_instructions`), so the subagent concept survives — unlike Cursor. **DEMOTED** when the source sets `model` (Codex's model namespace differs) or `tools` (Codex scopes via `sandbox_mode` / `mcp_servers`). |
| **MCP** (`.mcp.json`) | `.codex/config.toml` | **NATIVE** or **DEMOTED** | Emitted as `[mcp_servers.<name>]` TOML tables. **DEMOTED** if the config uses `${CLAUDE_PLUGIN_ROOT}`, which doesn't resolve in Codex. Merge into an existing `config.toml` if present. |
| **Hook** (`hooks/hooks.json`) | — | **SKIPPED** | No Codex equivalent. Reported, never silently dropped. |

### Cursor vs. Codex — the contrast

The same plugin lands differently, which is exactly why the report exists:

| Component | Cursor | Codex |
| ----------- | -------- | ------- |
| Skill | NATIVE (as a `.mdc` rule) | NATIVE (as a Codex skill) |
| Command | NATIVE/DEMOTED (real slash command) | **DEMOTED** (no slash command → skill) |
| Agent | **DEMOTED** (subagent concept lost → rule) | **DEMOTED** (subagent concept *kept* → `.toml`) |

Cursor keeps commands but loses the subagent idea; Codex keeps the subagent idea but loses
project slash commands. Neither is "better" — the report tells the consumer which trade they got.

## Worked example — `changelog`

```
$ node src/cli.ts inspect changelog --harness codex

changelog → codex

  ✓ NATIVE  skill:keep-a-changelog → .agents/skills/keep-a-changelog/SKILL.md
  ~ DEMOTED command:changelog → .agents/skills/changelog/SKILL.md
            ↳ user-invoked slash command → explicitly-invoked skill; allowed-tools dropped; argument placeholders not represented in a skill
  ~ DEMOTED agent:release-notes-writer → .codex/agents/release-notes-writer.toml
            ↳ model (sonnet) dropped — Codex model namespace differs; tool list dropped — Codex scopes via sandbox_mode / mcp_servers

  3 file(s); 1 native, 2 demoted
```

Output is locked under [`tests/golden/codex/changelog/`](../../tests/golden/codex/changelog).

## Verified facts (June 2026)

- **Skills** — `SKILL.md` with `name` + `description` frontmatter; discovered under
  `.agents/skills/` scanning from the cwd up to the repo root (or global `~/.codex/skills/`).
- **Subagents** — standalone TOML files in `.codex/agents/` (project) or `~/.codex/agents/`
  (personal); required fields `name`, `description`, `developer_instructions`; optional
  `model`, `sandbox_mode`, `mcp_servers`.
- **MCP** — `[mcp_servers.<name>]` tables in `config.toml` (`~/.codex/config.toml`, or
  project `.codex/config.toml` in trusted projects).
- **Custom prompts** — `~/.codex/prompts/*.md`, **deprecated** in favor of skills, and
  global-only (not project-scoped).

Sources: [Codex skills](https://developers.openai.com/codex/skills),
[Codex subagents](https://developers.openai.com/codex/subagents),
[Codex MCP](https://developers.openai.com/codex/mcp),
[Codex custom prompts](https://developers.openai.com/codex/custom-prompts).

## Known limitations

- **Skill/command name collisions.** `.agents/skills/<name>/` is flat; a skill and a command
  sharing a name within a plugin (or across plugins) would collide. Not yet namespaced.
- **`config.toml` is overwritten, not merged.** MCP output is a standalone `config.toml`; the
  report flags that it must be merged into an existing one. A real merge needs a TOML parser.
- **Agent model is dropped, not translated.** Claude model names (`sonnet`) aren't Codex
  models, so the field is omitted rather than guessed.
