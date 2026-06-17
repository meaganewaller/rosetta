# Agent Orchestration

## Available agents

Agents live in `~/.claude/agents/`. Each agent's description defines when to invoke it — read those descriptions as the authoritative routing guide. The current set:

- **architect** — system design and architectural decisions
- **docs** — keeping documentation in sync with code
- **fixer** — resolving build and compilation errors
- **planner** — implementation planning for complex features and refactors
- **reviewer** — code review after writing or modifying code
- **security** — security analysis before commits
- **tester** — test-driven development for new features and bug fixes

## Invoke agents proactively

Don't wait to be asked. If a situation clearly calls for an agent, invoke it:

- Just wrote or modified code → **reviewer**
- Build is failing → **fixer**
- Starting a non-trivial feature → **planner** first, then **tester** as you build
- Making an architectural decision → **architect**
- About to commit → **security**

## Run independent agents in parallel

When multiple agents can work without depending on each other's output, launch them simultaneously rather than sequentially.

```
# Good: parallel when independent
Launch in parallel:
- security: analyze the auth module
- reviewer: review the cache changes
- tester: write tests for the new endpoint

# Bad: sequential when there's no dependency
Run security, then reviewer, then tester
```

## Agents delegate to plugins

Agents are generic orchestrators. Language- and framework-specific knowledge lives in plugins. When an agent encounters something language-specific (type patterns, test framework conventions, framework-specific security issues), it should delegate to the appropriate plugin rather than reasoning from scratch.