---
name: skill-create
description: Analyze local git history to extract coding patterns and generate SKILL.md files. Local version of the Skill Creator GitHub App.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# Skill Create

Analyze the repository's git history to extract coding patterns and generate SKILL.md files.

## Usage

```
/skill-create                      # analyze current repo
/skill-create --commits 100        # analyze last 100 commits (default: 200)
/skill-create --output ./skills    # custom output directory
/skill-create --instincts          # also generate instincts for continuous-learning-v2
```

## What it does

1. Parse git history — commits, file changes, co-change patterns, commit message conventions
2. Detect recurring patterns — architecture, workflows, testing conventions, naming
3. Generate a `SKILL.md` with frontmatter (`name`, `description`, `version`, `source`, `analyzed_commits`) and sections for commit conventions, code architecture, workflows, and testing patterns
4. If `--instincts`: also generate instinct YAML files for continuous-learning-v2, saved alongside the skill

## Key git commands used

```bash
# Commits with file changes
git log --oneline -n ${COMMITS:-200} --name-only --pretty=format:"%H|%s|%ad" --date=short

# Most frequently changed files
git log --oneline -n 200 --name-only | grep -v "^$" | grep -v "^[a-f0-9]" | sort | uniq -c | sort -rn | head -20

# Commit message patterns
git log --oneline -n 200 | cut -d' ' -f2-
```

## GitHub App

For larger repos (10k+ commits) or team sharing, use the [Skill Creator GitHub App](https://github.com/apps/skill-creator) — comment `/skill-creator analyze` on any issue to receive a PR with generated skills.

## Related commands

`/instinct-import`, `/instinct-status`, `/evolve`