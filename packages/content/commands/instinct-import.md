---
name: instinct-import
description: Import instincts from teammates, Skill Creator, or other sources
command: true
---

# Instinct Import

Import instincts from a file, URL, or Skill Creator repo analysis.

## Usage

```
/instinct-import <file-or-url>
/instinct-import --from-skill-creator <owner/repo>
/instinct-import --dry-run                          # preview without importing
/instinct-import --force                            # import even if conflicts exist
/instinct-import --min-confidence <n>               # skip instincts below threshold
/instinct-import --merge-strategy <higher|local|import>
```

## Implementation

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning/scripts/instinct-cli.py" import <file-or-url> [flags]
```

If `CLAUDE_PLUGIN_ROOT` is not set:

```bash
python3 ~/.claude/skills/continuous-learning/scripts/instinct-cli.py import <file-or-url>
```

## What to do

1. Fetch the instinct file (local path, URL, or Skill Creator)
2. Parse and validate the format
3. Compare against existing instincts and classify each as new, duplicate, or conflicting
4. Apply merge strategy for duplicates — default is keep the higher-confidence version and combine observation counts
5. Skip conflicts by default; flag them for manual resolution
6. Save imported instincts to `~/.claude/homunculus/instincts/inherited/` with `imported_from` and `imported_at` metadata
7. Report what was added, updated, and skipped with reasons