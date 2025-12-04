<!-- 201269da-7387-48f4-9872-f5b0133eb96a d430eb50-eeed-42de-8be5-67937e6766ea -->
# Combo Sets Feature Implementation

## 1. Database Schema Updates

Add new tables to [`src/db/schema.ts`](src/db/schema.ts):

- **`combos`** - Main combo entity with `id`, `name`, `level`, `slug`, `publishedAt`, `deletedAt`, `createdAt`, `updatedAt`
- **`comboMoves`** - Junction table linking combos to moves with `comboId`, `moveId`, `orderIndex` (1-8), unique constraint on combo+order
- **`userComboFavorites`** - User favorites with `userId`, `comboId`, `createdAt`, primary key on (userId, comboId)

Relations: combo has many comboMoves, comboMove references move, userComboFavorites references combo.

## 2. oRPC Schema Definitions

Add to [`src/orpc/schema.ts`](src/orpc/schema.ts):

- `CombosListInputSchema` - pagination, level filter, moveId filter (search by included move)
- `ComboListItemSchema` - id, name, level, slug, moves (array of move thumbnails), isFavorite
- `CombosListOutputSchema` - combos array + total count
- `ComboFavoriteToggleInputSchema` / `OutputSchema`
- Admin schemas for CRUD operations

## 3. Data Access Layer

Create [`src/data-access/combos.ts`](src/data-access/combos.ts):

- `listPublishedCombos(input)` - paginated list with level/move filters, includes move images
- `toggleComboFavorite(userId, comboId)` - add/remove favorite
- `getUserComboFavorites(userId)` - get user's favorite combo IDs
- Admin functions: `createCombo`, `updateCombo`, `deleteCombo`, `publishCombo`

## 4. oRPC Router Procedures

Create [`src/orpc/router/combos.ts`](src/orpc/router/combos.ts):

- `list` - public list with auth middleware for favorites
- `toggleFavorite` - authenticated users only
- `getBySlug` - single combo detail

Add admin procedures to [`src/orpc/router/admin.ts`](src/orpc/router/admin.ts) and register in [`src/orpc/router/index.ts`](src/orpc/router/index.ts).

## 5. Frontend Components

Create [`src/components/combos/`](src/components/combos/):

- `combo-card.tsx` - Card showing combo name, level badge, move thumbnails (circular), favorite heart button, "Zobacz szczegoly" link
- `combo-filters.tsx` - Level dropdown + move search (combobox to select a move)
- `combos-pagination.tsx` - Reuse pattern from catalog (8 items per page)
- `combos-header.tsx`, `combos-empty-state.tsx`, `combos-skeleton.tsx`

## 6. Combos Page Route

Create [`src/routes/combos.tsx`](src/routes/combos.tsx):

- URL search params: `level`, `moveId`, `page`
- Query with `orpc.combos.list`
- Grid layout matching screenshot (4 columns on desktop)
- Pagination with max 8 combos per page

## 7. Navigation Update

Update [`src/components/nav.tsx`](src/components/nav.tsx):

- Add "Zestawy Combo" link between "Figury" and "Moj Dziennik"
- Add i18n messages for nav item

## 8. Constants and i18n

- Add `COMBOS_PAGE_SIZE = 8` to [`src/utils/constants.ts`](src/utils/constants.ts)
- Add combo-related validation constants (name length, move count 3-8)
- Add Polish/English translations for all combo UI text

### To-dos

- [ ] Add combos, comboMoves, userComboFavorites tables with relations to schema.ts
- [ ] Add Zod schemas for combo list, favorite toggle, and admin CRUD in schema.ts
- [ ] Create combos.ts data access with list, favorite toggle, and admin functions
- [ ] Create combos.ts router and add admin procedures, register in index.ts
- [ ] Create combo-card, combo-filters, and supporting components
- [ ] Create combos.tsx route with filtering, pagination, and favorites
- [ ] Add Zestawy Combo navigation link to nav.tsx
- [ ] Add Polish and English translations for combo UI