# Agentic Plugin Marketplace

> Production-ready agentic workflow building blocks: Plugins, agents, skills, and commands built for Claude Code and consumed natively by OpenAI Codex CLI, Cursor, OpenCode, Gemini CLI, and GitHub Copilot from a single Markdown source.

Author a capability **once** in Claude Code's plugin format, and ship it to every major
agentic coding harness. A deterministic adapter layer translates the single canonical
source into each harness's native packaging — so the instructions live in one place and
never drift.

## Status

Building in phases — see the [roadmap](ROADMAP.md) for detail.

- ✅ **Phase 0 — Foundations.** Vision, architecture, plugin spec, taxonomy, distribution model.
- ✅ **Phase 1 — Canonical authoring & Git marketplace.** A 5-plugin seed catalog, a CI-gated
  [validator](scripts/validate.ts), and the `rosetta` marketplace — verified by a live
  `/plugin install` in Claude Code.
- 🚧 **Phase 2 — Adapter layer & CLI.** The `rosetta` CLI translates a canonical plugin into
  another harness with a per-component fidelity report. Adapters done:
  [Cursor](docs/adapters/cursor.md), [Codex CLI](docs/adapters/codex.md), and
  [OpenCode](docs/adapters/opencode.md). Gemini CLI is next.
- ⏳ **Phases 3–5** — catalog buildout, web registry/site, governance.

## Documentation

Start with the [docs index](docs/README.md), or jump in:

- [Vision](docs/vision.md) — the problem, the bet, the principles.
- [Architecture](docs/architecture.md) — how single-source → multi-harness works.
- [Plugin spec](docs/plugin-spec.md) — the canonical format you author in.
- [Categories](docs/categories.md) — the full catalog taxonomy.
- [Distribution](docs/distribution.md) — Git marketplace, CLI installer, web registry.
- [Roadmap](ROADMAP.md) — the phased plan.
- [Contributing](CONTRIBUTING.md) — author and submit a plugin.

See [`plugins/changelog/`](plugins/changelog/) for a fully-worked reference plugin.

## License

MIT — see [LICENSE](LICENSE).

## Star History

<a href="https://www.star-history.com/?type=date&legend=top-left&repos=meaganewaller%2Fagents">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=meaganewaller/agents&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=meaganewaller/agents&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=meaganewaller/agents&type=date&legend=top-left" />
 </picture>
</a>