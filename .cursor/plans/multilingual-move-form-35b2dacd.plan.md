<!-- 35b2dacd-6c19-4cdf-a45b-0630fcf59a78 2d073318-22c3-441f-946a-fa562a8bfa40 -->
# Multilingual Move Form Implementation

## Database Schema Updates

Update `src/db/schema.ts`:

- Remove `description` field from `moves` table
- Remove `title` and `description` fields from `steps` table
- Update `moveTranslations` table to only have `description` field (remove `name` and `level` since they won't be translated per user confirmation)
- Keep `stepTranslations` as is (has `title` and `description` per language)

## oRPC Schema Updates

Update `src/orpc/schema.ts`:

**AdminCreateMoveInputSchema**: Replace single `description` with:

- `descriptionEn` (string, min 10, max 1000 chars)
- `descriptionPl` (string, min 10, max 1000 chars)

Update steps array schema to include translations:

- `titleEn` (string, min 3, max 350 chars)
- `titlePl` (string, min 3, max 350 chars)
- `descriptionEn` (string, min 10, max 350 chars)
- `descriptionPl` (string, min 10, max 350 chars)

Also update `AdminEditMoveInputSchema` with the same translation fields.

## Form Component Updates

Update `src/components/admin/moves/move-form.tsx`:

Add translation input fields:

- Replace single description textarea with two labeled textareas: "Description (English)" and "Description (Polish)"
- Each step should have four inputs instead of two:
  - Title (English) / Title (Polish)
  - Description (English) / Description (Polish)

Update character count displays for each translation field separately.

## Form Hook Updates

Update `src/hooks/use-move-form.ts`:

Update `MoveFormViewModel` type:

```typescript
type MoveFormViewModel = {
  name: string;
  descriptionEn: string;
  descriptionPl: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "";
  steps: StepViewModel[];
};

type StepViewModel = {
  id: string;
  titleEn: string;
  titlePl: string;
  descriptionEn: string;
  descriptionPl: string;
};
```

Update all handlers to manage translation fields.

## Backend Procedure Updates

Update `src/orpc/router/admin.ts`:

**createMoveProcedure**: Update to:

1. Accept new translation fields from input
2. Call updated `createMove` with translations
3. Ensure both translations are created in the database

**editMoveProcedure**: Similar updates for editing moves with translations.

## Data Access Layer Updates

Update `src/data-access/moves.ts`:

**createMove function**: Update signature to accept:

```typescript
{
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  slug: string;
  descriptionEn: string;
  descriptionPl: string;
  steps: Array<{
    titleEn: string;
    titlePl: string;
    descriptionEn: string;
    descriptionPl: string;
  }>;
}
```

Use transaction to:

1. Insert move (without description)
2. Insert moveTranslations records for both "en" and "pl"
3. Insert steps records (without title/description)
4. Insert stepTranslations records for both languages

**updateMove function**: Apply similar changes for editing.

**getMoveByIdForAdmin function**: Update to fetch translations for admin editing.

Also update `listPublishedMoves` and `listAdminMoves` to handle searching across translations properly.

## Database Migration

Create new migration in `supabase/migrations/`:

- `ALTER TABLE moves DROP COLUMN description;`
- `ALTER TABLE steps DROP COLUMN title, DROP COLUMN description;`
- `ALTER TABLE move_translations DROP COLUMN name, DROP COLUMN level;`

Ensure existing data is migrated to the new translation structure before dropping columns.

### To-dos

- [ ] Update database schema to remove translated fields from main tables and adjust translation tables
- [ ] Update oRPC input/output schemas to support English and Polish translation fields
- [ ] Update useMoveForm hook to manage translation fields for descriptions and steps
- [ ] Update move-form.tsx UI to display English and Polish input fields for translated content
- [ ] Update data-access/moves.ts functions to handle translations in database operations
- [ ] Update createMoveProcedure and editMoveProcedure to work with new translation structure
- [ ] Create database migration to alter tables and migrate existing data