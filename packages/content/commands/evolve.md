---
name: evolve
description: Cluster related instincts into skills, commands, or agents
command: true
---

# Evolve

Analyze accumulated instincts and cluster related ones into reusable structures.

## Usage

```
/evolve                        # analyze all instincts and preview clusters
/evolve --execute              # create the evolved files
/evolve --domain <name>        # limit to a specific domain
/evolve --threshold <n>        # minimum instincts to form a cluster (default: 3)
/evolve --type <command|skill|agent>  # only create one type
```

## Implementation

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning/scripts/instinct-cli.py" evolve [--generate]
```

If `CLAUDE_PLUGIN_ROOT` is not set:

```bash
python3 ~/.claude/skills/continuous-learning/scripts/instinct-cli.py evolve [--generate]
```

## How clustering works

Read instincts from `~/.claude/homunculus/instincts/`. Group by domain similarity, trigger overlap, and action sequence. For each cluster of 3+ related instincts, determine the right output type:

- **Command** — instincts describing a repeatable user-invoked sequence
- **Skill** — instincts describing automatic, pattern-triggered behavior
- **Agent** — instincts describing a complex multi-step process that benefits from isolation

Save generated files to `~/.claude/homunculus/evolved/{commands,skills,agents}/` and link each back to its source instincts via `evolved_from` in the frontmatter.

## Default behavior

Preview only — show clusters found, their type, confidence, and what files would be created. Require `--execute` to actually write anything.