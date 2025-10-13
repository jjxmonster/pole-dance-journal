# Moves List API

## Overview

The `moves.list` oRPC procedure provides a paginated and filterable list of published pole dance moves. It supports filtering by difficulty level and text-based search on move names and descriptions.

## Endpoint Details

- **Procedure**: `moves.list`
- **Transport**: oRPC
- **URL**: `POST /api/rpc/moves.list`
- **Authentication**: Public (no authentication required)

## Request Parameters

All parameters are optional and validated using Zod schemas.

| Parameter | Type     | Required | Default | Constraints                                      | Description                                           |
| --------- | -------- | -------- | ------- | ------------------------------------------------ | ----------------------------------------------------- |
| `limit`   | `number` | No       | `20`    | 1-100                                            | Number of moves to return per page                    |
| `offset`  | `number` | No       | `0`     | ≥0                                               | Number of moves to skip for pagination                |
| `level`   | `string` | No       | -       | `"Beginner"` \| `"Intermediate"` \| `"Advanced"` | Filter moves by difficulty level                      |
| `query`   | `string` | No       | -       | min 1 char (trimmed)                             | Search text for filtering by move name or description |

## Response Format

```typescript
{
	moves: Array<{
		id: string; // UUID
		name: string; // Move name
		description: string; // Move description
		level: "Beginner" | "Intermediate" | "Advanced";
		slug: string; // URL-friendly identifier
		imageUrl: string | null; // Optional image URL
	}>;
	total: number; // Total count of moves matching filters
}
```

## Usage Examples

### Basic Usage (TypeScript Client)

```typescript
import { client } from "@/orpc/client";

// Get first 20 moves
const result = await client.moves.list({
	limit: 20,
	offset: 0,
});

console.log(result.moves); // Array of moves
console.log(result.total); // Total count
```

### Filtering by Difficulty Level

```typescript
// Get only beginner moves
const beginnerMoves = await client.moves.list({
	level: "Beginner",
});

// Get intermediate moves with pagination
const intermediateMoves = await client.moves.list({
	level: "Intermediate",
	limit: 10,
	offset: 0,
});
```

### Text Search

```typescript
// Search moves by name or description
const searchResults = await client.moves.list({
	query: "handstand",
});

// Search is case-insensitive
const results = await client.moves.list({
	query: "HANDSTAND", // Same as 'handstand'
});
```

### Combined Filters

```typescript
// Search for advanced moves containing "invert"
const advancedInverts = await client.moves.list({
	level: "Advanced",
	query: "invert",
	limit: 50,
});
```

### Pagination Example

```typescript
// Implement infinite scroll or pagination
const PAGE_SIZE = 20;

async function getPage(pageNumber: number) {
	return await client.moves.list({
		limit: PAGE_SIZE,
		offset: pageNumber * PAGE_SIZE,
	});
}

// Get first page
const page1 = await getPage(0);
// Get second page
const page2 = await getPage(1);

// Calculate total pages
const totalPages = Math.ceil(page1.total / PAGE_SIZE);
```

## Usage with TanStack Query

### Basic Query Hook

```typescript
import { orpc } from '@/orpc/client';

function MovesList() {
  const { data, isLoading, error } = useQuery(orpc.moves.list.queryOptions({
    input: {
      limit: 20,
      offset: 0,
    }
  }));

  if (isLoading) return <div>Loading moves...</div>;
  if (error) return <div>Error loading moves</div>;

  return (
    <div>
      <p>Total moves: {data.total}</p>
      {data.moves.map(move => (
        <div key={move.id}>
          <h3>{move.name}</h3>
          <p>{move.description}</p>
          <span>Level: {move.level}</span>
        </div>
      ))}
    </div>
  );
}
```

### Filtered Query

```typescript
function BeginnerMovesList() {
	const { data, isLoading, error } = useQuery(
		orpc.moves.list.queryOptions({
			input: {
				level: "Beginner",
				limit: 50,
			},
		})
	);

	// Component implementation...
}
```

### Search with Debouncing

