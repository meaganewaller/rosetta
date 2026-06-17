---
name: instinct-status
description: Show all learned instincts with their confidence levels
command: true
---

# Instinct Status

Show all learned instincts grouped by domain with confidence levels.

## Usage

```
/instinct-status
/instinct-status --domain <name>
/instinct-status --low-confidence
/instinct-status --high-confidence
/instinct-status --source <session-observation|repo-analysis|inherited>
/instinct-status --json
```

## Implementation

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning/scripts/instinct-cli.py" status
```

If `CLAUDE_PLUGIN_ROOT` is not set:

```bash
python3 ~/.claude/skills/continuous-learning/scripts/instinct-cli.py status
```

## What to do

Read instincts from `~/.claude/homunculus/instincts/personal/` and `~/.claude/homunculus/instincts/inherited/`. Display them grouped by domain, showing trigger, action, confidence, and source for each. Summarize total count split by personal vs inherited.