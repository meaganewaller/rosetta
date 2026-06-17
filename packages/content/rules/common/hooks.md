# Hooks

## Hook types

- **PreToolUse** — runs before a tool executes; use for validation or parameter modification
- **PostToolUse** — runs after a tool executes; use for auto-formatting, linting, or type checks
- **Stop** — runs when a session ends; use for final verification steps

Language-specific rules define the concrete hooks for each stack (formatters, linters, type checkers).

## Auto-accept permissions

Enable only for trusted, well-defined plans — not for exploratory work. Never use `--dangerously-skip-permissions`. Configure permitted tools explicitly via `allowedTools` in `~/.claude.json`.

## Task tracking

Use the TodoWrite tool to track progress on multi-step tasks. A written todo list surfaces problems early: steps out of order, missing items, unnecessary items, wrong granularity, misinterpreted requirements. Update it as work progresses so the current state is always visible.