---
description: Draft a trigger-quality SKILL.md for a given topic.
argument-hint: "<skill-name>"
allowed-tools: "Write, Read"
---

Draft a `SKILL.md` for the skill named **$1**.

Apply the `writing-effective-skills` skill, then produce `skills/$1/SKILL.md` with:

1. **Frontmatter** — `name: $1` and a `description` written as a trigger: lead with "Use when …",
   name the situations and intents that should activate it, and (where useful) what it is *not*
   for. This single line is the most important part — it's how the model decides to load the skill.
2. **Body** — focused instructions for the one capability. Lead with the core procedure or rules;
   push depth and long references into separate files in the skill directory and link to them
   (progressive disclosure). Keep the main file scannable.

Before writing, ask the user what the skill should cover and when it should fire if that isn't
clear from `$1`. Use American English. Don't pad — a skill that tries to do everything triggers
for nothing.
