# View Implementation Plan: My Moves

## 1. Overview

This document outlines the implementation plan for the "My Moves" view, a personalized dashboard for authenticated users. The view will display a list of all pole dance moves for which the user has either set a status (e.g., "Want to learn") or written a personal note. It will feature filtering by difficulty level, inline status updates with optimistic UI, and clear indicators for notes and archived moves.

## 2. View Routing

The view will be accessible at the following path:

- **Path**: `/my-moves`
- **Access**: This is a private route, accessible only to authenticated users. Unauthenticated users will be redirected to the sign-in page.

## 3. Component Structure

The view will be composed of the following component hierarchy. New components are marked with `*`.

```
/my-moves (Route Component)
├── TabNavigation*
├── MovesGrid
│   ├── MoveCardMyMoves (Variant of MoveCard)
│   │   ├── ... (existing MoveCard elements)
│   │   ├── StatusBadge*
│   │   ├── NoteIndicator*
│   │   ├── StatusDropdown*
│   │   └── ArchivedMoveBadge*
│   └── EmptyState*
└── FloatingActionButton*
```

## 4. Component Details

### MyMovesView (Route Component)

- **Component description**: The main container for the `/my-moves` route. It's responsible for orchestrating data fetching via a custom hook, managing the view's overall state (loading, error, empty), and rendering the appropriate child components. It will be protected by an authentication guard.
- **Main elements**: It renders the `TabNavigation` and either the `MovesGrid` with `MoveCardMyMoves` instances or the `EmptyState` component based on the fetched data. It also renders the `FloatingActionButton`.
- **Handled interactions**: Manages the active filter state passed down from the `TabNavigation`.
- **Handled validation**: Verifies user authentication status before rendering.
- **Types**: `MyMoveViewModel[]`
- **Props**: None.

### TabNavigation

- **Component description**: A reusable component that displays filtering tabs ("All", "Beginner", "Intermediate", "Advanced"). It manages the active tab state and communicates changes to its parent.
- **Main elements**: A `nav` element containing a list of `button` or link elements representing the tabs.
- **Handled events**: `onClick` on a tab, which invokes a callback prop (`onTabChange`) with the selected level.
- **Handled validation**: None.
- **Types**: `MoveLevel` enum (`'Beginner' | 'Intermediate' | 'Advanced'`).
- **Props**:
  - `activeTab: MoveLevel | 'All'`
  - `onTabChange: (level: MoveLevel | 'All') => void`

### MoveCardMyMoves (Variant)

- **Component description**: An enhanced version of the existing `MoveCard`. In addition to the move's core details (image, name, level), it displays user-specific information like status, a note indicator, and quick actions. It also adapts its styling for archived moves.
- **Main elements**: `div` or `article` as the card root. Includes child components: `StatusDropdown`, `NoteIndicator` icon, and `ArchivedMoveBadge`.
- **Handled events**: Delegates the status change event from the `StatusDropdown` to a prop (`onStatusUpdate`).
- **Handled validation**: None.
- **Types**: `MyMoveViewModel`.
- **Props**:
  - `move: MyMoveViewModel`
  - `onStatusUpdate: (moveId: string, newStatus: MoveStatus) => void`

### StatusDropdown

- **Component description**: An interactive control (likely a Shadcn `Select` or `DropdownMenu`) that allows the user to change the status of a move without leaving the page.
- **Main elements**: A dropdown menu with options corresponding to the `MoveStatus` enum values.
- **Handled events**: `onValueChange` or `onSelect` which triggers a callback prop (`onStatusChange`) with the newly selected status.
- **Handled validation**: None.
- **Types**: `MoveStatus` enum (`'WANT' | 'ALMOST' | 'DONE'`).
- **Props**:
  - `currentStatus: MoveStatus`
  - `onStatusChange: (newStatus: MoveStatus) => void`

## 5. Types

### DTOs (from oRPC API)

**Request DTOs**

```typescript
// Input for querying moves for the user
type GetForUserInput = {
	level?: "Beginner" | "Intermediate" | "Advanced";
};

// Input for the status update mutation
type UpdateUserMoveStatusInput = {
	moveId: string;
	newStatus: "WANT" | "ALMOST" | "DONE";
};
```

**Response DTO**

```typescript
// Output from the user moves query
type GetForUserOutput = {
	moves: Array<{
		id: string;
		name: string;
		level: "Beginner" | "Intermediate" | "Advanced";
		slug: string;
		imageUrl: string | null;
		status: "WANT" | "ALMOST" | "DONE";
		note: string | null;
		isDeleted: boolean;
	}>;
};
```

### ViewModels (for UI Components)

```typescript
// Transformed data object for use in UI components
type MyMoveViewModel = {
	id: string;
	name: string;
	level: "Beginner" | "Intermediate" | "Advanced";
	slug: string;
	imageUrl: string | null;
	status: "WANT" | "ALMOST" | "DONE";
	statusPolish: "Chcę zrobić" | "Prawie" | "Zrobione";
	hasNote: boolean;
	isArchived: boolean;
};
```

