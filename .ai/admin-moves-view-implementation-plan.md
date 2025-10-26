# View Implementation Plan: Admin Move List

## 1. Overview

This document outlines the implementation plan for the "Admin Move List" view. This view is a private, admin-only interface designed for managing the entire catalog of moves within the application. It allows administrators to view, filter, and perform management actions (publish, unpublish, delete, restore) on all moves, including those not visible to regular users.

## 2. View Routing

- **Path**: `/admin/moves`
- **Layout**: This view should be rendered within the main admin layout, which handles authentication and role-based access control.

## 3. Component Structure

The view will be composed of the following components, located in `src/components/admin/moves/`. Component filenames should be in `kebab-case` (e.g., `admin-moves-view.tsx`).

```
AdminMovesView (Route Component)
├── AdminMovesHeader
├── AdminMovesFilters
│   ├── AdminSearchBar
│   └── AdminFilterControls
├── AdminMovesTable
│   ├── TableHeader
│   └── TableBody
│       └── AdminMoveTableRow (repeated for each move)
│           ├── StatusBadge
│           ├── LevelBadge
│           └── ActionButtons
│               └── ConfirmDialog (Shadcn)
└── AdminMovesPagination
```

## 4. Component Details

### `AdminMovesView`

- **Location**: `src/routes/admin/moves.tsx`
- **Component description**: The main page component that fetches data and orchestrates the state for the entire view. It uses a custom hook to manage filters and passes data down to its children.
- **Main elements**: `div` container wrapping `AdminMovesHeader`, `AdminMovesFilters`, `AdminMovesTable`, and `AdminMovesPagination`.
- **Handled interactions**: None directly; delegates to child components.
- **Handled validation**: Displays loading and error states based on the API request status.
- **Types**: `AdminMoveViewModel[]` for the list of moves.
- **Props**: None (it's a route component).

### `AdminMovesFilters`

- **Location**: `src/components/admin/moves/admin-moves-filters.tsx`
- **Component description**: A container for all filtering controls, including the search bar and dropdowns for level and status.
- **Main elements**: `div` containing `AdminSearchBar` and `AdminFilterControls`.
- **Handled interactions**: `onSearchChange`, `onLevelChange`, `onStatusChange`.
- **Handled validation**: None.
- **Types**: `MoveLevel`, `AdminMoveStatus`.
- **Props**:
  - `query: string`
  - `level: MoveLevel | 'All'`
  - `status: AdminMoveStatus | 'All'`
  - `onQueryChange: (query: string) => void`
  - `onLevelChange: (level: MoveLevel | 'All') => void`
  - `onStatusChange: (status: AdminMoveStatus | 'All') => void`

### `AdminMovesTable`

- **Location**: `src/components/admin/moves/admin-moves-table.tsx`
- **Component description**: Renders the list of moves in a table. It includes headers, rows, and handles the empty/loading/error states.
- **Main elements**: Shadcn `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`. Renders `AdminMoveTableRow` for each move.
- **Handled interactions**: None directly; delegates actions to `AdminMoveTableRow`.
- **Handled validation**: Displays a message when no moves match the current filters.
- **Types**: `AdminMoveViewModel[]`.
- **Props**:
  - `moves: AdminMoveViewModel[]`
  - `isLoading: boolean`
  - `isError: boolean`

### `AdminMoveTableRow`

- **Location**: `src/components/admin/moves/admin-move-table-row.tsx`
- **Component description**: Displays a single move with its details and action buttons.
- **Main elements**: Shadcn `TableRow` with `TableCell`s for name, level, status, updated date, and actions.
- **Handled interactions**: Edit, Publish/Unpublish, Delete/Restore clicks.
- **Handled validation**: Conditionally renders action buttons based on the move's `status`.
- **Types**: `AdminMoveViewModel`.
- **Props**:
  - `move: AdminMoveViewModel`

### `AdminMovesPagination`

- **Location**: `src/components/admin/moves/admin-moves-pagination.tsx`
- **Component description**: Provides controls to navigate between pages of the move list.
- **Main elements**: Shadcn `Pagination` component.
- **Handled interactions**: `onPageChange`.
- **Handled validation**: Disables "Previous" and "Next" buttons when on the first or last page, respectively.
- **Types**: `number`.
- **Props**:
  - `currentPage: number`
  - `totalPages: number`
  - `onPageChange: (page: number) => void`

## 5. Types

This view will require the creation of a new types file at `src/types/admin.ts` to house the following view-specific types.

### `AdminMoveStatus`

A type alias for move statuses in the admin context.

```typescript
export type AdminMoveStatus = "Published" | "Unpublished" | "Deleted";
```

### `MoveLevel`

The existing enum for move difficulty.

```typescript
export type MoveLevel = "Beginner" | "Intermediate" | "Advanced";
```

### `AdminListMovesInput` (Request DTO)

The input schema for the new admin-specific API endpoint.

```typescript
export type AdminListMovesInput = {
	limit?: number; // default: 10
	offset?: number; // default: 0
	level?: MoveLevel;
	status?: AdminMoveStatus;
	query?: string;
};
```

### `AdminListMovesOutput` (Response DTO)

The output schema for the new admin-specific API endpoint.

```typescript
export type AdminListMovesOutput = {
	moves: {
		id: string;
		name: string;
		level: MoveLevel;
		slug: string;
		status: AdminMoveStatus;
		updatedAt: Date;
	}[];
	total: number;
};
```

### `AdminMoveViewModel`

The data structure used by frontend components. It's derived directly from the `AdminListMovesOutput.moves` array element.

```typescript
export type AdminMoveViewModel = {
	id: string;
	name: string;
	level: MoveLevel;
	slug: string;
	status: AdminMoveStatus;
	updatedAt: Date;
};
```

## 6. State Management

State will be primarily managed by a custom hook, `useAdminMovesFilters`, which synchronizes filter, search, and pagination state with the URL query parameters using Tanstack Router's `useSearch` hook.

- **`useAdminMovesFilters` Hook:**
  - **Purpose**: To provide a single source of truth for all filter and pagination state. It reads from the URL on mount and updates the URL on state changes, triggering data re-fetches.
  - **State**: `query`, `level`, `status`, `page`, `limit`.
  - **Returns**: An object with current state values and updater functions.

Data fetching state (`data`, `isLoading`, `isError`) will be managed by Tanstack Query. Instead of calling `useQuery` directly in the component, we will create a `queryOptions` factory to encapsulate the query logic, as per project conventions. Mutations will be handled by `useMutation`, which will invalidate the main query on success.

## 7. API Integration

A new, admin-only oRPC endpoint, `admin.listMoves`, must be created. The existing `moves.list` is unsuitable as it only returns published moves.

- **Endpoint**: `admin.listMoves`
- **Request Type**: `AdminListMovesInput`
- **Response Type**: `AdminListMovesOutput`

**Frontend Integration**:

- **Data Fetching**: Data fetching logic will be encapsulated in a `queryOptions` factory.
  - **Location**: `src/query-options/admin.ts`
  - **Function**: `adminMovesQueryOptions`
  - **Implementation**:

    ```typescript
    import { queryOptions } from "@tanstack/react-query";
    import { orpc } from "@/orpc/client";
    import type { AdminListMovesInput } from "@/orpc/schema";

    export const adminMovesQueryOptions = (filters: AdminListMovesInput) =>
    	queryOptions({
    		queryKey: ["admin", "moves", filters],
    		queryFn: () => orpc.admin.listMoves.query(filters),
    	});
    ```

  - **Usage**: The `AdminMovesView` component will use this by calling `useQuery(adminMovesQueryOptions(...))`.

- **Mutations**: Separate `useMutation` hooks will be created for each action (publish, unpublish, delete, restore). On success, they will call `queryClient.invalidateQueries({ queryKey: ['admin', 'moves'] })`.

## 8. User Interactions

- **Search**: User types into the search bar. The input is debounced (e.g., 300ms). After the delay, the URL is updated, and a new API request is made.
- **Filtering**: User selects a new value from the Level or Status dropdowns. The URL is updated immediately, and a new API request is made.
- **Pagination**: User clicks a page number or next/previous button. The URL is updated, and a new API request is made for the corresponding page.
- **Delete Action**: User clicks the "Delete" button. A Shadcn `AlertDialog` appears to confirm. If confirmed, the delete mutation is executed.
- **Other Actions (Publish, Restore, etc.)**: User clicks the button. The corresponding mutation is executed immediately. The button enters a disabled/loading state until the API call completes.

## 9. Conditions and Validation

- **Access Control**: The entire `/admin/moves` route and the `admin.listMoves` endpoint will be protected by a server-side middleware that verifies the user has an `isAdmin` role. Non-admins will be denied access.
- **Filter Values**: The filter components will only allow valid enum values (`MoveLevel`, `AdminMoveStatus`), ensuring that API requests are well-formed.
- **UI State**: The UI will correctly render button states based on the move's status. For example, a "Published" move will show an "Unpublish" button, and a "Deleted" move will show a "Restore" button.

## 10. Error Handling

- **Data Fetching Error**: If the `useQuery` call to `admin.listMoves` fails, the table area will display a user-friendly error message (e.g., "Failed to load moves.") with a "Retry" button.
- **Mutation Error**: If a mutation (e.g., delete, publish) fails, a toast notification will appear at the top of the screen informing the user of the failure (e.g., "Failed to delete move. Please try again.").
- **Empty State**: If the API returns 0 total moves for the given filters, the table will display a message like "No moves found." with a suggestion to adjust filters or create a new move.

## 11. Implementation Steps

1.  **Backend (API):**
    1.  Create a new data-access function `listAdminMoves` in `src/data-access/moves.ts` that queries moves based on `level`, `status` (published/unpublished/deleted), and a search query.
    2.  Define the `AdminListMovesInputSchema` and `AdminListMovesOutputSchema` in `src/orpc/schema.ts`.
    3.  Create the new `admin.listMoves` oRPC procedure in `src/orpc/router/admin.ts`, ensuring it is protected by admin-only middleware.
    4.  Create the oRPC procedures for mutations: `admin.publishMove`, `admin.unpublishMove`, `admin.deleteMove`, `admin.restoreMove`.

2.  **Frontend (State & Logic):**
    1.  Create a new file at `src/types/admin.ts` and define the `AdminMoveStatus` and `AdminMoveViewModel` types.
    2.  Create the `useAdminMovesFilters` custom hook in `src/hooks/use-admin-moves-filters.ts` to manage URL search parameters.
    3.  Create a new file at `src/query-options/admin.ts` and implement the `adminMovesQueryOptions` factory for data fetching.

3.  **Frontend (Component Creation):**
    1.  Create the new route file at `src/routes/admin/moves.tsx`.
    2.  Implement the `AdminMovesView` page component, integrating the `useAdminMovesFilters` hook and using `useQuery` with `adminMovesQueryOptions`.
    3.  Create the component files inside `src/components/admin/moves/` using `kebab-case` naming.
    4.  Build the `AdminMovesHeader` and `AdminMovesFilters` components.
    5.  Build the `AdminMovesTable` component, including logic for displaying loading, error, and empty states.
    6.  Build the `AdminMoveTableRow` component, including the conditional logic for `ActionButtons`.
    7.  Implement the `useMutation` hooks for each action and connect them to the `ActionButtons` component. Use Shadcn's `AlertDialog` for the delete confirmation.
    8.  Build the `AdminMovesPagination` component and connect it to the state management hook.

4.  **Styling and Finalization:**
    1.  Apply Tailwind CSS classes to all components for proper layout and styling, consistent with the rest of the admin interface.
    2.  Add status badges with distinct colors for `Published` (green), `Unpublished` (gray), and `Deleted` (red).
    3.  Thoroughly test all user interactions, including filtering, searching, pagination, and all actions.
    4.  Ensure all new interactive elements meet accessibility standards for keyboard navigation and screen readers.
