> This file extends [common/performance.md](../common/performance.md) with Ruby-specific content.

## N+1 queries

The most common Rails performance issue. Use `includes` or `preload` to eager-load associations:

```ruby
# N+1 — one query per user
users = User.all
users.each { |u| puts u.posts.count }

# Eager loaded — two queries total
users = User.includes(:posts).all
users.each { |u| puts u.posts.size }  # .size uses loaded association
```

Use the **bullet** gem in development to detect N+1s automatically:

```ruby
# Gemfile
gem "bullet", group: :development
```

## Avoid loading what you don't need

Select only the columns you need, especially in large tables:

```ruby
# Loads all columns
User.where(active: true)

# Loads only what's needed
User.where(active: true).select(:id, :email)

# For read-only queries, skip ActiveRecord instantiation
User.where(active: true).pluck(:id, :email)
```

## Batch processing

Never load all records into memory at once. Use `find_each` or `find_in_batches`:

```ruby
# Dangerous — loads all users into memory
User.all.each { |u| send_email(u) }

# Safe — processes in batches of 1000
User.find_each(batch_size: 1000) { |u| send_email(u) }

# For bulk operations
User.find_in_batches(batch_size: 500) do |batch|
  bulk_send_emails(batch)
end
```

## Caching

Cache expensive computations with `Rails.cache` or memoization:

```ruby
# Memoize within a request
def current_user_permissions
  @current_user_permissions ||= compute_permissions(current_user)
end

# Cache across requests
def user_stats(user_id)
  Rails.cache.fetch("user_stats/#{user_id}", expires_in: 1.hour) do
    compute_expensive_stats(user_id)
  end
end
```

Invalidate cache entries when the underlying data changes — stale cache is worse than no cache.

## String allocation

Freeze string literals to reduce allocations in hot paths. Enable globally with the magic comment:

```ruby
# frozen_string_literal: true
```

Add this to every file or enforce it with RuboCop's `Style/FrozenStringLiteralComment` cop. Frozen strings can't be modified in place — any mutation creates a new object, which is consistent with the immutability principle.

## Profiling

Before optimizing, measure:

```bash
# Identify slow tests
bundle exec rspec --profile 10

# Profile memory allocations
gem install memory_profiler
```

Use `rack-mini-profiler` in development Rails apps to see query counts and timing per request.