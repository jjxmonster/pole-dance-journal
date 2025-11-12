<!-- 1204ac88-23ab-4065-b131-c81c4061e7e3 a040027d-aa5f-4aa7-9535-26d1a430614b -->
# Catalog Trial Version

## Changes Overview

Transform the catalog page to support both authenticated users (full access) and non-authenticated users (trial with 5 moves).

## 1. Data Access Layer

**File**: [`src/data-access/moves.ts`](src/data-access/moves.ts)

Add new function `listPublishedMovesTrialVersion()`:

- Fetch 5 oldest published moves ordered by `createdAt` ASC
- Apply same filters as regular list (isNotNull publishedAt, isNull deletedAt)
- Return same structure as `listPublishedMoves` but hardcoded limit of 5

## 2. oRPC Schema

**File**: [`src/orpc/schema.ts`](src/orpc/schema.ts)

Add new schema for trial version:

- `MovesListTrialOutputSchema` - reuse `MovesListOutputSchema` structure (moves array + total count)

## 3. oRPC Router

**File**: [`src/orpc/router/moves.ts`](src/orpc/router/moves.ts)

Add new procedure `listMovesTrialVersion`:

- NO input required
- Use `MovesListTrialOutputSchema` for output
- NO `authMiddleware` (publicly accessible)
- Call `listPublishedMovesTrialVersion()` from data access

**File**: [`src/orpc/router/index.ts`](src/orpc/router/index.ts)

Export new procedure in moves router:

- Add `listTrialVersion: listMovesTrialVersion` to moves object

## 4. Auth Prompt Component

**File**: `src/components/catalog/catalog-auth-prompt.tsx` (new)

Create call-to-action card component:

- Display message: "Want to explore all moves? Create a free account"
- Include sign-up and sign-in button links
- Use Card component from shadcn/ui for styling
- Prominent, friendly design to encourage registration

## 5. Catalog Route

**File**: [`src/routes/catalog.tsx`](src/routes/catalog.tsx)

Major updates:

### beforeLoad changes:

- Remove redirect for non-authenticated users
- Check session and pass `isAuthenticated` flag to component context
- Keep search params validation

### Component logic:

- Check auth status early in component
- Branch rendering logic:
- **Non-authenticated users**: Use trial query (no filters, no params)
- **Authenticated users**: Use existing full catalog logic

### UI changes for non-authenticated:

- Hide `SearchBar` component
- Hide `LevelFilterBadges` component  
- Hide `CatalogFiltersSummary` component
- Hide `CatalogPagination` component
- Show `CatalogAuthPrompt` component after move cards grid
- Keep `CatalogHeader`, `CatalogResultsSummary`, `CatalogError`, and loading states

## Implementation Details

- Trial version shows exactly 5 moves (oldest by creation date)
- Search params are ignored for non-authenticated users
- All filtering UI is hidden for trial users
- Catalog header with wheel button remains visible (may need auth check on wheel button)
- Error and loading states work the same for both user types

### To-dos

- [ ] Create listPublishedMovesForTrial in data access layer
- [ ] Add MovesListTrialInputSchema and MovesListTrialOutputSchema
- [ ] Create listMovesPublic procedure in moves router
- [ ] Create CatalogTrialMessage component
- [ ] Update catalog route to check auth and call appropriate procedure