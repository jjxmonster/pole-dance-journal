# API Endpoint Implementation Plan: `moves.getBySlug`

## 1. Endpoint Overview

This oRPC procedure retrieves the complete details of a single published pole dance move by its URL-friendly slug identifier. The response includes the move's metadata (name, description, level, image) and all associated step-by-step instructions, ordered sequentially. This endpoint serves public data and requires no authentication.

**Purpose**: Enable users to view detailed information about a specific pole dance move, including all steps required to perform it.

**Key Requirements**:

- Only return published moves (`published_at IS NOT NULL`)
- Exclude soft-deleted moves (`deleted_at IS NULL`)
- Include all steps ordered by `order_index`
- Return `NOT_FOUND` error if move doesn't exist or isn't published

## 2. Request Details

- **oRPC Procedure**: `moves.getBySlug`
- **Method Type**: Query (read operation)
- **URL Pattern**: Via oRPC client: `client.moves.getBySlug.query({ slug: "..." })`

### Parameters

**Required:**

- `slug` (string): URL-friendly unique identifier for the move
  - Must be non-empty string
  - Trimmed of whitespace
  - Case-insensitive matching

**Optional:**

- None

### Input Schema (Zod)

```typescript
export const MoveGetBySlugInputSchema = z.object({
	slug: z.string().trim().min(1, "Slug is required"),
});
```

## 3. Used Types

### Input Type

```typescript
type MoveGetBySlugInput = z.infer<typeof MoveGetBySlugInputSchema>;
// { slug: string }
```

### Output Types

```typescript
export const MoveStepSchema = z.object({
	orderIndex: z.number().int().positive(),
	title: z.string(),
	description: z.string(),
});

export const MoveDetailSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	description: z.string(),
	level: z.enum(moveLevelEnum.enumValues),
	slug: z.string(),
	imageUrl: z.string().nullable(),
	steps: z.array(MoveStepSchema),
});

export const MoveGetBySlugOutputSchema = MoveDetailSchema;
```

### Data Access Layer Type

```typescript
type MoveWithSteps = {
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
} | null;
```

## 4. Response Details

### Success Response (200)

```typescript
{
  id: "123e4567-e89b-12d3-a456-426614174000",
  name: "Butterfly",
  description: "A graceful move that requires core strength...",
  level: "Intermediate",
  slug: "butterfly",
  imageUrl: "https://example.com/images/butterfly.jpg",
  steps: [
    {
      orderIndex: 1,
      title: "Grip the pole",
      description: "Place hands in split grip position..."
    },
    {
      orderIndex: 2,
      title: "Hook your leg",
      description: "Hook your inside leg around the pole..."
    }
  ]
}
```

### Error Responses

**NOT_FOUND (404)**

- Move with given slug doesn't exist
- Move exists but is not published (`published_at IS NULL`)
- Move is soft-deleted (`deleted_at IS NOT NULL`)

```typescript
{
  code: "NOT_FOUND",
  message: "Move not found"
}
```

**BAD_REQUEST (400)**

- Empty or invalid slug format

```typescript
{
  code: "BAD_REQUEST",
  message: "Slug is required"
}
```

**INTERNAL_SERVER_ERROR (500)**

- Database connection errors
- Unexpected server errors

```typescript
{
  code: "INTERNAL_SERVER_ERROR",
  message: "An unexpected error occurred"
}
```

## 5. Data Flow

```
1. Client Request
   └─> oRPC Client: client.moves.getBySlug.query({ slug: "butterfly" })

2. Input Validation
   └─> Zod Schema validates input (MoveGetBySlugInputSchema)
   └─> Trims whitespace, checks non-empty string

3. Handler Invocation
   └─> moves.getBySlug.handler({ input })
   └─> Calls getMoveBySlug(input.slug)

4. Data Access Layer (getMoveBySlug)
   └─> Query database with Drizzle ORM
   └─> Use relational query API: db.query.moves.findFirst()
   └─> Conditions:
       - slug matches (case-insensitive using sql`lower(slug) = lower(${slug})`)
       - published_at IS NOT NULL
       - deleted_at IS NULL
   └─> Include related steps with orderBy(asc(steps.orderIndex))

5. Result Processing
   ├─> If move found:
   │   └─> Return move with steps
   ├─> If move not found:
   │   └─> Return null

6. Error Handling in Handler
   ├─> If null returned:
   │   └─> Throw oRPC ORPCError with code: "NOT_FOUND"
   ├─> If database error:
   │   └─> Log error and throw INTERNAL_SERVER_ERROR

7. Output Validation
   └─> oRPC validates response against MoveGetBySlugOutputSchema

8. Response to Client
   └─> Return formatted move data or error
```

