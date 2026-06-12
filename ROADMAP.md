# Roadmap

The phased plan to get from an empty repo to a comprehensive, multi-harness agentic plugin
marketplace. Read the [vision](docs/vision.md) for the *why* and [architecture](docs/architecture.md)
for the *how*; this is the *when* and *in what order*.

Phases are sequential in dependency but the work *within* later phases parallelizes. Each
phase has an **exit criterion** — the concrete thing that must be true to call it done.

## Decisions locked

These were settled at kickoff and frame everything below:

| Decision | Choice |
|----------|--------|
| **Source of truth** | Claude Code plugin format is canonical; all other harnesses are generated targets. |
| **Distribution** | All three channels: Git marketplace + CLI installer/adapter + web registry/site. |
| **First doc pass** | Roadmap-first lean set (this document set). |
| **Target harnesses** | Claude Code (source) + Codex CLI, Cursor, OpenCode, Gemini CLI, GitHub Copilot. |
| **Marketplace name** | `rosetta` — the `name` in `marketplace.json`; installs read `plugin@rosetta`. Product/site branding deferred. |
| **Category metadata** | Catalog-side, in `marketplace.json` entries; validated against `catalog/categories.json`. |
| **Tooling stack** | Node / TypeScript, run via Node's native type stripping (no build step). |

---

## Phase 0 — Foundations *(done)*

Get the direction, the spec, and the contributor on-ramp written down before building.

- [x] Vision, principles, audience — [`docs/vision.md`](docs/vision.md)
- [x] Architecture: single-source → multi-harness + component mapping — [`docs/architecture.md`](docs/architecture.md)
- [x] Canonical plugin spec — [`docs/plugin-spec.md`](docs/plugin-spec.md)
- [x] Category taxonomy — [`docs/categories.md`](docs/categories.md)
- [x] Distribution model (3 channels) — [`docs/distribution.md`](docs/distribution.md)
- [x] Contributing guide — [`CONTRIBUTING.md`](CONTRIBUTING.md)
- [x] One fully-worked example plugin — [`plugins/changelog/`](plugins/changelog/)
- [x] This roadmap

**Exit criterion:** a new contributor can read the docs and understand what to build, how to
package it, and where it's headed — without asking. ✅

---

## Phase 1 — Canonical authoring & Git marketplace *(done)*

Make the catalog real and installable on Claude Code, with a quality gate.

- [x] Finalize repo layout: catalog plugins live in `plugins/<name>/`; the canonical
      taxonomy is `catalog/categories.json`; category is recorded catalog-side in
      `marketplace.json`.
- [x] Write [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json) and wire
      the plugins into it (`changelog`, `pr-description`).
- [x] **Validator** ([`scripts/validate.ts`](scripts/validate.ts)): manifest fields,
      component frontmatter, no absolute paths, README present, category valid against
      `catalog/categories.json`, name/version cross-checks, duplicate + unregistered-dir
      detection. Warns on missing `allowed-tools` / `keywords`. Runs as native TypeScript,
      no build step. (The interactive `meta:validate-plugin` skill remains useful for
      deeper one-off audits.)
- [x] **CI** ([`.github/workflows/validate.yml`](.github/workflows/validate.yml)): runs the
      validator + a type-check on every push and PR.
- [x] Seed catalog: **5** plugins across distinct categories — `changelog` (Documentation),
      `pr-description` (Workflows), `test-plan` (Testing), `secret-scan` (Security),
      `shell-lint` (Bash / Shell). All pass the validator with zero warnings.

