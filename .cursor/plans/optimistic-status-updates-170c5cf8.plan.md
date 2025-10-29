<!-- 170c5cf8-2140-4814-8fcf-b5618832a44f 2d040164-e5f9-42c7-8adf-b782d24d9728 -->
# Implement Optimistic Status Updates

## Changes Required

### 1. Update `useMoveStatus` Hook

**File:** `src/hooks/use-move-status.ts`

Add `useOptimistic` to manage optimistic state:

- Import `useOptimistic` from React
- Wrap the current status in `useOptimistic` to create `optimisticStatus` and `setOptimisticStatus`
- Update the mutation to call `setOptimisticStatus` immediately when status changes
- Return `optimisticStatus` instead of the actual `status` from the query
- On mutation error, the optimistic state will automatically revert to the actual status

Key changes:

```typescript
const [optimisticStatus, setOptimisticStatus] = useOptimistic(
  data?.status || null
);

const updateStatus = (status: MoveStatus) => {
  if (!isAuthenticated) {
    toast.error("Musisz być zalogowany, aby zaktualizować status");
    return;
  }
  
  setOptimisticStatus(status); // Immediate UI update
  mutate(status); // Async server call
};

return {
  status: optimisticStatus, // Return optimistic value
  // ... rest
};
```

### 2. Update `StatusButtons` Component

**File:** `src/components/moves/status-buttons.tsx`

No changes needed - the component will automatically receive and display the optimistic status value from the hook.

## Benefits

- Instant visual feedback when users click status buttons
- Automatic rollback on error (built into `useOptimistic`)
- Clean separation of concerns (hook manages state, component stays simple)
- Better UX with perceived performance improvement

### To-dos

- [ ] Add useOptimistic to useMoveStatus hook for optimistic status updates
- [ ] Test that status buttons show immediate feedback and handle errors correctly