# Cursor adapter

Translates a canonical (Claude Code format) plugin into [Cursor](https://cursor.com)'s native
project files. This is the first adapter — it proves the [adapter contract](../architecture.md#the-adapter-layer)
before the others are built.

> **Verified against [cursor.com/docs](https://cursor.com/docs) in June 2026.** Cursor's
> formats evolve; if this drifts, the golden-file tests (`tests/cursor.test.ts`) will catch
> the output change, but the *mapping* below needs a human re-check against the live docs.

## Component mapping

| Canonical component | Cursor target | Fidelity | What transfers / what's lost |
| --------------------- | --------------- | ---------- | ------------------------------ |
| **Skill** (`skills/<n>/SKILL.md`) | `.cursor/rules/<plugin>/<n>.mdc` | **NATIVE** | Becomes an "Apply Intelligently" rule (`description` set, `alwaysApply: false`). The skill description becomes the rule's trigger, preserving on-demand/progressive-disclosure semantics. Body transfers verbatim. |
| **Command** (`commands/<n>.md`) | `.cursor/commands/<n>.md` | **NATIVE** or **DEMOTED** | Cursor commands are plain Markdown with **no frontmatter** — the body is the prompt. NATIVE when the command is just description + body; **DEMOTED** when it uses `allowed-tools` (no Cursor equivalent) or `$1`/`$ARGUMENTS` (may not interpolate). The `description` is prepended to the body so intent isn't lost. |
| **Agent** (`agents/<n>.md`) | `.cursor/rules/<plugin>/agent-<n>.mdc` | **DEMOTED** | Cursor has no file-based subagent primitive, so the agent's system prompt becomes an "Apply Intelligently" rule. Lost: it runs **inline** rather than as a separate subagent, plus tool scoping and any model override. |
| **MCP** (`.mcp.json`) | `.cursor/mcp.json` | **NATIVE** or **DEMOTED** | Same `mcpServers` schema. **DEMOTED** if the config uses `${CLAUDE_PLUGIN_ROOT}`, which doesn't resolve in Cursor (use `${workspaceFolder}`). |
| **Hook** (`hooks/hooks.json`) | — | **SKIPPED** | No Cursor plugin-hook equivalent. Reported, never silently dropped. |

Every `add`/`inspect` prints a per-component report (`NATIVE / DEMOTED / INLINED / SKIPPED`)
so consumers see exactly what landed.

## Worked example — `changelog`

```
$ node src/cli.ts inspect changelog --harness cursor

changelog → cursor

  ✓ NATIVE  skill:keep-a-changelog → .cursor/rules/changelog/keep-a-changelog.mdc
  ~ DEMOTED command:changelog → .cursor/commands/changelog.md
            ↳ allowed-tools has no Cursor equivalent; argument placeholders ($1/$ARGUMENTS) may not interpolate
  ~ DEMOTED agent:release-notes-writer → .cursor/rules/changelog/agent-release-notes-writer.mdc
            ↳ runs inline as a rule, not as a separate subagent; tool scoping dropped; model override (sonnet) dropped

  3 file(s); 1 native, 2 demoted
```

The exact output is locked as golden files under
[`tests/golden/cursor/changelog/`](../../tests/golden/cursor/changelog).

## Verified facts (June 2026)

- **Rules** — `.cursor/rules/*.mdc`, frontmatter fields `description` / `globs` / `alwaysApply`.
  "Apply Intelligently" = `alwaysApply: false` + `description`, no `globs`. Rules may live in
  subdirectories, so we namespace per plugin (`.cursor/rules/<plugin>/`) to avoid collisions.
- **Commands** — `.cursor/commands/*.md`, **no frontmatter**; the filename is the command name
  and the file content is the prompt.
- **MCP** — `.cursor/mcp.json` with an `mcpServers` object (`command`/`args`/`env` for local,
  `url`/`headers` for remote).

Sources: [Cursor rules docs](https://cursor.com/docs/context/rules),
[Cursor MCP docs](https://cursor.com/docs/context/mcp), and the Cursor 1.6 custom-commands release.

## Known limitations

- **Command-name collisions.** `.cursor/commands/` is flat; two plugins with the same command
  name would collide. Rules are namespaced per plugin; commands are not yet. (Tracked for the
  CLI work — likely a `<plugin>-<command>` prefix or an opt-in.)
- **Agent demotion is lossy by nature.** A subagent's isolation (own context, own tools, own
  model) cannot be represented as a rule. The report says so per agent.
- **Argument interpolation.** Commands authored with `$1`/`$ARGUMENTS` carry the text through,
  but Cursor may not substitute it. Flagged as DEMOTED.