**Exit criterion:** `/plugin marketplace add` + `/plugin install` works for seed plugins on
Claude Code, and no invalid plugin can merge. *(Met and verified end-to-end: CI is green on
`main` — validator gate + type-check on every push/PR — and a live `/plugin marketplace add
meaganewaller/agents` + `/plugin install changelog@rosetta` succeeded in Claude Code, with
the plugin's command, skill, and agent all loaded.)*

---

## Phase 2 — Adapter layer & CLI installer *(in progress)*

Make "any harness" real. This is the technical heart of the project. **Cursor slice landed**
end-to-end (contract + adapter + CLI + golden tests); the remaining harnesses follow the same
shape.

- [x] Define the **adapter contract** ([`src/contract.ts`](src/contract.ts)): input = canonical
      plugin; output = per-harness files + a translation report
      (`NATIVE | DEMOTED | INLINED | SKIPPED`).
- [~] Build the **capability matrix** — emerges from each adapter's declared mapping + report.
      Cursor is documented in [`docs/adapters/cursor.md`](docs/adapters/cursor.md); the rest fill in
      as adapters land.
- [~] **Validate the [component mapping](docs/architecture.md#components-and-how-they-translate)**
      against each harness's *current* behavior. **Cursor, Codex CLI, OpenCode & Gemini CLI:
      done** (verified vs. live docs, June 2026). Tier-3 pending.
- [x] Tier-1 adapters: **Cursor** ✅ and **Codex CLI** ✅ — both with golden-file tests.
      ([cursor.md](docs/adapters/cursor.md), [codex.md](docs/adapters/codex.md))
- [x] Tier-2 adapters: **OpenCode** ✅ and **Gemini CLI** ✅ — both with golden-file tests.
      ([opencode.md](docs/adapters/opencode.md), [gemini.md](docs/adapters/gemini.md))
- [ ] Tier-3 adapter: **GitHub Copilot** (expect the most degradation).
- [x] The **CLI** ([`src/cli.ts`](src/cli.ts)): `inspect` (dry run) + `add` (write), harness
      detection, `--harness` override, `--into`, and the per-component report.
- [~] CLI distribution: **decided** — run via Node / `mise run cli` for now; packaging
      (npm / binary / mise) deferred until the adapters settle.

**Exit criterion:** a single canonical plugin installs into all tier-1 harnesses via the
CLI, each install prints an accurate translation report, and adapter output is covered by
golden-file tests. *(Met for Tier-1: `changelog` translates to both Cursor and Codex CLI
with accurate reports and golden tests. Tier-2/3 harnesses remain.)*

---

## Phase 3 — Catalog buildout

Earn "comprehensive." Systematically populate the [taxonomy](docs/categories.md).

- [ ] Per-category **quality bar + curation checklist** (what makes a category "covered").
- [ ] Prioritize categories (likely: Core engineering + top Languages first; long-tail
      domains as demand appears).
- [ ] Author/curate plugins per category; each passes the validator and has adapter coverage.
- [ ] Track coverage publicly (a coverage matrix: category × harness fidelity).
- [ ] Establish a cadence for accepting community contributions at scale.

**Exit criterion:** every category family has credible depth, and coverage is tracked
openly so gaps are visible rather than hidden.

---

## Phase 4 — Web registry & discovery site

Make it findable.

- [ ] Static site generated from `marketplace.json` + plugin metadata (no hand-maintained
      content — see [distribution](docs/distribution.md#channel-3--web-registry--site)).
- [ ] Category pages mirroring the taxonomy; full-text + keyword search.
- [ ] Per-plugin pages: description, version history, **per-harness capability matrix**,
      copy-paste install commands for each channel.
- [ ] Hosting + build pipeline; rebuild on catalog changes.

**Exit criterion:** anyone can discover a plugin by category or search and get correct
install instructions for their specific harness, with fidelity shown up front.

---

## Phase 5 — Governance, versioning & sustainability

Make it trustworthy and durable. A marketplace distributing *executable* capability has to
take this seriously.

- [ ] **Versioning & deprecation** policy (SemVer enforcement, pinning, sunset process).
- [ ] **Security review** process: plugins carry executable surface (hooks, `allowed-tools`,
      MCP servers) — define what review is required before a plugin is listed.
- [ ] **Provenance**: authorship, signing/attestation, and how trust is shown across all
      three channels.
- [ ] **Maintainership**: contribution review SLAs, ownership, CODEOWNERS.
- [ ] **Compatibility tracking**: detect when a harness's format changes and an adapter
      needs updating.

**Exit criterion:** there is a written, enforced answer to "is this plugin safe, current,
and from who it claims to be?" for every plugin in the catalog.

---

## Cross-cutting concerns (all phases)

- **Honesty about loss.** Every adapter and install path surfaces what it couldn't translate.
- **Determinism.** Adapters are testable, reproducible transforms — never ad-hoc generation.
- **American English** in all docs, identifiers, and messages.
- **Coupling isolation.** Claude-Code-format coupling stays in the spec + validator, so
  upstream format changes touch few places.

## Open questions

- **Product / site branding.** The marketplace `name` is `rosetta`; a product name and
  visual brand for the Phase 4 site are still open. (Phase 4)
- **CLI distribution.** npm package, standalone binary, or `mise`-installable? (Phase 2)
- **Hosted site stack.** Static generator + host choice for the registry. (Phase 4)
- **Security review depth.** Manual review, automated scanning, or both — and what's
  blocking vs. advisory? (Phase 5)

### Resolved

- ~~**Category metadata location.**~~ → Catalog-side in `marketplace.json` entries,
  validated against `catalog/categories.json`. (Phase 1)
- ~~**Marketplace name.**~~ → `rosetta`. (Phase 1)
