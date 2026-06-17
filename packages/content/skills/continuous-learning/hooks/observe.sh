#!/usr/bin/env bash
# continuous-learning observation hook
# Captures PreToolUse/PostToolUse events to ~/.claude/homunculus/observations.jsonl
# See continuous-learning skill for hook configuration.

set -euo pipefail

CONFIG_DIR="${HOME}/.claude/homunculus"
OBSERVATIONS_FILE="${CONFIG_DIR}/observations.jsonl"
MAX_FILE_SIZE_MB=10

mkdir -p "$CONFIG_DIR"

# Respect kill switch
[[ -f "${CONFIG_DIR}/disabled" ]] && exit 0

# Read stdin — nothing to do if empty
INPUT_JSON=$(cat)
[[ -z "$INPUT_JSON" ]] && exit 0

# Archive observations file if it has grown too large
if [[ -f "$OBSERVATIONS_FILE" ]]; then
  file_size_mb=$(du -m "$OBSERVATIONS_FILE" 2>/dev/null | cut -f1)
  if [[ "${file_size_mb:-0}" -ge "$MAX_FILE_SIZE_MB" ]]; then
    archive_dir="${CONFIG_DIR}/observations.archive"
    mkdir -p "$archive_dir"
    mv "$OBSERVATIONS_FILE" "${archive_dir}/observations-$(date +%Y%m%d-%H%M%S).jsonl"
  fi
fi

# Parse input and append observation in one Python call
python3 - "$OBSERVATIONS_FILE" <<'PYEOF'
import json
import sys

observations_file = sys.argv[1]
timestamp = __import__("datetime").datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")

try:
    data = json.loads(sys.stdin.read())
except json.JSONDecodeError as e:
    with open(observations_file, "a") as f:
        f.write(json.dumps({"timestamp": timestamp, "event": "parse_error", "error": str(e)}) + "\n")
    sys.exit(0)

hook_type = data.get("hook_type", "")
tool_name = data.get("tool_name", data.get("tool", "unknown"))
session_id = data.get("session_id", "unknown")
event = "tool_start" if "Pre" in hook_type else "tool_complete"

def truncate(value, limit=5000):
    s = json.dumps(value) if isinstance(value, dict) else str(value)
    return s[:limit]

observation = {
    "timestamp": timestamp,
    "event": event,
    "tool": tool_name,
    "session": session_id,
}

if event == "tool_start":
    observation["input"] = truncate(data.get("tool_input", data.get("input", {})))
else:
    observation["output"] = truncate(data.get("tool_output", data.get("output", "")))

with open(observations_file, "a") as f:
    f.write(json.dumps(observation) + "\n")
PYEOF

# Signal observer process if running
pid_file="${CONFIG_DIR}/.observer.pid"
if [[ -f "$pid_file" ]]; then
  pid=$(cat "$pid_file")
  kill -USR1 "$pid" 2>/dev/null || true
fi