> This file extends [common/testing.md](../common/testing.md) with TypeScript-specific content.

## Test framework

Use **Vitest** for new projects — it's faster, native ESM, and shares Vite config. Use **Jest** if the project already has it. Don't mix both.

```bash
# Run tests
npx vitest run

# Watch mode
npx vitest

# Coverage
npx vitest run --coverage
```

## File organization

Co-locate test files with the module they test:

```
src/
  services/
    budget.ts
    budget.test.ts
  components/
    PricingTable.tsx
    PricingTable.test.tsx
```

E2E tests live in a top-level `e2e/` directory and use **Playwright**.

## Unit test structure

```typescript
import { describe, it, expect, vi } from 'vitest';
import { calculateTotal } from './pricing';

describe('calculateTotal', () => {
  it('applies discount to subtotal', () => {
    expect(calculateTotal(100, 0.1)).toBe(90);
  });

  it('returns subtotal when discount is zero', () => {
    expect(calculateTotal(100, 0)).toBe(100);
  });

  it('throws on negative subtotal', () => {
    expect(() => calculateTotal(-1, 0)).toThrow('subtotal must be non-negative');
  });
});
```

## Mocking

Mock at the module boundary, not deep inside implementations. Use `vi.mock` (Vitest) or `jest.mock` (Jest):

```typescript
vi.mock('../lib/stripe', () => ({
  createCheckoutSession: vi.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/test' }),
}));
```

Prefer dependency injection for classes and functions that need to be tested with different collaborators — it's more explicit than module mocking.

## Type-safe test utilities

Use typed factory functions instead of ad-hoc object literals in tests:

```typescript
function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'test-id',
    email: 'test@example.com',
    role: 'user',
    ...overrides,
  };
}
```

## Integration tests

For API routes, test the full handler with a real (or in-memory) database rather than mocking the data layer. The point of an integration test is to catch wiring errors — mocking the database defeats that.

## Coverage

```bash
npx vitest run --coverage
```

Thresholds in `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    coverage: {
      thresholds: { lines: 80, branches: 80, functions: 80 },
    },
  },
});
```