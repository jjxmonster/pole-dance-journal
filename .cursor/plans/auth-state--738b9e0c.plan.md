<!-- 738b9e0c-31b4-4459-b0e6-bc566346a028 4d78c1cd-2edf-4f4f-b106-643475eeec36 -->
# Implement Client-Side Auth State Management with TanStack Store

## Architecture Overview

Create a TanStack Store-based auth store that:

- Maintains reactive auth session state (userId, email, isAdmin, expiresAt)
- Persists state to localStorage automatically
- Syncs with server on app initialization via `getSession` oRPC call
- Provides derived state for common checks (isAuthenticated, isExpired)
- Integrates with existing auth mutations (login, logout, register)

## Files to Create/Modify

### 1. Create `src/lib/auth-store.ts`

- Define `AuthState` interface matching `AuthSessionOutputSchema`
- Create TanStack Store with initial state
- Add localStorage persistence with `subscribe()` hook
- Create derived state: `isAuthenticated` (userId !== null), `isExpired` (expiresAt check)
- Export store and derived states

### 2. Modify `src/routes/__root.tsx`

- Import `getSession` mutation from oRPC client
- On app load (in a `useEffect` or server function), call `getSession` to sync store with server
- Update store state with fetched session data
- Add `AuthStoreDevtools` plugin to the devtools array

### 3. Create `src/hooks/use-auth.ts`

- Export custom hook to access auth store state and mutations
- Provide convenient access pattern for components
- Return destructured auth state + mutation helpers

### 4. Update auth form components

- Modify `sign-in-form.tsx`, `sign-up-form.tsx`, `forgot-password-form.tsx`, `reset-password-form.tsx`
- After successful mutations, update the auth store
- Use `useAuth()` hook to access current auth state

## Implementation Strategy

**Store Structure:**

```typescript
{
  userId: string | null,
  email: string | null,
  isAdmin: boolean,
  expiresAt: number | null,
}
```

**Derived States:**

- `isAuthenticated`: `userId !== null`
- `isExpired`: `expiresAt !== null && expiresAt < Date.now()`

**Persistence:**

- On any state change, serialize to `localStorage.setItem('auth-state', JSON.stringify(state))`
- On app load, hydrate from `localStorage.getItem('auth-state')`
- Fallback to server sync via `getSession` if localStorage is empty

**Server Sync:**

- Call `getSession` on app initialization (in root layout)
- Update store with fresh server state
- Handles session refresh and validation

## Key Integration Points

- oRPC client queries: `getSession()` for initial sync
- Auth mutations: Update store after successful login/register/logout
- Root layout: Initialize sync on app load
- Components: Access via `useAuth()` hook for type-safe state

## Todos

- create-auth-store: Create TanStack Store with persistence and derived state
- create-devtools: Create auth store devtools for debugging
- sync-on-load: Add session sync to root layout on app initialization
- create-hook: Create useAuth hook for component access
- update-forms: Update auth form components to update store after mutations

### To-dos

- [ ] Create src/lib/auth-store.ts with TanStack Store, localStorage persistence, and derived states
- [ ] Create src/lib/auth-store-devtools.tsx following demo-store-devtools pattern
- [ ] Modify src/routes/__root.tsx to sync session on app load via getSession oRPC call
- [ ] Create src/hooks/use-auth.ts hook for convenient auth state access in components
- [ ] Update auth form components to dispatch store updates after successful mutations