## 6. Security Considerations

### 1. SQL Injection Prevention

- **Mitigation**: Use Drizzle ORM's parameterized queries
- Never concatenate user input directly into SQL
- Drizzle automatically escapes values

### 2. Information Disclosure

- **Risk**: Revealing unpublished or deleted moves
- **Mitigation**:
  - Enforce `published_at IS NOT NULL` in WHERE clause
  - Enforce `deleted_at IS NULL` in WHERE clause
  - Return same error for non-existent and unpublished moves

### 3. Enumeration Attacks

- **Risk**: Attacker could enumerate all move slugs
- **Mitigation**:
  - Use generic error message "Move not found"
  - Don't differentiate between "doesn't exist" and "not published"
  - Consider rate limiting at infrastructure level

### 4. Input Validation

- **Validation Rules**:
  - Slug must be non-empty string
  - Trim whitespace before processing
  - Maximum length validation (reasonable limit like 200 chars)
  - Optional: Regex validation for allowed characters

### 5. No Authentication Required

- This endpoint serves public data
- No user context or permissions needed
- Monitor for abuse via rate limiting

### 6. Data Exposure

- Only expose fields in the output schema
- Don't leak internal IDs or timestamps
- Image URLs should be validated/sanitized if user-uploaded

## 7. Error Handling

### Error Hierarchy

```typescript
try {
	// Query database
	const move = await getMoveBySlug(input.slug);

	// Check if move exists
	if (!move) {
		throw new ORPCError({
			code: "NOT_FOUND",
			message: "Move not found",
		});
	}

	return move;
} catch (error) {
	// Handle known errors
	if (error instanceof ORPCError) {
		throw error;
	}

	// Log unexpected errors
	console.error("Error fetching move by slug:", error);

	// Throw generic error
	throw new ORPCError({
		code: "INTERNAL_SERVER_ERROR",
		message: "An unexpected error occurred while fetching the move",
	});
}
```

### Specific Error Scenarios

| Scenario         | Error Code              | Status | Message               | Action                              |
| ---------------- | ----------------------- | ------ | --------------------- | ----------------------------------- |
| Empty slug       | `BAD_REQUEST`           | 400    | "Slug is required"    | Caught by Zod validation            |
| Move not found   | `NOT_FOUND`             | 404    | "Move not found"      | Check for null result               |
| Unpublished move | `NOT_FOUND`             | 404    | "Move not found"      | Filtered in WHERE clause            |
| Deleted move     | `NOT_FOUND`             | 404    | "Move not found"      | Filtered in WHERE clause            |
| Database error   | `INTERNAL_SERVER_ERROR` | 500    | Generic error message | Log full error, return safe message |
| Timeout          | `INTERNAL_SERVER_ERROR` | 500    | "Request timeout"     | Handle at infrastructure level      |

### Logging Strategy

```typescript
// Log all database errors for monitoring
if (error instanceof DatabaseError) {
	console.error("Database error in getMoveBySlug:", {
		slug: input.slug,
		error: error.message,
		stack: error.stack,
		timestamp: new Date().toISOString(),
	});
}

// Log 404s for analytics (optional)
if (!move) {
	console.info("Move not found:", {
		slug: input.slug,
		timestamp: new Date().toISOString(),
	});
}
```

## 8. Performance Considerations

### Database Query Optimization

1. **Use Relational Query API**
   - Fetch move and steps in a single query
   - Avoid N+1 query problem
   - Use `db.query.moves.findFirst({ with: { steps: true } })`

2. **Indexes**
   - Slug already has unique index: `idx_moves_slug_unique`
   - This ensures fast lookup by slug
   - Composite index on (slug, published_at, deleted_at) could further optimize

3. **Selective Field Loading**
   - Only select needed fields in the query
   - Use Drizzle's `.select()` with specific columns if needed
   - Steps table: only select orderIndex, title, description

