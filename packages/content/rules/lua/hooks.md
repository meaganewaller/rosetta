> This file extends [common/hooks.md](../common/hooks.md) with Lua-specific content.

## PostToolUse hooks

Run these automatically after Lua file writes:

**Lint with luacheck:**

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write|Edit",
      "command": "luacheck ${file}"
    }]
  }
}
```

**Format with StyLua:**

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write|Edit",
      "command": "stylua ${file}"
    }]
  }
}
```

Combine both:

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write|Edit",
      "command": "luacheck ${file} && stylua ${file}"
    }]
  }
}
```

## Stop hook

Run the test suite at session end:

```json
{
  "hooks": {
    "Stop": [{
      "command": "busted"
    }]
  }
}
```

## Tooling setup

```bash
# luacheck — linter
luarocks install luacheck

# StyLua — formatter (Rust-based, install via cargo or GitHub releases)
cargo install stylua
# or: https://github.com/JohnnyMorganz/StyLua/releases

# busted — test runner
luarocks install busted
```

Minimum `.luacheckrc`:

```lua
-- .luacheckrc
globals = {}          -- add project globals here
std = "lua54"         -- or lua51, lua52, lua53 as appropriate
max_line_length = 120
unused_args = false   -- often too noisy for callback-heavy code
```

Minimum `stylua.toml`:

```toml
column_width = 120
indent_type = "Spaces"
indent_width = 2
```