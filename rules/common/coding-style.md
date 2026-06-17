# Coding Style

## Immutability

Never mutate existing objects — always return new copies with changes applied. Mutating in place creates hidden side effects, makes state hard to trace, and breaks safe concurrency. Language-specific rules cover the idiomatic patterns for each stack.

## File organization

Prefer many small, focused files over few large ones. A file should do one thing well. Typical range is 200–400 lines; treat 800 as a hard ceiling. When a file grows large, extract by feature or domain — not by type (avoid `utils.ts` dumping grounds).

## Error handling

Handle errors explicitly at every level — don't let them propagate silently or get swallowed in empty catch blocks. In UI-facing code, surface user-friendly messages. On the server, log full context. Never suppress an error without a deliberate reason and a comment explaining why.

## Input validation

Validate all external input at system boundaries before it touches business logic. This includes user input, API responses, file content, and environment variables. Use schema validation where available. Fail fast with a clear message rather than letting bad data corrupt state downstream.

## Before marking work complete

- Functions are small and do one thing (<50 lines is a good signal, not a hard rule)
- Files are focused (<800 lines)
- No nesting deeper than 4 levels — use early returns and extracted helpers
- No hardcoded values that belong in constants or config
- No mutations — immutable patterns used throughout
- Errors handled explicitly, not swallowed
- All external input validated at the boundary