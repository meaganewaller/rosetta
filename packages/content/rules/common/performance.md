# Performance

## Model selection

Choose models based on task complexity, not habit. Lighter models are faster and cheaper for tasks that don't require deep reasoning — use them for worker agents, frequent invocations, and straightforward code generation. Reserve the most capable models for architectural decisions, complex multi-file reasoning, and tasks where quality clearly outweighs cost.

Consult the product-self-knowledge skill for current model names, capabilities, and cost tradeoffs — these change and shouldn't be hardcoded in rules.

## Context window

Avoid starting large, multi-file tasks when the context window is near capacity. Tasks sensitive to a full context include large-scale refactoring, feature implementation spanning many files, and debugging complex interactions across a codebase. At high context usage, prefer smaller scoped tasks: single-file edits, isolated utilities, documentation updates, simple bug fixes.

When context is getting full and the task is large, start a fresh session rather than pushing into the last portion of the window where reasoning quality degrades.