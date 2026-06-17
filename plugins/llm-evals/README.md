# llm-evals

Design evals for LLM features so you know when output is actually good — representative test
sets, the cheapest valid pass criteria, and regression checks on every prompt/model change.

## What's in it

| Component | File | What it does |
| ----------- | ------ | -------------- |
| **Skill** | [`skills/designing-llm-evals/SKILL.md`](skills/designing-llm-evals/SKILL.md) | Test-set assembly, pass criteria (exact / programmatic / rubric / LLM-judge), and regression discipline. |
| **Command** | [`commands/design-eval.md`](commands/design-eval.md) | `/design-eval [feature]` — produces a concrete eval plan. |
| **Manifest** | [`.claude-plugin/plugin.json`](.claude-plugin/plugin.json) | Name, version, author, license, keywords. |

Pairs naturally with [`prompt-engineering`](../prompt-engineering): write the prompt, then prove
the change with an eval. Model/runner choices are out of scope (provider-specific).

## Try it (Claude Code)

```
/plugin marketplace add meaganewaller/rosetta
/plugin install llm-evals@rosetta
/design-eval "support-ticket classifier"
```

## Category

`AI & ML` — see the [taxonomy](../../docs/categories.md).
