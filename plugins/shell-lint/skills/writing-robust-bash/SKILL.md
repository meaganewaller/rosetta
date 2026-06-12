---
name: writing-robust-bash
description: >-
  Use when writing or reviewing bash/shell scripts. Covers strict mode, quoting, error
  handling and cleanup traps, safe command usage, and bash-vs-POSIX portability so scripts
  fail loudly instead of silently doing the wrong thing.
---

# Writing robust bash

A shell script's default behavior is to plow ahead after an error. Robust scripts opt out of
that: fail fast, quote everything, and clean up after themselves.

## Strict mode

Start non-trivial bash scripts with:

```bash
#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'
```

- `-e` exit on error, `-u` error on unset variables, `-o pipefail` so a failure mid-pipe
  isn't masked by a later success.
- Narrowing `IFS` avoids surprise word-splitting on spaces.

## Quoting

- Quote every expansion: `"$var"`, `"$@"`, `"${arr[@]}"`. Unquoted expansions split on
  whitespace and glob.
- Use `"$@"` (not `$*`) to forward arguments intact.
- Prefer `printf '%s\n' "$x"` over `echo "$x"` for values that may start with `-` or contain
  escapes.

## Errors & cleanup

- Use a trap for cleanup so temp files go away on any exit:
  `tmp=$(mktemp); trap 'rm -f "$tmp"' EXIT`.
- Check that required commands exist: `command -v jq >/dev/null || { echo "need jq" >&2; exit 1; }`.
- Send diagnostics to stderr (`>&2`) and return meaningful exit codes.

## Safe patterns

- Prefer `[[ … ]]` over `[ … ]` in bash; it's safer with empty vars and supports `=~`.
- Don't parse `ls`; use globs or `find … -print0` with `read -d ''`.
- Use `local` for function variables so they don't leak into the global scope.
- Quote command substitutions: `count="$(wc -l < "$file")"`.

## Portability

- If the shebang is `#!/bin/sh`, you're in POSIX territory: no `[[ ]]`, no arrays, no
  `local` (in strict POSIX). Either target bash explicitly or stay within POSIX.
- `set -euo pipefail` is bash; plain POSIX `sh` supports only `set -eu`.

American English in comments and messages.
