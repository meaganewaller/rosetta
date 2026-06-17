---
description: Scan the staged diff (or given paths) for committed secrets.
argument-hint: "[path]"
allowed-tools: "Bash(git diff:*), Bash(git log:*), Read, Glob, Grep"
---

Scan **$1** for committed secrets (default: the staged diff, `git diff --cached`).

Steps:

1. Gather the content to scan — the staged diff, or the files/paths in `$1`.
2. Apply the `secret-remediation` skill's patterns to flag likely secrets: cloud keys, tokens,
   private keys, connection strings, and high-entropy strings in secret-shaped assignments.
3. For each finding, report: **file:line**, the **kind** of secret, a **confidence**
   (high/medium/low), and the **remediation**. **Redact the value** — show only a short
   masked prefix, never the full secret.
4. Separate likely-real findings from probable false positives (placeholders, `example`,
   `dummy`, obviously fake values). Say which is which.

If a real secret is found, lead with the remediation order from the skill — **rotate first**.
This command reports and advises; it does not rewrite git history on its own.
