# oRPC API Plan

This document outlines the oRPC API for the Pole Journal application, designed based on the project's database schema, PRD, and tech stack.

## 1. Resources

- **`moves`**: Represents the public catalog of pole dance moves.
- **`userMoveStatuses`**: Manages the relationship between a user and a move, including their progress status and private notes.
- **`admin`**: A dedicated router for all administrative procedures, ensuring clear separation and security for privileged operations.

## 2. Procedures

### 2.1. Moves

#### `moves.list`

- **Description**: Retrieves a paginated list of published moves. Supports filtering by difficulty level and a text search across the move's name and description.
- **Input Schema**:
  ```typescript
  {
    limit: number().optional().default(20),
    offset: number().optional().default(0),
    level: enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
    query: string().optional(),
  }
  ```
- **Output Schema**:
  ```typescript
  {
    moves: [
      {
        id: string(),
        name: string(),
        description: string(),
        level: enum(['Beginner', 'Intermediate', 'Advanced']),
        slug: string(),
        imageUrl: string().nullable(),
      }
    ],
    total: number(),
  }
  ```
- **Errors**: None.

#### `moves.getBySlug`

- **Description**: Retrieves the full details of a single published move, including its steps.
- **Input Schema**:
  ```typescript
  {
    slug: string(),
  }
  ```
- **Output Schema**:
  ```typescript
  {
    id: string(),
    name: string(),
    description: string(),
    level: enum(['Beginner', 'Intermediate', 'Advanced']),
    slug: string(),
    imageUrl: string().nullable(),
    steps: [
      {
        orderIndex: number(),
        title: string(),
        description: string(),
      }
    ]
  }
  ```
- **Errors**: `NOT_FOUND` if no published move with the given slug exists.

#### `moves.getForUser` (Authenticated)

- **Description**: Retrieves a list of all moves for which the authenticated user has set a status or written a note. Supports filtering by difficulty level.
- **Input Schema**:
  ```typescript
  {
    level: enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
  }
  ```
- **Output Schema**:
  ```typescript
  {
    moves: [
      {
        id: string(),
        name: string(),
        level: enum(['Beginner', 'Intermediate', 'Advanced']),
        slug: string(),
        imageUrl: string().nullable(),
        status: enum(['WANT', 'ALMOST', 'DONE']),
        note: string().nullable(),
        isDeleted: boolean(), // True if the move has been soft-deleted by an admin
      }
    ]
  }
  ```
- **Errors**: `UNAUTHORIZED` if the user is not authenticated.

### 2.2. User Move Statuses

#### `userMoveStatuses.set` (Authenticated)

- **Description**: Creates or updates (upserts) the status and private note for a specific move for the authenticated user. This single procedure handles the "autosave" logic for notes.
- **Input Schema**:
  ```typescript
  {
    moveId: string(),
    status: enum(['WANT', 'ALMOST', 'DONE']),
    note: string().max(2000).optional(),
  }
  ```
- **Output Schema**:
  ```typescript
  {
    success: true,
    updatedAt: date(),
  }
  ```
- **Errors**: `UNAUTHORIZED` if the user is not authenticated, `BAD_REQUEST` on validation failure.

### 2.3. Admin

All procedures under the `admin` router require administrator privileges.

#### `admin.moves.list` (Admin-only)

- **Description**: Retrieves a paginated list of all moves, including unpublished and soft-deleted ones. Supports filtering by level and publication status.
- **Input Schema**:
  ```typescript
  {
    limit: number().optional().default(20),
    offset: number().optional().default(0),
    level: enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
    status: enum(['published', 'unpublished', 'deleted']).optional(),
  }
  ```
- **Output Schema**:
  ```typescript
  {
    moves: [
      {
        id: string(),
        name: string(),
        level: enum(['Beginner', 'Intermediate', 'Advanced']),
        publishedAt: date().nullable(),
        deletedAt: date().nullable(),
        updatedAt: date(),
      }
    ],
    total: number(),
  }
  ```
- **Errors**: `UNAUTHORIZED` if the user is not an admin.

#### `admin.moves.create` (Admin-only)

- **Description**: Creates a new move along with its associated steps.
- **Input Schema**:
  ```typescript
  {
    name: string().min(3).max(100),
    description: string().min(10).max(500),
    level: enum(['Beginner', 'Intermediate', 'Advanced']),
    steps: array(
      object({
        title: string().min(3).max(150),
        description: string().min(10).max(150),
      })
    ).min(2).max(15),
  }
  ```
