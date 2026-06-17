# Zed adapter

Translates a canonical (Claude Code format) plugin into [Zed](https://zed.dev)'s native project
files. Zed recently reshaped its agent surface: **reusable Rules were replaced by Skills**, and
always-on instructions moved to `AGENTS.md`. So Zed now reads the same `.agents/skills/` **Agent
Skills open standard** as Codex and Antigravity — which makes skills a clean 1:1, while commands
and agents (which have no dedicated Zed primitive) fold into skills.

> **Verified against [zed.dev/docs/ai](https://zed.dev/docs/ai) in June 2026.** Formats evolve;
> the golden-file tests (`tests/zed.test.ts`) catch output drift, but the *mapping* below needs a
> human re-check against the live docs.

## Component mapping

| Canonical component | Zed target | Fidelity | What transfers / what's lost |
|---------------------|-----------|----------|------------------------------|
| **Skill** (`skills/<n>/SKILL.md`) | `.agents/skills/<n>/SKILL.md` | **NATIVE** | Zed skills use the **same `SKILL.md` format** (`name` + `description` frontmatter, optional `disable-model-invocation`). Model-invoked or slash-invoked (`/n`). 1:1 relocation. |
| **Command** (`commands/<n>.md`) | `.agents/skills/<n>/SKILL.md` (`disable-model-invocation: true`) | **DEMOTED** | Zed has **no separate slash-command primitive** — skills *are* the slash commands. Setting `disable-model-invocation: true` keeps it explicitly-invoked (`/n`), not autonomous. `allowed-tools` and `$1`/`$ARGUMENTS` are not represented. |
| **Agent** (`agents/<n>.md`) | `.agents/skills/<n>/SKILL.md` | **DEMOTED** | Zed has **no file-based subagent** with a system prompt (Agent Profiles are tool scopes; External Agents are ACP binaries). The persona becomes a model-invoked skill; `model` and `tools` are dropped. |
| **MCP** (`.mcp.json`) | `.zed/settings.json` (`context_servers`) | **NATIVE** or **DEMOTED** | Converted to Zed's `context_servers` object — local `{ command, args, env }`, remote `{ url, headers }`. **DEMOTED** only if it uses `${CLAUDE_PLUGIN_ROOT}`, which doesn't resolve in Zed. Merge into an existing `.zed/settings.json` if present. |
| **Hook** (`hooks/hooks.json`) | — | **SKIPPED** | No Zed equivalent. Reported, never silently dropped. |

### Skills as the universal primitive

Because Zed retired Rules in favor of Skills, **all three prompt-bearing components land in
`.agents/skills/`** — skills natively, commands as manual-only skills, agents as model-invoked
skills. That's a different shape than every other adapter:

| Component | Zed | Codex | OpenCode |
|-----------|-----|-------|----------|
| Skill | NATIVE (skill) | NATIVE (skill) | NATIVE (skill) |
| Command | DEMOTED (manual skill) | DEMOTED (skill) | NATIVE (command) |
| Agent | DEMOTED (skill) | NATIVE (subagent `.toml`) | NATIVE (subagent) |

## Worked example — `changelog`

```
$ node src/cli.ts inspect changelog --harness zed

changelog → zed

  ✓ NATIVE  skill:keep-a-changelog → .agents/skills/keep-a-changelog/SKILL.md
  ~ DEMOTED command:changelog → .agents/skills/changelog/SKILL.md
            ↳ slash command → manually-invoked skill (disable-model-invocation); allowed-tools dropped — Zed scopes tools via agent profiles; argument placeholders ($1/$ARGUMENTS) are not interpolated in skills
  ~ DEMOTED agent:release-notes-writer → .agents/skills/release-notes-writer/SKILL.md
            ↳ no file-based subagent — runs as a model-invoked skill, not a separate subagent; model (sonnet) dropped — Zed uses provider/model ids; tool list dropped — Zed scopes tools via agent profiles

  3 file(s); 1 native, 2 demoted
```

Output is locked under [`tests/golden/zed/changelog/`](../../tests/golden/zed/changelog).

## Verified facts (June 2026)

- **Skills** — `.agents/skills/<name>/SKILL.md` (project, in the worktree) or `~/.agents/skills/`
  (global); frontmatter `name` (lowercase/hyphens, ≤64) + `description` (≤1024); optional
  `disable-model-invocation: true` restricts a skill to manual `/name` / `@name` invocation.
  Skills replaced the former *Rules* feature.
- **Instructions** — always-on project rules now live in `AGENTS.md` (project and personal).
- **MCP / context servers** — `context_servers` key in `settings.json` (project `.zed/settings.json`
  or global): local `{ command, args, env }`, remote `{ url, headers }` (OAuth-capable).
- **Agent Profiles** — `agent.profiles` in settings choose which built-in and MCP tools a thread
  can use; they are tool scopes, **not** personas, so they can't carry an agent's instructions.

Sources: [Zed AI overview](https://zed.dev/docs/ai/overview),
[Skills](https://zed.dev/docs/ai/skills),
[MCP](https://zed.dev/docs/ai/mcp),
[Agent Profiles](https://zed.dev/docs/ai/agent-profiles).

## Known limitations

- **Everything prompt-bearing collapses into skills.** Commands and agents both become skills, so
  a command and an agent (or skill) sharing a name within a plugin would collide under
  `.agents/skills/<name>/`. Not yet namespaced.
- **The subagent boundary is lost.** An agent runs as model-invoked guidance, not a separate
  subagent with its own tool scope; `model` and `tools` are dropped rather than guessed.
- **`.zed/settings.json` is overwritten, not merged.** MCP output is a standalone settings file
  with just the `context_servers` key; the report flags that it must be merged into an existing one.
