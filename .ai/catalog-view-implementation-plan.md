# View Implementation Plan: Catalog / Browse Moves

## 1. Overview

The Catalog view is a public, SSR-enabled page that allows users to browse, search, and filter published pole dance moves. It serves as the primary discovery interface with a responsive grid layout, real-time search with debouncing, level-based filtering, and pagination. Authenticated users see additional status indicators on moves they've interacted with.

## 2. View Routing

- **Path**: `/catalog` or `/moves`
- **Access Level**: Public (SSR, indexable)
- **URL Parameters**:
  - `?query=` - search text
  - `?level=` - difficulty filter (Beginner|Intermediate|Advanced)
  - `?page=` - current page number (default: 1)

## 3. Component Structure

```
CatalogView (route component)
├── SearchBar
├── LevelFilterBadges
│   └── Badge × 4 (All, Beginner, Intermediate, Advanced)
├── ResultsSummary
├── MovesGrid | EmptyState | SkeletonGrid
│   └── MoveCard × N
│       ├── Card (from shadcn/ui)
│       ├── Image
│       ├── Badge (level)
│       └── StatusIndicator (conditional)
└── Pagination
```

## 4. Component Details

### CatalogView (Page Component)

- **Description**: Main route component managing state, data fetching, and URL synchronization. Orchestrates all child components and handles filter/search logic.
- **Main elements**:
  - `<div>` container with max-width constraint
  - Header section with title
  - SearchBar component
  - LevelFilterBadges component
  - ResultsSummary component
  - Conditional rendering: MovesGrid | EmptyState | SkeletonGrid
  - Pagination component (footer)
- **Handled interactions**: None directly (delegates to children)
- **Handled validation**:
  - Parse and validate URL search params on mount
  - Sanitize invalid `page` values (< 1 → 1)
  - Validate `level` param matches enum or undefined
  - Ensure `query` is trimmed or undefined
- **Types**: `CatalogSearchParams`, `MovesListResponse`
- **Props**: Route search params from TanStack Router

### SearchBar

- **Description**: Full-width text input with search icon and clear button. Implements debounced search to minimize API calls.
- **Main elements**:
  - `<div>` wrapper with search icon (left)
  - `<input type="text">` with placeholder "Szukaj ruchów..." (Polish: "Search moves...")
  - Clear button (right, visible when input has value)
- **Handled interactions**:
  - `onChange`: Update local input value immediately
  - Clear button `onClick`: Reset input and query param
  - `onKeyDown`: Handle Enter key (optional, already debounced)
- **Handled validation**:
  - Trim whitespace before updating URL
  - Don't send query if empty string (send undefined instead)
  - Maximum length: 100 characters (soft limit, no hard enforcement)
- **Types**: `SearchBarProps { value: string; onChange: (value: string) => void; onClear: () => void }`
- **Props**: `value` (controlled input), `onChange`, `onClear`

### LevelFilterBadges

- **Description**: Horizontal row of clickable badge buttons for filtering by difficulty level. Shows active state for selected level.
- **Main elements**:
  - `<div>` flex container with gap
  - Badge component × 4 (All, Beginner, Intermediate, Advanced)
  - Each badge shows level name in Polish
- **Handled interactions**:
  - Badge `onClick`: Update URL level param and reset page to 1
- **Handled validation**:
  - Only allow valid enum values: 'Beginner' | 'Intermediate' | 'Advanced' | undefined
  - 'All' selection clears level param (undefined in URL)
- **Types**: `LevelFilterBadgesProps { activeLevel: MoveLevel | 'All'; onChange: (level: MoveLevel | 'All') => void }`
- **Props**: `activeLevel`, `onChange`

### ResultsSummary

- **Description**: Displays count of filtered results and active filter tags. Provides visual feedback about current search/filter state.
- **Main elements**:
  - `<div>` text showing "Znaleziono X ruchów" (Polish: "Found X moves")
  - Active filter tags (level, search query) with remove buttons
- **Handled interactions**:
  - Filter tag close button: Remove specific filter
- **Handled validation**: None
- **Types**: `ResultsSummaryProps { total: number; activeFilters: { query?: string; level?: MoveLevel } }`
- **Props**: `total`, `activeFilters`

### MovesGrid

