# Eval

Manage eval-driven development for a feature.

## Usage

```
/eval define <name>
/eval check <name>
/eval report <name>
/eval list
/eval clean
```

## Define

Create `.claude/evals/<name>.md` with sections for:

- **Capability evals** — what new behavior should work
- **Regression evals** — what existing behavior must keep working
- **Success criteria** — pass rates required (e.g. pass@3 > 90% for capability, 100% for regression)

Then prompt for the specific criteria to fill in — don't leave placeholders.

## Check

Run evals for the named feature:

1. Read the definition from `.claude/evals/<name>.md`
2. Attempt to verify each capability eval; record pass/fail and log the attempt
3. Run relevant tests for each regression eval; compare against baseline
4. Report how many are passing and whether the feature is ready

## Report

Produce a full summary for the named feature covering:

- Each capability eval with pass/fail and how many attempts it took
- Each regression eval with pass/fail
- Aggregate pass rates
- A clear recommendation: ship, needs work, or blocked

## List

Show all eval definitions with their current pass rate and status (not started, in progress, ready).

## Clean

Remove old eval logs, keeping the last 10 runs per feature.