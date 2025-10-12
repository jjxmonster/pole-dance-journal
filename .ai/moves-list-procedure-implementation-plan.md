# API Endpoint Implementation Plan: `moves.list`

## 1. Endpoint Overview

This document outlines the implementation plan for the `moves.list` oRPC procedure. The endpoint's purpose is to retrieve a paginated and filterable list of published pole dance moves. It supports filtering by difficulty level and a text-based search on the move's name and description.

## 2. Request Details

- **Procedure**: `moves.list`
- **Transport**: oRPC
- **Input Schema**: The procedure will accept an object with the following optional properties. Validation will be performed using Zod.

  ```typescript
  import { z } from "zod";
  import { moveLevelEnum } from "../../db/schema";

  export const MovesListInputSchema = z.object({
  	limit: z.number().int().positive().max(100).optional().default(20),
  	offset: z.number().int().nonnegative().optional().default(0),
  	level: z.enum(moveLevelEnum.enumValues).optional(),
  	query: z.string().trim().min(1).optional(),
  });
  ```

## 3. Response Details

- **Success Response**: On success, the procedure returns an object containing the list of moves and the total count of records matching the query.

  ```typescript
  import { z } from "zod";
  import { moveLevelEnum } from "../../db/schema";

  export const MoveListItemSchema = z.object({
  	id: z.string().uuid(),
  	name: z.string(),
  	description: z.string(),
  	level: z.enum(moveLevelEnum.enumValues),
  	slug: z.string(),
  	imageUrl: z.string().nullable(),
  });

  export const MovesListOutputSchema = z.object({
  	moves: z.array(MoveListItemSchema),
  	total: z.number().int().nonnegative(),
  });
  ```

- **Error Response**: In case of an error, a standard oRPC error object will be returned.
  - `BAD_REQUEST`: For input validation failures.
  - `INTERNAL_SERVER_ERROR`: For unexpected database or server-side errors.

## 4. Data Flow

1.  A client invokes the `moves.list` oRPC procedure with filter, search, and pagination parameters.
2.  The oRPC router receives the request and validates the input using the `MovesListInputSchema`.
3.  If validation succeeds, the router calls the `listPublishedMoves` function located in `src/data-access/moves.data-access.ts`.
4.  The `listPublishedMoves` function constructs and executes two Drizzle ORM queries against the `moves` table:
    a. A `count` query to get the `total` number of records matching the filter criteria (`level`, `query`, and published status).
    b. A `select` query to retrieve the paginated list of moves, applying all filters and `limit`/`offset` parameters. The results will be ordered by `published_at` in descending order.
5.  The data-access function returns an object `{ moves, total }`.
6.  The oRPC procedure sends this object back to the client as the success response.

## 5. Security Considerations

- **SQL Injection**: Prevented by the exclusive use of Drizzle ORM's query builder, which parameterizes all user-provided input.
- **Denial of Service**: The `limit` parameter is capped at `100` via Zod validation to prevent queries that could overload the database.
- **Data Isolation**: The data access layer will enforce a non-negotiable `WHERE` clause to ensure only moves with a non-null `published_at` and a null `deleted_at` field are ever returned.

## 6. Error Handling

- **Input Validation**: Handled declaratively by the Zod schema in the oRPC procedure definition. The framework will automatically reject invalid requests with a `BAD_REQUEST` error.
- **Server Errors**: Any exceptions thrown from the data-access layer (e.g., database connection errors) will be caught within the oRPC procedure, logged to the console via `console.error`, and re-thrown as a generic oRPC `INTERNAL_SERVER_ERROR` to avoid leaking implementation details.

## 7. Performance Considerations

- **Database Indexing**: The text search on `moves.name` and `moves.description` using `ilike` may be slow on a large dataset. A future optimization is to implement a full-text search index (e.g., `tsvector`) in PostgreSQL for these columns.
- **Query Count**: The implementation requires two separate database queries (one for the count, one for the data) to provide accurate pagination. This is an acceptable trade-off for functionality.

## 8. Implementation Steps

1.  **Update Schema**: Add the `MovesListInputSchema` and `MovesListOutputSchema` to `src/orpc/schema.ts`.
2.  **Create Data-Access Layer**: Create a new file `src/data-access/moves.data-access.ts`.
3.  **Implement Query Logic**: Inside the new data-access file, implement the `listPublishedMoves` function. This function will accept the validated input and use Drizzle to perform the two database queries (count and select). It will dynamically build the `WHERE` clause based on the provided `level` and `query` parameters.
4.  **Create oRPC Router**: Create a new file `src/orpc/router/moves.ts`.
5.  **Define Procedure**: In the new router file, define a new `t.router` for moves and add the `list` public procedure. This procedure will use the Zod schemas for input/output and will call the `listPublishedMoves` data-access function.
6.  **Register Router**: Import and register the new `movesRouter` in the main App Router file located at `src/orpc/router/index.ts`.
7.  **Testing**: Create integration tests to verify the endpoint's functionality, including filtering, searching, pagination, and error handling.
