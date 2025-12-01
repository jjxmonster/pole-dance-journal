<!-- 4d20a05f-1d6c-4f2f-8569-8fd49095f51f e66d8bcf-094c-4485-aee3-f35e67a720f1 -->
# Combo Detail View Redesign

## Summary

Redesign the combo detail page to display moves in a vertical timeline layout with step indicators, move images, names, and descriptions connected by arrow connectors. Remove breadcrumbs as requested.

## Key Changes

### 1. Update Data Access Layer

**File:** [src/data-access/combos.ts](src/data-access/combos.ts)

Modify `getComboBySlug` to include move translations (descriptions) by:

- Adding a `language` parameter
- Including `translations` relation in the move query
- Returning `description` for each move

### 2. Update oRPC Schema

**File:** [src/orpc/schema.ts](src/orpc/schema.ts)

- Add `description` field to the combo detail move schema (`ComboDetailSchema`)
- Add optional `language` parameter to `ComboGetBySlugInputSchema`

### 3. Update oRPC Router

**File:** [src/orpc/router/combos.ts](src/orpc/router/combos.ts)

- Pass language parameter to `getComboBySlug` function
- Use paraglide's `languageTag()` to get current language

### 4. Redesign Combo Detail Component

**File:** [src/routes/combos.$slug.tsx](src/routes/combos.$slug.tsx)

Replace the current grid layout with a vertical timeline design:

- Remove breadcrumbs
- Keep the italic combo title at the top
- Display moves as vertical cards with:
- Step label (e.g., "Krok 1" / "Step 1")
- Move image on the left
- Move name (bold)
- Move description
- Add arrow connectors between moves using Lucide's `ArrowDown` icon
- Keep favorite toggle button
- Maintain loading and error states

### 5. Add i18n Message

**Files:** [messages/en.json](messages/en.json), [messages/pl.json](messages/pl.json)

Add translation for step label: `combos_step_label` ("Step {number}" / "Krok {number}")

### To-dos

- [ ] Update getComboBySlug to include move descriptions with language support
- [ ] Add description field and language param to combo detail schemas
- [ ] Pass language parameter in combos router
- [ ] Add combos_step_label translation to en.json and pl.json
- [ ] Redesign combo detail view with vertical timeline layout