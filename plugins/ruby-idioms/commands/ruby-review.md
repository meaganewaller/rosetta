---
description: Review a Ruby file for idiomatic improvements.
argument-hint: "[file]"
allowed-tools: "Read, Grep, Glob, Edit"
---

Review the Ruby in **$1** (default: the files in the current change) for idiomatic quality.

Apply the `writing-idiomatic-ruby` skill. For each finding, report **file:line**, the
non-idiomatic pattern (manual loops, verbose nil checks, nested conditionals, `rescue
Exception`), and the idiomatic rewrite — favoring the right Enumerable method and guard clauses.
Offer to apply fixes with `Edit`; leave whitespace/formatting to RuboCop. Keep the review
proportional to the change.
