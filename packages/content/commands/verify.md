# Verify

Run checks on the current codebase state.

## Usage

```
/verify          # full checks (default)
/verify quick    # build + types only
/verify pre-pr   # full checks + security scan
```

## Steps

Run in order, stopping at build failure:

1. **Build** — run the project's build command; stop and report if it fails
2. **Type check** — run the type checker; report errors with file and line
3. **Lint** — run the linter; report warnings and errors
4. **Tests** — run the full test suite; report pass/fail count and coverage
5. **Debug logging** — search source files for debug log statements left in; report locations
6. **Git status** — show uncommitted changes and files modified since last commit

Report results for each step and a final verdict: ready for PR or not.