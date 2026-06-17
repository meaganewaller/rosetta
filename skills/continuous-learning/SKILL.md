---
name: continuous-learning
description: Instinct-based learning system that observes sessions via hooks, creates atomic instincts with confidence scoring, and evolves them into skills, commands, and agents.
version: 0.1.0
---

# Continuous Learning

Turns Claude Code sessions into reusable knowledge through atomic instincts — small learned behaviors with confidence scoring that evolve over time into skills, commands, and agents.

## The instinct model

An instinct is one trigger mapped to one action:

```yaml
---
id: prefer-functional-style
trigger: "when writing new functions"
confidence: 0.7
domain: "code-style"
source: "session-observation"
---

# Prefer Functional Style

## Action
Use functional patterns over classes when appropriate.

## Evidence
- Observed 5 instances of functional pattern preference
- User corrected class-based approach to functional on 2025-01-15
```

Instincts are atomic, confidence-weighted (0.3–0.9), domain-tagged, and evidence-backed.

## How it works

```
Session activity
  → hooks capture tool use (100% reliable, unlike probabilistic skills)
  → observations.jsonl
  → observer agent detects patterns (background, lightweight model)
  → instincts/personal/   (atomic learned behaviors)
  → /evolve clusters instincts
  → evolved/ commands, skills, agents
```

## Setup

### 1. Enable observation hooks

Add to `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "*",
      "hooks": [{ "type": "command", "command": "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning/hooks/observe.sh pre" }]
    }],
    "PostToolUse": [{
      "matcher": "*",
      "hooks": [{ "type": "command", "command": "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning/hooks/observe.sh post" }]
    }]
  }
}
```

If installed manually to `~/.claude/skills`, replace `${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning` with `~/.claude/skills/continuous-learning`.

### 2. Initialize directories

```bash
mkdir -p ~/.claude/homunculus/{instincts/{personal,inherited},evolved/{agents,skills,commands}}
touch ~/.claude/homunculus/observations.jsonl
```

### 3. Commands

| Command | Description |
|---------|-------------|
| `/instinct-status` | Show all instincts with confidence levels |
| `/evolve` | Cluster related instincts into skills, commands, or agents |
| `/instinct-export` | Export instincts for sharing |
| `/instinct-import <file>` | Import instincts from others |

## Configuration

`config.json`:

```json
{
  "version": "2.0",
  "observation": {
    "enabled": true,
    "store_path": "~/.claude/homunculus/observations.jsonl",
    "max_file_size_mb": 10,
    "archive_after_days": 7
  },
  "instincts": {
    "personal_path": "~/.claude/homunculus/instincts/personal/",
    "inherited_path": "~/.claude/homunculus/instincts/inherited/",
    "min_confidence": 0.3,
    "auto_approve_threshold": 0.7,
    "confidence_decay_rate": 0.05
  },
  "observer": {
    "enabled": true,
    "model": "haiku",
    "run_interval_minutes": 5,
    "patterns_to_detect": ["user_corrections", "error_resolutions", "repeated_workflows", "tool_preferences"]
  },
  "evolution": {
    "cluster_threshold": 3,
    "evolved_path": "~/.claude/homunculus/evolved/"
  }
}
```

## File structure

```
~/.claude/homunculus/
├── identity.json
├── observations.jsonl
├── observations.archive/
├── instincts/
│   ├── personal/
│   └── inherited/
└── evolved/
    ├── agents/
    ├── skills/
    └── commands/
```

## Confidence scoring

| Score | Meaning | Behavior |
|-------|---------|----------|
| 0.3 | Tentative | Suggested, not enforced |
| 0.5 | Moderate | Applied when relevant |
| 0.7 | Strong | Auto-approved |
| 0.9 | Near-certain | Core behavior |

Confidence increases when a pattern is repeatedly observed or goes uncorrected. Confidence decreases when the user corrects the behavior or contradicting evidence appears.

## Privacy

Observations stay local. Only instincts (patterns) can be exported — no code or conversation content is included. You control what gets shared.