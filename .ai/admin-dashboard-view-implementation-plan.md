# View Implementation Plan: Admin Dashboard

## 1. Overview

This document outlines the implementation plan for the Admin Dashboard view, which serves as the central hub for administrators. The dashboard provides a high-level summary of content within the application and offers quick access to key administrative functions, such as content management and creation.

## 2. View Routing

The Admin Dashboard will be accessible at the following path:

- **Path**: `/admin`
- **File Location**: `src/routes/admin/index.tsx`

Access will be protected by a route loader in a layout file (`src/routes/admin/__root.tsx`) to ensure only authenticated administrators can view the page.

## 3. Component Structure

The view will be composed of several distinct components, organized in a clear hierarchy to ensure maintainability and separation of concerns.

```
/src/routes/admin/index.tsx (Route Component: AdminDashboardView)
└── AdminDashboardPage (Client Component)
    ├── AdminHeader
    │   └── QuickActions
    │       ├── Link (to /admin/moves) -> Button
    │       └── Link (to /admin/moves/new) -> Button
    └── StatsGrid
        ├── StatsCard (Skeleton while loading)
        ├── StatsCard (Skeleton while loading)
        └── StatsCard (Skeleton while loading)
```

## 4. Component Details

### `AdminDashboardView` (Route Component)

- **Component description**: The main server component for the `/admin` route. It will handle server-side concerns and render the client-side page component.
- **Main elements**: Renders the `<AdminDashboardPage />` component.
- **Handled interactions**: None.
- **Handled validation**: Route-level access control will be handled by a `loader` in a parent layout route (`/admin/__root.tsx`).
- **Types**: None.
- **Props**: None.

### `AdminDashboardPage` (Client Component)

- **Component description**: The main client component that orchestrates the dashboard's UI. It is responsible for fetching statistics and managing loading/error states.
- **Main elements**: `<h1>`, `AdminHeader`, `StatsGrid`.
- **Handled interactions**: None directly; it passes data to child components.
- **Handled validation**: Manages the `isLoading` and `isError` states from the data fetching hook.
- **Types**: `AdminStatsViewModel`.
- **Props**: None.

### `AdminHeader`

- **Component description**: A simple presentational component that displays the main page title and houses the quick action buttons.
- **Main elements**: `<header>`, `<h2>`, `<QuickActions />`.
- **Handled interactions**: None.
- **Handled validation**: None.
- **Types**: None.
- **Props**: None.

### `QuickActions`

- **Component description**: Contains links styled as buttons for the primary administrative tasks.
- **Main elements**: `<div>`, Tanstack Router `<Link>` components, Shadcn `Button` components.
- **Handled interactions**:
  - `onClick` on "Manage Moves": Navigates to `/admin/moves`.
  - `onClick` on "Create New Move": Navigates to `/admin/moves/new`.
- **Handled validation**: None.
- **Types**: None.
- **Props**: None.

### `StatsGrid`

- **Component description**: Displays the summary statistics. It handles the loading and error states for the stats data.
- **Main elements**: `<div>` (grid layout), `StatsCard` components, or `StatsCardSkeleton` components.
- **Handled interactions**: None.
- **Handled validation**:
  - If `isLoading` is true, it renders three `StatsCardSkeleton` components.
  - If `isError` is true, it displays an error message.
  - If data is available, it maps over the data to render `StatsCard` components.
- **Types**: `AdminStatsViewModel`.
- **Props**:
  ```typescript
  interface StatsGridProps {
  	stats: AdminStatsViewModel | undefined;
  	isLoading: boolean;
  	isError: boolean;
  }
  ```

### `StatsCard`

- **Component description**: A reusable card for displaying a single metric, consisting of a label, a value, and an optional icon.
- **Main elements**: Shadcn `Card` component (`Card`, `CardHeader`, `CardTitle`, `CardContent`), `<div>`, `<p>`.
- **Handled interactions**: None.
- **Handled validation**: None.
- **Types**: None.
- **Props**:
  ```typescript
  interface StatsCardProps {
  	label: string;
  	value: number | string;
  	icon?: React.ReactNode;
  }
  ```

## 5. Types

A new DTO and ViewModel are required for the admin statistics.

### `AdminGetStatsOutput` (DTO)

This type defines the data structure for the API response from the new `admin.getStats` endpoint.

```typescript
// Location: src/orpc/schema.ts
import { z } from "zod";

export const AdminGetStatsOutputSchema = z.object({
	totalMoves: z.number().int().nonnegative(),
	publishedMoves: z.number().int().nonnegative(),
	unpublishedMoves: z.number().int().nonnegative(),
});

export type AdminGetStatsOutput = z.infer<typeof AdminGetStatsOutputSchema>;
```

