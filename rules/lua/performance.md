> This file extends [common/performance.md](../common/performance.md) with Lua-specific content.

## Local variable access is faster than global

Every global lookup traverses `_G`. Cache globals and module fields in locals at the top of hot functions or modules:

```lua
-- Slow in a tight loop — global lookup each iteration
for i = 1, 1e6 do
  math.sin(i)
end

-- Fast — local reference resolved once
local sin = math.sin
for i = 1, 1e6 do
  sin(i)
end
```

This matters most inside loops. At the top level of a module, the difference is negligible.

## Table pre-allocation

When you know the final size of a table, pre-allocate with `table.create` (LuaJIT / Lua 5.4+) to avoid repeated rehashing:

```lua
-- Rehashes multiple times as it grows
local result = {}
for i = 1, 10000 do
  result[i] = process(i)
end

-- Pre-allocated — no rehashing
local result = table.create(10000)  -- LuaJIT / some Lua 5.4 builds
for i = 1, 10000 do
  result[i] = process(i)
end
```

For plain Lua 5.4 without `table.create`, pre-set the last index to trigger a single allocation:

```lua
local result = {}
result[10000] = false  -- hint the allocator
for i = 1, 10000 do
  result[i] = process(i)
end
result[10000] = process(10000)
```

## String concatenation in loops

Lua strings are immutable — `..` allocates a new string each time. In loops, collect parts and join once with `table.concat`:

```lua
-- Slow — O(n²) allocations
local result = ""
for _, part in ipairs(parts) do
  result = result .. part
end

-- Fast — one allocation
local result = table.concat(parts)

-- With separator
local result = table.concat(parts, ", ")
```

## Avoid table creation in hot paths

Table allocation and GC pressure are the most common Lua performance problems. In tight loops, reuse tables rather than allocating new ones:

```lua
-- Allocates a new table per call — expensive in a hot loop
local function get_bounds(items)
  return { min = find_min(items), max = find_max(items) }
end

-- Reuse a scratch table
local _bounds = {}
local function get_bounds(items)
  _bounds.min = find_min(items)
  _bounds.max = find_max(items)
  return _bounds  -- caller must not hold a reference across calls
end
```

Only apply this when profiling confirms it's a bottleneck — it trades clarity for performance.

## LuaJIT

If the runtime is LuaJIT, numeric-heavy code in the JIT's "hot path" compiles to native code automatically. Help the JIT by:

- Keeping hot functions small and avoiding `pcall` inside tight loops (it inhibits tracing)
- Using FFI for calls to C libraries instead of the C API
- Preferring arrays (integer-keyed tables) over hash tables for sequential data

Profile before optimizing:

```lua
-- Simple wall-clock profiler
local t0 = os.clock()
expensive_function()
print(string.format("elapsed: %.3f ms", (os.clock() - t0) * 1000))
```

For detailed profiling, use **luajit -jp** (LuaJIT's built-in profiler) or **lua-profiler**.