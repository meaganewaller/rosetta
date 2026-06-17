---
name: configure-rosetta
description: Interactive installer for Rosetta. Guides users through selecting and installing skills and language-specific rules at user-level or project-level, verifies paths, and optionally optimizes installed files.
---

# Configure Rosetta

Interactive step-by-step installation wizard for Rosetta. Uses `AskUserQuestion` throughout to guide selection and confirm choices.

## When to activate

User says "configure rosetta", "install rosetta", "setup rosetta", or asks to selectively install, verify, or optimize a Rosetta installation.

---

## Step 0: Clone source

```bash
rm -rf /tmp/rosetta
git clone https://github.com/meaganewaller/rosetta /tmp/rosetta
```

Set `ROSETTA_ROOT=/tmp/rosetta`. If the clone fails, ask the user for a local path.

---

## Step 1: Installation level

Ask: where to install — user-level (`~/.claude/`), project-level (`.claude/`), or both. Set `TARGET` accordingly and create `$TARGET/skills` and `$TARGET/rules` if they don't exist.

---

## Step 2: Skills

Ask which skill categories to install (multi-select): Framework & Language, Database, Workflow & Quality, or All. For each selected category, show the skills available and let the user deselect any.

Available skills are listed in the Rosetta repository under `skills/`. Read the directory rather than assuming a fixed list — the catalog changes.

For each selected skill:
```bash
cp -r $ROSETTA_ROOT/skills/<skill-name> $TARGET/skills/
```

Note: `continuous-learning` includes hooks and scripts beyond `SKILL.md` — copy the entire directory.

---

## Step 3: Rules

Ask which rule sets to install (multi-select): common (recommended), TypeScript, Python, Go, and any other language directories present in `$ROSETTA_ROOT/rules/`.

```bash
cp -r $ROSETTA_ROOT/rules/common/* $TARGET/rules/
cp -r $ROSETTA_ROOT/rules/<language>/* $TARGET/rules/
```

If the user selects language-specific rules without common rules, warn them — language rules extend common rules and may be incomplete without them.

**Important**: Rules install flat into `$TARGET/rules/` — not in subdirectories. `$TARGET/rules/coding-style.md` is correct; `$TARGET/rules/common/coding-style.md` is not.

---

## Step 4: Verification

After installation:

1. Confirm all installed files exist at the target path
2. Scan for path references that may be broken:
   ```bash
   grep -rn "~/.claude/" $TARGET/skills/ $TARGET/rules/
   grep -rn "../common/" $TARGET/rules/
   ```
3. For project-level installs, flag any skill references to `~/.claude/skills/` or `~/.claude/rules/` — check whether the referenced skill was also installed
4. Check cross-references: skills that reference other skills (e.g. `*-tdd` → `*-patterns`) should have their dependencies installed too. `continuous-learning` references `~/.claude/homunculus/` — this is always user-level and is expected.

For each issue: report the file, line, what's wrong, and what to do.

---

## Step 5: Optimize (optional)

Ask whether to optimize installed skills, rules, both, or skip.

**Skills**: Read each `SKILL.md`, ask about the project's tech stack, suggest and apply removals of irrelevant sections, fix any path issues from Step 4.

**Rules**: Ask about preferences (coverage target, formatting tools, git workflow, security requirements) and edit rule files accordingly.

Only modify files in `$TARGET/` — never touch `$ROSETTA_ROOT/`.

---

## Step 6: Summary and cleanup

```bash
rm -rf /tmp/rosetta
```

Report: installation level and path, skills installed (count + names), rules installed (count by set), verification results, and any optimizations applied.