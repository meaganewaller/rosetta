# Rosetta - Agentic Workflow Building Blocks

Author an agentic capability once, in Claude Code's plugin format, and install it into every major agentic coding harness - Cluade Code, Cursor, Codex CLI, OpenCode, Gemini CLI, Copilot, Antigravity, and Zed - from a single Markdown source.

## The problem

The agentic coding ecosystem fragmented faster than it standardized. A useful capability — a code-review workflow, a Rails testing skill, a release-notes agent — has to be rewritten for each tool. The content is ~90% the same; the packaging differs. Rosetta makes the packaging mechanical so you only write the content once.

## Packages

| Package | Description |
|---------|-------------|
| [`@rosetta/core`](packages/core) | Shared types: `Plugin`, `Adapter`, `Finding`, `DegradedCapability`, `RosettaLockfile`, … |
| [`@rosetta/content`](packages/content) | The canonical plugin catalog: rules, skills, agents, commands, hooks |
| [`@rosetta/adapters`](packages/adapters) | Harness adapters that transpile canonical content into each tool's native format |
| [`@rosetta/install`](packages/install) | CLI for installing and updating content into any supported harness |
| [`@rosetta/scanner`](packages/scanner) | Security and drift scanner for installed output |


## Getting started


```bash
# Requires Node.js 22+ and pnpm
corepack enable
pnpm install
pnpm build
```

## Install into your harness

```bash
# Install into Claude Code (user-level)
npx rosetta-install --harness claude-code typescript

# Install into Cursor (project-level)
npx rosetta-install --harness cursor --project typescript ruby

# Install into Codex CLI
npx rosetta-install --harness codex typescript

# Update all installed content
npx rosetta-update
```

A `.rosetta-lock.json` is written to the install root recording what was installed, from which content version, and what capabilities were degraded.

## Degradation

Not every harness supports every component. Rosetta never silently drops capabilities — every loss is recorded in the lockfile and printed at install time. For example, hooks are Claude Code-specific and will be omitted when installing to Cursor or Codex, with a clear explanation.

```
Installed 12 files to .cursor/
Degraded (3):
  [omitted]  hook     observe.sh       Cursor has no hook system
  [omitted]  command  checkpoint.md    Cursor has no slash command system
  [partial]  agent    reviewer.md      Adapted as a rule; model/tool config not enforced
```

## Scan

```bash
# Scan a Claude Code install
npx rosetta-scan --harness claude-code

# Scan a project-level Cursor install
npx rosetta-scan --harness cursor --root .cursor

# JSON output for CI
npx rosetta-scan --format json

# Fail on high severity or above (CI gate)
npx rosetta-scan --fail-on high
```

The scanner checks for hardcoded secrets, overly permissive settings, hook injection risks, MCP supply chain issues, and drift from the canonical content version.

## Supported harnesses

| Harness | ID | Rules/Skills | Agents | Commands | Hooks | MCP |
|---------|-----|:---:|:---:|:---:|:---:|:---:|
| Claude Code | `claude-code` | ✓ | ✓ | ✓ | ✓ | ✓ |
| Cursor | `cursor` | ✓ | partial | — | — | partial |
| Codex CLI / OpenCode | `codex` | partial | partial | partial | — | — |
| Gemini CLI | `gemini` | partial | partial | partial | — | — |
| Copilot | `copilot` | partial | — | partial | — | — |
| Antigravity | `antigravity` | partial | partial | partial | — | — |
| Zed | `zed` | partial | partial | partial | — | — |

"partial" means the capability is included but with reduced functionality. See the degradation report for details per install.

## Content layout

```
packages/content/
├── rules/
│   ├── common/        # Language-agnostic principles (always installed)
│   └── <language>/    # TypeScript, Ruby, Bash, Lua, Go, …
├── skills/            # Deep reference material for specific tasks
├── agents/            # Specialist sub-agents
├── commands/          # Slash commands
└── hooks/             # Hook scripts
```

Rules are structured as a common layer plus language-specific extensions:

```
rules/common/           # coding-style, testing, security, patterns, …
rules/typescript/       # extends common with TS-specific content
rules/ruby/             # extends common with Ruby-specific content
rules/bash/             # extends common with Bash-specific content
rules/lua/              # extends common with Lua-specific content
```

Each language file opens with:
```
> This file extends [common/xxx.md](../common/xxx.md) with <Language>-specific content.
```

## Adding a new language

1. Create `packages/content/rules/<language>/`
2. Add `coding-style.md`, `testing.md`, `patterns.md`, `hooks.md`, `security.md`, `performance.md`
3. Each file starts with the `> This file extends…` reference line
4. Register the language in `packages/install/src/install-manifests.ts`

## Adding a new harness adapter

1. Create `packages/adapters/src/harnesses/<harness>.ts`
2. Implement the `Adapter` interface from `@rosetta/core`
3. Register it in `packages/adapters/src/index.ts`
4. Add the harness to the `Harness` union in `@rosetta/core`

Each adapter receives a parsed `Plugin` and returns `OutputFile[]` plus `DegradedCapability[]`. Omitting a capability without recording it in `degraded` is a bug.

## Development

```bash
pnpm build                                    # Build all packages
pnpm test                                     # Test all packages
pnpm typecheck                                # Type-check all packages
pnpm --filter @rosetta/scanner test           # Test one package
pnpm --filter @rosetta/adapters build         # Build one package
```

## License

MIT

## Star History

<a href="https://www.star-history.com/?type=date&legend=top-left&repos=meaganewaller%2Frosetta">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=meaganewaller/rosetta&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=meaganewaller/rosetta&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=meaganewaller/rosetta&type=date&legend=top-left" />
 </picture>
</a>
