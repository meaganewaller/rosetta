> This file extends [common/patterns.md](../common/patterns.md) with Ruby-specific content.

## Repository pattern

```ruby
class UserRepository
  def find_by_id(id)
    record = User.find_by(id: id)
    return nil unless record
    map_to_domain(record)
  end

  def find_all(filters = {})
    scope = User.all
    scope = scope.where(role: filters[:role]) if filters[:role]
    scope.map { |r| map_to_domain(r) }
  end

  def create(attributes)
    record = User.create!(attributes)
    map_to_domain(record)
  end

  private

  def map_to_domain(record)
    Domain::User.new(
      id: record.id,
      email: record.email,
      role: record.role
    )
  end
end
```

Separating the persistence record from the domain object keeps business logic independent of ActiveRecord.

## API response envelope

```ruby
class ApiResponse
  attr_reader :success, :data, :error, :meta

  def self.ok(data, meta: nil)
    new(success: true, data: data, meta: meta)
  end

  def self.fail(error)
    new(success: false, error: error)
  end

  def to_h
    { success: success, data: data, error: error, meta: meta }.compact
  end

  private

  def initialize(success:, data: nil, error: nil, meta: nil)
    @success = success
    @data = data
    @error = error
    @meta = meta
  end
end

# Usage
ApiResponse.ok(users, meta: { total: 100, page: 1, limit: 20 })
ApiResponse.fail("User not found")
```

## Service objects

Extract complex business operations into service objects with a single public method:

```ruby
class ChargeUser
  def initialize(user:, amount:, payment_gateway:)
    @user = user
    @amount = amount
    @payment_gateway = payment_gateway
  end

  def call
    validate!
    result = @payment_gateway.charge(@user, @amount)
    record_transaction(result)
    ApiResponse.ok(result)
  rescue InsufficientFundsError => e
    ApiResponse.fail(e.message)
  end

  private

  def validate!
    raise ArgumentError, "amount must be positive" unless @amount.positive?
  end

  def record_transaction(result)
    Transaction.create!(user: @user, amount: @amount, reference: result.id)
  end
end

# Usage
ChargeUser.new(user: user, amount: 50, payment_gateway: gateway).call
```

## Value objects

Use value objects for domain concepts that are defined by their attributes, not identity:

```ruby
class Money
  attr_reader :amount, :currency

  def initialize(amount, currency)
    @amount = amount.freeze
    @currency = currency.upcase.freeze
    freeze
  end

  def +(other)
    raise ArgumentError, "currency mismatch" unless currency == other.currency
    Money.new(amount + other.amount, currency)
  end

  def ==(other)
    other.is_a?(Money) && amount == other.amount && currency == other.currency
  end
end
```

## Result type for explicit error handling

```ruby
class Result
  attr_reader :value, :error

  def self.ok(value) = new(value: value)
  def self.fail(error) = new(error: error)

  def success? = error.nil?
  def failure? = !success?

  private

  def initialize(value: nil, error: nil)
    @value = value
    @error = error
  end
end
```