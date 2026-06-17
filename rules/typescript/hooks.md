> This file extends [common/hooks.md](../common/hooks.md) with TypeScript-specific content.

## PostToolUse hooks

Run these automatically after file writes:

**Format** — keep code consistently formatted without manual intervention:

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write|Edit",
      "command": "npx prettier --write ${file}"
    }]
  }
}
```

**Lint** — catch issues immediately after editing:

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write|Edit",
      "command": "npx eslint --fix ${file}"
    }]
  }
}
```

**Type check** — verify types across the project after changes:

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write|Edit",
      "command": "npx tsc --noEmit"
    }]
  }
}
```

## Stop hook

Run a final build verification at session end:

```json
{
  "hooks": {
    "Stop": [{
      "command": "npm run build"
    }]
  }
}
```

## Tooling setup

Ensure these are present in the project before relying on hooks:

```bash
npm install --save-dev prettier eslint typescript
```

Minimum `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "moduleResolution": "bundler",
    "target": "ES2022"
  }
}
```