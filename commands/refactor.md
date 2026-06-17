# Refactor Clean

Safely identify and remove dead code with test verification.

1. Determine the appropriate dead code analysis tools for the project's language and stack, then run them
2. Generate a report in `.reports/dead-code-analysis.md`
3. Categorize findings: safe (test files, unused utilities), caution (API routes, components), danger (config files, entry points)
4. Propose safe deletions only
5. For each deletion: run the full test suite, apply the change, re-run tests, roll back if tests fail
6. Report what was removed

Never delete code without running tests first.