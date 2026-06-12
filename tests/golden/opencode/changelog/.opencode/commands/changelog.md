---
description: Generate or update CHANGELOG.md from git history for a release.
---

Update `CHANGELOG.md` for version **$1** (default: `Unreleased` if no version given).

Steps:

1. Find the previous release tag: `git describe --tags --abbrev=0` (if none, use the repo's
   first commit).
2. Collect commits since that tag: `git log <prev>..HEAD --pretty=format:'%s'`.
3. Group commit subjects into Keep a Changelog sections — **Added, Changed, Deprecated,
   Removed, Fixed, Security** — inferring the section from conventional-commit type where
   present (`feat:` → Added, `fix:` → Fixed, `perf:`/`refactor:` → Changed, etc.).
4. If `CHANGELOG.md` exists, insert a new version block at the top under any `Unreleased`
   section, preserving prior entries. If it doesn't exist, create one with the standard
   Keep a Changelog header.
5. Use the `keep-a-changelog` skill for exact formatting and heading conventions.

Write human-readable entries, not raw commit subjects — collapse noise, keep the signal.
