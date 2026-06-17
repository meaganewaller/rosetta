> This file extends [common/testing.md](../common/testing.md) with Lua-specific content.

## Test framework

Use **busted** for new projects — it's the most widely adopted Lua test framework with good async support and output formatting:

```bash
# Install via luarocks
luarocks install busted

# Run all tests
busted

# Run a specific file
busted spec/my_module_spec.lua

# Verbose output
busted --verbose

# Coverage (requires luacov)
busted --coverage
```

## File organization

Mirror the source structure under `spec/`:

```
lib/
  parser.lua
  client.lua
spec/
  parser_spec.lua
  client_spec.lua
  helpers/
    factories.lua
```

## Test structure

```lua
local parser = require("lib.parser")

describe("parser", function()
  describe("parse_date", function()
    it("parses a valid ISO date", function()
      local result = parser.parse_date("2026-01-15")
      assert.are.equal(2026, result.year)
      assert.are.equal(1, result.month)
      assert.are.equal(15, result.day)
    end)

    it("returns nil and error on invalid input", function()
      local result, err = parser.parse_date("not-a-date")
      assert.is_nil(result)
      assert.is_not_nil(err)
      assert.matches("invalid date", err)
    end)

    it("handles nil input", function()
      assert.has_error(function()
        parser.parse_date(nil)
      end, "input must be a string")
    end)
  end)
end)
```

## Setup and teardown

```lua
describe("file processor", function()
  local tmp_dir

  before_each(function()
    tmp_dir = os.tmpname()
    os.remove(tmp_dir)
    os.execute("mkdir -p " .. tmp_dir)
  end)

  after_each(function()
    os.execute("rm -rf " .. tmp_dir)
  end)

  it("processes files in directory", function()
    -- write test files into tmp_dir
    -- assert on results
  end)
end)
```

## Mocking and stubbing

Busted provides `spy`, `stub`, and `mock` utilities:

```lua
local http = require("lib.http")

describe("api client", function()
  it("retries on failure", function()
    local call_count = 0
    stub(http, "get", function()
      call_count = call_count + 1
      if call_count < 3 then
        return nil, "connection refused"
      end
      return { status = 200, body = "{}" }
    end)

    local client = require("lib.client")
    local result = client.fetch("/endpoint")

    assert.are.equal(3, call_count)
    assert.is_not_nil(result)

    http.get:revert()
  end)
end)
```

Always `revert()` stubs in `after_each` or after the test — global stubs leak across tests.

## Coverage

```bash
# Install luacov
luarocks install luacov

# Run with coverage
busted --coverage

# Generate report
luacov
cat luacov.report.out
```

Configure minimum coverage in `.luacov`:

```lua
-- .luacov
threshold = 80
```