---
name: ccg-plan
description: Multi-model collaborative planning using Codex and Gemini analysis
command: true
---

# CCG Plan

Multi-model collaborative planning — retrieves context, runs parallel Codex/Gemini analysis, and produces a step-by-step implementation plan. Does not modify any production code.

## Usage

```
/ccg:plan <requirement>
```

## Key constraints

- External models (Codex, Gemini) have **zero filesystem write access** — all file operations are Claude's responsibility
- All model calls use `run_in_background: true` — never block the main thread
- Do not proceed to the next phase until the current phase output is validated
- This command ends when the plan is saved and presented — never auto-invoke `/ccg:execute`

## Execution workflow

### Phase 1: Context retrieval

1. Enhance the prompt via `mcp__ace-tool__enhance_prompt` — use the result for all subsequent phases
2. Retrieve project context via `mcp__ace-tool__search_context` with a semantic query built from the enhanced requirement. If MCP is unavailable, fall back to Glob + Grep
3. Verify completeness — obtain full definitions and signatures for all relevant symbols; recurse if needed
4. If requirements are still ambiguous, ask clarifying questions before proceeding

### Phase 2: Multi-model analysis

Run Codex and Gemini in parallel (`run_in_background: true`). Save the returned `SESSION_ID` from each as `CODEX_SESSION` and `GEMINI_SESSION`.

**Codex** (role: `~/.claude/.ccg/prompts/codex/analyzer.md`) — technical feasibility, architecture impact, performance, risks

**Gemini** (role: `~/.claude/.ccg/prompts/gemini/analyzer.md`) — UI/UX impact, user experience, visual design

Wait for both with `TaskOutput({ block: true, timeout: 600000 })`. If still incomplete after 10 minutes, keep polling — never kill the process without asking the user first.

Optionally run a second parallel round using the architect role prompts to get plan drafts from each model before synthesizing.

### Phase 3: Plan synthesis

Synthesize both analyses into a final implementation plan covering: technical solution, numbered steps with expected deliverables, key files with line ranges and operations, risks and mitigations, and the saved `CODEX_SESSION` / `GEMINI_SESSION` IDs for use by `/ccg:execute`.

Save to `.claude/plan/<feature-name>.md` (use iteration suffixes `-v2`, `-v3` for revisions). Write the file before presenting it to the user.

Present the complete plan, state the saved file path, and show the execute command the user should run in a new session:

```
/ccg:execute .claude/plan/<feature-name>.md
```

Then stop. No further tool calls.

## Model call syntax

```
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend <codex|gemini> {{GEMINI_MODEL_FLAG}}- \"$PWD\" <<'EOF'
ROLE_FILE: <role prompt path>
<TASK>
Requirement: <enhanced requirement>
Context: <retrieved context>
</TASK>
OUTPUT: Step-by-step implementation plan with pseudo-code. DO NOT modify any files.
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "<brief description>"
})
```

`{{GEMINI_MODEL_FLAG}}` → `--gemini-model gemini-3-pro-preview ` (trailing space) when using Gemini; empty string for Codex.