# Test Coverage

Analyze coverage and generate missing tests to reach 80%+.

1. Determine the project's test and coverage command, then run it
2. Parse the coverage report to identify files below 80%
3. For each under-covered file: analyze untested paths and generate tests covering happy paths, error handling, edge cases (null, empty, boundary values)
4. Verify new tests pass
5. Report before/after coverage metrics