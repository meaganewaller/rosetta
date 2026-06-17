# Update Docs

Sync documentation from source of truth.

1. Identify the project's source-of-truth files — wherever scripts/tasks and environment configuration are defined (`package.json`, `Makefile`, `Rakefile`, `Cargo.toml`, `.env.example`, etc.)
2. From those files, generate a scripts/tasks reference table and document environment variables with their purpose and format
3. Update `docs/CONTRIB.md` — development workflow, available scripts/tasks, environment setup, testing procedures
4. Update `docs/RUNBOOK.md` — deployment procedures, monitoring, common issues and fixes, rollback steps
5. Flag docs not modified in 90+ days for manual review
6. Report what changed

Don't invent content — derive everything from the actual project files.