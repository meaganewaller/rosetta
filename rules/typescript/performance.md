> This file extends [common/performance.md](../common/performance.md) with TypeScript-specific content.

## Type-level performance

Complex conditional types and deep generic recursion can slow the TypeScript compiler noticeably on large codebases. Prefer simpler type constructions where possible. If `tsc` becomes slow:

```bash
# Profile type checking hotspots
npx tsc --noEmit --extendedDiagnostics
```

Use `ts-prune` or `knip` to find unused exports — dead code inflates bundle size and type-check time.

## Bundle size

Import specifically rather than importing entire libraries:

```typescript
// Avoid — pulls in the entire library
import _ from 'lodash';

// Prefer — tree-shakeable
import { debounce } from 'lodash-es';
```

Use `bundlesize` or `size-limit` in CI to catch regressions:

```json
{
  "size-limit": [
    { "path": "dist/index.js", "limit": "50 kB" }
  ]
}
```

## Async patterns

Avoid unintentional sequential awaits when operations are independent:

```typescript
// Sequential — slower
const user = await getUser(id);
const posts = await getPosts(id);

// Parallel — faster
const [user, posts] = await Promise.all([getUser(id), getPosts(id)]);
```

Use `Promise.allSettled` when you need all results regardless of individual failures.

## Runtime checks

`instanceof` and `typeof` are cheap. Zod's `.parse()` adds overhead proportional to schema complexity — avoid running it on the same data multiple times. Parse once at the boundary and pass typed values inward.