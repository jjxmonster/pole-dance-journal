<!-- db8a4afb-f522-47cd-99e7-088e24533a3b 7582424c-83cd-41b8-a19b-c6700f39c74f -->
# Add Translated Description Field to Combos

## 1. Database Schema

Add `comboTranslations` table to [`src/db/schema.ts`](src/db/schema.ts) following the `moveTranslations` pattern:

```typescript
export const comboTranslations = pgTable(
  "combo_translations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    comboId: uuid("combo_id").notNull().references(() => combos.id, { onDelete: "cascade" }),
    language: languageEnum("language").notNull(),
    description: text("description").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    comboLanguageUnique: unique("combo_language_unique").on(table.comboId, table.language),
    descriptionLengthCheck: check(
      "combo_trans_description_length_check",
      sql`char_length(${table.description}) between 10 and 1000`
    ),
  })
);
```

Add relations for `comboTranslations` and update `combosRelations` to include `translations: many(comboTranslations)`.

## 2. Constants

Add to [`src/utils/constants.ts`](src/utils/constants.ts):

```typescript
export const COMBO_DESCRIPTION_MIN_LENGTH = 10;
export const COMBO_DESCRIPTION_MAX_LENGTH = 1000;
```

## 3. oRPC Schema Updates

Update [`src/orpc/schema.ts`](src/orpc/schema.ts):

- Add `descriptionEn` and `descriptionPl` to `AdminCreateComboInputSchema` and `AdminUpdateComboInputSchema`
- Add `description` to `ComboDetailSchema` (for public view)
- Add `descriptionEn` and `descriptionPl` to `AdminGetComboOutputSchema`

## 4. Data Access Layer

Update [`src/data-access/combos.ts`](src/data-access/combos.ts):

- `createCombo`: Insert translations after combo creation
- `updateCombo`: Delete and re-insert translations
- `getComboBySlug`: Include translations with language fallback
- `getComboByIdForAdmin`: Return both language descriptions

## 5. Admin Form Updates

Update [`src/components/admin/combos/combo-form.tsx`](src/components/admin/combos/combo-form.tsx) and [`src/components/admin/combos/edit-combo-form.tsx`](src/components/admin/combos/edit-combo-form.tsx):

- Add `descriptionEn` and `descriptionPl` textarea fields
- Add validation for description length constraints
- Update form state and submission logic

## 6. Public Combo Detail Display

Update [`src/routes/combos/$slug.tsx`](src/routes/combos/$slug.tsx):

- Display combo description below the title/level badge section

## 7. Generate Migration

Run `pnpm drizzle-kit generate` to create the migration file.

### To-dos

- [ ] Add comboTranslations table and relations to schema.ts
- [ ] Add COMBO_DESCRIPTION_MIN/MAX_LENGTH constants
- [ ] Update oRPC schemas for description fields
- [ ] Update combos.ts data access for translations
- [ ] Add description fields to admin combo forms
- [ ] Display combo description on public detail page
- [ ] Generate database migration