- **Description**: Responsive CSS Grid container displaying move cards. Adapts column count based on viewport width.
- **Main elements**:
  - `<div>` with CSS Grid: 1 column mobile, 2 tablet, 3 desktop
  - Gap between cards: 1rem (gap-4)
  - Maps over moves array to render MoveCard components
- **Handled interactions**: None
- **Handled validation**: None
- **Types**: `MovesGridProps { moves: MoveDTO[]; userStatuses?: Map<string, MoveStatus> }`
- **Props**: `moves`, `userStatuses` (optional, for authenticated users)

### MoveCard

- **Description**: Individual move display card with image, name, level badge, and optional status indicator. Clickable to navigate to detail page.
- **Main elements**:
  - `<Card>` from shadcn/ui as wrapper
  - `<Link>` wrapping entire card (to `/moves/{slug}`)
  - `<img>` with alt text, fallback if imageUrl is null
  - `<h3>` for move name
  - `<p>` for truncated description (2 lines max)
  - `<Badge>` for level (bottom-left)
  - `<StatusIndicator>` (top-right, conditional)
- **Handled interactions**:
  - Card click: Navigate to move detail page
  - Hover: Show elevation/shadow effect
- **Handled validation**:
  - Ensure required fields (id, name, slug) exist
  - Handle null imageUrl with placeholder or default image
- **Types**: `MoveCardProps { move: MoveDTO; userStatus?: MoveStatus }`
- **Props**: `move`, `userStatus`

### Pagination

- **Description**: Page navigation controls with Previous/Next buttons and page number display. Calculates total pages from API response.
- **Main elements**:
  - `<div>` flex container
  - Previous button (disabled on page 1)
  - Page indicator: "Strona X z Y" (Polish: "Page X of Y")
  - Next button (disabled on last page)
- **Handled interactions**:
  - Previous button `onClick`: Decrement page in URL
  - Next button `onClick`: Increment page in URL
- **Handled validation**:
  - Ensure page >= 1
  - Ensure page <= totalPages
  - Calculate totalPages = Math.ceil(total / PAGE_SIZE)
- **Types**: `PaginationProps { currentPage: number; totalPages: number; onPageChange: (page: number) => void }`
- **Props**: `currentPage`, `totalPages`, `onPageChange`

### EmptyState

- **Description**: Displayed when no moves match current filters. Provides helpful message and action to reset filters.
- **Main elements**:
  - `<div>` centered container with icon
  - Heading: "Nie znaleziono ruchów" (Polish: "No moves found")
  - Description text suggesting filter adjustment
  - Button to reset all filters
- **Handled interactions**:
  - Reset button `onClick`: Clear all URL params
- **Handled validation**: None
- **Types**: `EmptyStateProps { onReset: () => void; hasActiveFilters: boolean }`
- **Props**: `onReset`, `hasActiveFilters`

### SkeletonGrid

- **Description**: Loading placeholder mimicking MovesGrid layout. Shows during initial load and filter changes.
- **Main elements**:
  - Same CSS Grid as MovesGrid
  - SkeletonCard × PAGE_SIZE (20)
- **Handled interactions**: None
- **Handled validation**: None
- **Types**: None
- **Props**: None

### SkeletonCard

- **Description**: Loading placeholder for individual move card with animated shimmer effect.
- **Main elements**:
  - `<Card>` wrapper
  - Rectangle skeleton for image
  - Line skeletons for name and description
  - Small skeleton for level badge
- **Handled interactions**: None
- **Handled validation**: None
- **Types**: None
- **Props**: None

## 5. Types

