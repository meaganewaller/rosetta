> This file extends [common/hooks.md](../common/hooks.md) with Ruby-specific content.

## PostToolUse hooks

Run these automatically after Ruby file writes:

**Lint and auto-correct with RuboCop:**

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write|Edit",
      "command": "bundle exec rubocop --autocorrect ${file}"
    }]
  }
}
```

**Type-check with Sorbet (if the project uses it):**

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write|Edit",
      "command": "bundle exec srb tc"
    }]
  }
}
```

Combine both if the project uses Sorbet:

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write|Edit",
      "command": "bundle exec rubocop --autocorrect ${file} && bundle exec srb tc"
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
      "command": "bundle exec rspec"
    }]
  }
}
```

## Tooling setup

```bash
# Gemfile (development/test group)
gem "rubocop", require: false
gem "rubocop-performance", require: false
gem "rubocop-rspec", require: false      # if using RSpec
gem "rubocop-rails", require: false      # if using Rails
```

Minimum `.rubocop.yml`:

```yaml
require:
  - rubocop-performance

AllCops:
  NewCops: enable
  TargetRubyVersion: 3.2

Style/FrozenStringLiteralComment:
  Enabled: true
```