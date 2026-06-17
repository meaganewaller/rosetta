---
description: Configure your preferred package manager (mise/npm/pnpm/yarn/bun)
disable-model-invocation: true
---

# Package Manager Setup

Configure the package manager for this project or globally.

## Usage

```bash
node "${CLAUDE_PLUGIN_ROOT:-$HOME/.claude}/scripts/setup-package-manager.ts" --detect
node "${CLAUDE_PLUGIN_ROOT:-$HOME/.claude}/scripts/setup-package-manager.ts" --global pnpm
node "${CLAUDE_PLUGIN_ROOT:-$HOME/.claude}/scripts/setup-package-manager.ts" --project bun
node "${CLAUDE_PLUGIN_ROOT:-$HOME/.claude}/scripts/setup-package-manager.ts" --list
```

## Detection priority

1. `CLAUDE_PACKAGE_MANAGER` environment variable
2. `.claude/package-manager.json` (project)
3. `package.json` — `packageManager` field
4. Lock file — `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `bun.lockb`
5. `~/.claude/package-manager.json` (global)
6. First available: **mise** → pnpm → bun → yarn → npm

## Configuration

**Global** (`~/.claude/package-manager.json`):
```json
{ "packageManager": "mise" }
```

**Project** (`.claude/package-manager.json`):
```json
{ "packageManager": "pnpm" }
```

**package.json**:
```json
{ "packageManager": "pnpm@8.6.0" }
```

**Environment variable** (overrides all):
```bash
export CLAUDE_PACKAGE_MANAGER=mise   # macOS/Linux
$env:CLAUDE_PACKAGE_MANAGER = "mise" # Windows PowerShell
```

## mise

[mise](https://mise.jdx.dev) is the preferred package manager — it handles both runtime version management and task running, replacing a combination of nvm/fnm + package managers. If mise is available and no other preference is set, it will be used by default.