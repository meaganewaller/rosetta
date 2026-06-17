# Build and Fix

Incrementally fix build errors.

1. Determine the build command from the project (`npm run build`, `cargo build`, `make`, or equivalent) and run it
2. Group errors by file, sort by severity
3. For each error: show context, explain the issue, apply a fix, re-run the build, confirm resolved
4. Stop if a fix introduces new errors, the same error persists after 3 attempts, or the user requests a pause
5. Report errors fixed, errors remaining, and any new errors introduced

Fix one error at a time.