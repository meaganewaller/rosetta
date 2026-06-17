# agent-memory

Design what an agent remembers — what to persist (vs. recompute), how to retrieve only what's
relevant, and how to compact history so context stays within budget and memories stay fresh.

## What's in it

| Component | File | What it does |
| ----------- | ------ | -------------- |
| **Skill** | [`skills/agent-memory-patterns/SKILL.md`](skills/agent-memory-patterns/SKILL.md) | Persistence, scoping, relevance retrieval, compaction, freshness, and bounds. |
| **Command** | [`commands/design-memory.md`](commands/design-memory.md) | `/design-memory [system]` — produces a concrete memory strategy. |
| **Manifest** | [`.claude-plugin/plugin.json`](.claude-plugin/plugin.json) | Name, version, author, license, keywords. |

The strategy is provider-agnostic — vector stores, embedding models, and provider
context/compaction APIs sit below it as implementation choices.

## Try it (Claude Code)

```
/plugin marketplace add meaganewaller/agents
/plugin install agent-memory@rosetta
/design-memory "customer-support agent"
```

## Category

`Memory` — see the [taxonomy](../../docs/categories.md).
