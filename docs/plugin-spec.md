# Plugin spec (canonical format)

This is the reference for the format you author in. It is **Claude Code's plugin format**,
which we adopt as the canonical source of truth (see [architecture](architecture.md#why-claude-code-is-the-source-of-truth)).
Everything in the catalog conforms to this; everything per-harness is generated from it.

> Status: this spec tracks Claude Code's plugin format. Where Claude Code's own docs and
> this doc disagree, Claude Code's docs win and this is a bug — open an issue. The
> validator (Phase 1) is the executable version of this spec.

## Directory layout

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json          # required: the manifest
├── commands/                # optional: user-invoked slash commands
│   └── *.md
├── skills/                  # optional: model-invoked skills
│   └── <skill-name>/
│       └── SKILL.md
├── agents/                  # optional: autonomous subagents
│   └── *.md
├── hooks/                   # optional: event-driven automation (Claude Code only)
│   └── hooks.json
├── .mcp.json                # optional: MCP server definitions
└── README.md                # required (in this catalog): what/why/how-to-use
```

Directories are **auto-discovered**. You do not register components in the manifest; their
presence on disk is the registration.

## The manifest: `plugin.json`

```json
{
  "name": "changelog",
  "description": "Generate and maintain a Keep a Changelog–style CHANGELOG.md from git history.",
  "version": "0.1.0",
  "author": { "name": "Meagan Waller" },
  "homepage": "https://github.com/meaganewaller/agents/tree/main/examples/changelog",
  "license": "MIT",
  "keywords": ["changelog", "release-notes", "documentation"]
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `name` | ✅ | kebab-case, unique within the catalog. Becomes the install identifier. |
| `description` | ✅ | One sentence. Shown in catalog listings and search. |
| `version` | ✅ (catalog) | SemVer. See [versioning](#versioning). |
| `author` | ✅ (catalog) | Object with at least `name`. |
| `license` | ✅ (catalog) | SPDX identifier. Plugins ship as source. |
| `keywords` | recommended | Drives search + category placement. |
| `homepage` | optional | Canonical URL for the plugin. |

> "(catalog)" = required by *this marketplace's* contribution rules even if Claude Code
> treats it as optional. The [validator](../CONTRIBUTING.md) enforces these.

Every catalog plugin also declares **at least one category** from the
[taxonomy](categories.md). The mechanism (a `categories` field vs. catalog-side metadata)
is finalized in [Phase 1](../ROADMAP.md#phase-1--canonical-authoring--git-marketplace).

## Components

### Skills — `skills/<name>/SKILL.md`

Model-invoked knowledge. The model reads the `description` to decide when to pull the skill
into context (progressive disclosure). Keep `SKILL.md` focused; link out to supporting
files in the same directory for depth.

```markdown
---
name: keep-a-changelog
description: >-
  Use when writing or updating a CHANGELOG. Applies the Keep a Changelog format
  (Added/Changed/Deprecated/Removed/Fixed/Security) and SemVer-aligned headings.
---

# Keep a Changelog

<the actual procedure / knowledge>
```

- `name` — kebab-case, unique within the plugin.
- `description` — the single most important field for skills: it is the *trigger*. Write it
  as "Use when …" so the model can match intent. Vague descriptions = skills that never fire.

### Commands — `commands/<name>.md`

User-invoked (slash commands in Claude Code, prompts elsewhere). The body is the prompt;
`$ARGUMENTS` / `$1`, `$2` interpolate user input.

```markdown
---
description: Generate or update CHANGELOG.md from git history.
argument-hint: "[version]"
allowed-tools: "Bash(git log:*), Bash(git tag:*), Read, Edit"
---

Update the changelog for version $1 ...
```

- `description` — shown in the command picker.
- `argument-hint` — UI hint for expected args.
- `allowed-tools` — least-privilege tool grant. **Security-relevant**: this is part of the
  executable surface adapters and reviewers care about.

### Agents — `agents/<name>.md`

Autonomous subagents with their own tool set and (optionally) model. Invoked by the main
agent for a scoped task.

```markdown
---
name: release-notes-writer
description: >-
  Use to turn a range of commits into human-readable release notes grouped by theme.
tools: Read, Grep, Glob, Bash
model: sonnet
---

You are a release-notes writer. <system prompt>
```

- `tools` — least-privilege list. Omit to inherit all.
- `model` — optional override (`opus`, `sonnet`, `haiku`, …).
- `description` — when the orchestrator should delegate to this agent.

### Hooks — `hooks/hooks.json`

Event-driven automation (e.g. `PreToolUse`, `PostToolUse`, `Stop`). **Claude Code–specific
today.** Adapters for other harnesses will `SKIP` hooks with a reported warning until/unless
a target gains an equivalent. Document any hook's behavior in the plugin README so consumers
on other harnesses know what they're missing.

### MCP servers — `.mcp.json`

External tools/services over the Model Context Protocol. The **most portable** component —
most harnesses consume MCP. Use `${CLAUDE_PLUGIN_ROOT}` for paths so the config is
relocatable.

## Versioning

- Plugins use **SemVer**.
- Breaking changes to a plugin's command names, agent names, or behavior contract → major bump.
- The catalog records version history; consumers can pin. Deprecation policy is defined in
  [ROADMAP § Phase 5](../ROADMAP.md#phase-5--governance-versioning--sustainability).

## Authoring constraints for the catalog

To keep the catalog adapter-friendly and reviewable:

- **No absolute paths.** Use `${CLAUDE_PLUGIN_ROOT}` for anything path-like.
- **Declare tools explicitly.** `allowed-tools` / `tools` should be least-privilege; this
  feeds both security review and adapter fidelity.
- **Write trigger-quality descriptions.** Especially for skills and agents.
- **One plugin, one coherent capability.** Don't ship a grab-bag; split it.
- **Ship a README.** What it does, why, how to invoke, and a note on any non-portable
  components (hooks).

## Read next

- [Architecture](architecture.md) — how this format becomes six harness packages.
- [Contributing](../CONTRIBUTING.md) — the submission + validation flow.
- [Example plugin](../examples/changelog/) — this spec, fully worked.
