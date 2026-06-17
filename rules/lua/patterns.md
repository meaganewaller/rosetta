> This file extends [common/patterns.md](../common/patterns.md) with Lua-specific content.

## Module pattern

The standard Lua module is a table of functions:

```lua
-- lib/queue.lua
local M = {}

function M.new()
  return { _items = {}, _size = 0 }
end

function M.push(q, value)
  q._size = q._size + 1
  q._items[q._size] = value
end

function M.pop(q)
  if q._size == 0 then return nil end
  local value = q._items[1]
  table.remove(q._items, 1)
  q._size = q._size - 1
  return value
end

function M.size(q) return q._size end

return M
```

## Class pattern (metatables)

For objects with shared behavior, use metatables:

```lua
local User = {}
User.__index = User

function User.new(attrs)
  assert(type(attrs.email) == "string", "email is required")
  return setmetatable({
    id    = attrs.id or require("lib.uuid").v4(),
    email = attrs.email,
    role  = attrs.role or "user",
  }, User)
end

function User:display_name()
  return self.email:match("^([^@]+)")
end

function User:is_admin()
  return self.role == "admin"
end

return User
```

## Repository pattern

```lua
local UserRepository = {}
UserRepository.__index = UserRepository

function UserRepository.new(db)
  return setmetatable({ _db = db }, UserRepository)
end

function UserRepository:find_by_id(id)
  local row = self._db:query_one("SELECT * FROM users WHERE id = ?", id)
  if not row then return nil end
  return self:_to_domain(row)
end

function UserRepository:find_all(filters)
  filters = filters or {}
  local rows = self._db:query("SELECT * FROM users")
  local result = {}
  for _, row in ipairs(rows) do
    result[#result + 1] = self:_to_domain(row)
  end
  return result
end

function UserRepository:_to_domain(row)
  return User.new({ id = row.id, email = row.email, role = row.role })
end

return UserRepository
```

## Result pattern

Return `value, nil` on success and `nil, error` on failure — consistent with Lua's standard library:

```lua
local function divide(a, b)
  if b == 0 then
    return nil, "division by zero"
  end
  return a / b, nil
end

local result, err = divide(10, 0)
if err then
  -- handle error
end
```

For complex pipelines, a result table avoids ambiguity:

```lua
local function ok(value)
  return { success = true, value = value }
end

local function fail(err)
  return { success = false, error = err }
end

local result = process(input)
if not result.success then
  log("failed: " .. result.error)
end
```

## API response envelope

```lua
local Response = {}

function Response.ok(data, meta)
  return { success = true, data = data, error = nil, meta = meta }
end

function Response.fail(err)
  return { success = false, data = nil, error = err }
end

return Response
```

## Event/callback pattern

For decoupled communication between modules:

```lua
local EventEmitter = {}
EventEmitter.__index = EventEmitter

function EventEmitter.new()
  return setmetatable({ _handlers = {} }, EventEmitter)
end

function EventEmitter:on(event, handler)
  self._handlers[event] = self._handlers[event] or {}
  self._handlers[event][#self._handlers[event] + 1] = handler
end

function EventEmitter:emit(event, ...)
  for _, handler in ipairs(self._handlers[event] or {}) do
    handler(...)
  end
end

return EventEmitter
```