---
name: catalog-quality-bar
description: >-
  Use when reviewing a plugin for the rosetta catalog or registering it in marketplace.json —
  the quality bar the validator can't fully check, the required manifest/component fields, and
  how category metadata works. Apply during contribution review or before merging a new plugin.
---

# Catalog quality bar

The catalog earns trust by curation, not volume. The validator checks structure; this skill
covers the judgment a reviewer brings on top.

## What the validator enforces (must pass)

- `plugin.json`: `name` (kebab-case), `description`, SemVer `version`, `author.name`, `license`;
  `keywords` recommended.
- A `README.md` is present.
- Component frontmatter: skills/agents have `name` + `description`; commands have `description`.
- No hard-coded absolute paths (reference the `CLAUDE_PLUGIN_ROOT` variable instead).
- The `marketplace.json` `category` is one of the names in `catalog/categories.json`.
- `name`/`version` agree between `plugin.json` and the `marketplace.json` entry; names are unique.

## What a reviewer judges (beyond the validator)

- **One coherent capability.** A grab-bag should be split into separate plugins.
- **Trigger-quality descriptions.** Skill and agent descriptions are *triggers* — "Use when …",
  specific, with negative scope where needed. Vague descriptions mean dead components.
- **Least privilege.** `allowed-tools` / `tools` should be the minimum the component needs.
- **Portability.** Core capability in skills/commands; hooks treated as Claude-Code-only and
  documented as such in the README.
- **Honest README.** Says what it does, how to invoke it, and what won't translate.

## Registering in `marketplace.json`

Add an entry with `name`, `source` (e.g. `./plugins/<name>`), `description`, a `category` from
the taxonomy, and `version` (matching `plugin.json`). Category is **catalog-side metadata** — it
lives here, not in `plugin.json`. Then run the validator and fix every error before merging.
