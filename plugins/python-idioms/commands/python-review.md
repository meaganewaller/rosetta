---
description: Review a Python file for idiomatic improvements.
argument-hint: "[file]"
allowed-tools: "Read, Grep, Glob, Edit"
---

Review the Python in **$1** (default: the files in the current change) for idiomatic quality.

Apply the `writing-idiomatic-python` skill. For each finding, report **file:line**, the
non-idiomatic pattern, and the idiomatic rewrite — prioritizing correctness-adjacent issues
(mutable default args, bare `except`, `is` vs `==`) over style. Offer to apply the fixes with
`Edit`; don't reformat wholesale (that's a linter's job). Keep the review proportional to the
change.
