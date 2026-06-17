> This file extends [common/patterns.md](../common/patterns.md) with TypeScript-specific content.

## Repository pattern

Type the interface explicitly so implementations are interchangeable:

```typescript
interface UserRepository {
  findById(id: string): Promise<User | null>;
  findAll(filters?: UserFilters): Promise<User[]>;
  create(data: CreateUserInput): Promise<User>;
  update(id: string, data: UpdateUserInput): Promise<User>;
  delete(id: string): Promise<void>;
}

class PostgresUserRepository implements UserRepository {
  // ...
}

class InMemoryUserRepository implements UserRepository {
  // Use in tests
}
```

## API response envelope

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  meta?: PaginationMeta;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}

// Helper to keep response construction consistent
function ok<T>(data: T, meta?: PaginationMeta): ApiResponse<T> {
  return { success: true, data, error: null, meta };
}

function fail<T>(error: string): ApiResponse<T> {
  return { success: false, data: null, error };
}
```

## Result type for explicit error handling

Instead of throwing for expected failure cases, return a typed result:

```typescript
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return { ok: false, error: 'division by zero' };
  return { ok: true, value: a / b };
}

const result = divide(10, 0);
if (!result.ok) {
  console.error(result.error);
} else {
  console.log(result.value);
}
```

## Discriminated unions over inheritance

Model state variants as discriminated unions rather than class hierarchies:

```typescript
type LoadState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };
```

TypeScript's exhaustiveness checking catches unhandled cases in switch statements.

## Const assertions for fixed data

Use `as const` for configuration objects and lookup tables to get precise literal types:

```typescript
const ROLES = ['admin', 'editor', 'viewer'] as const;
type Role = (typeof ROLES)[number]; // 'admin' | 'editor' | 'viewer'
```