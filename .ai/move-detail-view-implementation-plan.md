# View Implementation Plan: Move Detail

## 1. Overview

The Move Detail view displays comprehensive information about a single pole dance move, including its name, difficulty level, description, ordered steps, and AI-generated image. For authenticated users, it provides functionality to set/update their personal status (Want, Almost, Done) and maintain private notes with autosave. The view is server-side rendered for SEO, publicly accessible for published moves, and handles special cases for unpublished and soft-deleted moves.

## 2. View Routing

- **Path**: `/moves/$slug`
- **Route file**: `src/routes/moves.$slug.tsx`
- **Access**: Public (SSR, indexable for published moves)
- **Special handling**:
  - Unpublished moves: 404 for non-admins
  - Soft-deleted moves: 410 Gone with noindex meta tag

## 3. Component Structure

```
MoveDetailPage (Route Component)
├── Breadcrumbs
├── MoveHeader
│   ├── h1 (Move name)
│   ├── Badge (Difficulty level)
│   └── StatusDropdown (authenticated only)
├── MoveImage
├── MoveDescription
├── StepsList
│   └── StepCard[] (multiple)
└── NoteEditor (authenticated only)
    ├── Textarea
    ├── CharacterCounter
    └── SaveIndicator
```

## 4. Component Details

### MoveDetailPage

- **Description**: Main route component that orchestrates data fetching, layout, and authentication state
- **Main elements**: Main container with max-width constraint, responsive grid layout for mobile/desktop
- **Handled interactions**: Initial data loading, authentication check, SSR/client hydration
- **Handled validation**:
  - Verify move is published (publishedAt NOT NULL)
  - Check if move is soft-deleted (deletedAt IS NULL)
  - Return 404 for unpublished moves (non-admins)
  - Return 410 Gone for soft-deleted moves
- **Types**: `MoveDetailResponse`, `UserMoveStatusResponse | null`, `User | null`
- **Props**: None (route component receives params via TanStack Router)

### Breadcrumbs

- **Description**: Navigation breadcrumb trail showing path from catalog to current move
- **Main elements**: `<nav>` with `aria-label="Breadcrumb"`, ordered list with linked items
- **Handled interactions**: Click navigation to catalog
- **Handled validation**: None
- **Types**: `{ moveName: string }`
- **Props**: `{ moveName: string }`

### MoveHeader

- **Description**: Hero section displaying move name, difficulty badge, and status control
- **Main elements**: `<header>` with `<h1>` for name, Badge component for level, StatusDropdown for authenticated users
- **Handled interactions**: Status change via dropdown
- **Handled validation**: Render StatusDropdown only if user is authenticated
- **Types**: `{ name: string; level: MoveLevel; status: MoveStatus | null; isAuthenticated: boolean }`
- **Props**: `{ name: string; level: MoveLevel; status: MoveStatus | null; isAuthenticated: boolean; onStatusChange: (status: MoveStatus) => void }`

### MoveImage

- **Description**: Responsive image display with skeleton loader for AI-generated move image
- **Main elements**: `<figure>` with `<img>` element, Skeleton component for loading state
- **Handled interactions**: Image load event
- **Handled validation**: Check if imageUrl exists and is valid
- **Types**: `{ imageUrl: string | null; alt: string }`
- **Props**: `{ imageUrl: string | null; alt: string }`

### MoveDescription

- **Description**: Formatted text block displaying the move's full description
- **Main elements**: `<section>` with `<p>` or formatted text block
- **Handled interactions**: None
- **Handled validation**: None
- **Types**: `{ description: string }`
- **Props**: `{ description: string }`

### StepsList

- **Description**: Container for ordered list of move steps
- **Main elements**: `<section>` with `<h2>` heading "Steps", ordered list of StepCard components
- **Handled interactions**: None
- **Handled validation**: Verify steps array has at least 2 items, sort by orderIndex
- **Types**: `{ steps: Step[] }`
- **Props**: `{ steps: Step[] }`

### StepCard

- **Description**: Individual step card showing step number, title, and description
- **Main elements**: `<li>` with step number badge, `<h3>` for title, `<p>` for description
- **Handled interactions**: None
- **Handled validation**: None
- **Types**: `{ step: Step }`
- **Props**: `{ orderIndex: number; title: string; description: string }`

### StatusDropdown

- **Description**: Select control for setting user's move status with Polish labels
- **Main elements**: Shadcn Select component with three options, trigger button showing current status
- **Handled interactions**: Click to open, select option to change status
- **Handled validation**:
  - User must be authenticated
  - Only valid status values (WANT, ALMOST, DONE)
- **Types**: `{ value: MoveStatus | null; onChange: (status: MoveStatus) => void }`
- **Props**: `{ value: MoveStatus | null; onChange: (status: MoveStatus) => void; disabled?: boolean }`

### NoteEditor

- **Description**: Expandable textarea for private notes with autosave, character counter, and save indicator
- **Main elements**: Shadcn Textarea, character counter `<div>`, SaveIndicator component, `<div>` with aria-live for screen readers
- **Handled interactions**:
  - Focus to expand
  - Input to update content
  - Blur to collapse (if empty)
  - Autosave every 2 seconds when dirty
