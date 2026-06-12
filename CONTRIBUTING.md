# Contributing

Thanks for adding to the catalog. This marketplace works by a simple deal: **you author a
plugin once in the canonical format, and the project handles getting it onto every
harness.** Your job is to write a good, well-scoped plugin and package it to spec. The
[adapter layer](docs/architecture.md#the-adapter-layer) does the rest.

> Some phases below (the validator, the CLI) are still being built — see the
> [roadmap](ROADMAP.md). Until the validator lands, the [plugin spec](docs/plugin-spec.md)
> is the checklist; treat it as the source of truth.

## Before you start

1. Read the [plugin spec](docs/plugin-spec.md) — the format you'll author in.
2. Skim the [example plugin](examples/changelog/) — the spec, fully worked.
3. Pick a [category](docs/categories.md). If nothing fits, propose a new one (see below).

## Authoring a plugin

A plugin is one coherent capability. Lay it out per the spec:

```
my-plugin/
├── .claude-plugin/plugin.json   # required manifest
├── README.md                    # required: what / why / how-to / non-portable notes
├── skills/<name>/SKILL.md        # optional
├── commands/<name>.md            # optional
├── agents/<name>.md              # optional
├── hooks/hooks.json              # optional (Claude Code only — note this in the README)
└── .mcp.json                     # optional
```

### The quality bar

The catalog earns trust by curation, not volume. A plugin should:

- **Do one thing well.** No grab-bags. If it's two capabilities, ship two plugins.
- **Have trigger-quality descriptions.** Skill and agent `description` fields are how the
  model decides to use them. Write "Use when …". Vague descriptions = dead components.
- **Be least-privilege.** Declare `allowed-tools` / `tools` narrowly. This feeds both
  security review and adapter fidelity.
- **Use no absolute paths.** `${CLAUDE_PLUGIN_ROOT}` for anything path-like.
- **Ship a real README.** What it does, why, how to invoke, and a clear note about any
  **non-portable components** (e.g. hooks won't reach Cursor/Codex — say so).
- **Be American English** in docs, identifiers, and messages.

### Think about portability

Your plugin will be translated to harnesses with thinner models than Claude Code's. You
don't have to handle that — the adapters do — but you can make it land better:

- Prefer **skills and commands** (most portable) for the core capability.
- Treat **hooks** as Claude-Code-only enhancements, not load-bearing behavior.
- If a capability *requires* a hook to be safe/correct, document that prominently so the
  translation report's `SKIPPED` line makes sense to a consumer.

## Submitting

1. Fork and branch.
2. Add your plugin under the catalog's plugin directory (layout finalized in
   [Phase 1](ROADMAP.md#phase-1--canonical-authoring--git-marketplace)). For now, model it
   on [`examples/changelog/`](examples/changelog/).
3. Register it in `.claude-plugin/marketplace.json` (name, source path, description,
   category, version).
4. Run the validator locally once it exists; until then, self-check against the
   [spec](docs/plugin-spec.md).
5. Open a PR. CI runs the validator (Phase 1+). A maintainer reviews for the quality bar
   above and, for plugins with executable surface, a security pass (Phase 5).

### Commits & PRs

- Commits follow **conventional commits**. This project routes commits through the
  `/commit` skill; if you can't, mirror its contract: `<type>(<scope>): <subject> :emoji:`,
  why-focused body, American English.
- One plugin (or one coherent change) per PR. Keep them reviewable.

## Versioning

Plugins use **SemVer**. Bump major for breaking changes to command/agent names or behavior
contracts. The catalog keeps version history so consumers can pin. See
[ROADMAP § Phase 5](ROADMAP.md#phase-5--governance-versioning--sustainability).

## Proposing a new category

The [taxonomy](docs/categories.md) evolves deliberately. To add one:

1. Open a PR editing `docs/categories.md` with the category, its scope, and example plugin ideas.
2. Add a note under [ROADMAP open questions / Phase 3](ROADMAP.md#phase-3--catalog-buildout)
   if it implies new curation work.
3. Languages are open-ended — adding a language is lower-ceremony than adding a domain family.

## Questions

Open an issue. If it's about whether a capability belongs in one plugin or two, or which
category fits, that's exactly the kind of question worth asking before you build.
