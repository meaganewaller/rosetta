# CCG Shared Reference

Shared call syntax, session management, and role prompt paths for all `/ccg:*` and `/workflow` commands.

## Call syntax

```
# New session
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend <codex|gemini> {{GEMINI_MODEL_FLAG}}- \"$PWD\" <<'EOF'
ROLE_FILE: <role prompt path>
<TASK>
Requirement: <requirement>
Context: <context>
</TASK>
OUTPUT: <expected output>
EOF",
  run_in_background: <true|false>,
  timeout: 3600000,
  description: "<brief description>"
})

# Resume existing session
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend <codex|gemini> {{GEMINI_MODEL_FLAG}}resume <SESSION_ID> - \"$PWD\" <<'EOF'
...same body...
EOF",
  run_in_background: <true|false>,
  timeout: 3600000,
  description: "<brief description>"
})
```

`{{GEMINI_MODEL_FLAG}}` → `--gemini-model gemini-3-pro-preview ` (with trailing space) for Gemini; empty string for Codex.

Use `run_in_background: true` for parallel calls, `false` for sequential.

## Waiting for background tasks

```
TaskOutput({ task_id: "<task_id>", block: true, timeout: 600000 })
```

Always specify `timeout: 600000` (10 minutes) — the default is 30 seconds and will cause premature timeout. If still incomplete after 10 minutes, keep polling with `TaskOutput`. Never kill the process directly — ask the user first via `AskUserQuestion`.

## Session reuse

Each call returns `SESSION_ID: xxx`. Save it and use `resume <SESSION_ID>` in subsequent calls to preserve context. In multi-phase workflows, save as `CODEX_SESSION` and `GEMINI_SESSION`.

## Role prompt paths

| Phase | Codex | Gemini |
|-------|-------|--------|
| Analysis | `~/.claude/.ccg/prompts/codex/analyzer.md` | `~/.claude/.ccg/prompts/gemini/analyzer.md` |
| Planning | `~/.claude/.ccg/prompts/codex/architect.md` | `~/.claude/.ccg/prompts/gemini/architect.md` |
| Review | `~/.claude/.ccg/prompts/codex/reviewer.md` | `~/.claude/.ccg/prompts/gemini/reviewer.md` |
| Frontend impl | — | `~/.claude/.ccg/prompts/gemini/frontend.md` |

## Trust rules

- Backend logic → follow Codex
- Frontend/UI → follow Gemini
- External models have **zero filesystem write access** — all file operations are Claude's