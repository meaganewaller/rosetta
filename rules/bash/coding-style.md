> This file extends [common/coding-style.md](../common/coding-style.md) with Bash-specific content.

## Shebang and strict mode

Every script starts with:

```bash
#!/usr/bin/env bash
set -euo pipefail
```

- `set -e` — exit immediately on error
- `set -u` — treat unset variables as errors
- `set -o pipefail` — propagate errors through pipes (without this, `false | true` exits 0)

## Immutability

Bash has no immutable data structures, but the principle applies in spirit: don't modify inputs. Write functions that produce output rather than mutating global state. Prefer local variables in functions:

```bash
process_file() {
  local input="$1"
  local result
  result=$(transform "$input")
  echo "$result"
}
```

## Quoting

Always double-quote variable expansions and command substitutions. Unquoted variables split on whitespace and glob-expand, causing hard-to-reproduce bugs:

```bash
# Unsafe — breaks on spaces in paths
cp $source $dest

# Safe
cp "$source" "$dest"
```

Exceptions: inside `[[ ]]`, the right-hand side of `=` and `==` is unquoted when you want glob matching.

## Error handling

Check return codes explicitly for commands where failure matters. Use meaningful exit codes:

```bash
if ! command_that_might_fail; then
  echo "Error: command failed" >&2
  exit 1
fi
```

Write error messages to stderr (`>&2`), not stdout. Stdout is for program output; stderr is for diagnostics.

## Input validation

Validate arguments at the top of every script before doing any work:

```bash
if [[ $# -lt 2 ]]; then
  echo "Usage: $(basename "$0") <source> <destination>" >&2
  exit 1
fi

source="$1"
destination="$2"

if [[ ! -f "$source" ]]; then
  echo "Error: source file '$source' does not exist" >&2
  exit 1
fi
```

## File organization

- One script, one responsibility
- Extract reusable logic into functions, not separate scripts unless independently useful
- Source shared libraries with explicit paths: `source "$(dirname "$0")/lib/common.sh"`
- Keep scripts under 200 lines; beyond that, consider whether the task belongs in a more expressive language

## Naming conventions

- Scripts: `kebab-case.sh`
- Functions: `snake_case`
- Local variables: `snake_case`
- Constants and environment variables: `SCREAMING_SNAKE_CASE`
- Temporary files: use `mktemp` and clean up with a trap