```typescript
// API DTOs (from endpoint)
type MoveLevel = "Beginner" | "Intermediate" | "Advanced";

type MoveDTO = {
	id: string;
	name: string;
	description: string;
	level: MoveLevel;
	slug: string;
	imageUrl: string | null;
};

type MovesListResponse = {
	moves: MoveDTO[];
	total: number;
};

type MovesListRequest = {
	limit?: number;
	offset?: number;
	level?: MoveLevel;
	query?: string;
};

// View Models
type CatalogSearchParams = {
	query?: string;
	level?: MoveLevel;
	page?: number;
};

type CatalogFilters = {
	query: string;
	level: MoveLevel | "All";
	page: number;
};

type MoveStatus = "WANT" | "ALMOST" | "DONE";

type PaginationInfo = {
	currentPage: number;
	totalPages: number;
	pageSize: number;
	totalItems: number;
};

// Component Props
type SearchBarProps = {
	value: string;
	onChange: (value: string) => void;
	onClear: () => void;
};

type LevelFilterBadgesProps = {
	activeLevel: MoveLevel | "All";
	onChange: (level: MoveLevel | "All") => void;
};

type ResultsSummaryProps = {
	total: number;
	activeFilters: {
		query?: string;
		level?: MoveLevel;
	};
	onRemoveFilter: (filterKey: "query" | "level") => void;
};

type MovesGridProps = {
	moves: MoveDTO[];
	userStatuses?: Map<string, MoveStatus>;
};

type MoveCardProps = {
	move: MoveDTO;
	userStatus?: MoveStatus;
};

type PaginationProps = {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
};

type EmptyStateProps = {
	onReset: () => void;
	hasActiveFilters: boolean;
};
```

## 6. State Management

**URL-Based State** (primary source of truth):

- Managed via TanStack Router's search params
- All filters stored in URL for shareability
- Validation schema ensures type safety

**Local Component State**:

- SearchBar: immediate input value (before debouncing)
- Debounced search query (250ms delay)

**Custom Hook: `useCatalogFilters`**:

```typescript
function useCatalogFilters() {
	const navigate = useNavigate();
	const searchParams = useSearch(); // from TanStack Router

	const filters: CatalogFilters = {
		query: searchParams.query || "",
		level: searchParams.level || "All",
		page: searchParams.page || 1,
	};

	const updateFilters = (updates: Partial<CatalogFilters>) => {
		navigate({
			search: {
				...searchParams,
				...updates,
				page: updates.page || 1, // Reset page on filter change
			},
		});
	};

	const resetFilters = () => {
		navigate({ search: {} });
	};

	return { filters, updateFilters, resetFilters };
}
```

**Debouncing**:

- Use custom `useDebouncedValue` hook or library like `use-debounce`
- Debounce delay: 250ms
- Apply to search query before triggering API call

## 7. API Integration

**Endpoint**: `orpc.moves.list` via TanStack Query

**Request Construction**:

```typescript
const PAGE_SIZE = 20;

const queryInput: MovesListRequest = {
	limit: PAGE_SIZE,
	offset: (filters.page - 1) * PAGE_SIZE,
	level: filters.level === "All" ? undefined : filters.level,
	query: debouncedQuery.trim() || undefined,
};
```

**Query Setup**:

```typescript
const { data, isLoading, error, isFetching } = useQuery(
	orpc.moves.list.queryOptions({
		input: queryInput,
		staleTime: 5 * 60 * 1000, // 5 minutes
	})
);
```

**Response Handling**:

- `data.moves`: Array of move DTOs to display
- `data.total`: Total count for pagination calculation
- `isLoading`: Show SkeletonGrid on initial load
- `isFetching`: Show subtle loading indicator on refetch
- `error`: Show error message with retry option

**Query Key Dependencies**:

- Query automatically refetches when input changes
- Dependencies: limit, offset, level, debouncedQuery

## 8. User Interactions

**Interaction 1: Text Search**

- User types in SearchBar
- Local state updates immediately (controlled input)
- After 250ms debounce, update URL query param
- TanStack Query detects URL change and refetches
- Show loading state (isFetching)
- Display new results or EmptyState

**Interaction 2: Level Filter Selection**

- User clicks level badge (e.g., "Beginner")
- Update URL level param via `updateFilters({ level: 'Beginner' })`
- Reset page to 1
- Query refetches with new level filter
- Update badge visual state (active styling)

**Interaction 3: Clear Search**

- User clicks clear button in SearchBar
- Reset local input value to ''
- Update URL to remove query param
- Query refetches showing all results

**Interaction 4: Pagination**

- User clicks Next/Previous button
- Update URL page param via `updateFilters({ page: newPage })`
- Query refetches with new offset
- Scroll to top of page for better UX

**Interaction 5: Navigate to Move Detail**

- User clicks MoveCard
- Navigate to `/moves/{slug}` via Link component
- TanStack Router handles navigation

**Interaction 6: Reset All Filters**