4. **Ordering**
   - Order steps by `order_index` in the database query
   - Avoid sorting in application code
   - Use: `orderBy: [asc(steps.orderIndex)]`

### Caching Strategy (Future Enhancement)

```typescript
// Example with unstable_cache from Next.js/TanStack
import { unstable_cache } from "@tanstack/react-router";

const getCachedMove = unstable_cache(
	async (slug: string) => await getMoveBySlug(slug),
	["move-by-slug"],
	{
		revalidate: 3600, // 1 hour
		tags: [`move-${slug}`],
	}
);
```

### Expected Performance

- **Database Query**: < 50ms (with proper indexing)
- **Total Response Time**: < 100ms (including network)
- **Concurrent Requests**: Should handle 100+ req/s with proper connection pooling

### Monitoring Metrics

- Query execution time
- Cache hit/miss ratio (if caching implemented)
- 404 rate (for monitoring broken links)
- Error rate
- Request volume per move (identify popular content)

## 9. Implementation Steps

### Step 1: Define Schemas in `src/orpc/schema.ts`

Add the following schemas to the existing file:

```typescript
// Input schema
export const MoveGetBySlugInputSchema = z.object({
	slug: z.string().trim().min(1, "Slug is required"),
});

// Step schema (reusable)
export const MoveStepSchema = z.object({
	orderIndex: z.number().int().positive(),
	title: z.string(),
	description: z.string(),
});

// Output schema
export const MoveDetailSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	description: z.string(),
	level: z.enum(moveLevelEnum.enumValues),
	slug: z.string(),
	imageUrl: z.string().nullable(),
	steps: z.array(MoveStepSchema),
});

export const MoveGetBySlugOutputSchema = MoveDetailSchema;
```

### Step 2: Create Data Access Function in `src/data-access/moves.ts`

Add the following function to the existing file:

```typescript
import { asc, and, eq, isNotNull, isNull, sql } from "drizzle-orm";
import { db } from "../db";
import { moves, steps } from "../db/schema";

export async function getMoveBySlug(slug: string) {
	const move = await db.query.moves.findFirst({
		where: and(
			eq(sql`lower(${moves.slug})`, slug.toLowerCase()),
			isNotNull(moves.publishedAt),
			isNull(moves.deletedAt)
		),
		columns: {
			id: true,
			name: true,
			description: true,
			level: true,
			slug: true,
			imageUrl: true,
		},
		with: {
			steps: {
				columns: {
					orderIndex: true,
					title: true,
					description: true,
				},
				orderBy: [asc(steps.orderIndex)],
			},
		},
	});

	return move ?? null;
}
```

**Note**: This requires setting up Drizzle relations. Add to `src/db/schema.ts`:

```typescript
import { relations } from "drizzle-orm";

export const movesRelations = relations(moves, ({ many }) => ({
	steps: many(steps),
}));

export const stepsRelations = relations(steps, ({ one }) => ({
	move: one(moves, {
		fields: [steps.moveId],
		references: [moves.id],
	}),
}));
```

### Step 3: Create oRPC Procedure in `src/orpc/router/moves.ts`

Add the new procedure to the existing file:

```typescript
import { ORPCError, os } from "@orpc/server";
import { getMoveBySlug, listPublishedMoves } from "../../data-access/moves";
import {
	MoveGetBySlugInputSchema,
	MoveGetBySlugOutputSchema,
	MovesListInputSchema,
	MovesListOutputSchema,
} from "../schema";

// Existing listMoves procedure...

export const getBySlug = os
	.input(MoveGetBySlugInputSchema)
	.output(MoveGetBySlugOutputSchema)
	.handler(async ({ input }) => {
		const move = await getMoveBySlug(input.slug);

		if (!move) {
			throw new ORPCError({
				code: "NOT_FOUND",
				message: "Move not found",
			});
		}

		return move;
	});
```

### Step 4: Register Procedure in Router `src/orpc/router/index.ts`

Update the router to include the new procedure:

```typescript
import { getBySlug, listMoves } from "./moves";

export default {
	moves: {
		list: listMoves,
		getBySlug: getBySlug,
	},
};
```

### Step 5: Add Relations to Database Schema (if not exists)

Ensure `src/db/schema.ts` includes Drizzle relations:

