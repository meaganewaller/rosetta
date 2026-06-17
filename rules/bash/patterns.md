> This file extends [common/patterns.md](../common/patterns.md) with Bash-specific content.

## Script structure

Every non-trivial script follows this layout:

```bash
#!/usr/bin/env bash
set -euo pipefail

# --- Constants ---
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_NAME="$(basename "$0")"

# --- Functions ---
usage() {
  echo "Usage: $SCRIPT_NAME [options] <arg>" >&2
  echo ""
  echo "Options:" >&2
  echo "  -h, --help    Show this help" >&2
  echo "  -n, --dry-run Print actions without executing" >&2
  exit 1
}

main() {
  parse_args "$@"
  validate
  run
}

# --- Entry point ---
main "$@"
```

Wrapping logic in `main()` prevents partial execution if the script is sourced or interrupted during download.

## Temporary files

Always use `mktemp` and clean up with a trap:

```bash
TMPFILE="$(mktemp)"
trap 'rm -f "$TMPFILE"' EXIT

# TMPFILE is cleaned up on exit, error, or signal
```

For temp directories: `mktemp -d`.

## Command existence checks

```bash
require_command() {
  local cmd="$1"
  if ! command -v "$cmd" &>/dev/null; then
    echo "Error: '$cmd' is required but not installed" >&2
    exit 1
  fi
}

require_command jq
require_command aws
```

Call these at the top of scripts that depend on external tools, before doing any real work.

## Logging

Use a consistent logging pattern across scripts:

```bash
log()  { echo "[$(date '+%H:%M:%S')] $*"; }
warn() { echo "[$(date '+%H:%M:%S')] WARN: $*" >&2; }
die()  { echo "[$(date '+%H:%M:%S')] ERROR: $*" >&2; exit 1; }

log "Starting deployment"
warn "Skipping optional step"
die "Required file not found"  # exits
```

## Argument parsing

For scripts with more than two arguments, use a `while` loop over positional args:

```bash
parse_args() {
  DRY_RUN=false

  while [[ $# -gt 0 ]]; do
    case "$1" in
      -h|--help)    usage ;;
      -n|--dry-run) DRY_RUN=true; shift ;;
      --)           shift; break ;;
      -*)           die "Unknown option: $1" ;;
      *)            break ;;
    esac
  done

  [[ $# -ge 1 ]] || die "Missing required argument: <target>"
  TARGET="$1"
}
```

## API response handling with jq

When consuming JSON from APIs or CLI tools, always use `jq` rather than `grep`/`sed`:

```bash
response=$(curl -sf "https://api.example.com/status")
status=$(echo "$response" | jq -r '.status')

if [[ "$status" != "ok" ]]; then
  die "API returned status: $status"
fi
```