### `AdminStatsViewModel`

This client-side type is used for props and state within the dashboard components. It directly maps to the `AdminGetStatsOutput` DTO.

```typescript
// Defined within the component file or a local types file
export type AdminStatsViewModel = {
	totalMoves: number;
	publishedMoves: number;
	unpublishedMoves: number;
};
```

## 6. State Management

Server state will be managed by **Tanstack Query**. A custom hook will be created to encapsulate the data fetching logic.

### `useAdminStats` Hook

- **Purpose**: Fetches admin statistics using the oRPC client and provides component-friendly state flags.
- **Implementation**:

  ```typescript
  // Location: src/hooks/use-admin-stats.ts
  import { useQuery } from "@tanstack/react-query";
  import { orpcClient } from "@/orpc/client";

  export function useAdminStats() {
  	return useQuery({
  		queryKey: ["admin", "stats"],
  		queryFn: () => orpcClient.admin.getStats.query(),
  	});
  }
  ```

## 7. API Integration

A new oRPC procedure, `admin.getStats`, must be created. The frontend will call this procedure via the `orpcClient`.

- **Endpoint**: `admin.getStats`
- **Method**: `query`
- **Request Type**: `undefined` (no input)
- **Response Type**: `AdminGetStatsOutput`

The frontend integration will be handled by the `useAdminStats` hook, which abstracts the API call and state management away from the components.

## 8. User Interactions

- **Page Load**: The dashboard automatically fetches and displays the latest move statistics.
- **Navigation**:
  - Clicking the **"Manage Moves"** button navigates the user to the `/admin/moves` route.
  - Clicking the **"Create New Move"** button navigates the user to the `/admin/moves/new` route.

## 9. Conditions and Validation

- **Access Control (Server-Side)**:
  - A `loader` function in `src/routes/admin/__root.tsx` will verify that the user is authenticated and has the `isAdmin` flag set to `true`.
  - If the user is not authenticated, they will be redirected to `/auth/sign-in`.
  - If the user is authenticated but not an admin, a `403 Forbidden` error will be thrown.
- **Data Fetching (Client-Side)**:
  - The `StatsGrid` component will conditionally render UI based on the `isLoading` and `isError` flags from `useAdminStats`.
  - If `isLoading` is `true`, skeleton loaders are shown.
  - If `isError` is `true`, an error message is shown.

## 10. Error Handling

- **Unauthorized Access**: Handled by the route `loader`, which will either redirect or show a "Forbidden" error page.
- **API Failure**: If the `admin.getStats` API call fails, the `useAdminStats` hook will set `isError` to `true`. The `StatsGrid` component will display a user-friendly error message, e.g., "Failed to load statistics. Please refresh the page."

## 11. Implementation Steps

1.  **Backend: Create `admin.getStats` oRPC Procedure**:
    - In `src/orpc/router/admin.ts`, define a new procedure `getStats`.
    - The procedure handler should use Drizzle to query the `moves` table and calculate `totalMoves`, `publishedMoves`, and `unpublishedMoves`.
    - Ensure the procedure is protected by admin-only middleware.
    - Add the `AdminGetStatsOutputSchema` to `src/orpc/schema.ts`.
2.  **Frontend: Create Route and Access Control**:
    - Create the admin layout route file `src/routes/admin/__root.tsx`.
    - Implement a `loader` function in this file to perform the authentication and admin authorization check.
    - Create the admin dashboard route file `src/routes/admin/index.tsx`.
3.  **Frontend: Implement Data Fetching Hook**:
    - Create `src/hooks/use-admin-stats.ts`.
    - Implement the `useAdminStats` hook using `@tanstack/react-query` to call the new `admin.getStats` procedure.
4.  **Frontend: Build UI Components**:
    - Create the `StatsCard` component, including a skeleton variant for the loading state. Use Shadcn's `Card` and `Skeleton` components.
    - Create the `QuickActions` component with `Link` components from `@tanstack/react-router` styled as Shadcn `Button`s.
    - Create the `AdminHeader` component.
    - Create the `StatsGrid` component, which uses `useAdminStats` to get data and handles rendering logic for loading, error, and success states.
5.  **Frontend: Assemble the View**:
    - In `src/routes/admin/index.tsx`, create the `AdminDashboardView` and `AdminDashboardPage` components.
    - Compose the `AdminHeader` and `StatsGrid` inside the `AdminDashboardPage` to build the final UI.
6.  **Testing**:
    - Manually test all states: loading, error, and success.
    - Verify that the quick action links navigate to the correct routes.
    - Test access control by trying to access `/admin` as a non-authenticated user and as a non-admin authenticated user.