## 6. State Management

All view-specific logic will be encapsulated in a custom hook, `useMyMoves`.

- **`useMyMoves` Hook**:
  - **Purpose**: To provide the `MyMovesView` component with all the data and actions it needs, abstracting away the complexities of data fetching, state management, and mutations.
  - **Internal Logic**:
    - It will use TanStack Router's `useSearch` hook to read the `level` filter from the URL query parameters.
    - It will use TanStack Query's `useQuery` to fetch data from the `moves.getForUser` endpoint, passing the current `level` filter. The query will be automatically refetched when the filter changes.
    - It will use TanStack Query's `useMutation` for the `moves.updateUserMoveStatus` endpoint to handle status changes. This mutation will be configured for optimistic updates.
  - **Returns**: An object containing `{ moves, isLoading, isError, updateStatus, activeFilter, setFilter }`.

## 7. API Integration

The view will integrate with two new oRPC endpoints.

- **Query Endpoint**: `moves.getForUser`
  - **Request**: `GetForUserInput`
  - **Response**: `GetForUserOutput`
  - **Integration**: Called via `useQuery` within the `useMyMoves` hook. The query key will be `['my-moves', { level }]` to ensure caching and automatic refetching on filter change.

- **Mutation Endpoint**: `moves.updateUserMoveStatus`
  - **Request**: `UpdateUserMoveStatusInput`
  - **Response**: `{ success: boolean }`
  - **Integration**: Called via `useMutation` within the `useMyMoves` hook. It will be configured with `onMutate`, `onError`, and `onSettled` callbacks to handle the optimistic update flow.

## 8. User Interactions

- **Filtering Moves**: Clicking a tab in `TabNavigation` updates the `level` URL query parameter, triggering an API refetch for the new filter.
- **Changing Status**: Selecting a new status in the `StatusDropdown` on a `MoveCard` triggers the `updateStatus` mutation. The UI updates instantly (optimistically), and a toast notification confirms success or failure.
- **Editing a Note**: Clicking the note indicator icon on a `MoveCard` navigates the user to the move detail page (`/moves/{slug}`) where they can edit the note.
- **Adding a New Move**: Clicking the floating "+" button navigates the user to the main catalog (`/catalog`) to discover and add new moves.

## 9. Conditions and Validation

- **Authentication**: The route will be protected. The `beforeLoad` property in the TanStack Router route definition will check for an active user session and redirect to `/auth/sign-in` if none exists. The API query will only be enabled if a user is logged in.
- **Data Presence**: The view will check if the fetched `moves` array is empty. If it is, the `EmptyState` component will be rendered instead of the moves grid.
- **Archived State**: The `MoveCardMyMoves` component will check the `isArchived` flag from the view model and conditionally apply muted styling and render the `ArchivedMoveBadge`.

## 10. Error Handling

- **Data Fetching Error**: If the `useQuery` call to `moves.getForUser` fails, the `isError` state will become true. The UI will display a generic error message with a "Retry" button that calls the `refetch` function provided by `useQuery`.
- **Status Update Error**: If the `updateUserMoveStatus` mutation fails, the `onError` callback in `useMutation` will automatically roll back the UI to its previous state. An error toast will be displayed to the user (e.g., "Failed to update status").

## 11. Implementation Steps

1.  **Backend**: Implement the required oRPC endpoints: `moves.getForUser` and `moves.updateUserMoveStatus`. Ensure they are protected and have the correct logic for data retrieval and updates based on the authenticated user.
2.  **Types**: Define all DTOs and ViewModel types in a shared types file.
3.  **Routing**: Define the `/my-moves` route using TanStack Router, including the `beforeLoad` authentication guard.
4.  **Custom Hook**: Create the `useMyMoves` hook. Set up the `useSearch`, `useQuery`, and `useMutation` logic inside it, including the optimistic update configuration.
5.  **Main View Component**: Create the `MyMovesView` route component. Use the `useMyMoves` hook to get data and actions, and render conditional UI for loading, error, empty, and data states.
6.  **UI Components**:
    - Create the `TabNavigation` component.
    - Modify the existing `MoveCard` to support a "my-moves" variant that includes the `StatusDropdown`, `NoteIndicator`, and `ArchivedMoveBadge`.
    - Create the standalone `StatusDropdown`, `EmptyState`, and `FloatingActionButton` components, leveraging Shadcn UI where possible.
7.  **Styling**: Apply Tailwind CSS for the responsive grid layout and styling of all new components, including the muted look for archived cards.
8.  **Integration**: Wire up all components, passing props and callbacks from the main view down to the interactive elements.
9.  **Testing**: Manually test all user interactions: filtering, successful status updates, failed status updates (rollback), navigation, and responsive layouts.
