# User Move Statuses API

This document describes the API endpoints for managing user move statuses.

## Set User Move Status

Creates or updates (upserts) the status and private note for a specific move for the authenticated user.

### Endpoint

```
userMoveStatuses.set
```

### Authentication

Authentication is required for this endpoint. The user must be logged in.

### Request Parameters

| Parameter | Type          | Required | Description                                                           |
| --------- | ------------- | -------- | --------------------------------------------------------------------- |
| moveId    | string (UUID) | Yes      | The UUID of the move                                                  |
| status    | enum          | Yes      | The status of the move for the user. One of: "WANT", "ALMOST", "DONE" |
| note      | string        | No       | Optional personal note about the move (max 2000 characters)           |

### Example Request

```typescript
import { client } from "@/orpc/client";

// Set status for a move
const result = await client.userMoveStatuses.set({
	moveId: "123e4567-e89b-12d3-a456-426614174000",
	status: "WANT",
	note: "I want to learn this move next week",
});
```

### Response

| Field     | Type    | Description                            |
| --------- | ------- | -------------------------------------- |
| success   | boolean | Always true if the operation succeeded |
| updatedAt | Date    | Timestamp when the record was updated  |

### Example Response

```json
{
	"success": true,
	"updatedAt": "2025-10-14T12:34:56.789Z"
}
```

### Error Responses

| Error                 | Description                                                         |
| --------------------- | ------------------------------------------------------------------- |
| UNAUTHORIZED          | User is not authenticated                                           |
| BAD_REQUEST           | Invalid input data (e.g., invalid moveId, status, or note too long) |
| NOT_FOUND             | Move with the provided moveId doesn't exist                         |
| INTERNAL_SERVER_ERROR | An unexpected error occurred while processing the request           |

### Implementation Notes

- The endpoint uses an upsert operation to handle both creating new records and updating existing ones
- If a record already exists for the user and move, it will be updated
- If no record exists, a new one will be created
- The note field is optional and can be omitted
