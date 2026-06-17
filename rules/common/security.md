# Security

## Before every commit

Run the **security** agent before committing. It handles the full check — secrets, injection, auth, input validation, and more. Don't rely on a manual checklist as a substitute.

## Secret management

Never hardcode secrets in source. Use environment variables or a secret manager. Validate that required secrets are present at startup so misconfiguration fails loudly rather than silently at runtime. If a secret may have been exposed in source or logs, rotate it immediately.

## When a security issue is found

Stop. Fix critical issues before continuing. If credentials were exposed, rotate them before anything else. After fixing, scan the rest of the codebase for the same pattern — isolated issues rarely are.