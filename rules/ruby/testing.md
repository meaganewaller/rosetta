> This file extends [common/testing.md](../common/testing.md) with Ruby-specific content.

## Test framework

Use **RSpec** for new projects. Use **Minitest** if the project already has it. Don't mix both.

```bash
# Run all tests
bundle exec rspec

# Run a specific file
bundle exec rspec spec/models/user_spec.rb

# Run a specific example
bundle exec rspec spec/models/user_spec.rb:42

# Coverage
bundle exec rspec --format documentation
```

## File organization

Mirror the `lib/` structure under `spec/`:

```
lib/
  my_app/
    user.rb
    payment_service.rb
spec/
  my_app/
    user_spec.rb
    payment_service_spec.rb
  support/
    factories.rb
    shared_examples.rb
```

## RSpec structure

```ruby
RSpec.describe PaymentService do
  subject(:service) { described_class.new(user: user) }

  let(:user) { User.new(id: "user-1", balance: 100) }

  describe "#charge" do
    context "when balance is sufficient" do
      it "returns a successful result" do
        result = service.charge(50)
        expect(result).to be_success
        expect(result.amount).to eq(50)
      end
    end

    context "when balance is insufficient" do
      it "raises InsufficientFundsError" do
        expect { service.charge(200) }.to raise_error(InsufficientFundsError)
      end
    end
  end
end
```

Use `described_class` instead of the class name directly — it stays correct if the class is renamed.

## Test doubles

Use RSpec doubles for collaborators, not real implementations:

```ruby
let(:mailer) { instance_double(UserMailer, send_confirmation: true) }

before { allow(mailer).to receive(:send_confirmation) }

it "sends a confirmation email" do
  service.create_user(email: "user@example.com", mailer: mailer)
  expect(mailer).to have_received(:send_confirmation).once
end
```

`instance_double` verifies the doubled class has the methods being stubbed — it fails if the interface drifts.

## Factories

Use **FactoryBot** for test data rather than constructing objects manually:

```ruby
# spec/support/factories.rb
FactoryBot.define do
  factory :user do
    id { SecureRandom.uuid }
    email { "user@example.com" }
    balance { 100 }

    trait :admin do
      role { "admin" }
    end
  end
end

# In specs
let(:user) { build(:user) }               # in-memory, no DB
let(:admin) { create(:admin_user) }       # persisted
let(:user) { build(:user, balance: 0) }   # override traits
```

## Rails-specific

For Rails projects, use `rails_helper` not `spec_helper`, and prefer request specs over controller specs for API testing:

```ruby
RSpec.describe "POST /api/payments", type: :request do
  it "creates a payment" do
    post "/api/payments", params: { amount: 50 }, headers: auth_headers

    expect(response).to have_http_status(:created)
    expect(json_body[:status]).to eq("pending")
  end
end
```

## Coverage

Use SimpleCov:

```ruby
# spec/spec_helper.rb
require "simplecov"
SimpleCov.start do
  minimum_coverage 80
  add_filter "/spec/"
end
```