# Documentation

Docs for the agentic plugin marketplace — author once in Claude Code's plugin format, ship
to six harnesses.

## Reading order

1. **[Vision](vision.md)** — the problem, the bet, the principles. Start here.
2. **[Architecture](architecture.md)** — how single-source → multi-harness works, and how
   each component type translates.
3. **[Plugin spec](plugin-spec.md)** — the canonical format you author in (reference).
4. **[Categories](categories.md)** — the full catalog taxonomy.
5. **[Distribution](distribution.md)** — the three delivery channels (Git marketplace, CLI,
   web registry).
6. **[Contributing](../CONTRIBUTING.md)** — author + submit a plugin.
7. **[Roadmap](../ROADMAP.md)** — the phased plan and what's next.

## By intent

| I want to… | Read |
|------------|------|
| Understand what this is and why | [Vision](vision.md) |
| Understand how it works under the hood | [Architecture](architecture.md) |
| Build a plugin | [Plugin spec](plugin-spec.md) + [Contributing](../CONTRIBUTING.md) |
| See a worked example | [`plugins/changelog/`](../plugins/changelog/) |
| Know which categories exist | [Categories](categories.md) |
| Install a plugin into my harness | [Distribution](distribution.md) |
| Understand a specific harness adapter | [Cursor](adapters/cursor.md) · [Codex CLI](adapters/codex.md) · [OpenCode](adapters/opencode.md) |
| See what's planned | [Roadmap](../ROADMAP.md) |

## Status

Phase 0 (foundations). This doc set defines direction; the validator, adapters, CLI, and
site are upcoming — see the [roadmap](../ROADMAP.md).
