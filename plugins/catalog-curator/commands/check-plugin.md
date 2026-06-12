---
description: Validate a plugin against the catalog quality bar and explain any failures.
argument-hint: "[plugin-name]"
allowed-tools: "Bash(mise run validate:*), Bash(node scripts/validate.ts:*), Read, Grep"
---

Check plugin **$1** (or the whole catalog if no name is given) against the spec.

Steps:

1. Run the catalog validator: `mise run validate` (falls back to `node scripts/validate.ts`).
2. For each reported **error**, explain what it means and the concrete fix — quote the spec rule
   it violates (manifest fields, component frontmatter, no absolute paths, README present, valid
   category). For **warnings** (missing `allowed-tools`, missing `keywords`), say whether they
   apply and how to resolve them.
3. Apply the `catalog-quality-bar` skill to review beyond what the validator checks: is it one
   coherent capability? Are the skill/agent descriptions trigger-quality? Is tool access
   least-privilege?
4. If the plugin isn't yet registered, confirm its `.claude-plugin/marketplace.json` entry has
   `name`, `source`, `description`, a `category` from `catalog/categories.json`, and `version`.

If the validator isn't available (e.g. running outside this repo), review manually against the
spec instead and say so. End with a clear verdict: ready to merge, or the specific blockers.