```typescript
import { relations } from "drizzle-orm";

export const movesRelations = relations(moves, ({ many }) => ({
	steps: many(steps),
}));

export const stepsRelations = relations(steps, ({ one }) => ({
	move: one(moves, {
		fields: [steps.moveId],
		references: [moves.id],
	}),
}));
```

### Step 6: Test the Implementation

Create test scenarios to verify:

1. **Happy Path**: Fetch a published move with steps
2. **Not Found**: Request non-existent slug
3. **Unpublished Move**: Request move with `published_at = NULL`
4. **Deleted Move**: Request move with `deleted_at != NULL`
5. **Empty Slug**: Send empty string (should be caught by validation)
6. **Case Insensitivity**: Test with different case variations

### Step 7: Manual Testing with oRPC Client

```typescript
// In a React component or test file
import { client } from "@/orpc/client";

// Test successful retrieval
const result = await client.moves.getBySlug.query({
	slug: "butterfly",
});

console.log(result.name); // "Butterfly"
console.log(result.steps.length); // Number of steps
console.log(result.steps[0].orderIndex); // 1

// Test error handling
try {
	await client.moves.getBySlug.query({
		slug: "non-existent",
	});
} catch (error) {
	console.log(error.code); // "NOT_FOUND"
	console.log(error.message); // "Move not found"
}
```

### Step 8: Error Handling Verification

Verify error scenarios:

```typescript
// Test empty slug validation
try {
	await client.moves.getBySlug.query({ slug: "" });
} catch (error) {
	// Should throw BAD_REQUEST with "Slug is required"
}

// Test whitespace handling
const result = await client.moves.getBySlug.query({
	slug: "  butterfly  ",
});
// Should work due to trim()

// Test case insensitivity
const result1 = await client.moves.getBySlug.query({
	slug: "butterfly",
});
const result2 = await client.moves.getBySlug.query({
	slug: "BUTTERFLY",
});
// Both should return the same move
```

### Step 9: Performance Monitoring

Add logging for monitoring:

```typescript
export const getBySlug = os
	.input(MoveGetBySlugInputSchema)
	.output(MoveGetBySlugOutputSchema)
	.handler(async ({ input }) => {
		const startTime = Date.now();

		try {
			const move = await getMoveBySlug(input.slug);

			const duration = Date.now() - startTime;
			console.info("getMoveBySlug completed", {
				slug: input.slug,
				found: !!move,
				duration,
			});

			if (!move) {
				throw new ORPCError({
					code: "NOT_FOUND",
					message: "Move not found",
				});
			}

			return move;
		} catch (error) {
			const duration = Date.now() - startTime;
			console.error("getMoveBySlug error", {
				slug: input.slug,
				duration,
				error: error instanceof Error ? error.message : "Unknown error",
			});
			throw error;
		}
	});
```

### Step 10: Documentation

Update API documentation to include:

- Endpoint description and usage
- Input/output examples
- Error scenarios
- Performance characteristics
- Rate limiting guidelines (if applicable)

---

## Implementation Checklist

- [ ] Define input/output schemas in `src/orpc/schema.ts`
- [ ] Add Drizzle relations to `src/db/schema.ts`
- [ ] Implement `getMoveBySlug()` in `src/data-access/moves.ts`
- [ ] Create `getBySlug` procedure in `src/orpc/router/moves.ts`
- [ ] Register procedure in `src/orpc/router/index.ts`
- [ ] Test happy path (published move with steps)
- [ ] Test error scenarios (not found, unpublished, deleted)
- [ ] Test input validation (empty slug, whitespace)
- [ ] Test case insensitivity
- [ ] Verify performance (query execution time)
- [ ] Add logging for monitoring
- [ ] Update documentation

## Additional Notes

### Future Enhancements

1. **Caching**: Implement caching layer for frequently accessed moves
2. **Rate Limiting**: Add rate limiting to prevent abuse
3. **Analytics**: Track which moves are most viewed
4. **Image Optimization**: Add image transformation/optimization
5. **Related Moves**: Include suggestions for related moves
6. **User Progress**: Include user's progress on this move (requires auth)

### Dependencies

- `@orpc/server`: For creating oRPC procedures
- `drizzle-orm`: For database queries
- `zod`: For schema validation
- Database must have relations configured for moves and steps

### Breaking Changes

None. This is a new endpoint addition.
