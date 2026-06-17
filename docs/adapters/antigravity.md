# Google Antigravity adapter

Translates a canonical (Claude Code format) plugin into [Google Antigravity](https://antigravity.google)'s
native project files. Antigravity is Google's agentic IDE (and CLI), built on the `.agents/`
**Agent Skills open standard** — the same `SKILL.md` convention Codex, OpenCode, and Zed read.
Its standout trait among the adapters: a Claude **command** lands in a real slash-invoked home
(an Antigravity *workflow*), so the slash-command concept survives where Codex and Zed demote it.

> **Verified against [antigravity.google/docs](https://antigravity.google/docs) in June 2026.**
> Formats evolve; the golden-file tests (`tests/antigravity.test.ts`) catch output drift, but the
> *mapping* below needs a human re-check against the live docs.

## Component mapping

| Canonical component | Antigravity target | Fidelity | What transfers / what's lost |
|---------------------|--------------------|----------|------------------------------|
| **Skill** (`skills/<n>/SKILL.md`) | `.agents/skills/<n>/SKILL.md` | **NATIVE** | Antigravity skills use the **same `SKILL.md` format** (`name` + `description` frontmatter + body) under the `.agents/` standard. 1:1 relocation. |
| **Command** (`commands/<n>.md`) | `.agents/workflows/<n>.md` | **NATIVE** or **DEMOTED** | Workflows are saved prompts invoked as slash commands (`/n`), so the slash-command concept is **kept**. **DEMOTED** only when the source sets `allowed-tools` (workflows don't scope tools) or uses `$1`/`$ARGUMENTS` (not interpolated in workflows). |
| **Agent** (`agents/<n>.md`) | `.agents/rules/agent-<n>.md` | **DEMOTED** | Antigravity has **no per-file subagent** primitive (personas live in `AGENTS.md` + `.agents/rules/`). The agent body becomes a model-applied rule, not a separate subagent; `model` and `tools` are dropped. |
| **MCP** (`.mcp.json`) | `mcp_config.json` (`mcpServers`) | **DEMOTED** | Converted to Antigravity's shape — remote servers use **`serverUrl`** (not `url`). Always **DEMOTED**: the MCP config is **global** (`~/.gemini/antigravity/mcp_config.json`), never project-scoped, so it can't ship inside the project. |
| **Hook** (`hooks/hooks.json`) | — | **SKIPPED** | No Antigravity equivalent. Reported, never silently dropped. |

### Where Antigravity sits among the adapters

`.agents/skills/` is shared territory — Codex, OpenCode (via `.claude`/`.agents`), Zed, and
Antigravity all read it. What's distinct here is the **command** target:

| Component | Antigravity | Codex | Zed |
|-----------|-------------|-------|-----|
| Command | **workflow** (real `/slash` command) | demoted → skill | demoted → manual skill |
| Agent | demoted → rule | subagent `.toml` (kept) | demoted → skill |

Antigravity keeps slash commands (as workflows) but, like Cursor and Zed, has no file-based
subagent — so agents demote to rules. The report tells the consumer exactly which trade they got.

## Worked example — `changelog`

```
$ node src/cli.ts inspect changelog --harness antigravity

changelog → antigravity

  ✓ NATIVE  skill:keep-a-changelog → .agents/skills/keep-a-changelog/SKILL.md
  ~ DEMOTED command:changelog → .agents/workflows/changelog.md
            ↳ allowed-tools has no workflow equivalent (workflows don't scope tools); argument placeholders ($1/$ARGUMENTS) are not interpolated in workflows
  ~ DEMOTED agent:release-notes-writer → .agents/rules/agent-release-notes-writer.md
            ↳ runs as a model-applied rule, not a separate subagent; model (sonnet) dropped — Antigravity uses its own model ids; tool list dropped — Antigravity uses its own tool names

  3 file(s); 1 native, 2 demoted
```

Output is locked under [`tests/golden/antigravity/changelog/`](../../tests/golden/antigravity/changelog).

## Verified facts (June 2026)

- **Skills** — `.agents/skills/<name>/SKILL.md` with `name` (optional; defaults to the directory)
  + `description` (required, the trigger phrase) frontmatter, plus optional `scripts/`,
  `examples/`, `resources/` assets. Backward-compatible with `.agent/skills/`.
- **Workflows** — `.agents/workflows/<name>.md`: saved prompts invoked in the Agent panel with a
  forward slash (`/deploy`, `/qa-check`).
- **Rules** — `.agents/rules/<name>.md`: model-applied guidance (with activation modes such as
  glob patterns). Defaults to `.agents/rules`, backward-compatible with `.agent/rules`.
- **MCP** — global `mcp_config.json` under `~/.gemini/antigravity/` (macOS/Linux) or
  `%USERPROFILE%\.gemini\antigravity\` (Windows); root key `mcpServers`; local servers use
  `command`/`args`/`env`, **remote servers use `serverUrl`** + `headers`.

Sources: [Agent Skills](https://antigravity.google/docs/skills),
[Rules & workflows](https://antigravity.google/docs/rules-workflows),
[MCP integration](https://antigravity.google/docs/mcp),
[install guide for an MCP server](https://github.com/github/github-mcp-server/blob/main/docs/installation-guides/install-antigravity.md).

## Known limitations

- **MCP is global, never project-scoped.** The emitted `mcp_config.json` is written under
  `.gemini/antigravity/` to mirror the home path, but it must be merged into
  `~/.gemini/antigravity/mcp_config.json` by hand — there is no project-local MCP config to ship.
- **Agents lose the subagent boundary.** With no per-file subagent primitive, an agent becomes a
  model-applied rule; its `model` and `tools` have no home and are dropped, not guessed.
- **Workflow arguments don't interpolate.** A command that relies on `$1`/`$ARGUMENTS` becomes a
  static workflow prompt; the report flags it as DEMOTED.
