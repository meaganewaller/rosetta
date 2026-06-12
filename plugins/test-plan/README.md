# test-plan

Produce a focused, proportional test plan for a change — what to test, at which level of the
pyramid, the edge cases worth covering, and what to deliberately skip.

## What's in it

| Component | File | What it does |
|-----------|------|--------------|
| **Command** | [`commands/test-plan.md`](commands/test-plan.md) | `/test-plan [path-or-base-branch]` — scopes the change and emits a test plan. |
| **Skill** | [`skills/test-design-heuristics/SKILL.md`](skills/test-design-heuristics/SKILL.md) | Pyramid, risk-based prioritization, boundary/equivalence cases, and what not to test. |
| **Manifest** | [`.claude-plugin/plugin.json`](.claude-plugin/plugin.json) | Name, version, author, license, keywords. |

No hooks or MCP servers — only the components that translate cleanly across every harness.

## Try it (Claude Code)

```
/plugin marketplace add meaganewaller/agents
/plugin install test-plan@rosetta
/test-plan main
```

## Category

`Testing` — see the [taxonomy](../../docs/categories.md).
