#!/usr/bin/env bash
# continuous-learning observer launcher
# Usage: start-observer.sh [start|stop|status]

set -euo pipefail

CONFIG_DIR="${HOME}/.claude/homunculus"
PID_FILE="${CONFIG_DIR}/.observer.pid"
LOG_FILE="${CONFIG_DIR}/observer.log"
OBSERVATIONS_FILE="${CONFIG_DIR}/observations.jsonl"
INTERVAL=300  # seconds between analysis runs

mkdir -p "$CONFIG_DIR"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*" >> "$LOG_FILE"; }

is_running() {
  [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null
}

clean_pid() {
  rm -f "$PID_FILE"
}

analyze() {
  [[ -f "$OBSERVATIONS_FILE" ]] || return
  local count
  count=$(wc -l < "$OBSERVATIONS_FILE" 2>/dev/null || echo 0)
  (( count < 10 )) && return

  log "Analyzing $count observations..."

  if ! command -v claude &>/dev/null; then
    log "claude CLI not found — skipping analysis"
    return
  fi

  if ! claude --model haiku --max-turns 3 --print \
    "Read ${OBSERVATIONS_FILE} and identify patterns. \
     If you find 3+ occurrences of the same pattern, create an instinct file \
     in ${CONFIG_DIR}/instincts/personal/ following the observer agent spec. \
     Be conservative — only create instincts for clear patterns." \
    >> "$LOG_FILE" 2>&1; then
    log "Analysis failed (exit $?)"
  fi

  # Archive processed observations
  local archive_dir="${CONFIG_DIR}/observations.archive"
  mkdir -p "$archive_dir"
  mv "$OBSERVATIONS_FILE" "${archive_dir}/processed-$(date +%Y%m%d-%H%M%S).jsonl" 2>/dev/null || true
  touch "$OBSERVATIONS_FILE"
}

# ---------------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------------

cmd_stop() {
  if ! is_running; then
    [[ -f "$PID_FILE" ]] && { echo "Removing stale PID file."; clean_pid; }
    echo "Observer is not running."
    return 0
  fi
  local pid
  pid=$(cat "$PID_FILE")
  echo "Stopping observer (PID: ${pid})..."
  kill "$pid"
  clean_pid
  echo "Observer stopped."
}

cmd_status() {
  if is_running; then
    local obs_count
    obs_count=$(wc -l < "$OBSERVATIONS_FILE" 2>/dev/null || echo 0)
    echo "Observer is running (PID: $(cat "$PID_FILE"))"
    echo "Observations: ${obs_count} lines"
    echo "Log: ${LOG_FILE}"
    return 0
  else
    [[ -f "$PID_FILE" ]] && { echo "Removing stale PID file."; clean_pid; }
    echo "Observer is not running."
    return 1
  fi
}

cmd_start() {
  if is_running; then
    echo "Observer already running (PID: $(cat "$PID_FILE"))."
    return 0
  fi
  clean_pid

  # Write PID before disowning so the parent can read it reliably
  (
    echo $$ > "$PID_FILE"
    trap 'clean_pid; exit 0' TERM INT
    trap 'analyze' USR1

    log "Observer started (PID: $$)"

    while true; do
      sleep "$INTERVAL" &
      wait $!
      analyze
    done
  ) &

  disown $!

  # Give the subshell a moment to write its PID
  local retries=5
  while (( retries-- > 0 )); do
    sleep 0.2
    is_running && break
  done

  if is_running; then
    echo "Observer started (PID: $(cat "$PID_FILE"))."
    echo "Log: ${LOG_FILE}"
  else
    echo "Failed to start observer." >&2
    return 1
  fi
}

# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

case "${1:-start}" in
  stop)   cmd_stop ;;
  status) cmd_status ;;
  start)  cmd_start ;;
  *)
    echo "Usage: $(basename "$0") [start|stop|status]" >&2
    exit 1
    ;;
esac