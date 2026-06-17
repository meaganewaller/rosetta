> This file extends [common/coding-style.md](../common/coding-style.md) with Ruby-specific content.

## Immutability patterns

Prefer returning new objects over mutating in place. Use the non-bang form of methods unless mutation is intentional and clearly scoped:

```ruby
# Mutates in place — avoid unless intentional
name.upcase!
items.map! { |i| i * 2 }

# Returns new value — prefer
upcased = name.upcase
doubled = items.map { |i| i * 2 }
```

Freeze constants to prevent accidental mutation:

```ruby
SUPPORTED_FORMATS = %w[json csv xml].freeze
DEFAULT_OPTIONS = { timeout: 30, retries: 3 }.freeze
```

## Error handling

Use specific exception classes rather than rescuing `StandardError` broadly. Define domain-specific errors for expected failure cases:

```ruby
class PaymentError < StandardError; end
class InsufficientFundsError < PaymentError; end

def charge(amount)
  raise ArgumentError, "amount must be positive" unless amount.positive?
  raise InsufficientFundsError, "balance too low" if balance < amount
  # ...
end

begin
  charge(100)
rescue InsufficientFundsError => e
  # handle expected case
rescue PaymentError => e
  # handle other payment errors
end
```

Never rescue `Exception` — it catches signals like `Interrupt` and `SystemExit`.

## Input validation

Validate arguments early and raise with clear messages:

```ruby
def process(path:, format:)
  raise ArgumentError, "path is required" if path.nil? || path.empty?
  raise ArgumentError, "unsupported format: #{format}" unless SUPPORTED_FORMATS.include?(format)
  # ...
end
```

For external input (web requests, file content, API responses), use a validation library — see security.md.

## File organization

Follow standard Ruby project layout:

```
lib/
  my_gem/
    version.rb
    client.rb
    models/
      user.rb
spec/
  my_gem/
    client_spec.rb
    models/
      user_spec.rb
```

One class or module per file. File name matches the class name in snake_case: `MyGem::UserAccount` → `lib/my_gem/user_account.rb`.

## Style

Follow the [Ruby Style Guide](https://rubystyle.guide/). Use RuboCop to enforce it automatically — see hooks.md. Key points:

- Two-space indentation
- `snake_case` for methods and variables
- `PascalCase` for classes and modules
- `SCREAMING_SNAKE_CASE` for constants
- Parentheses optional for method calls with no arguments; required when passing arguments to avoid ambiguity
- Prefer `&&`/`||` over `and`/`or` in conditionals (different precedence)