---
description: Draft a reviewer-friendly pull request description from the diff and commits.
argument-hint: "[base-branch]"
allowed-tools: "Bash(git diff:*), Bash(git log:*), Bash(git branch:*), Read"
---

Draft a pull request description for the current branch against base **$1** (default: the
repo's default branch — detect it with `git symbolic-ref refs/remotes/origin/HEAD`).

Steps:

1. Determine the change set: `git log <base>..HEAD --pretty=format:'%s%n%b'` for intent, and
   `git diff <base>...HEAD --stat` for scope.
2. Apply the `pull-request-conventions` skill for structure and tone.
3. Produce a description with:
   - **Summary** — what changed and *why*, in 2–4 sentences. Lead with the why.
   - **Changes** — the notable changes as a short bulleted list (grouped, not a file dump).
   - **Testing** — how it was verified, or what reviewers should check.
   - **Notes** — risks, follow-ups, or out-of-scope items, only if any exist.
4. Keep it scannable. Do not pad. If the diff is trivial, the description should be trivial.

Output the description as Markdown ready to paste into the PR body. Do not invent testing
that wasn't done — if you can't tell how it was tested, say so and prompt the author.