- **Handled validation**:
  - Max 2000 characters (client-side enforcement)
  - Trim whitespace before save
  - Disable input when at character limit
- **Types**: `{ moveId: string; initialNote: string | null; onSave: (note: string) => Promise<void> }`
- **Props**: `{ moveId: string; initialNote: string | null }`

### CharacterCounter

- **Description**: Visual indicator showing current character count out of 2000
- **Main elements**: `<span>` with aria-live="polite" for accessibility
- **Handled interactions**: None (display only)
- **Handled validation**: Show warning styling when approaching limit (>1900 chars)
- **Types**: `{ count: number; max: number }`
- **Props**: `{ count: number; max: number }`

### SaveIndicator

- **Description**: Status indicator showing current autosave state
- **Main elements**: `<span>` with icon and text, aria-live region for screen reader announcements
- **Handled interactions**: None (display only)
- **Handled validation**: None
- **Types**: `{ status: SaveStatus }`
- **Props**: `{ status: 'idle' | 'saving' | 'saved' | 'error' }`

## 5. Types

```typescript
// API Response DTOs
type MoveDetailResponse = {
	id: string;
	name: string;
	description: string;
	level: "Beginner" | "Intermediate" | "Advanced";
	slug: string;
	imageUrl: string | null;
	steps: Array<{
		orderIndex: number;
		title: string;
		description: string;
	}>;
};

type UserMoveStatusResponse = {
	status: "WANT" | "ALMOST" | "DONE";
	note: string | null;
	updatedAt: string;
};

// View Models
type MoveLevel = "Beginner" | "Intermediate" | "Advanced";

type MoveStatus = "WANT" | "ALMOST" | "DONE";

type StatusOption = {
	value: MoveStatus;
	label: string; // Polish: 'Chcę zrobić' | 'Prawie' | 'Zrobione'
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

type Step = {
	orderIndex: number;
	title: string;
	description: string;
};

type LocalStorageNoteBackup = {
	note: string;
	timestamp: number;
	moveId: string;
};
```

## 6. State Management

State management is handled through a combination of TanStack Query for server state and custom hooks for local UI state.

**Server State (TanStack Query):**

- Move data: Fetched via SSR and cached with `orpc.moves.getBySlug.queryOptions()`
- User move status: Fetched client-side with `orpc.userMoveStatuses.get.queryOptions()` (authenticated only)
- Mutations for status updates and note saves

**Custom Hooks:**

**`useMoveStatus(moveId: string)`**

- Manages user's status for the move
- Returns: `{ status, updateStatus, isLoading, isError }`
- Uses TanStack Query mutation with optimistic updates
- Shows toast notification on success/error

**`useNoteAutosave(moveId: string, initialNote: string | null)`**

- Handles note editing with autosave logic
- Returns: `{ note, setNote, saveStatus, characterCount, isDirty }`
- Logic:
  - Debounce input changes (2 seconds)
  - Trigger save mutation when dirty
  - Retry failed saves 3 times with exponential backoff (1s, 2s, 4s)
  - On persistent failure, save to localStorage and show error
  - On mount, check localStorage for newer backup and prompt restoration

**`useLocalStorageNoteBackup(moveId: string)`**

- Manages localStorage backup for notes
- Returns: `{ hasBackup, getBackup, saveBackup, clearBackup, isNewerThanServer }`
- Key format: `pole-journal:note-backup:${moveId}`

## 7. API Integration

**Primary Endpoint: `moves.getBySlug`**

- Request type: `{ slug: string }`
- Response type: `MoveDetailResponse`
- Integration: Use in TanStack Router loader for SSR
- Error handling: Throw 404 redirect if NOT_FOUND

**User Status Endpoint: `userMoveStatuses.get`**

