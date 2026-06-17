> This file extends [common/security.md](../common/security.md) with Ruby-specific content.

## Input validation

Use a schema validation library at system boundaries. **Dry-validation** or **ActiveModel::Validations** for Rails:

```ruby
require "dry-validation"

class CreateOrderContract < Dry::Validation::Contract
  params do
    required(:user_id).filled(:string)
    required(:amount).filled(:integer, gt?: 0)
    required(:currency).filled(:string, included_in?: %w[USD EUR GBP])
  end
end

contract = CreateOrderContract.new
result = contract.call(params)

if result.failure?
  return ApiResponse.fail(result.errors.to_h)
end
```

## Mass assignment

Never pass `params` directly to model constructors. Use strong parameters in Rails, or an explicit permit list:

```ruby
# Unsafe — user could set any attribute including admin: true
User.create(params)

# Safe — explicit permit list
User.create(params.permit(:email, :name, :role))

# Or outside Rails — explicit hash construction
User.create(
  email: params[:email],
  name: params[:name]
)
```

## SQL injection

ActiveRecord's query methods are safe when used correctly. String interpolation bypasses parameterization:

```ruby
# Unsafe — SQL injection via string interpolation
User.where("email = '#{params[:email]}'")

# Safe — parameterized
User.where(email: params[:email])
User.where("email = ?", params[:email])
User.where("email = :email", email: params[:email])
```

Never use `find_by_sql` with interpolated user input.

## Command injection

Use arrays instead of strings when shelling out:

```ruby
# Unsafe — shell interprets metacharacters in filename
system("convert #{filename} output.png")

# Safe — arguments passed directly, no shell interpolation
system("convert", filename, "output.png")

# Also safe — explicit array form
Open3.capture2("convert", filename, "output.png")
```

Never use `eval` with external input. Avoid `send` with user-controlled method names.

## Secret management

Access secrets through `ENV` with validation at startup — never hardcode:

```ruby
# config/initializers/env_check.rb (Rails) or at process start
REQUIRED_ENV_VARS = %w[
  DATABASE_URL
  SECRET_KEY_BASE
  STRIPE_SECRET_KEY
].freeze

missing = REQUIRED_ENV_VARS.reject { |var| ENV[var].present? }
raise "Missing required environment variables: #{missing.join(', ')}" if missing.any?
```

## Dependency security

Audit gems regularly:

```bash
bundle audit check --update
```

Add to CI. Pin gem versions in `Gemfile.lock` and commit it to version control.