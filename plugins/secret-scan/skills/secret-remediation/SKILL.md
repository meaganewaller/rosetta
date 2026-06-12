---
name: secret-remediation
description: >-
  Use when a secret may have been committed or is about to be. Covers high-signal detection
  patterns and the correct remediation order — rotate the credential first, then remove it
  from code and history. Always redact when reporting.
---

# Secret detection & remediation

A committed secret should be treated as **compromised the moment it lands**, even in a
private repo. The clock starts at commit time, not at discovery.

## High-signal patterns

- **Cloud keys** — AWS access key ids (`AKIA…`/`ASIA…`), GCP/Azure key blobs.
- **Provider tokens** — GitHub (`ghp_…`, `github_pat_…`), Slack (`xox…`), Stripe (`sk_live_…`),
  npm, PyPI tokens.
- **Private keys** — any `-----BEGIN … PRIVATE KEY-----` block.
- **Connection strings** — `scheme://user:password@host/db` with embedded credentials.
- **Generic** — high-entropy values assigned to keys named `*secret*`, `*token*`,
  `*password*`, `*api*key*`, especially in `.env`, config, or CI files.

Filter false positives: placeholders (`example`, `changeme`, `xxxx`), test fixtures, and
documented sample values.

## Remediation order (do not reorder)

1. **Rotate / revoke first.** Invalidate the exposed credential at its source. Assume it's
   already scraped. This is the only step that actually stops the bleeding.
2. **Remove from code.** Move the value to a secret manager or environment variable; reference
   it indirectly. Never just delete it from the latest commit and move on.
3. **Purge history if needed.** If it's in past commits, rewrite history (`git filter-repo`
   or BFG) and force-push, then have collaborators re-clone. Rotation (step 1) matters more
   than a clean history — a rotated secret in old history is harmless.
4. **Prevent recurrence.** Add the path to `.gitignore`, add a pre-commit secret scan, and
   document where the real value lives.

## When reporting

- **Redact.** Show a masked prefix (e.g. `AKIA****`), never the full value — the report
  itself can leak.
- Lead with severity and the rotate-first action, not with history rewriting.
- American English throughout.