- Request type: `{ moveId: string }`
- Response type: `UserMoveStatusResponse | null`
- Integration: Client-side query after authentication check
- Error handling: Return null if not found (user hasn't set status yet)

**Status Update Endpoint: `userMoveStatuses.upsert`**

- Request type: `{ moveId: string; status: MoveStatus }`
- Response type: `UserMoveStatusResponse`
- Integration: Mutation with optimistic updates via `useMoveStatus` hook
- Error handling: Revert optimistic update, show error toast

**Note Update Endpoint: `userMoveStatuses.updateNote`**

- Request type: `{ moveId: string; note: string }`
- Response type: `UserMoveStatusResponse`
- Integration: Mutation with retry logic via `useNoteAutosave` hook
- Error handling: Retry 3x, fallback to localStorage, show error indicator

## 8. User Interactions

**1. View Move Details**

- User navigates to `/moves/:slug`
- Page loads via SSR with move data
- If authenticated, status and note load client-side
- Steps are displayed in order, image shows with skeleton loader

**2. Change Status**

- User clicks StatusDropdown (must be authenticated)
- Dropdown opens with three options: "Chcę zrobić", "Prawie", "Zrobione"
- User selects option
- UI updates optimistically
- Mutation fires to backend
- On success: Toast notification "Status zaktualizowany"
- On error: Revert to previous status, show error toast

**3. Edit Note**

- User clicks in NoteEditor textarea (must be authenticated)
- Textarea expands on focus
- User types content
- Character counter updates in real-time
- After 2s of inactivity, autosave triggers
- SaveIndicator shows "Zapisywanie..." then "Zapisano" or "Błąd"
- On persistent error: "Zapisano lokalnie" message with localStorage backup

**4. Navigate Breadcrumbs**

- User clicks "Catalog" in breadcrumb trail
- Navigates to catalog page preserving any filters

**5. Mobile Sticky Actions (optional enhancement)**

- On mobile viewport, sticky bottom bar shows
- Contains StatusDropdown and "Edit Note" button
- Provides quick access without scrolling

## 9. Conditions and Validation

**Move Visibility (MoveDetailPage)**

- Condition: `publishedAt IS NOT NULL AND deletedAt IS NULL`
- Verification: Check in loader, return 404 if not met
- Effect: Controls entire page visibility

**Soft-Deleted Move (MoveDetailPage)**

- Condition: `deletedAt IS NOT NULL`
- Verification: Check in loader
- Effect: Return 410 Gone response, render "No longer available" message, add noindex meta

**Authentication for Status/Notes (MoveHeader, NoteEditor)**

- Condition: User is authenticated
- Verification: Check `user` from auth context
- Effect: Conditionally render StatusDropdown and NoteEditor

**Note Length (NoteEditor)**

- Condition: `note.length <= 2000`
- Verification: Validate on input event
- Effect: Disable further input at limit, show warning styling at >1900 chars

**Status Values (StatusDropdown)**

- Condition: Status must be WANT, ALMOST, or DONE
- Verification: Provide only valid options in dropdown
- Effect: Ensures data integrity

**Steps Ordering (StepsList)**

- Condition: Steps have valid orderIndex
- Verification: Sort steps by orderIndex before rendering
- Effect: Ensures correct step sequence display

## 10. Error Handling

**Move Not Found (404)**

- Trigger: API returns NOT_FOUND or no published move with slug
- Handling: Throw 404 redirect in loader, render 404 page
- User message: "Move not found" with link to catalog

**Move Soft-Deleted (410)**

- Trigger: Move has deletedAt timestamp
- Handling: Return 410 response, render custom component with noindex meta
- User message: "This move is no longer available" with link to catalog

**Status Update Failure**

- Trigger: Network error, server error during status mutation
- Handling: Revert optimistic update, show error toast
- User message: "Failed to update status. Please try again."

**Note Save Failure (Transient)**

- Trigger: Network timeout, 5xx error during first attempt
- Handling: Retry with exponential backoff (3 attempts: 1s, 2s, 4s)
- User message: SaveIndicator shows "Saving..." during retries

**Note Save Failure (Persistent)**

- Trigger: All 3 retry attempts failed
- Handling: Save to localStorage, show non-blocking error
- User message: "Couldn't save to server. Saved locally." with SaveIndicator showing error state

**Image Load Failure**

- Trigger: Invalid imageUrl or network error
- Handling: Show placeholder image or broken image icon
- User message: None (graceful degradation)

**Authentication Required**

- Trigger: User attempts to interact with status/notes while logged out
- Handling: Redirect to login page with return URL
- User message: "Please log in to save your progress"

**LocalStorage Restoration**

- Trigger: LocalStorage backup is newer than server data
- Handling: Show prompt asking user to restore
- User message: "You have unsaved changes. Restore?" with Yes/No options

## 11. Implementation Steps

1. **Create route file** `src/routes/moves.$slug.tsx` with TanStack Router
2. **Implement SSR loader** to fetch move data via `orpc.moves.getBySlug`, handle 404 and 410 cases
3. **Create type definitions** file for all ViewModels and DTOs
4. **Build atomic components** (Breadcrumbs, MoveImage, MoveDescription) with proper TypeScript types
5. **Implement StepsList and StepCard** components with proper semantic HTML and ordering
6. **Create StatusDropdown** component using Shadcn Select with Polish labels
7. **Implement `useMoveStatus` hook** with TanStack Query mutation and optimistic updates
8. **Build NoteEditor component** with Textarea, CharacterCounter, and SaveIndicator
9. **Implement `useNoteAutosave` hook** with debouncing, retry logic, and autosave mutation
10. **Implement `useLocalStorageNoteBackup` hook** for backup management
11. **Build MoveHeader component** integrating StatusDropdown for authenticated users
12. **Assemble MoveDetailPage** route component with all child components
13. **Add authentication checks** to conditionally render StatusDropdown and NoteEditor
14. **Implement error boundaries** for graceful error handling
15. **Add toast notifications** using Sonner for status updates
16. **Add meta tags** for SEO (title, description, canonical, conditional noindex)
17. **Test accessibility** (keyboard navigation, screen reader announcements, focus management)
18. **Add loading states** (skeleton for image, disabled state for form controls)
19. **Test responsive design** on mobile, tablet, and desktop viewports
20. **Implement mobile sticky action bar** (optional enhancement)