```typescript
import { useState, useEffect } from 'react';
import { orpc } from '@/orpc/client';

function MovesSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, error } = useQuery(orpc.moves.list.queryOptions({
    input: {
      query: debouncedQuery || undefined,
      limit: 20,
    },
    enabled: debouncedQuery.length > 0,
  }));

  return (
    <div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search moves..."
      />
      {isLoading && <div>Searching...</div>}
      {data?.moves.map(move => (
        <div key={move.id}>{move.name}</div>
      ))}
    </div>
  );
}
```

### Infinite Scroll Example

```typescript
import { orpc } from '@/orpc/client';

function InfiniteMovesList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(orpc.moves.list.infiniteOptions({
    input: ({ pageParam = 0 }) => ({
      limit: 20,
      offset: pageParam,
    }),
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.length * 20;
      return loadedCount < lastPage.total ? loadedCount : undefined;
    },
  }))

  return (
    <div>
      {data?.pages.map((page, i) => (
        <div key={i}>
          {page.moves.map(move => (
            <div key={move.id}>{move.name}</div>
          ))}
        </div>
      ))}

      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
```

## Error Handling

### Validation Errors

If invalid parameters are provided, the endpoint returns a `BAD_REQUEST` error:

```typescript
try {
	await client.moves.list({
		limit: 150, // Exceeds max of 100
	});
} catch (error) {
	// Error: BAD_REQUEST - validation failed
}
```

### Server Errors

Database or unexpected server errors return `INTERNAL_SERVER_ERROR`:

```typescript
try {
	const result = await client.moves.list({});
} catch (error) {
	if (error.code === "INTERNAL_SERVER_ERROR") {
		// Handle server error
		console.error("Server error occurred");
	}
}
```

## Data Filtering Rules

The endpoint enforces the following data isolation rules:

1. **Published Only**: Only moves with `published_at` IS NOT NULL are returned
2. **Non-Deleted Only**: Only moves with `deleted_at` IS NULL are returned
3. **Text Search**: Search matches against both `name` and `description` fields (case-insensitive)
4. **Ordering**: Results are ordered by `published_at` in descending order (newest first)

## Performance Considerations

### Pagination

Always use pagination for better performance:

```typescript
// ✅ Good: Use pagination
const moves = await client.moves.list({ limit: 20 });

// ❌ Avoid: Requesting too many results at once
const moves = await client.moves.list({ limit: 100 });
```

### Text Search Performance

- Text search uses `ILIKE` pattern matching
- For large datasets, consider:
  - Debouncing user input (minimum 2-3 characters)
  - Showing a limited number of results
  - Adding a full-text search index in the future

### Caching with TanStack Query

```typescript
// Configure stale time to reduce unnecessary requests
const { data } = useQuery(
	orpc.moves.list.queryOptions({
		input: { limit: 20 },
		staleTime: 5 * 60 * 1000, // 5 minutes
	})
);
```

## Implementation Details

### Database Schema

The endpoint queries the `moves` table with the following relevant columns:

- `id` (uuid, primary key)
- `name` (text, indexed for uniqueness)
- `description` (text)
- `level` (enum: Beginner/Intermediate/Advanced)
- `slug` (text, unique index)
- `image_url` (text, nullable)
- `published_at` (timestamp, nullable)
- `deleted_at` (timestamp, nullable)

### Query Optimization

The implementation uses:

- **Parallel Queries**: Count and data queries run in parallel using `Promise.all()`
- **Selective Fields**: Only necessary columns are selected
- **Indexed Filters**: Where possible, filters use indexed columns

### Security Measures

- **SQL Injection**: Prevented through Drizzle ORM's parameterized queries
- **DoS Protection**: Maximum limit of 100 enforced at validation layer
- **Data Isolation**: Published and non-deleted filters are non-negotiable

## Related Files

- Schema: `src/orpc/schema.ts`
- Router: `src/orpc/router/moves.ts`
- Data Access: `src/data-access/moves.ts`
- Database Schema: `src/db/schema.ts`
