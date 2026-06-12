---
name: keep-a-changelog
description: >-
  Use when writing or updating a CHANGELOG. Applies the Keep a Changelog format —
  the six change groups (Added, Changed, Deprecated, Removed, Fixed, Security),
  reverse-chronological version blocks, ISO dates, and an Unreleased section — kept
  aligned with Semantic Versioning.
---

# Keep a Changelog

A changelog is **for humans**. Write entries a reader can understand without reading the
diff. Follow the [Keep a Changelog](https://keepachangelog.com/) conventions.

## Structure

- Reverse chronological: newest version at the top.
- One block per version: `## [x.y.z] - YYYY-MM-DD`.
- An `## [Unreleased]` block at the top accumulates changes not yet released.
- Dates are ISO 8601 (`2026-06-12`).

## The six groups

Within a version block, group entries under only the headings that apply:

- **Added** — new features.
- **Changed** — changes to existing behavior.
- **Deprecated** — soon-to-be-removed features.
- **Removed** — now-removed features.
- **Fixed** — bug fixes.
- **Security** — vulnerabilities addressed.

## Rules

- Each entry is a short, human-readable line — not a raw commit subject.
- Don't include empty groups.
- Map conventional-commit types when inferring groups: `feat:` → Added, `fix:` → Fixed,
  `perf:`/`refactor:`/most `chore:` → Changed, security fixes → Security, removals → Removed.
- Keep versioning aligned with SemVer: breaking changes imply a major bump.
- American English throughout.

## Skeleton

```markdown
# Changelog

All notable changes to this project are documented here.
The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

## [Unreleased]

## [1.2.0] - 2026-06-12
### Added
- New `--harness` flag to target a specific tool.
### Fixed
- Crash when the changelog file did not yet exist.
```
