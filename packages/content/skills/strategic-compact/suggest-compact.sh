#!/usr/bin/env bash
# Strategic compact suggester — runs on PreToolUse (Edit/Write).
# See strategic-compact skill for hook configuration.

set -euo pipefail

THRESHOLD="${COMPACT_THRESHOLD:-50}"
REMINDER_INTERVAL=25

# Use CLAUDE_SESSION_ID for session-scoped counter; fall back to PPID.
# Avoid $$ — it changes per invocation.
SESSION_ID="${CLAUDE_SESSION_ID:-${PPID:-default}}"
COUNTER_FILE="/tmp/claude-compact-count-${SESSION_ID}"

# Increment counter
if [[ -f "$COUNTER_FILE" ]]; then
  count=$(( $(cat "$COUNTER_FILE") + 1 ))
else
  count=1
fi
echo "$count" > "$COUNTER_FILE"

# Suggest at threshold
if (( count == THRESHOLD )); then
  echo "[strategic-compact] ${count} tool calls — consider /compact if transitioning phases" >&2
  exit 0
fi

# Remind at regular intervals after threshold
if (( count > THRESHOLD && (count - THRESHOLD) % REMINDER_INTERVAL == 0 )); then
  echo "[strategic-compact] ${count} tool calls — good checkpoint for /compact if context is stale" >&2
fi