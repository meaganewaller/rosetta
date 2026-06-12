---
name: writing-effective-skills
description: >-
  Use when writing or reviewing a SKILL.md — how to write a description that reliably triggers
  the skill, structure the body for progressive disclosure, and keep one skill scoped to one
  capability. Apply whenever a skill isn't firing when it should, or fires when it shouldn't.
---

# Writing effective skills

A skill is model-invoked: the model reads its **description** and decides whether to pull the
body into context. So the description is not documentation — it's a **trigger**. Most skill
problems are description problems.

`SKILL.md` is now a cross-harness open standard (Claude Code, Codex, OpenCode, Gemini, Copilot
all read it), so the effort you put here pays off on every harness at once.

## The description is the trigger

- **Lead with "Use when …"** and name the *situations and intents* that should activate the
  skill, in the user's words — not a feature summary.
- **Include negative scope** when a skill is easily confused with another ("…not for X").
- **Be specific.** "Use when working with dates" is too broad; "Use when parsing, formatting, or
  doing arithmetic on dates/timezones" fires precisely.
- Put all the "when to use" information in the **description**, not the body. The model often
  decides based on the description alone.

Failure modes: a vague description never fires; an over-broad one fires constantly and crowds
context; a description that only says *what* (not *when*) leaves the model guessing.

## Structure the body for progressive disclosure

- Lead with the **core procedure or rules** — the 80% case, scannable at a glance.
- Push depth (edge cases, long references, examples, scripts) into **separate files** in the
  skill directory and link to them. The model loads them only when needed.
- Keep the main `SKILL.md` focused; a wall of text is as bad as no skill.

## One skill, one capability

If a skill needs "and" to describe it, split it. Narrow skills have sharper triggers and compose
better than a single god-skill. Use American English throughout.
