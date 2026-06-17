# CCG Execute

Execute a plan produced by `/ccg:plan` — retrieves context, gets prototypes from Codex/Gemini, refactors to production-grade code, and audits.

## Usage

```
/ccg:execute .claude/plan/<feature-name>.md
/ccg:execute <task description>   # if plan already discussed in context
```

## Key constraints

- External models have **zero filesystem write access** — all writes are Claude's
- Treat Codex/Gemini diffs as dirty prototypes — always refactor before applying
- Do not proceed to the next phase until the current phase output is validated
- Require explicit user confirmation before executing if no plan file or `SESSION_ID` is present

See `ccg-shared.md` for call syntax, session reuse, role prompt paths, and `TaskOutput` specification.

## Workflow

### Phase 0: Read plan `[Mode: Prepare]`

Read and parse the plan file. Extract: task type, implementation steps, key files, `CODEX_SESSION`, `GEMINI_SESSION`.

Route by task type:
- **Frontend** (pages, components, UI, styles) → Gemini
- **Backend** (API, database, logic, algorithms) → Codex
- **Fullstack** → Codex ∥ Gemini parallel

If the plan is missing `SESSION_ID` or key files, confirm with the user before proceeding.

### Phase 1: Context retrieval `[Mode: Retrieval]`

Call `mcp__ace-tool__search_context` using the plan's key files as the basis for a semantic query. Do not manually explore the project with `find`/`ls`. If results are insufficient, run 1–2 additional targeted queries.

### Phase 2: Prototype acquisition `[Mode: Prototype]`

Call the appropriate model(s) using the architect role prompt. Use `resume <SESSION_ID>` from the plan where available.

Output required: **Unified Diff Patch only. No file modifications.**

For fullstack tasks, call Codex and Gemini in parallel (`run_in_background: true`) and wait for both.

### Phase 3: Implementation `[Mode: Implement]`

1. Parse the diff
2. Mentally simulate applying it — check logical consistency, spot conflicts and side effects
3. Refactor to production-grade code: readable, maintainable, compliant with project standards, no unnecessary comments
4. Apply changes with Edit/Write — modify only what the requirement demands
5. Run lint, typecheck, and tests; fix any regressions before proceeding

### Phase 4: Audit and delivery `[Mode: Audit]`

Parallel-call Codex (`reviewer.md`) and Gemini (`reviewer.md`) to review the applied diff:
- Codex: security, performance, error handling, logic correctness
- Gemini: accessibility, design consistency, user experience

Synthesize feedback, apply fixes (trust Codex for backend, Gemini for frontend), and repeat audit if needed. When clean, report the change summary and audit results to the user.