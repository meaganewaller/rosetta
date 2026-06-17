> This file extends [common/security.md](../common/security.md) with Lua-specific content.

## Sandbox untrusted code

Never execute untrusted Lua with `load`, `loadfile`, `dofile`, or `loadstring` without a restricted environment. These give full access to the Lua runtime and the OS by default:

```lua
-- Unsafe — untrusted code can call os.execute, io.open, etc.
local fn = load(user_provided_code)
fn()

-- Safer — restricted environment with no access to dangerous libraries
local function sandbox(code)
  local env = {
    -- only expose safe functions
    math = math,
    string = string,
    table = table,
    ipairs = ipairs,
    pairs = pairs,
    tostring = tostring,
    tonumber = tonumber,
    type = type,
    error = error,
    assert = assert,
  }
  env._ENV = env

  local fn, err = load(code, "sandbox", "t", env)
  if not fn then return nil, err end
  return pcall(fn)
end
```

Even a restricted sandbox is difficult to make truly safe. If you need user-provided logic, prefer a data-driven configuration format (JSON, TOML) over arbitrary Lua execution.

## Command injection

Never build shell commands with string concatenation using external input:

```lua
-- Unsafe — user_input could contain ; rm -rf / or similar
os.execute("process " .. user_input)

-- Safe — validate and sanitize before any shell use
local function is_safe_filename(name)
  return name:match("^[%w%-_.]+$") ~= nil
end

if not is_safe_filename(filename) then
  return nil, "invalid filename"
end
os.execute("process " .. filename)
```

Prefer libraries that accept arguments directly over shell string construction wherever possible.

## Input validation

Validate type and range of all external input before use:

```lua
local function validate_config(cfg)
  assert(type(cfg) == "table", "config must be a table")
  assert(type(cfg.timeout) == "number" and cfg.timeout > 0,
    "timeout must be a positive number")
  assert(type(cfg.host) == "string" and cfg.host ~= "",
    "host must be a non-empty string")
end
```

## Global variable hygiene

Accidental globals are a common Lua bug — a typo in a local variable name silently creates or reads a global. Enable strict mode in development with a metatable on `_G`:

```lua
-- At the top of your entry point (development only)
if os.getenv("LUA_ENV") == "development" then
  setmetatable(_G, {
    __newindex = function(_, k, v)
      error("attempt to create global variable: " .. k, 2)
    end,
    __index = function(_, k)
      error("attempt to read undefined global: " .. k, 2)
    end,
  })
end
```

Luacheck also catches undeclared globals statically — configure it to treat them as errors.

## Secret management

Never hardcode secrets. Read from environment variables and validate at startup:

```lua
local function require_env(name)
  local value = os.getenv(name)
  if not value or value == "" then
    error("missing required environment variable: " .. name, 2)
  end
  return value
end

local API_KEY   = require_env("API_KEY")
local DB_URL    = require_env("DATABASE_URL")
```

Don't log secrets. When logging tables that may contain credentials, filter sensitive keys:

```lua
local SENSITIVE_KEYS = { password = true, token = true, api_key = true, secret = true }

local function safe_log(t)
  local out = {}
  for k, v in pairs(t) do
    out[k] = SENSITIVE_KEYS[k] and "[REDACTED]" or v
  end
  return out
end
```