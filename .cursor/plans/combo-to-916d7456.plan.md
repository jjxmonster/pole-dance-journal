<!-- 916d7456-1d77-403e-875c-9262856a3b9f f8c41ba9-348f-43a5-8b5e-36de7a81bd0f -->
# Rename "Combo" Feature to "Transition"

## Database Migration

Create a new Drizzle migration to rename:

- Table: `move_combo_references` -> `move_transition_references`
- Constraints: `combo_order_index_check` -> `transition_order_index_check`, `combo_move_order_unique` -> `transition_move_order_unique`, `combo_no_self_reference` -> `transition_no_self_reference`, `combo_no_duplicate_reference` -> `transition_no_duplicate_reference`

## Schema Changes

Update [src/db/schema.ts](src/db/schema.ts):

- Rename `moveComboReferences` table to `moveTransitionReferences`
- Rename `moveComboReferencesRelations` to `moveTransitionReferencesRelations`
- Update all constraint names from "combo" to "transition"

Update [src/db/index.ts](src/db/index.ts):

- Update imports and schema registration

## oRPC Schema Changes

Update [src/orpc/schema.ts](src/orpc/schema.ts):

- Rename `ComboMoveReferenceSchema` -> `TransitionMoveReferenceSchema`
- Rename `comboReferences` field -> `transitionReferences` in `MoveDetailSchema`, `AdminEditMoveInputSchema`, `AdminGetMoveOutputSchema`
- Rename `MAX_COMBO_REFERENCES_COUNT` import -> `MAX_TRANSITION_REFERENCES_COUNT`

## Router Changes

Update [src/orpc/router/admin.ts](src/orpc/router/admin.ts):

- Rename all `comboReferences` variables to `transitionReferences`
- Update error messages from "combo reference" to "transition reference"

## Data Access Changes

Update [src/data-access/moves.ts](src/data-access/moves.ts):

- Rename all `comboReferences` variables and fields to `transitionReferences`
- Update import from `moveComboReferences` to `moveTransitionReferences`

## Constants Changes

Update [src/utils/constants.ts](src/utils/constants.ts):

- Rename `MAX_COMBO_REFERENCES_COUNT` -> `MAX_TRANSITION_REFERENCES_COUNT`
- Rename `COMBO_NOTIFICATION_COOKIE_NAME` -> `TRANSITION_NOTIFICATION_COOKIE_NAME`

## Cookie Utils Changes

Update [src/utils/cookie-utils.ts](src/utils/cookie-utils.ts):

- Rename functions: `hasSeenComboNotification` -> `hasSeenTransitionNotification`, `markComboNotificationAsSeen` -> `markTransitionNotificationAsSeen`
- Update constant import

## Hook Changes

Update [src/hooks/use-edit-move-form.ts](src/hooks/use-edit-move-form.ts):

- Rename `comboReferences` field -> `transitionReferences`
- Rename `handleComboReferencesChange` -> `handleTransitionReferencesChange`

## Component Changes

Rename and update [src/components/moves/combo-moves-section.tsx](src/components/moves/combo-moves-section.tsx):

- Rename file to `transition-moves-section.tsx`
- Rename component `ComboMovesSection` -> `TransitionMovesSection`
- Rename `ComboMoveCard` -> `TransitionMoveCard`
- Rename type `ComboMovesSectionProps` -> `TransitionMovesSectionProps`
- Update `data-testid` from `combo-moves-section` to `transition-moves-section`

Rename and update [src/components/admin/moves/combo-references-selector.tsx](src/components/admin/moves/combo-references-selector.tsx):

- Rename file to `transition-references-selector.tsx`
- Rename component `ComboReferencesSelector` -> `TransitionReferencesSelector`
- Rename type `ComboReferencesSelectorProps` -> `TransitionReferencesSelectorProps`
- Update label text from "Combo References" to "Transition References"

Update [src/components/admin/moves/edit-move-form.tsx](src/components/admin/moves/edit-move-form.tsx):

- Update import and usage of `TransitionReferencesSelector`
- Rename handler `handleComboReferencesChangeWithTracking` -> `handleTransitionReferencesChangeWithTracking`

## Route Changes

Update [src/routes/moves.$slug.tsx](src/routes/moves.$slug.tsx):

- Update imports for renamed components and functions
- Rename `hasSeenComboNotification` -> `hasSeenTransitionNotification`
- Rename `markComboNotificationAsSeen` -> `markTransitionNotificationAsSeen`
- Update `move.comboReferences` -> `move.transitionReferences`

## i18n Message Keys

Update [messages/en.json](messages/en.json) and [messages/pl.json](messages/pl.json):

- Rename keys: `combo_moves_section_title` -> `transition_moves_section_title`
- Rename keys: `combo_moves_section_description` -> `transition_moves_section_description`
- Rename keys: `combo_moves_new_feature_toast` -> `transition_moves_new_feature_toast`
- Rename keys: `combo_move_card_view_button` -> `transition_move_card_view_button`

### To-dos

- [x] Create Drizzle migration to rename database table and constraints
- [x] Update src/db/schema.ts with renamed table and relations
- [x] Update src/db/index.ts imports
- [x] Update src/orpc/schema.ts types and schemas
- [x] Update src/orpc/router/admin.ts references
- [x] Update src/data-access/moves.ts references
- [x] Update src/utils/constants.ts constant names
- [x] Update src/utils/cookie-utils.ts function names
- [x] Update src/hooks/use-edit-move-form.ts references
- [x] Rename combo-moves-section.tsx to transition-moves-section.tsx
- [x] Rename combo-references-selector.tsx to transition-references-selector.tsx
- [x] Update src/components/admin/moves/edit-move-form.tsx imports
- [x] Update src/routes/moves.$slug.tsx imports and references
- [x] Update messages/en.json and messages/pl.json keys