- User clicks reset button in EmptyState
- Call `resetFilters()` to clear all URL params
- Query refetches with default params (all moves)

## 9. Conditions and Validation

**SearchBar Component**:

- Trim whitespace before updating URL
- Convert empty string to undefined for API
- No minimum length enforced (user can search single character)

**LevelFilterBadges Component**:

- Only valid enum values allowed: 'Beginner' | 'Intermediate' | 'Advanced'
- 'All' selection translates to undefined in API request
- Validate on URL param parsing (invalid values fallback to 'All')

**Pagination Component**:

- Ensure `currentPage >= 1`
- Ensure `currentPage <= totalPages`
- Disable Previous button when page === 1
- Disable Next button when page === totalPages
- Calculate offset: `(page - 1) * PAGE_SIZE`
- Validate page param from URL (invalid → 1)

**API Request Validation**:

- `limit`: Always 20 (hardcoded PAGE_SIZE)
- `offset`: Calculated from page, always >= 0
- `level`: enum or undefined (validated in component)
- `query`: trimmed or undefined (validated in SearchBar)

**Data Display Validation**:

- Check if `moves` array is empty → show EmptyState
- Handle null `imageUrl` → use placeholder image
- Ensure required move fields exist before rendering

## 10. Error Handling

**API Errors**:

- **Validation Error (BAD_REQUEST)**: Should not occur with proper frontend validation. Log error and show generic message.
- **Server Error (INTERNAL_SERVER_ERROR)**: Show error message "Nie udało się załadować ruchów. Spróbuj ponownie." with retry button.
- **Network Error**: TanStack Query retries automatically (3 attempts). Show error state after exhausting retries.

**Empty Results**:

- Not an error, but show EmptyState component
- Different messages based on active filters:
  - With filters: "Nie znaleziono ruchów. Spróbuj zmienić filtry."
  - Without filters: "Brak dostępnych ruchów w katalogu."

**Invalid URL Parameters**:

- Parse and validate on component mount
- Sanitize invalid values:
  - Invalid `level` → undefined ('All')
  - Invalid `page` (< 1 or non-numeric) → 1
  - Invalid `query` → undefined
- Use validated values for API request

**Missing Data**:

- Handle null `imageUrl` gracefully (placeholder or default image)
- Handle undefined `userStatus` (only for authenticated users)

**Loading States**:

- `isLoading`: Initial data fetch, show SkeletonGrid
- `isFetching && !isLoading`: Refetch with existing data, show subtle indicator
- Prevent layout shift during loading

## 11. Implementation Steps

1. **Setup Route**: Create `/catalog` route in TanStack Router with search params validation schema.

2. **Create Custom Hooks**: Implement `useCatalogFilters` hook for URL state management and `useDebouncedValue` for search debouncing.

3. **Build CatalogView Component**: Main route component that uses hooks and orchestrates child components. Setup TanStack Query for data fetching.

4. **Implement SearchBar**: Controlled input with debouncing, clear button, and proper ARIA labels.

5. **Implement LevelFilterBadges**: Badge group with click handlers, active state styling, and Polish labels.

6. **Implement MoveCard**: Card component with image, text, level badge, and optional status indicator. Use shadcn/ui Card component.

7. **Implement MovesGrid**: Responsive CSS Grid container using Tailwind classes (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`).

8. **Implement Pagination**: Calculate total pages, render controls, handle navigation, manage disabled states.

9. **Implement EmptyState**: Conditional component with helpful message and reset action.

10. **Implement SkeletonGrid/Card**: Loading placeholders matching actual card dimensions with shimmer animation.

11. **Implement ResultsSummary**: Display count and active filter tags with remove functionality.

12. **Add Error Handling**: Wrap data fetching with error boundaries, show error messages, implement retry logic.

13. **Add Accessibility**: ARIA labels, keyboard navigation, focus management, semantic HTML, live regions for dynamic content.

14. **Style Components**: Use Tailwind for responsive design, hover states, focus indicators. Follow shadcn/ui patterns for consistency.

15. **Test Interactions**: Verify search debouncing, filter updates, pagination, URL persistence, error states, and loading states.

16. **Optimize Performance**: Configure TanStack Query stale time, implement proper memoization where needed, ensure efficient re-renders.
