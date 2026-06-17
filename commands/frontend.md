# Frontend

Gemini-led development workflow for UI/UX tasks (Research → Ideation → Plan → Execute → Optimize → Review).

## Usage

```
/frontend <task description>
```

## Model roles

- **Gemini** — frontend authority; its opinions are trustworthy
- **Codex** — backend perspective only; frontend opinions for reference
- **Claude** — orchestration, all file writes, delivery

See `ccg-shared.md` for call syntax, session reuse, role prompt paths, and `TaskOutput` specification.

## Workflow

### Phase 0: Prepare
Enhance prompt via `mcp__ace-tool__enhance_prompt` if available. Use the result for all Gemini calls.

### Phase 1: Research `[Mode: Research]`
Retrieve existing components, styles, and design system via `mcp__ace-tool__search_context`. Score requirement completeness (0–10) — continue at ≥7, stop and clarify below that.

### Phase 2: Ideation `[Mode: Ideation]`
Call Gemini (`analyzer.md`). Output at least 2 solutions with UX evaluation. Save `GEMINI_SESSION`. Wait for user to select a solution.

### Phase 3: Planning `[Mode: Plan]`
Call Gemini (`architect.md`, `resume $GEMINI_SESSION`). Output component structure, UI flow, styling approach. Claude synthesizes and saves plan to `.claude/plan/<task-name>.md` after user approval.

### Phase 4: Implementation `[Mode: Execute]`
Follow the approved plan. Match existing design system and code standards. Ensure responsiveness and accessibility.

### Phase 5: Optimization `[Mode: Optimize]`
Call Gemini (`reviewer.md`). Input: `git diff` or changed code. Output: accessibility, responsiveness, performance, design consistency issues. Apply fixes after user confirmation.

### Phase 6: Review `[Mode: Review]`
Verify completion against plan, check responsiveness and accessibility, report remaining issues.