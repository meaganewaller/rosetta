# Catalog taxonomy

The marketplace aims to be **comprehensive**: a place you start a search, not a toy. This
is the category tree. Every catalog plugin declares at least one category; a plugin may span
two when it genuinely belongs to both (prefer one).

Categories are grouped into families below for navigation only — the family is not part of
the identifier. Each entry lists its scope and a few illustrative plugin ideas to seed
[Phase 3 catalog buildout](../ROADMAP.md#phase-3--catalog-buildout).

## Core engineering

| Category | Scope | Example plugin ideas |
| ---------- | ------- | --------------------- |
| **Development** | Day-to-day coding loops, scaffolding, refactoring assists | scaffold-feature, refactor-extract, dead-code-finder |
| **Documentation** | Authoring & maintaining docs | changelog, adr-writer, api-docs-from-source, readme-generator |
| **Workflows** | Multi-step orchestration & process | pr-review-flow, release-train, incident-runbook |
| **Testing** | Test authoring, coverage, flake triage | test-generator, flaky-test-hunter, coverage-gaps |
| **Quality** | Linting, review, standards enforcement | code-review, complexity-audit, style-enforcer |
| **Utilities** | Small sharp tools | json-tools, regex-builder, time-converter |

## Data & intelligence

| Category | Scope | Example plugin ideas |
| ---------- | ------- | --------------------- |
| **AI & ML** | Model integration, prompting, eval | prompt-linter, eval-harness, rag-builder |
| **Memory** | Persistent context, knowledge capture | decision-journal, context-saver |
| **Data** | Data wrangling, pipelines, formats | csv-tools, schema-inference, etl-scaffold |
| **Database** | Schema, queries, migrations, tuning | migration-writer, query-optimizer, er-diagram |

## Platform & operations

| Category | Scope | Example plugin ideas |
| ---------- | ------- | --------------------- |
| **Operations** | Day-2 ops, runbooks, on-call | runbook-author, oncall-summarizer |
| **Performance** | Profiling, benchmarking, optimization | benchmark-harness, hotpath-finder |
| **Infrastructure** | IaC, provisioning, containers | terraform-helper, dockerfile-optimizer, k8s-manifest |
| **Security** | AppSec, secrets, threat modeling, audits | threat-model, secret-scanner, dependency-audit |
| **Governance** | Policy, compliance, licensing, standards | license-checker, policy-as-code, compliance-report |
| **Modernization** | Legacy migration, upgrades, dep bumps | framework-migrator, dep-upgrader, legacy-strangler |
| **API** | API design, clients, contracts | openapi-designer, client-generator, contract-test |

## Domain & business

| Category | Scope | Example plugin ideas |
| ---------- | ------- | --------------------- |
| **Marketing** | Content, SEO, growth ops | seo-auditor, landing-copy, campaign-brief |
| **Business** | Ops, analytics, internal tooling | metrics-dashboard, ops-automation |
| **Finance** | Accounting, modeling, reporting | financial-model, invoice-parser, ledger-checks |
| **Payments** | Billing, processors, reconciliation | stripe-integration, reconciliation, subscription-logic |
| **Gaming** | Game dev, engines, design | gameplay-balancer, asset-pipeline, engine-helper |
| **Accessibility** | a11y audits & remediation | a11y-audit, aria-fixer, contrast-checker |
| **Creative / Design** | Design systems, assets, generative | design-tokens, theme-factory, asset-generator |

## Languages

A meta-family: language- and runtime-specific plugins. Each language is its own category so
consumers can filter to their stack. Seed list (extensible):

| Category | Scope | Example plugin ideas |
| ---------- | ------- | --------------------- |
| **Python** | Idioms, typing, packaging, async | type-hint-adder, pytest-setup, fastapi-endpoint |
| **Ruby** | Ruby & Rails idioms, testing | rails-model, rspec-setup, n+1-finder |
| **JavaScript** | Modern JS, tooling, runtime | esm-migrator, eslint-setup |
| **TypeScript** | Types, architecture, config | type-system-design, tsconfig-tuner |
| **Systems programming** | Rust / C / C++ / Go / Zig | rust-borrow-helper, go-concurrency, cmake-helper |
| **Web scripting** | Browser/edge scripting, DOM | dom-automation, edge-function |
| **Bash / Shell** | Robust portable scripts | shellcheck-fixer, posix-portability |
| **JVM** | Java / Kotlin / Scala | spring-endpoint, kotlin-coroutines, gradle-helper |
| **…and more** | PHP, C#/.NET, Swift, Elixir, SQL, etc. | add as contributions arrive |

> The language family is intentionally open-ended. New languages are added by contribution,
> not gatekept by a fixed list — the table above is a seed, not a ceiling.

## Category rules

- **Pick the most specific applicable category.** A Rails N+1 finder is `Ruby`, not `Quality`.
- **At most two categories**, and only when genuinely dual-natured.
- **Languages compose with domains.** A `Python` plugin for `Data` work picks `Python`
  primarily; cross-listing in `Data` is allowed if it's broadly useful there.
- The **canonical list lives here.** Adding a category is a docs PR + a note in the roadmap,
  so the taxonomy evolves deliberately.

## Read next

- [Contributing](../CONTRIBUTING.md) — how to place and submit a plugin.
- [Roadmap § Phase 3](../ROADMAP.md#phase-3--catalog-buildout) — how the catalog gets populated.
