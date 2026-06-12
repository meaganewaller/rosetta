# Architecture

How a single Markdown source reaches six harnesses. This is the explanation doc; the
[plugin spec](plugin-spec.md) is the precise reference, and [distribution](distribution.md)
covers how plugins are delivered.

## The shape of the system

```
                         ┌─────────────────────────────┐
                         │  Canonical plugin source    │
                         │ (Claude Code format)        │
                         │  .claude-plugin/plugin.json │
                         │  skills/ agents/ commands/  │
                         │  hooks/ .mcp.json           │
                         └────────────┬────────────────┘
                                      │
                        ┌─────────────▼──────────────┐
                        │        Validator           │   ← lint against the spec, CI gate
                        └─────────────┬──────────────┘
                                      │
                        ┌─────────────▼──────────────┐
                        │       Adapter layer        │   ← deterministic transpilers
                        └─┬─────┬─────┬─────┬─────┬──┘
                          │     │     │     │     │
              ┌───────────▼┐ ┌──▼───┐ ┌▼─────┐ ┌──▼──┐ ┌▼────────┐ ┌─────────┐
              │ Claude Code│ │Codex │ │Cursor│ │Open │ │ Gemini  │ │ Copilot │
              │  (native)  │ │ CLI  │ │      │ │Code │ │  CLI    │ │         │
              └────────────┘ └──────┘ └──────┘ └─────┘ └─────────┘ └─────────┘
```

Three things move through this pipeline:

1. **The canonical source** — what an author writes and what lives in the catalog.
2. **The validator** — guarantees the source is well-formed before anything downstream runs.
3. **The adapter layer** — turns one source into N native packages, one per harness.

## Why Claude Code is the source of truth

We evaluated three models (see [the decision in the kickoff](../ROADMAP.md#decisions-locked)):
canonical-Claude-Code, a neutral universal spec, and a hybrid. We chose
**Claude Code as canonical** because:

- It has the **richest explicit component model** of any current harness — skills, agents,
  commands, hooks, and MCP are all first-class with documented on-disk shapes.
- It has a **real, lintable layout** (`.claude-plugin/plugin.json` + auto-discovered
  directories), so the validator has something concrete to check.
- Translating *down* from a rich model to a simpler one (e.g. Cursor rules) is mechanical.
  Translating *up* from a poor model is guesswork. Source-richest-target wins.

The cost: we're coupled to an evolving format. We accept that and isolate the coupling in
the spec doc and the validator, so a format change touches few places.

## Components and how they translate

A canonical plugin is composed of these component types. The right-hand columns are the
**target mappings** — the intended translation. **These must be validated against each
harness's current behavior during Phase 2 adapter work**; harness capabilities move fast
and this table is a design intent, not a verified guarantee.

| Canonical component | What it is | Portable concept | Typical target |
|---------------------|-----------|------------------|----------------|
| **Skill** (`skills/x/SKILL.md`) | Model-invoked knowledge/procedure, progressively disclosed | Instruction/context injection | `AGENTS.md` / `GEMINI.md` section, `.cursor/rules/*.mdc`, `copilot-instructions.md` |
| **Command** (`commands/x.md`) | User-invoked slash command / prompt | Reusable prompt | Codex/OpenCode custom prompt, Cursor command, Gemini TOML command, Copilot `*.prompt.md` |
| **Agent** (`agents/x.md`) | Autonomous subagent w/ own tools/model | Named sub-agent / chat mode | OpenCode agent, Copilot custom agent; degrades to command+instructions where unsupported |
| **Hook** (`hooks/hooks.json`) | Event-driven shell/prompt automation | (Least portable) | Claude Code only today; **omitted with a reported warning** elsewhere |
| **MCP server** (`.mcp.json`) | External tool/service over Model Context Protocol | MCP (most portable) | Native MCP config in nearly every harness |

### The degradation ladder

When a target can't represent a component natively, the adapter walks down a ladder rather
than dropping it silently:

1. **Native** — emit the harness's first-class equivalent.
2. **Demote** — express it with a lower-fidelity primitive (e.g. an agent becomes a
   command plus an instructions block).
3. **Inline** — fold it into the harness's always-on context file with a clear heading.
4. **Report-only** — if even inlining would mislead (e.g. a `PreToolUse` hook that blocks
   commands), emit nothing but record a `SKIPPED` entry in the install report explaining
   what was lost and why.

Every adapter run produces a **translation report**: per-component `NATIVE | DEMOTED |
INLINED | SKIPPED`, so consumers always know exactly what they got. This is the
"lossy is fine, silent loss is not" principle from the [vision](vision.md#principles),
made operational.

## The adapter layer

- **Deterministic, not generative.** Adapters are code (templates + transforms), not an
  LLM call. Same input → same output, byte for byte. This makes them testable with golden
  files and safe to run in CI.
- **One adapter per harness.** Each is independently versioned and independently testable.
  Adding a harness = adding an adapter; it never touches the source format or other adapters.
- **Capability-matrix driven.** Each adapter declares which canonical components it supports
  and at what fidelity. The matrix is data, surfaced in the catalog so consumers see
  per-harness support *before* installing.

Two adapters are built, each verified against its harness's live docs and covered by
golden-file tests: **[Cursor](adapters/cursor.md)** and **[Codex CLI](adapters/codex.md)**.
They map the same plugin differently — Cursor keeps slash commands but loses the subagent
concept; Codex keeps subagents but has no project slash command — which is exactly what the
fidelity report exists to communicate. The contract they implement lives in `src/contract.ts`.

## Harness tiers (proposed)

Rollout order for adapters, to be confirmed in the [roadmap](../ROADMAP.md#phase-2--adapter-layer-cli-installer):

- **Tier 0 — Claude Code:** native, no adapter needed (it *is* the source). Reference behavior.
- **Tier 1 — Codex CLI, Cursor:** highest adoption; built first.
- **Tier 2 — OpenCode, Gemini CLI:** close component models, fast to follow.
- **Tier 3 — GitHub Copilot:** most constrained extension model; built last, expect the
  most `DEMOTED`/`SKIPPED` entries.

## Distribution, briefly

Authoring and packaging is only half the system; getting plugins to people is the other
half. We're shipping all three channels — a **Git marketplace** (native to Claude Code),
a **CLI installer/adapter**, and a **web registry/site**. Each is detailed in
[distribution](distribution.md).

## Read next

- [Plugin spec](plugin-spec.md) — the precise canonical format.
- [Distribution](distribution.md) — the three delivery channels.
- [Categories](categories.md) — the catalog taxonomy.