- **Output Schema**:
  ```typescript
  {
    id: string(), // The ID of the newly created move
    slug: string(),
  }
  ```
- **Errors**: `UNAUTHORIZED` if the user is not an admin, `BAD_REQUEST` on validation failure (e.g., duplicate name).

#### `admin.moves.update` (Admin-only)

- **Description**: Updates an existing move and its steps.
- **Input Schema**:
  ```typescript
  {
    id: string(),
    name: string().min(3).max(100),
    description: string().min(10).max(500),
    level: enum(['Beginger', 'Intermediate', 'Advanced']),
    steps: array( // The full, ordered list of steps
      object({
        id: string().optional(), // ID required for existing steps
        title: string().min(3).max(150),
        description: string().min(10).max(150),
      })
    ).min(2).max(15),
  }
  ```
- **Output Schema**:
  ```typescript
  {
    success: true,
    updatedAt: date(),
  }
  ```
- **Errors**: `UNAUTHORIZED` if the user is not an admin, `NOT_FOUND` if the move ID doesn't exist, `BAD_REQUEST` on validation failure.

#### `admin.moves.publish` (Admin-only)

- **Description**: Publishes a move, making it visible in the public catalog.
- **Input Schema**:
  ```typescript
  {
    id: string(),
  }
  ```
- **Output Schema**:
  ```typescript
  {
    success: true,
    publishedAt: date(),
  }
  ```
- **Errors**: `UNAUTHORIZED` if the user is not an admin, `NOT_FOUND` if the move ID doesn't exist.

#### `admin.moves.unpublish` (Admin-only)

- **Description**: Unpublishes a move, hiding it from the public catalog.
- **Input Schema**:
  ```typescript
  {
    id: string(),
  }
  ```
- **Output Schema**:
  ```typescript
  {
    success: true,
  }
  ```
- **Errors**: `UNAUTHORIZED` if the user is not an admin, `NOT_FOUND` if the move ID doesn't exist.

#### `admin.moves.delete` (Admin-only)

- **Description**: Soft-deletes a move by setting its `deleted_at` timestamp. This hides it from the catalog and marks it as "Archived" for users who have a status for it.
- **Input Schema**:
  ```typescript
  {
    id: string(),
  }
  ```
- **Output Schema**:
  ```typescript
  {
    success: true,
  }
  ```
- **Errors**: `UNAUTHORIZED` if the user is not an admin, `NOT_FOUND` if the move ID doesn't exist.

## 3. Authentication and Authorization

- **Authentication**: All procedures marked as `(Authenticated)` or `(Admin-only)` will require a valid JWT from Supabase Auth, passed in the `Authorization` header. The server middleware will verify the token and attach the user's session to the context.
- **Authorization**:
  - **User-level**: For procedures like `moves.listMyMoves` and `userMoveStatuses.set`, authorization is enforced by Supabase's Row Level Security (RLS) policies. The API server will execute queries as the authenticated user, ensuring they can only access or modify their own data.
  - **Admin-level**: All procedures under the `admin.*` router are protected by a middleware that checks if the authenticated user has the `is_admin` flag set to `true` in their `profiles` record. Access is denied if the flag is not present or `false`.

## 4. Validation and Business Logic

- **Input Validation**: All procedure inputs are strictly validated against the defined Zod schemas. The validation rules (e.g., `min`, `max`, `enum`) are derived directly from the database constraints and PRD requirements to ensure data integrity at the edge.
- **Business Logic**:
  - **Slug Generation**: When creating a move via `admin.moves.create`, a unique, URL-friendly slug will be generated from the move's name on the server.
  - **Soft Deletes**: The `admin.moves.delete` procedure implements the soft-delete pattern by setting a `deleted_at` timestamp, preserving user data associated with the move. The `moves.listMyMoves` procedure surfaces this state to the user.
  - **Autosave**: The `userMoveStatuses.set` procedure's upsert logic is designed to support the "autosave" feature for user notes, simplifying client-side implementation.
  - **Step Management**: In `admin.moves.create` and `admin.moves.update`, steps are managed as a complete, ordered list within the move payload. The server will handle the logic to create, update, or delete step records to match the provided list, ensuring transactional integrity.
