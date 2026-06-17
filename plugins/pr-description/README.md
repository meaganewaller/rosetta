# pr-description

Draft a clear, reviewer-friendly pull request description from your branch's diff and commit
history — structured (Summary / Changes / Testing / Notes), scannable, and honest about
what was tested.

## What's in it

| Component | File | What it does |
|-----------|------|--------------|
| **Command** | [`commands/pr-description.md`](commands/pr-description.md) | `/pr-description [base-branch]` — drafts the PR body from `git diff`/`git log` against the base branch. |
| **Skill** | [`skills/pull-request-conventions/SKILL.md`](skills/pull-request-conventions/SKILL.md) | Reviewer-focused PR structure and tone, pulled in automatically when writing a PR description. |
| **Manifest** | [`.claude-plugin/plugin.json`](.claude-plugin/plugin.json) | Name, version, author, license, keywords. |

No hooks or MCP servers — only the components that translate cleanly across every harness.

## Try it (Claude Code)

```
/plugin marketplace add meaganewaller/rosetta
/plugin install pr-description@rosetta
/pr-description main
```

## Category

`Workflows` — see the [taxonomy](../../docs/categories.md).
