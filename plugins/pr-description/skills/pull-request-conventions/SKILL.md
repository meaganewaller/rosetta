---
name: pull-request-conventions
description: >-
  Use when writing or reviewing a pull request description. Provides a structure
  (Summary / Changes / Testing / Notes) and tone guidance focused on the reviewer —
  lead with why, keep it scannable, never pad a small change into a big description.
---

# Pull request conventions

A PR description is written **for the reviewer**. Its job is to make the change easy and
fast to review correctly. Optimize for their time, not for completeness theater.

## Structure

Use only the sections that carry signal:

- **Summary** — what changed and *why*, in 2–4 sentences. The why goes first; the diff
  already shows the what.
- **Changes** — notable changes as a short bulleted list, grouped by theme. Not a
  file-by-file restatement of the diff.
- **Testing** — how it was verified, or exactly what the reviewer should check. Be honest:
  if something wasn't tested, say so.
- **Notes** — risks, known limitations, follow-ups, or explicitly out-of-scope items. Omit
  the section entirely if there are none.

## Tone

- **Lead with why.** Reviewers can read the diff for the what; they can't read your mind for
  the why.
- **Scannable beats thorough.** Short bullets, clear headings, no walls of prose.
- **Proportional.** A one-line fix gets a one-line description. Don't inflate.
- **Honest.** Never claim testing that didn't happen. Flag the risky parts rather than
  burying them.
- **American English**, present tense, active voice.

## Anti-patterns

- Restating every file in the diff as a bullet.
- "Various fixes and improvements" — say which, and why.
- A long Testing section that just says "tested locally" with no specifics.
- Hiding a breaking change three paragraphs down instead of calling it out up top.
