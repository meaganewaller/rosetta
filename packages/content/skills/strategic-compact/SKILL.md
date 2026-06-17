---
name: strategic-compact
description: Suggests manual context compaction at logical intervals to preserve context through task phases rather than arbitrary auto-compaction.
---

# Strategic Compact

Suggests manual `/compact` at logical task boundaries rather than letting auto-compaction interrupt mid-task.

## When to compact

- After exploration, before execution — compact the research context, keep the plan
- After completing a milestone — fresh start for the next phase
- Before a major context shift — clear one task's context before starting another

The `suggest-compact.sh` hook tracks tool calls and suggests compaction at a configurable threshold (default: 50), then reminds every 25 calls after that. The hook tells you *when*; you decide *if*.

## Hook setup

Add to `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "tool == \"Edit\" || tool == \"Write\"",
      "hooks": [{ "type": "command", "command": "~/.claude/skills/strategic-compact/suggest-compact.sh" }]
    }]
  }
}
```

Set `COMPACT_THRESHOLD` to override the default of 50.