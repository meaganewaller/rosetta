> This file extends [common/coding-style.md](../common/coding-style.md) with TypeScript-specific content.

## Immutability patterns

Use spread and array methods rather than in-place mutation:

```typescript
// Objects
const updated = { ...original, field: newValue };

// Arrays
const appended = [...items, newItem];
const filtered = items.filter(item => item.id !== targetId);
const mapped = items.map(item => item.id === targetId ? { ...item, field: value } : item);
```

## Type safety

Avoid `any` — it silently disables type checking. Prefer `unknown` for values whose type is genuinely not known at compile time, then narrow with type guards:

```typescript
function process(value: unknown): string {
  if (typeof value === 'string') return value.toUpperCase();
  throw new Error(`Expected string, got ${typeof value}`);
}
```

Use strict mode. Ensure `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true
  }
}
```

## Error handling

Use typed errors rather than throwing plain strings. Catch blocks receive `unknown` in strict mode — narrow before accessing properties:

```typescript
try {
  await doSomething();
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  log(`Failed: ${message}`);
}
```

## Input validation

Use a schema validation library (Zod, Valibot, or equivalent) at system boundaries. Parse, don't cast:

```typescript
// Parse and throw on invalid input
const params = MySchema.parse(req.body);

// Or handle gracefully
const result = MySchema.safeParse(req.body);
if (!result.success) {
  return res.status(400).json({ error: result.error.flatten() });
}
```

## Naming conventions

- Types and interfaces: `PascalCase`
- Variables, functions, methods: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE` for true module-level constants; `camelCase` is fine for const variables that aren't conceptually "constants"
- Files: `kebab-case.ts`
- Test files: `my-module.test.ts` co-located with the module they test