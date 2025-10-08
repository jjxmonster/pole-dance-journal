# Pole Journal - Database Schema Plan

This document outlines the PostgreSQL database schema for the Pole Journal MVP, designed for implementation with Drizzle ORM on Supabase.

## 1. Tables

### Custom ENUM Types

```sql
CREATE TYPE move_level AS ENUM ('Beginner', 'Intermediate', 'Advanced');
CREATE TYPE move_status AS ENUM ('WANT', 'ALMOST', 'DONE');
```

### `profiles` table

Stores user-specific data extending `auth.users`.

| Column       | Data Type     | Constraints & Defaults                                              | Description                                |
| :----------- | :------------ | :------------------------------------------------------------------ | :----------------------------------------- |
| `id`         | `uuid`        | `PRIMARY KEY`, `DEFAULT gen_random_uuid()`                          | Unique identifier for the profile.         |
| `user_id`    | `uuid`        | `NOT NULL`, `UNIQUE`, `REFERENCES auth.users(id) ON DELETE CASCADE` | Foreign key to the user in Supabase Auth.  |
| `is_admin`   | `boolean`     | `NOT NULL`, `DEFAULT false`                                         | Flag to indicate administrator privileges. |
| `created_at` | `timestamptz` | `NOT NULL`, `DEFAULT now()`                                         | Timestamp of profile creation.             |
| `updated_at` | `timestamptz` | `NOT NULL`, `DEFAULT now()`                                         | Timestamp of the last profile update.      |

### `moves` table

Represents the core pole dance moves in the catalog.

| Column         | Data Type     | Constraints & Defaults                                            | Description                                  |
| :------------- | :------------ | :---------------------------------------------------------------- | :------------------------------------------- |
| `id`           | `uuid`        | `PRIMARY KEY`, `DEFAULT gen_random_uuid()`                        | Unique identifier for the move.              |
| `name`         | `text`        | `NOT NULL`, `CHECK (char_length(name) BETWEEN 3 AND 100)`         | Name of the move.                            |
| `description`  | `text`        | `NOT NULL`, `CHECK (char_length(description) BETWEEN 10 AND 500)` | Detailed description of the move.            |
| `level`        | `move_level`  | `NOT NULL`                                                        | Difficulty level of the move.                |
| `slug`         | `text`        | `NOT NULL`                                                        | URL-friendly unique identifier for the move. |
| `image_url`    | `text`        | `NULL`                                                            | URL of an image.                             |
| `published_at` | `timestamptz` | `NULL`                                                            | Timestamp when the move was published.       |
| `deleted_at`   | `timestamptz` | `NULL`                                                            | Timestamp for soft deletion.                 |
| `created_at`   | `timestamptz` | `NOT NULL`, `DEFAULT now()`                                       | Timestamp of move creation.                  |
| `updated_at`   | `timestamptz` | `NOT NULL`, `DEFAULT now()`                                       | Timestamp of the last move update.           |

### `steps` table

Stores the ordered instructions for performing a move.

| Column        | Data Type     | Constraints & Defaults                                            | Description                         |
| :------------ | :------------ | :---------------------------------------------------------------- | :---------------------------------- |
| `id`          | `uuid`        | `PRIMARY KEY`, `DEFAULT gen_random_uuid()`                        | Unique identifier for the step.     |
| `move_id`     | `uuid`        | `NOT NULL`, `REFERENCES moves(id) ON DELETE CASCADE`              | Foreign key to the parent move.     |
| `order_index` | `integer`     | `NOT NULL`, `CHECK (order_index > 0)`                             | One-based index for step ordering.  |
| `title`       | `text`        | `NOT NULL`, `CHECK (char_length(title) BETWEEN 3 AND 150)`        | Title of the step.                  |
| `description` | `text`        | `NOT NULL`, `CHECK (char_length(description) BETWEEN 10 AND 150)` | Description of the step.            |
| `created_at`  | `timestamptz` | `NOT NULL`, `DEFAULT now()`                                       | Timestamp of step creation.         |
| `updated_at`  | `timestamptz` | `NOT NULL`, `DEFAULT now()`                                       | Timestamp of the last step update.  |
|               |               | `UNIQUE (move_id, order_index)`                                   | Ensures unique step order per move. |

### `user_move_statuses` table

Tracks a user's status and private notes for each move.

| Column       | Data Type     | Constraints & Defaults                        | Description                                     |
| :----------- | :------------ | :-------------------------------------------- | :---------------------------------------------- |
| `user_id`    | `uuid`        | `REFERENCES auth.users(id) ON DELETE CASCADE` | Foreign key to the user.                        |
| `move_id`    | `uuid`        | `REFERENCES moves(id) ON DELETE CASCADE`      | Foreign key to the move.                        |
| `status`     | `move_status` | `NOT NULL`, `DEFAULT 'WANT'`                  | The user's progress status for the move.        |
| `note`       | `text`        | `NULL`, `CHECK (char_length(note) <= 2000)`   | User's private note for the move.               |
| `created_at` | `timestamptz` | `NOT NULL`, `DEFAULT now()`                   | Timestamp of status creation.                   |
| `updated_at` | `timestamptz` | `NOT NULL`, `DEFAULT now()`                   | Timestamp of the last status update.            |
|              |               | `PRIMARY KEY (user_id, move_id)`              | Composite key ensures one status per user/move. |

