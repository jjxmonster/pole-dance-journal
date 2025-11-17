<!-- bb9df22f-99a3-4575-ade3-3af4c7ab4d3e 21bd579a-46bf-424b-8c90-89f14c28b806 -->
# Optimize Session Fetching with React Query Caching

## Problem

Currently, `beforeLoad` in `__root.tsx` calls `client.auth.getSession()` on every route navigation, causing multiple redundant server requests when navigating (e.g., from homepage to `/catalog`).

## Solution

Implement React Query caching for the session query with a 5-minute `staleTime` to ensure:

- Session is validated once on app load
- Cached session is reused during navigation for 5 minutes
- No redundant server calls within the cache window

## Changes Required

### 1. Create Session Query Options (`src/query-options/auth.ts`)

Create a new query options factory following the existing pattern in `admin.ts`:

```typescript
import { queryOptions } from "@tanstack/react-query";
import { client } from "@/orpc/client";

export function sessionQueryOptions() {
  return queryOptions({
    queryKey: ["auth", "session"],
    queryFn: () => client.auth.getSession(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
```

### 2. Update `__root.tsx` beforeLoad

Replace the direct `client.auth.getSession()` call with `queryClient.ensureQueryData()`:

```23:29:src/routes/__root.tsx
beforeLoad: async ({ context }) => {
  const session = await context.queryClient.ensureQueryData(
    sessionQueryOptions()
  );
  return { session };
},
```

This ensures React Query manages the cache, preventing duplicate fetches.

### 3. Simplify RootDocument useEffect (Optional Cleanup)

The current `useEffect` (lines 93-113) syncs session to auth store. Since `beforeLoad` now provides cached session via loader data, this logic remains valid but benefits from the upstream caching.

## Benefits

- ✅ One server call per app session (5-minute cache)
- ✅ Fast navigation without redundant fetches
- ✅ Session validated on initial load
- ✅ Existing auth store sync unchanged
- ✅ Follows TanStack Query best practices

## Performance Impact

- **Before**: 3-5+ server calls when navigating between routes
- **After**: 1 server call per 5-minute window

### To-dos

- [x] Create src/query-options/auth.ts with sessionQueryOptions() factory including 5-minute staleTime
- [x] Update src/routes/__root.tsx beforeLoad to use queryClient.ensureQueryData() with sessionQueryOptions