# OpenCode adapter

Translates a canonical (Claude Code format) plugin into [OpenCode](https://opencode.ai)'s
native project files. OpenCode is the closest model to Claude Code, so this is the
**highest-fidelity adapter** — every component type has a native home; only metadata
(`allowed-tools`, `model`, `tools`) is lost.

> **Verified against [opencode.ai/docs](https://opencode.ai/docs) in June 2026.** Formats
> evolve; the golden-file tests (`tests/opencode.test.ts`) catch output drift, but the
> *mapping* below needs a human re-check against the live docs.

## Component mapping

| Canonical component | OpenCode target | Fidelity | What transfers / what's lost |
|---------------------|-----------------|----------|------------------------------|
| **Skill** (`skills/<n>/SKILL.md`) | `.opencode/skills/<n>/SKILL.md` | **NATIVE** | OpenCode skills use the same `SKILL.md` format. 1:1 relocation. (OpenCode even reads `.claude/skills/` and `.agents/skills/` directly.) |
| **Command** (`commands/<n>.md`) | `.opencode/commands/<n>.md` | **NATIVE** or **DEMOTED** | `description` transfers; the body keeps **both** `$ARGUMENTS` and positional `$1..$9` (OpenCode interpolates them, unlike Cursor/Codex). **DEMOTED** only if `allowed-tools` is set — there's no command-level tool field (tool access is set on the agent a command runs as). |
| **Agent** (`agents/<n>.md`) | `.opencode/agents/<n>.md` (`mode: subagent`) | **NATIVE** or **DEMOTED** | The subagent concept is preserved (`mode: subagent`). **DEMOTED** when the source sets `model` (OpenCode uses `provider/model` ids) or `tools` (OpenCode scopes via the agent `permission` object). |
| **MCP** (`.mcp.json`) | `opencode.json` (`mcp` key) | **NATIVE** or **DEMOTED** | Converted to OpenCode's `{ type: "local", command: [...] }` / remote shape. **DEMOTED** if it uses `${CLAUDE_PLUGIN_ROOT}`. Merge the `mcp` key into an existing `opencode.json` if present. |
| **Hook** (`hooks/hooks.json`) | — | **SKIPPED** | OpenCode uses a TypeScript plugin system, not declarative hooks. Reported, never silently dropped. |

## Worked example — `changelog`

```
$ node src/cli.ts inspect changelog --harness opencode

changelog → opencode

  ✓ NATIVE  skill:keep-a-changelog → .opencode/skills/keep-a-changelog/SKILL.md
  ~ DEMOTED command:changelog → .opencode/commands/changelog.md
            ↳ allowed-tools has no command-level equivalent (set tool access on an agent)
  ~ DEMOTED agent:release-notes-writer → .opencode/agents/release-notes-writer.md
            ↳ model (sonnet) dropped — OpenCode uses provider/model ids; tool list dropped — OpenCode scopes via the agent `permission` object

  3 file(s); 1 native, 2 demoted
```

Output is locked under [`tests/golden/opencode/changelog/`](../../tests/golden/opencode/changelog).
Note the demotions here are the *thinnest* of any adapter so far: the command keeps its `$1`
argument and the agent stays a subagent — only metadata that has no OpenCode equivalent is dropped.

## Verified facts (June 2026)

- **Directories are plural**: `.opencode/agents/`, `.opencode/commands/`, `.opencode/skills/`
  (singular forms are accepted for backwards compatibility).
- **Agents** — markdown with frontmatter `description`, `mode` (`primary` / `subagent` / `all`),
  `model`, `permission`, `temperature`. A subagent is `mode: subagent`.
- **Commands** — markdown with frontmatter `description` / `agent` / `model` / `subtask`; body
  supports `$ARGUMENTS` and positional `$1..$9`.
- **Skills** — `skills/<name>/SKILL.md` with `name` + `description` frontmatter; also discovered
  from `.claude/skills/` and `.agents/skills/`.
- **MCP** — `opencode.json` `mcp` object: local `{ type:"local", command:[…], environment, enabled }`,
  remote `{ type:"remote", url, headers, enabled }`.

Sources: [OpenCode agents](https://opencode.ai/docs/agents),
[commands](https://opencode.ai/docs/commands),
[skills](https://opencode.ai/docs/skills),
[MCP servers](https://opencode.ai/docs/mcp-servers).

## Known limitations

- **`opencode.json` is overwritten, not merged.** MCP output is a standalone `opencode.json`
  with just the `mcp` key; the report flags that it must be merged into an existing one.
- **Agent `model`/`tools` are dropped, not translated.** Claude model names and tool lists
  don't map onto OpenCode's `provider/model` ids and `permission` object, so they're omitted.
