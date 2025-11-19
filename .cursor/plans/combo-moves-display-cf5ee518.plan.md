<!-- cf5ee518-19ac-4d9c-b03c-af811ef08ca7 024c480c-ffa3-451f-b63f-c3b2222c66a4 -->
# Add Combo Referenced Moves Display Feature

## Overview

Implement functionality to display combo referenced moves on move detail pages with mobile carousel (using shadcn carousel), desktop grid layout, and a one-time toast notification.

## Implementation Steps

### 1. Install Shadcn Carousel Component

Install the carousel component from shadcn/ui library since it's not currently installed.

### 2. Update Backend Schema & Data Access Layer

**File: `src/orpc/schema.ts`**

- Add `ComboMoveReferenceSchema` with fields: `id`, `name`, `slug`, `level`, `imageUrl`
- Update `MoveDetailSchema` to include `comboReferences: z.array(ComboMoveReferenceSchema)`

**File: `src/data-access/moves.ts`**

- Modify `getMoveBySlugWithTranslations()` function to fetch combo references
- Use relational query with `comboReferences` relation to fetch referenced move details
- Include: `referencedMove` data with `id`, `name`, `slug`, `level`, `imageUrl`
- Order by `orderIndex` (already sorted in admin query, ensure consistency)

**File: `src/orpc/router/moves.ts`**

- Update `getBySlug` handler output to include combo references (schema already updated)

### 3. Add Internationalization Messages

**File: `messages/en.json` and `messages/pl.json`**
Add the following message keys:

- `combo_moves_section_title` - "Combo Moves" / "Kombinacje Figur"
- `combo_moves_section_description` - "These moves work great in combination" / "Te figury świetnie się łączą"
- `combo_moves_new_feature_toast` - "New! Scroll down to see the combos!" / "Nowość! Przewiń w dół, aby zobaczyć kombinacje!"
- `combo_move_card_view_button` - "View Move" / "Zobacz Figurę"

### 4. Create Combo Moves Display Component

**New File: `src/components/moves/combo-moves-section.tsx`**

Component structure:

- Accept props: `comboMoves: Array<ComboMoveReference>`, `moveId: string`
- Mobile (< 768px): Use shadcn Carousel with embla-carousel
- Single card per slide
- Dots pagination below
- Swipe gestures enabled
- Desktop (>= 768px): Static grid layout (grid-cols-3)
- All cards visible at once
- No carousel functionality

**Card Design (applies to both mobile/desktop):**

- Display move image (or placeholder if null)
- Move name
- Level badge with appropriate color from `LEVEL_COLORS`
- Link to move detail page using slug
- Hover effect on desktop
- Tap feedback on mobile

### 5. Create Cookie Management Utility

**New File: `src/utils/cookie-utils.ts`**

- Export `hasSeenComboNotification()` - reads cookie on client side
- Export `markComboNotificationAsSeen()` - sets cookie on client side
- Cookie name: `COMBO_NOTIFICATION_SEEN`
- Cookie value: `"true"`
- Cookie expiry: 1 year
- Use `document.cookie` API

### 6. Update Move Detail Page

**File: `src/routes/moves.$slug.tsx`**

Changes:

- Import `ComboMovesSection` component
- Import toast from sonner
- Import cookie utilities
- Add `useEffect` hook that runs once on mount:
- Check if `move.comboReferences` exists and has length > 0
- Check if cookie `COMBO_NOTIFICATION_SEEN` is not set
- If both conditions true: show toast with message, then set cookie
- Toast should be informative variant (blue/info)
- Auto-dismiss after 5 seconds

Layout Changes:

- Add `ComboMovesSection` after `NoteEditor` component
- Only render if `move.comboReferences.length > 0`
- Conditional rendering: `{isAuthenticated && move.comboReferences.length > 0 && <ComboMovesSection ... />}`

### 7. Update Type Definitions

**File: `src/types/move.ts` (or create if doesn't exist)**

- Export `ComboMoveReference` type inferred from schema
- Ensure all move-related types are properly exported

## Technical Details

### Cookie Implementation

- Client-side only (not SSR)
- Set in browser after toast is shown
- Persistent across sessions (1 year expiry)
- Global flag (not per-move)

### Carousel Implementation (Mobile)

- Use `embla-carousel-react` (shadcn carousel dependency)
- Single item per view
- Enable loop navigation
- Show dot indicators
- Swipe/drag enabled

### Grid Implementation (Desktop)

- Responsive breakpoint: `md:grid-cols-3`
- Gap between cards: `gap-6`
- No carousel controls visible

### Badge Colors

Reuse existing `LEVEL_COLORS` constant from `src/utils/constants.ts`:

- Beginner: Green variant
- Intermediate: Orange variant  
- Advanced: Red variant

## Files to Create

1. `src/components/moves/combo-moves-section.tsx`
2. `src/utils/cookie-utils.ts`

## Files to Modify

1. `src/orpc/schema.ts`
2. `src/data-access/moves.ts`
3. `src/routes/moves.$slug.tsx`
4. `messages/en.json`
5. `messages/pl.json`

## Testing Considerations

- Test with moves that have 0, 1, 2, and 3 combo references
- Test toast appears only once per user
- Test carousel swipe on mobile devices
- Test grid layout on desktop
- Test navigation to referenced moves
- Test with missing move images (null imageUrl)

### To-dos

- [ ] Install shadcn carousel component
- [ ] Add ComboMoveReferenceSchema and update MoveDetailSchema
- [ ] Modify getMoveBySlugWithTranslations to fetch combo references
- [ ] Add internationalization messages for combo moves feature
- [ ] Create cookie management utility functions
- [ ] Create ComboMovesSection component with carousel and grid
- [ ] Update move detail page with toast and ComboMovesSection
- [ ] Test all scenarios and responsive behavior