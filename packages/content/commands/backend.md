# Backend

Codex-led development workflow for server-side tasks (Research → Ideation → Plan → Execute → Optimize → Review).

## Usage

```
/backend <task description>
```

## Model roles

- **Codex** — backend authority; its opinions are trustworthy
- **Gemini** — frontend perspective only; backend opinions for reference
- **Claude** — orchestration, all file writes, delivery

See `ccg-shared.md` for call syntax, session reuse, role prompt paths, and `TaskOutput` specification.

## Workflow

### Phase 0: Prepare
Enhance prompt via `mcp__ace-tool__enhance_prompt` if available. Use the result for all Codex calls.

### Phase 1: Research `[Mode: Research]`
Retrieve existing APIs, data models, and service architecture via `mcp__ace-tool__search_context`. Score requirement completeness (0–10) — continue at ≥7, stop and clarify below that.

### Phase 2: Ideation `[Mode: Ideation]`
Call Codex (`analyzer.md`). Output at least 2 solutions with trade-offs. Save `CODEX_SESSION`. Wait for user to select a solution.

### Phase 3: Planning `[Mode: Plan]`
Call Codex (`architect.md`, `resume $CODEX_SESSION`). Output file structure, function/class design, dependencies. Claude synthesizes and saves plan to `.claude/plan/<task-name>.md` after user approval.

### Phase 4: Implementation `[Mode: Execute]`
Follow the approved plan. Match existing code standards. Cover error handling, security, and performance.

### Phase 5: Optimization `[Mode: Optimize]`
Call Codex (`reviewer.md`). Input: `git diff` or changed code. Output: security, performance, error handling, API compliance issues. Apply fixes after user confirmation.

### Phase 6: Review `[Mode: Review]`
Verify completion against plan, run tests, report remaining issues.