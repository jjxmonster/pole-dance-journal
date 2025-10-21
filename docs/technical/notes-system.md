# Notes System Documentation

## Overview

The Notes System allows users to create, view, and delete multiple notes for each pole dance move. This document describes the technical implementation and user experience of the notes feature.

## Database Schema

### Move Notes Table

The system stores notes in the `move_notes` table with the following schema:

```sql
CREATE TABLE move_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  move_id UUID NOT NULL REFERENCES moves(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK(char_length(content) <= 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id, move_id) REFERENCES user_move_statuses(user_id, move_id) ON DELETE CASCADE
);
```

This table allows for:

- Multiple notes per user per move
- Chronological tracking of notes (via created_at)
- Automatic deletion when a move is deleted
- Maximum note length of 2000 characters

## API Endpoints

The system provides the following oRPC procedures for note management:

1. `getNotes`: Retrieves all notes for a specific move for the authenticated user
2. `addNote`: Adds a new note for a specific move
3. `deleteNote`: Deletes a specific note by ID

## User Interface

The note editor component provides the following functionality:

1. A text area for entering new notes
2. A "Add Note" button to explicitly save the note
3. A list of previously saved notes displayed chronologically
4. The ability to delete individual notes
5. Character count display with visual indicators when approaching the limit

## Migration System

To support users transitioning from the old single-note system to the new multi-note system:

1. A migration script (`scripts/migrate-notes.ts`) can be run to transfer all existing notes
2. A migration notice component appears for users who have notes in the old format
3. Users can trigger their own migration via the UI
4. The migration process preserves all existing note content

## Security

- All note operations require authentication
- Users can only access, create, and delete their own notes
- Input validation ensures notes don't exceed the maximum length

## Performance Considerations

- Notes are loaded on demand when viewing a specific move
- Optimistic UI updates provide immediate feedback when adding/deleting notes
- Pagination may be added in the future if users accumulate large numbers of notes

## Future Enhancements

Potential future enhancements to the notes system:

- Note editing functionality
- Rich text formatting
- Note categorization or tagging
- Note search functionality
- Attachments (images, videos)
