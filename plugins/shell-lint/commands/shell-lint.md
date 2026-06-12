---
description: Lint a shell script with shellcheck and apply robust-bash fixes.
argument-hint: "[file]"
allowed-tools: "Bash(shellcheck:*), Read, Edit"
---

Lint and harden the shell script at **$1**.

Steps:

1. Run `shellcheck $1` and collect the findings. If `shellcheck` is not installed, say so
   and review the script manually against the `writing-robust-bash` skill instead.
2. For each finding, explain the issue in one line and propose the fix. Apply fixes with
   `Edit`, preserving the script's behavior and style.
3. Beyond shellcheck, audit against the `writing-robust-bash` skill: strict mode, quoting,
   error handling and cleanup traps, and portability (bash vs POSIX `sh`).
4. Summarize what changed and call out anything that needs a human decision (e.g. a quoting
   change that could alter word-splitting on purpose).

Don't silence warnings with blanket `# shellcheck disable` directives — fix the cause. A
targeted disable with a one-line justification is acceptable when the warning is a genuine
false positive.
