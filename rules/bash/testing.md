> This file extends [common/testing.md](../common/testing.md) with Bash-specific content.

## Test framework

Use **Bats** (Bash Automated Testing System) for shell scripts:

```bash
npm install --save-dev bats
# or
brew install bats-core
```

## File organization

Co-locate tests with scripts or use a top-level `test/` directory:

```
scripts/
  deploy.sh
  test/
    deploy.bats
  lib/
    common.sh
    test/
      common.bats
```

## Test structure

```bash
#!/usr/bin/env bats

setup() {
  # Runs before each test
  TEST_DIR="$(mktemp -d)"
}

teardown() {
  # Runs after each test — always runs even if test fails
  rm -rf "$TEST_DIR"
}

@test "copies file to destination" {
  local src="$TEST_DIR/source.txt"
  echo "content" > "$src"

  run my_script.sh "$src" "$TEST_DIR/dest.txt"

  [ "$status" -eq 0 ]
  [ -f "$TEST_DIR/dest.txt" ]
}

@test "exits 1 when source does not exist" {
  run my_script.sh "/nonexistent" "$TEST_DIR/dest.txt"

  [ "$status" -eq 1 ]
  [[ "$output" == *"does not exist"* ]]
}
```

`run` captures exit status in `$status` and output in `$output` — use it for any command you want to assert on without aborting the test.

## Testing patterns

**Test behavior, not implementation.** Assert on exit codes, stdout/stderr output, and filesystem state — not on internal function calls.

**Use `setup`/`teardown` for isolation.** Every test gets a fresh temp directory; never share mutable state between tests.

**Test error paths explicitly.** Bash scripts fail silently when not tested under `set -euo pipefail`. Verify that your error handling actually triggers:

```bash
@test "fails loudly on missing required argument" {
  run my_script.sh  # no arguments

  [ "$status" -ne 0 ]
  [[ "$output" =~ "Usage:" ]]
}
```

## Running tests

```bash
# Run all tests
bats test/

# Run a specific file
bats test/deploy.bats

# Verbose output
bats --verbose-run test/
```