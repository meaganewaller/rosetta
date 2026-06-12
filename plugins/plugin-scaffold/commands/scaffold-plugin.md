---
description: Scaffold a new catalog plugin skeleton in the canonical format.
argument-hint: "<plugin-name> [category]"
allowed-tools: "Write, Read, Bash(mkdir:*)"
---

Scaffold a new plugin named **$1** (category: **$2**, if given).

Apply the `plugin-authoring` skill for the exact conventions, then create this skeleton under
`plugins/$1/`:

1. `plugins/$1/.claude-plugin/plugin.json` — manifest with `name` ($1, kebab-case),
   `description` (one sentence), `version` (`0.1.0`), `author`, `license` (`MIT`), and
   `keywords`. Leave the description as a clear placeholder if the user didn't supply one.
2. `plugins/$1/README.md` — what the plugin does, a table of its components, and a "Try it"
   block (`/plugin install $1@rosetta`).
3. At least one component stub the user asks for:
   - `skills/<name>/SKILL.md` — frontmatter `name` + a "Use when…" `description`.
   - `commands/<name>.md` — frontmatter `description` + least-privilege `allowed-tools`.
   - `agents/<name>.md` — frontmatter `name` + `description` (+ `tools`, `model`).

Before writing, confirm the component set with the user if it's ambiguous. After scaffolding:

- Do **not** use absolute paths anywhere; use `${CLAUDE_PLUGIN_ROOT}` for path-like values.
- Remind the user to register the plugin in `.claude-plugin/marketplace.json` with a `category`
  from `catalog/categories.json`, then run `mise run validate`.

Keep stubs minimal but valid — the goal is a skeleton that passes the validator, ready to fill in.
