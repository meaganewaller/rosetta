# Vision

> **Working title:** the repo ships as `meaganewaller/agents`. The product name is
> an open question — see [ROADMAP § Open questions](../ROADMAP.md#open-questions).

## The one-sentence version

Author an agentic capability **once**, in Claude Code's plugin format, and ship it to
every major agentic coding harness — Claude Code, OpenAI Codex CLI, Cursor, OpenCode,
Gemini CLI, and GitHub Copilot — from a single Markdown source.

## The problem

The agentic coding ecosystem fragmented faster than it standardized. A useful unit of
capability — a code-review workflow, a Rails testing skill, a release-notes agent — has
to be rewritten for each tool:

- Claude Code wants `skills/`, `agents/`, `commands/`, and a `plugin.json`.
- Cursor wants `.cursor/rules/*.mdc`.
- Codex CLI and OpenCode lean on `AGENTS.md` and custom prompts.
- Gemini CLI wants `GEMINI.md` and TOML commands.
- Copilot wants `.github/copilot-instructions.md` and `*.prompt.md` files.

The *content* — the actual instructions, the actual domain knowledge — is ~90% the same.
The *packaging* is what differs. Authors pay that packaging tax over and over, and
because they pay it manually, the copies drift and rot.

## The bet

The instructions are portable. The packaging is mechanical. So:

1. **Pick one canonical authoring format.** We chose Claude Code's plugin format because
   it has the richest, most explicit component model (skills, agents, commands, hooks,
   MCP) and a real on-disk layout we can lint and test against.
2. **Make every other harness a build target.** A deterministic adapter layer
   transpiles the canonical source into each harness's native format. Authors never hand-write
   the per-harness packaging.
3. **Curate a comprehensive catalog.** Breadth across [every category that matters](categories.md)
   — from `Development` and `Testing` to `Payments`, `Accessibility`, and per-language plugins —
   so the marketplace is a place you actually start your search, not a toy.

## Principles

- **Single source of truth.** A plugin is defined once. Per-harness output is *generated*,
  never hand-maintained. If you find yourself editing generated output, the adapter is wrong.
- **Lossy is fine, silent loss is not.** Not every harness supports every component
  (hooks are Claude-Code-specific today). When an adapter can't represent something, it
  degrades gracefully **and says so** — in a report, in a comment, in the install output.
  Never pretend a capability shipped when it didn't.
- **The spec is small.** We privilege Claude Code's format rather than inventing a grand
  universal schema. Less to design, less to maintain, and we ride an existing, evolving
  standard.
- **Curation over volume.** A comprehensive catalog earns trust by quality bar, not by
  plugin count. Every plugin is validated against the spec and reviewed.
- **Security is a first-class concern.** Plugins carry executable surface area (hooks,
  command `allowed-tools`, MCP servers). A marketplace that distributes executable
  capability has to treat review and provenance as core, not bolt-on. See
  [ROADMAP § Phase 5](../ROADMAP.md#phase-5--governance-versioning--sustainability).

## Who this is for

| Audience | What they get |
|----------|---------------|
| **Plugin authors** | Write once in a documented format, reach 6 harnesses. A lint + test harness so contributions hold a quality bar. |
| **Consumers** | Browse a comprehensive catalog, install into *their* harness with one command, regardless of which tool they use. |
| **Teams** | A shared, version-pinned set of agentic capabilities that works no matter which harness each engineer prefers. |

## What success looks like

- An author submits a plugin in canonical format; CI validates it; it appears in the
  catalog and is installable into all tier-1 harnesses without the author writing a single
  per-harness file.
- A consumer on Cursor and a consumer on Codex CLI install *the same* plugin and get an
  equivalent experience, with any unsupported components clearly reported.
- The catalog spans the full [category taxonomy](categories.md) with a credible depth of
  plugins per category.

## Non-goals (for now)

- We are **not** building a new agent runtime or harness. We package capabilities *for*
  existing harnesses.
- We are **not** inventing a universal plugin manifest from scratch. Claude Code's format
  is the source; see [architecture](architecture.md).
- We are **not** committing to feature parity across harnesses. Parity is impossible while
  the harnesses themselves differ. We commit to *honest, maximal* translation.

## Read next

- [Architecture](architecture.md) — how single-source → multi-harness actually works.
- [Plugin spec](plugin-spec.md) — the canonical format you author in.
- [Roadmap](../ROADMAP.md) — the phased plan to get there.
