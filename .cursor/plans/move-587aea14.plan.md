<!-- 587aea14-0eaf-4930-8d75-238195803609 c2165cde-2264-40ad-8679-1cc2ad079238 -->
# Move Details Layout Update

## What we'll change

- Reorganize `src/routes/moves.$slug.tsx` to:
  - Place `MoveImage` in the right column (desktop), above the status section.
  - Keep title and badge in the header on the left.
  - Show description and steps in the left content column.
  - Render `StatusButtons` under the image in the right column (only when authenticated).
  - Move `NoteEditor` below the grid to span full width (only when authenticated).

## Key edits (essential snippet)

```startLine:endLine:src/routes/moves.$slug.tsx
// inside <div className="grid grid-cols-1 gap-8 md:grid-cols-3"> ...
<div className="space-y-4 md:col-span-2">
  <MoveDescription description={move.description} />
  <StepsList steps={move.steps} />
</div>

<div className="space-y-6 md:col-span-1">
  <MoveImage alt={`${move.name} figura pole dance`} imageUrl={move.imageUrl} />
  {isAuthenticated && (
    <StatusButtons disabled={isStatusLoading} onChange={updateStatus} value={status} />
  )}
</div>
```
```startLine:endLine:src/routes/moves.$slug.tsx
// below the grid, render notes (only if authenticated)
{isAuthenticated && <NoteEditor moveId={move.id} />}
```

- Remove the top-level `MoveImage` render before the header.
- Keep SEO `head` and loader logic unchanged.
- Preserve all test IDs.

## Styling notes

- Use existing spacing utilities (`space-y-*`, `gap-*`) and responsive classes.
- No new components or dependencies; optional to wrap `MoveImage` in a `Card` later if desired.

### To-dos

- [ ] Move image to right column and remove top image
- [ ] Keep header left; render description and steps in left column
- [ ] Place StatusButtons under image; auth-gated
- [ ] Move NoteEditor below grid; auth-gated
- [ ] Ensure test IDs untouched and layout responsive