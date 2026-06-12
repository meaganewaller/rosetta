# Distribution

How plugins get from the catalog into someone's harness. We ship **three channels**, each
serving a different need. They share one backing source (the catalog repo) so they never
disagree about what exists.

```
                ┌───────────────────────────────┐
                │   Catalog repo (this repo)    │
                │   canonical plugin sources +  │
                │   marketplace.json manifest   │
                └───────┬───────────┬───────────┘
                        │           │           
        ┌───────────────▼─┐ ┌────────▼────────┐ ┌────────────────┐
        │ Git marketplace │ │  CLI installer  │ │  Web registry  │
        │  (native to CC) │ │   /adapter      │ │   + site       │
        └─────────────────┘ └─────────────────┘ └────────────────┘
            Claude Code        every harness       discovery layer
```

## Channel 1 — Git marketplace (native to Claude Code)

The zero-infra channel. Claude Code can add a marketplace directly from a Git repo via a
`.claude-plugin/marketplace.json` manifest at the repo root.

**Consumer flow (Claude Code):**

```
/plugin marketplace add meaganewaller/agents
/plugin install changelog@agents
```

**`marketplace.json` (shape):**

```json
{
  "name": "agents",
  "owner": { "name": "Meagan Waller" },
  "plugins": [
    {
      "name": "changelog",
      "source": "./examples/changelog",
      "description": "Generate and maintain a Keep a Changelog–style CHANGELOG.md.",
      "category": "Documentation",
      "version": "0.1.0"
    }
  ]
}
```

- **Pros:** works today, no servers, versioned with the repo, trusted via Git.
- **Cons:** Claude Code only; consumers on other harnesses can't use it directly.
- **Status:** first channel to land — [Phase 1](../ROADMAP.md#phase-1--canonical-authoring--git-marketplace).

## Channel 2 — CLI installer / adapter

The channel that makes "any harness" real. A CLI fetches a canonical plugin and runs the
[adapter layer](architecture.md#the-adapter-layer) to emit the right files for the target
harness, into the right place in the consumer's project.

**Consumer flow (sketch — names TBD in Phase 2):**

```bash
# install a plugin into the detected harness
agents add changelog

# or target one explicitly
agents add changelog --harness cursor
agents add changelog --harness codex --into ./

# see what each harness will/won't get before installing
agents inspect changelog --harness copilot
```

Every install prints the **translation report** (`NATIVE | DEMOTED | INLINED | SKIPPED`
per component) so consumers know exactly what landed. The CLI is the home of the adapters;
the Git marketplace and web registry both point at the same canonical sources the CLI reads.

- **Pros:** reaches every harness; honest about fidelity; scriptable for teams/CI.
- **Cons:** real software to build, test (golden files), and version per adapter.
- **Status:** [Phase 2](../ROADMAP.md#phase-2--adapter-layer-cli-installer). Open question:
  distribution of the CLI itself (npm? a single binary? `mise`-installable?).

## Channel 3 — Web registry + site

The discovery layer. A browsable, searchable site generated from the catalog manifest:
category pages (mirroring the [taxonomy](categories.md)), per-plugin pages with the
capability matrix, and copy-paste install instructions for each harness.

- Generated from `marketplace.json` + plugin metadata — **no hand-maintained content**, so
  it can't drift from the catalog.
- Each plugin page shows the per-harness support matrix (which components are `NATIVE` vs
  `DEMOTED`/`SKIPPED`) *before* you install.
- **Pros:** discovery, SEO, trust signals (versions, provenance, review status).
- **Cons:** the most infrastructure; needs hosting + a build pipeline.
- **Status:** [Phase 4](../ROADMAP.md#phase-4--web-registry--discovery-site).

## How the channels relate

- **One source of truth.** All three derive from the catalog repo + `marketplace.json`.
  The site never lists a plugin the CLI can't install; the CLI never installs a plugin the
  marketplace doesn't declare.
- **Layered rollout.** Git marketplace first (proves the catalog), CLI second (proves
  "any harness"), site third (proves discovery). Each builds on the prior.
- **Provenance is shared.** Whatever review/signing model Phase 5 lands applies across all
  three channels, since they read the same metadata.

## Read next

- [Architecture](architecture.md) — the adapter layer the CLI is built on.
- [Roadmap](../ROADMAP.md) — the phase each channel lands in.
