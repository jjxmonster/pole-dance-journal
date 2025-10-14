# API Endpoint Implementation Plan: `userMoveStatuses.set`

## 1. Endpoint Overview

This oRPC endpoint creates or updates (upserts) the status and private note for a specific move for the authenticated user. It handles the "autosave" logic for notes and provides a simple way for users to track their progress on different pole dance moves.

## 2. Request Details

- Method: oRPC procedure call
- Endpoint: `userMoveStatuses.set`
- Authentication: Required
- Parameters:
  - Required:
    - `moveId`: UUID string of the move
    - `status`: Enum value ('WANT', 'ALMOST', 'DONE')
  - Optional:
    - `note`: String (max 2000 characters)

## 3. Used Types

```typescript
// Schema definitions
export const UserMoveStatusSetInputSchema = z.object({
	moveId: z.string().uuid(),
	status: z.enum(["WANT", "ALMOST", "DONE"]),
	note: z.string().max(2000).optional(),
});

export const UserMoveStatusSetOutputSchema = z.object({
	success: z.literal(true),
	updatedAt: z.date(),
});
```

## 4. Response Details

- Success Response:

  ```json
  {
  	"success": true,
  	"updatedAt": "2025-10-14T12:34:56.789Z" // ISO date string of when the record was updated
  }
  ```

- Error Responses:
  - `UNAUTHORIZED`: User is not authenticated
  - `BAD_REQUEST`: Input validation failed (invalid moveId, status, or note too long)
  - `NOT_FOUND`: Move with the provided moveId doesn't exist

## 5. Data Flow

1. Validate the incoming request data against the schema
2. Check if the user is authenticated
3. Verify the move exists
4. Upsert the user's move status record:
   - If a record exists for this user and move, update it
   - If no record exists, create a new one
5. Return success response with the updated timestamp

## 6. Security Considerations

- **Authentication**: Ensure the user is authenticated before processing the request
- **Authorization**: Only allow users to update their own move statuses
- **Input Validation**: Validate all inputs according to the schema
- **Data Sanitization**: Sanitize the note field to prevent XSS attacks
- **Rate Limiting**: Consider implementing rate limiting to prevent abuse

## 7. Error Handling

| Error Scenario         | Status Code           | Error Message                     |
| ---------------------- | --------------------- | --------------------------------- |
| User not authenticated | UNAUTHORIZED          | "Authentication required"         |
| Invalid input data     | BAD_REQUEST           | "Invalid input data" with details |
| Move not found         | NOT_FOUND             | "Move not found"                  |
| Database error         | INTERNAL_SERVER_ERROR | "Failed to update move status"    |

## 8. Performance Considerations

- Use an upsert operation to minimize database queries
- Consider adding an index on the `user_id` and `move_id` columns if query performance becomes an issue
- Implement caching for frequently accessed move statuses if needed

## 9. Implementation Steps

1. **Update Schema Definitions**
   - Add the new schemas to `src/orpc/schema.ts`:
     - `UserMoveStatusSetInputSchema`
     - `UserMoveStatusSetOutputSchema`

2. **Create Data Access Function**
   - Create a new function in `src/data-access/user-move-statuses.ts`:
     ```typescript
     export async function upsertUserMoveStatus({
     	userId,
     	moveId,
     	status,
     	note,
     }: {
     	userId: string;
     	moveId: string;
     	status: "WANT" | "ALMOST" | "DONE";
     	note?: string;
     }) {
     	// Implementation here
     }
     ```

3. **Implement the oRPC Handler**
   - Create a new file `src/orpc/router/user-move-statuses.ts`:

     ```typescript
     import { os } from "@orpc/server";
     import { upsertUserMoveStatus } from "../../data-access/user-move-statuses";
     import {
     	UserMoveStatusSetInputSchema,
     	UserMoveStatusSetOutputSchema,
     } from "../schema";

     export const set = os
     	.input(UserMoveStatusSetInputSchema)
     	.output(UserMoveStatusSetOutputSchema)
     	.handler(async ({ input, ctx }) => {
     		// Implementation here
     	});
     ```

4. **Register the Handler in the Router**
   - Update `src/orpc/router/index.ts` to include the new handler:

     ```typescript
     import { set } from "./user-move-statuses";

     export default {
     	moves: {
     		list: listMoves,
     		getBySlug,
     	},
     	userMoveStatuses: {
     		set,
     	},
     };
     ```

5. **Implement Authentication Check**
   - Add authentication check in the handler:
     ```typescript
     if (!ctx.user) {
     	throw new Error("UNAUTHORIZED");
     }
     ```

6. **Implement Move Existence Check**
   - Add check to verify the move exists:
     ```typescript
     const moveExists = await checkMoveExists(input.moveId);
     if (!moveExists) {
     	throw new Error("NOT_FOUND");
     }
     ```

7. **Implement the Upsert Logic**
   - Use Drizzle ORM to upsert the record:
     ```typescript
     const result = await upsertUserMoveStatus({
     	userId: ctx.user.id,
     	moveId: input.moveId,
     	status: input.status,
     	note: input.note,
     });
     ```

8. **Return the Response**
   - Format and return the response:
     ```typescript
     return {
     	success: true,
     	updatedAt: result.updatedAt,
     };
     ```

9. **Add Tests**
   - Create unit tests for the new endpoint
   - Test authentication requirements
   - Test input validation
   - Test successful upsert operations

10. **Update Documentation**
    - Update API documentation to include the new endpoint
    - Include examples of request and response payloads
