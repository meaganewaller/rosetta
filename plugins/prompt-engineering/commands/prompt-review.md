---
description: Review an LLM prompt for specificity, structure, and failure modes.
argument-hint: "[file]"
allowed-tools: "Read, Grep, Glob, Edit"
---

Review the prompt in **$1** (a file, or paste the prompt) using the `effective-prompting` skill.

For each issue, name it and show the fix:

1. **Specificity** — is the task, the inputs, and the *exact output shape* unambiguous?
2. **Output contract** — if the output is machine-consumed, is there a schema / structured-output
   ask, or is it parsing prose?
3. **Examples** — are format- and judgment-sensitive parts shown with examples (incl. edge cases)?
4. **Reasoning** — for multi-step tasks, is there room to reason, with answer/reasoning separated?
5. **Failure modes** — contradictions, buried task, irrelevant context, over-constraint.

Then provide a **tightened rewrite** of the prompt, and offer to apply it with `Edit`. Keep
provider-specific knobs (model, temperature, token limits) out of the review — flag them only as
"configure per your provider."
