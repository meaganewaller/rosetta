> This file extends [common/security.md](../common/security.md) with TypeScript-specific content.

## Schema validation at boundaries

Use Zod (or equivalent) to validate all external input. Never cast with `as` at a trust boundary — parse and let the schema throw on invalid data:

```typescript
import { z } from 'zod';

const CreateOrderSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.enum(['USD', 'EUR', 'GBP']),
});

// In your handler:
const body = CreateOrderSchema.parse(req.body); // throws ZodError on invalid input
```

## Environment variable validation

Validate all required environment variables at startup, not lazily at the call site:

```typescript
import { z } from 'zod';

const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  API_SECRET: z.string().min(32),
  NODE_ENV: z.enum(['development', 'test', 'production']),
});

export const env = EnvSchema.parse(process.env);
```

Import `env` from this module throughout the app — never access `process.env` directly.

## Avoiding prototype pollution

Don't merge untrusted objects directly onto existing objects. When merging user-provided data, use schema-parsed output rather than raw input:

```typescript
// Unsafe: user could include __proto__ or constructor keys
Object.assign(target, req.body);

// Safe: schema strips unknown keys and validates types
const updates = UpdateSchema.parse(req.body);
Object.assign(target, updates);
```

## Type-safe SQL

Use a query builder or ORM that supports parameterized queries by default (Kysely, Drizzle, Prisma). If writing raw SQL, always use parameterized form — never string interpolation:

```typescript
// Unsafe
const result = await db.query(`SELECT * FROM users WHERE id = '${userId}'`);

// Safe
const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
```

## Secrets in TypeScript

Access secrets only through the validated `env` module (see above). If a secret appears in a log, error message, or serialized object, it's a leak. Mark sensitive fields explicitly:

```typescript
interface UserSession {
  userId: string;
  email: string;
  /** @sensitive - never log or serialize */
  sessionToken: string;
}
```