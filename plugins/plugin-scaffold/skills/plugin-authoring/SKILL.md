---
name: plugin-authoring
description: >-
  Use when creating or structuring a Claude Code plugin for this marketplace — the on-disk
  layout, the plugin.json manifest fields, the frontmatter for skills/commands/agents, and the
  authoring rules (no absolute paths, least-privilege tools, one coherent capability).
---

# Authoring a catalog plugin

A plugin is **one coherent capability** authored once in Claude Code's format. Everything else
(Cursor, Codex, OpenCode, Gemini, Copilot) is generated from it by the adapters, so author for
the canonical format and let translation handle the rest.

## Directory layout

```
my-plugin/
├── .claude-plugin/plugin.json   # required manifest
├── README.md                    # required: what / why / how-to-use
├── skills/<name>/SKILL.md        # optional: model-invoked knowledge
├── commands/<name>.md            # optional: user-invoked slash commands
├── agents/<name>.md              # optional: subagents
├── hooks/hooks.json              # optional (Claude Code only — note it in the README)
└── .mcp.json                     # optional: MCP servers
```

Directories are auto-discovered; presence on disk *is* registration.

## `plugin.json`

Required: `name` (kebab-case, unique), `description` (one sentence), `version` (SemVer),
`author.name`, `license` (SPDX). Recommended: `keywords` (drives search). **Category is not a
manifest field** — it lives catalog-side in `marketplace.json`.

## Component frontmatter

- **Skill** — `name` + `description`. The description is the *trigger*: write "Use when …".
- **Command** — `description`, optional `argument-hint`, and least-privilege `allowed-tools`.
- **Agent** — `name` + `description` (when to delegate), optional `tools` and `model`.

## Authoring rules

- **No absolute paths.** Use `${CLAUDE_PLUGIN_ROOT}` for anything path-like.
- **Least privilege.** Declare `allowed-tools` / `tools` narrowly — it feeds both security review
  and adapter fidelity.
- **Trigger-quality descriptions**, especially for skills and agents (see the
  `writing-effective-skills` skill).
- **One plugin, one capability.** If it's two things, ship two plugins.
- **Ship a README** and note any non-portable components (hooks won't reach other harnesses).

## Portability

Prefer skills and commands — they translate cleanly everywhere. `SKILL.md` is now a
cross-harness open standard, so skills are the highest-leverage, most portable component.
Treat hooks as Claude-Code-only enhancements, never load-bearing behavior.