## 2. Relationships

- **`profiles` to `auth.users`**: One-to-one relationship. Each user in `auth.users` has one corresponding profile.
- **`steps` to `moves`**: Many-to-one relationship. A move can have many steps, but each step belongs to exactly one move.
- **`user_move_statuses` to `auth.users`**: Many-to-one relationship. A user can have statuses for many moves.
- **`user_move_statuses` to `moves`**: Many-to-one relationship. A move can have statuses from many users.

All foreign key relationships are configured with `ON DELETE CASCADE` to ensure that deleting a parent record (e.g., a user or a move) automatically removes all associated child records.

## 3. Indexes

- **Move Name Uniqueness**: A unique index on the lowercase `name` for moves that are not soft-deleted.
  ```sql
  CREATE UNIQUE INDEX idx_moves_name_active ON moves(lower(name)) WHERE deleted_at IS NULL;
  ```
- **Move Slug Uniqueness**: A unique index on the lowercase `slug` for all moves, including soft-deleted ones, to prevent URL conflicts.
  ```sql
  CREATE UNIQUE INDEX idx_moves_slug_unique ON moves(lower(slug));
  ```
- **Step Order Uniqueness**: A unique constraint on `(move_id, order_index)` in the `steps` table ensures that each step has a unique order within its parent move.
- **Search**: The `unaccent` extension should be installed to support diacritic-insensitive search on move names.

## 4. PostgreSQL Policies (RLS)

Row Level Security (RLS) is enabled on all tables.

### `profiles`

- **SELECT**: Users can only view their own profile.
  ```sql
  CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
  ```
- **UPDATE**: Users can update their own profile but cannot change their `is_admin` status.
  ```sql
  CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id AND is_admin = (SELECT is_admin FROM profiles WHERE id = profiles.id));
  ```

### `moves`

- **SELECT**: Authenticated users can view moves that are published and not soft-deleted.
  ```sql
  CREATE POLICY "Authenticated users can view published moves" ON moves FOR SELECT USING (auth.role() = 'authenticated' AND published_at IS NOT NULL AND deleted_at IS NULL);
  ```
- **ADMIN CUD**: Admins can create, update, and delete moves.
  ```sql
  CREATE POLICY "Admins can manage moves" ON moves FOR ALL USING (
    (SELECT is_admin FROM profiles WHERE user_id = auth.uid())
  );
  ```

### `steps`

- **SELECT**: Authenticated users can view steps belonging to published, non-deleted moves.
  ```sql
  CREATE POLICY "Authenticated users can view steps of published moves" ON steps FOR SELECT USING (
    auth.role() = 'authenticated' AND
    move_id IN (SELECT id FROM moves WHERE published_at IS NOT NULL AND deleted_at IS NULL)
  );
  ```
- **ADMIN CUD**: Admins can create, update, and delete steps.
  ```sql
  CREATE POLICY "Admins can manage steps" ON steps FOR ALL USING (
    (SELECT is_admin FROM profiles WHERE user_id = auth.uid())
  );
  ```

### `user_move_statuses`

- **ALL**: Users can only create, view, update, and delete their own statuses and notes. This ensures complete privacy.
  ```sql
  CREATE POLICY "Users can manage their own move statuses" ON user_move_statuses FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  ```

## 5. Automation and Triggers

- **Auto-create Profile**: A trigger will automatically create a new entry in the `profiles` table when a new user signs up in `auth.users`.

  ```sql
  CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER AS $$
  BEGIN
    INSERT INTO public.profiles (user_id)
    VALUES (new.id);
    RETURN new;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  ```

- **Auto-update `updated_at`**: A reusable trigger function will update the `updated_at` column on any row modification for all tables.

  ```sql
  CREATE OR REPLACE FUNCTION public.moddatetime()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  -- Example trigger for the 'moves' table
  CREATE TRIGGER handle_updated_at BEFORE UPDATE ON moves
    FOR EACH ROW EXECUTE PROCEDURE public.moddatetime();
  -- This trigger should be created for: profiles, moves, steps, user_move_statuses
  ```

- **Unpublish on Soft Delete**: A trigger will set `published_at` to `NULL` when a move is soft-deleted (when `deleted_at` is set).

  ```sql
  CREATE OR REPLACE FUNCTION public.unpublish_on_soft_delete()
  RETURNS TRIGGER AS $$
  BEGIN
    IF NEW.deleted_at IS NOT NULL THEN
      NEW.published_at = NULL;
    END IF;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER handle_soft_delete BEFORE UPDATE ON moves
    FOR EACH ROW EXECUTE PROCEDURE public.unpublish_on_soft_delete();
  ```

## 6. Additional Notes

- **Schema Organization**: All application tables and functions reside in the `public` schema.
- **Authentication**: The entire application catalog is gated and requires users to be authenticated. There are no publicly accessible pages defined by this schema.
- **Admin Promotion**: The first admin user must be promoted manually via a direct SQL `UPDATE` statement.
- **Database Migrations**: All schema changes, including table creations, RLS policies, and triggers, will be versioned and managed in the `supabase/migrations/` directory.
