# GitHub Copilot adapter

Translates a canonical (Claude Code format) plugin into [GitHub Copilot](https://github.com/features/copilot)'s
VS Code customization files. This is the last Tier-3 adapter — and it turned out higher-fidelity
than expected, because Copilot has adopted the Agent Skills open standard.

> **Verified against [code.visualstudio.com/docs](https://code.visualstudio.com/docs) and
> [docs.github.com](https://docs.github.com/copilot) in June 2026.** Formats evolve; the
> golden-file tests (`tests/copilot.test.ts`) catch output drift, but the *mapping* below
> needs a human re-check against the live docs.

## Component mapping

| Canonical component | Copilot target | Fidelity | What transfers / what's lost |
|---------------------|----------------|----------|------------------------------|
| **Skill** (`skills/<n>/SKILL.md`) | `.github/skills/<n>/SKILL.md` | **NATIVE** | Copilot Agent Skills use the same `SKILL.md` (the open standard; also reads `.claude/skills/` and `.agents/skills/`). |
| **Command** (`commands/<n>.md`) | `.github/prompts/<n>.prompt.md` | **NATIVE** or **DEMOTED** | Slash-invoked prompt file with `description` + `mode: agent`. **DEMOTED** when the body uses `$1`/`$ARGUMENTS` (Copilot uses `${input:…}` variables) or `allowed-tools` (Copilot has its own tool names). |
| **Agent** (`agents/<n>.md`) | `.github/agents/<n>.agent.md` | **NATIVE** or **DEMOTED** | Copilot custom agents (formerly chat modes) are personas with their own instructions. **DEMOTED** when the source sets `model` or `tools` (Copilot has its own ids/names). |
| **MCP** (`.mcp.json`) | `.vscode/mcp.json` | **NATIVE** or **DEMOTED** | Note the root key is **`servers`**, not `mcpServers`; stdio servers get `type: "stdio"`. **DEMOTED** if it uses `${CLAUDE_PLUGIN_ROOT}`. |
| **Hook** (`hooks/hooks.json`) | — | **SKIPPED** | No Copilot equivalent. Reported, never silently dropped. |

## Worked example — `changelog`

```
$ node src/cli.ts inspect changelog --harness copilot

changelog → copilot

  ✓ NATIVE  skill:keep-a-changelog → .github/skills/keep-a-changelog/SKILL.md
  ~ DEMOTED command:changelog → .github/prompts/changelog.prompt.md
            ↳ Copilot prompt files use ${input:…} variables, not $1/$ARGUMENTS; allowed-tools not mapped — Copilot uses its own tool names
  ~ DEMOTED agent:release-notes-writer → .github/agents/release-notes-writer.agent.md
            ↳ model (sonnet) dropped — Copilot uses its own model ids; tool list dropped — Copilot uses its own tool names

  3 file(s); 1 native, 2 demoted
```

Output is locked under [`tests/golden/copilot/changelog/`](../../tests/golden/copilot/changelog).

## Verified facts (June 2026)

- **Skills** — `.github/skills/<name>/SKILL.md` (Agent Skills open standard, shared across VS Code,
  the Copilot CLI, and the cloud agent; also `.claude/skills/` and `.agents/skills/`).
- **Prompt files** — `.github/prompts/<name>.prompt.md`; frontmatter `description` / `mode` /
  `model` / `tools`; invoked as `/name` in chat; arguments via `${input:…}` variables.
- **Custom agents** — `.github/agents/<name>.agent.md` (formerly chat modes in
  `.github/chatmodes/*.chatmode.md`); a persona with its own instructions, tools, and model.
- **MCP** — `.vscode/mcp.json` with the root key **`servers`** (not `mcpServers`); MCP tools work
  in Agent mode.

Sources: [VS Code Copilot customization](https://code.visualstudio.com/docs/copilot/copilot-customization),
[VS Code Agent Skills](https://code.visualstudio.com/docs/agent-customization/agent-skills),
[GitHub agent skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills),
[VS Code MCP servers](https://code.visualstudio.com/docs/agent-customization/mcp-servers).

## Known limitations

- **Targets the VS Code customization surface.** Copilot spans VS Code chat, the CLI, and the
  cloud agent; this adapter emits the repo-committed `.github/*` + `.vscode/mcp.json` files,
  which the VS Code experience and (for skills/instructions) the cloud agent read.
- **Argument variables aren't translated.** `$1`/`$ARGUMENTS` are left in place and flagged;
  Copilot prompt files use `${input:…}` variables.
- **`.vscode/mcp.json` is overwritten, not merged.**
