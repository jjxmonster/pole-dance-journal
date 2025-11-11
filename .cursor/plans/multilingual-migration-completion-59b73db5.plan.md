<!-- 59b73db5-5688-4636-be69-c6e200134d25 5ea48869-1053-42a2-909b-35a84332e619 -->
# Complete Multilingual Schema Migration

## Context

The schema has been updated to remove `description` from `moves` table and `title`/`description` from `steps` table. These fields now exist only in `moveTranslations` and `stepTranslations` tables. The data-access layer needs to be updated to reflect this change.

## Changes Required

### 1. Remove Unused Function

**File: `src/data-access/moves.ts`**

Remove the `getMoveBySlug` function (lines 206-234) as it's not used anywhere in the codebase. Only `getMoveBySlugWithTranslations` is used by the router.

### 2. Update `listPublishedMoves` Function (lines 24-66)

Remove references to `moves.description`:

- Line 35: Remove `ilike(moves.description, searchPattern)` from search conditions (keep only name search)
- Line 50: Remove `description: moves.description` from the select clause

The function should only search and return: `id`, `name`, `level`, `slug`, `imageUrl`

### 3. Update `listAdminMoves` Function (lines 322-405)

Remove references to `moves.description`:

- Line 349: Remove `ilike(moves.description, searchPattern)` from search conditions (keep only name search)

Admin list only needs to show move names and metadata, not descriptions.

### 4. Update `createMove` Function (lines 436-522)

Remove line 463 that sets `description: data.descriptionPl` in the moves insert. The description is already correctly inserted into `moveTranslations` table (lines 470-485).

Similarly, remove lines 491-492 that set `title` and `description` in steps insert, as these are already correctly inserted into `stepTranslations` table (lines 499-518).

### 5. Update `updateMove` Function (lines 570-667)

Remove line 597 that sets `description: data.descriptionPl` in the moves update. The description is already correctly updated in `moveTranslations` table (lines 604-628).

Remove lines 636-637 that set `title` and `description` in steps insert, as these are already correctly inserted into `stepTranslations` table (lines 644-663).

## Key Implementation Notes

- `getMoveBySlugWithTranslations` already correctly uses translations with language fallback
- `getMoveByIdForAdmin` already correctly returns both EN and PL translations
- Create/update functions already write to translation tables correctly
- Search will be simplified to only search in move names (which remain in the moves table)
- No schema changes needed - schema is already correct
- No oRPC router changes needed - they already use the correct functions

### To-dos

- [x] Remove unused getMoveBySlug function from moves.ts
- [x] Update listPublishedMoves to remove description field references
- [x] Update listAdminMoves to remove description from search
- [x] Remove obsolete description/title/description assignments in createMove
- [x] Remove obsolete description/title/description assignments in updateMove
- [x] Update oRPC schema to remove description from MoveListItemSchema
- [x] Update seed.ts to use translation tables instead of direct column inserts
- [x] Delete obsolete migrate-to-translations.ts service
- [x] Run build to verify no TypeScript errors remain - ✅ All migration-related errors resolved