> This file extends [common/hooks.md](../common/hooks.md) with Bash-specific content.

## PostToolUse hooks

Run these automatically after shell script writes:

**Lint with shellcheck** — catches undefined variables, quoting bugs, and common mistakes:

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write|Edit",
      "command": "shellcheck --severity=warning ${file}"
    }]
  }
}
```

**Format with shfmt** — enforces consistent indentation and style:

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write|Edit",
      "command": "shfmt -w -i 2 ${file}"
    }]
  }
}
```

Combine both in one hook if the project uses a lint script:

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write|Edit",
      "command": "shellcheck --severity=warning ${file} && shfmt -w -i 2 ${file}"
    }]
  }
}
```

## Stop hook

Run tests at session end if the project has a Bats suite:

```json
{
  "hooks": {
    "Stop": [{
      "command": "bats test/"
    }]
  }
}
```

## Tooling setup

```bash
# macOS
brew install shellcheck shfmt bats-core

# Linux (Debian/Ubuntu)
apt-get install shellcheck
go install mvdan.cc/sh/v3/cmd/shfmt@latest
npm install --save-dev bats
```

Apply hooks only to `.sh` files if the project contains mixed file types — use a matcher that checks the file extension.