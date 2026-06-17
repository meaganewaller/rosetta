# Workflow

Full multi-model development workflow (Research → Ideation → Plan → Execute → Optimize → Review) with intelligent routing: frontend → Gemini, backend → Codex.

## Usage

```
/workflow <task description>
```

## Model roles

- **Codex** — backend authority (logic, algorithms, data)
- **Gemini** — frontend authority (UI/UX, visual design); backend opinions for reference only
- **Claude** — orchestration, all file writes, delivery

See `ccg-shared.md` for call syntax, session reuse, role prompt paths, and `TaskOutput` specification.

## Workflow

### Phase 1: Research `[Mode: Research]`

1. Enhance prompt via `mcp__ace-tool__enhance_prompt` — use result for all model calls
2. Retrieve context via `mcp__ace-tool__search_context`
3. Score requirement completeness (0–10) across: goal clarity, expected outcome, scope, constraints — continue at ≥7, stop and clarify below

### Phase 2: Ideation `[Mode: Ideation]`

Parallel-call Codex (`analyzer.md`) and Gemini (`analyzer.md`). Save `CODEX_SESSION` and `GEMINI_SESSION`. Wait for both. Synthesize into at least 2 solution options and wait for user selection.

### Phase 3: Planning `[Mode: Plan]`

Parallel-call Codex (`architect.md`, `resume $CODEX_SESSION`) and Gemini (`architect.md`, `resume $GEMINI_SESSION`). Wait for both. Claude synthesizes: adopt Codex for backend architecture, Gemini for frontend architecture. Save to `.claude/plan/<task-name>.md` after user approval.

### Phase 4: Implementation `[Mode: Execute]`

Follow the approved plan. Match existing code standards. Check in with the user at key milestones.

### Phase 5: Optimization `[Mode: Optimize]`

Parallel-call Codex (`reviewer.md`) and Gemini (`reviewer.md`) on the changed diff. Codex: security, performance, error handling. Gemini: accessibility, design consistency. Apply fixes after user confirmation.

### Phase 6: Review `[Mode: Review]`

Verify completion against plan, run tests, report remaining issues, confirm with user.

## Communication

- Label each response with its current mode: `[Mode: Research]`, `[Mode: Ideation]`, etc.
- Use `AskUserQuestion` for confirmations and selections
- Phase sequence cannot be skipped unless the user explicitly instructs it