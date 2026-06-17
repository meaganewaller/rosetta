> This file extends [common/coding-style.md](../common/coding-style.md) with Lua-specific content.

## Immutability patterns

Lua has no built-in immutable data structures, but the principle applies: return new tables rather than mutating inputs. Use `table.move` or manual copy for shallow clones:

```lua
-- Mutates in place — avoid unless intentional
local function append_in_place(t, value)
  t[#t + 1] = value
end

-- Returns new table — prefer
local function append(t, value)
  local result = {}
  table.move(t, 1, #t, 1, result)
  result[#result + 1] = value
  return result
end

-- Shallow copy of a table
local function copy(t)
  local result = {}
  for k, v in pairs(t) do
    result[k] = v
  end
  return result
end
```

Use metatables with `__newindex` to enforce read-only tables where correctness requires it:

```lua
local function freeze(t)
  return setmetatable({}, {
    __index = t,
    __newindex = function(_, k)
      error("attempt to modify frozen table key: " .. tostring(k), 2)
    end,
  })
end

local DEFAULTS = freeze({ timeout = 30, retries = 3 })
```

## Error handling

Lua uses `pcall`/`xpcall` for protected calls rather than exceptions. Always handle errors explicitly:

```lua
-- Unprotected — error propagates up and may crash the program
local result = might_fail()

-- Protected — capture error without crashing
local ok, result = pcall(might_fail)
if not ok then
  -- result is the error message
  log("failed: " .. tostring(result))
  return nil, result
end

-- With additional context
local ok, result = xpcall(might_fail, function(err)
  return debug.traceback(err, 2)
end)
```

For functions that can fail, return `nil, error_message` as the idiomatic error pattern:

```lua
local function read_file(path)
  local f, err = io.open(path, "r")
  if not f then
    return nil, "could not open file: " .. err
  end
  local content = f:read("*a")
  f:close()
  return content
end

local content, err = read_file("config.json")
if not content then
  error(err, 2)
end
```

## Input validation

Validate arguments at function entry. Use `assert` for programming errors (wrong type, nil where value expected); use explicit error returns for expected failure cases:

```lua
local function process(path, options)
  assert(type(path) == "string", "path must be a string, got " .. type(path))
  assert(path ~= "", "path must not be empty")
  options = options or {}
  -- ...
end
```

## File organization

Lua modules are tables returned from files:

```lua
-- lib/my_module.lua
local M = {}

function M.do_thing(x)
  -- ...
end

return M
```

One module per file. Keep files focused — Lua has no enforced module system, so discipline matters more. Use a consistent require path rooted at the project root:

```lua
local utils  = require("lib.utils")
local config = require("config")
```

## Naming conventions

- Variables and functions: `snake_case`
- Module-level "constants": `SCREAMING_SNAKE_CASE`
- Private module members: prefix with `_` or keep them local (preferred)
- Classes/types (metatables): `PascalCase`
- Files: `snake_case.lua`

Prefer `local` for everything that doesn't need to be exported. Global variables are shared across the entire runtime and cause hard-to-debug bugs.