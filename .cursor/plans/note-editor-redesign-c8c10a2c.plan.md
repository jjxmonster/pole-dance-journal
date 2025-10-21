<!-- c8c10a2c-a5b4-49b9-af53-9a83402d4bc7 c02e16e6-6e21-4afc-93e1-029c564937af -->
# Note Editor Redesign Plan

## Overview

This plan outlines the changes needed to transform the current note editor with auto-save functionality into a list-based notes system with explicit save via button. The changes will affect the component structure, database schema, and related functionality.

## Current Implementation

Currently, the system:

- Stores a single note per user-move combination in the `note` field of the `user_move_statuses` table
- Uses auto-save functionality that saves notes every 2 seconds when changes are detected
- Displays a single text area for editing notes

## Required Changes

### 1. Database Schema Changes

We need to create a new `move_notes` table to store multiple notes per move:

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

### 2. API/Backend Changes

- Create new oRPC procedures for note management:
  - `addNote`: Add a new note for a move
  - `getNotes`: Get all notes for a move
  - `deleteNote`: Delete a specific note

### 3. Component Changes

- Redesign the `NoteEditor` component:
  - Remove auto-save functionality
  - Add a form with text area and submit button
  - Add a list component to display existing notes
  - Add ability to delete notes

### 4. PRD Update

Update the PRD to reflect the new notes system, changing from a single auto-saved note to multiple discrete notes.

## Implementation Steps

1. Create database schema changes
2. Implement backend API endpoints
3. Update the NoteEditor component
4. Update the PRD

## Technical Details

### Component Structure

The updated NoteEditor will consist of:

- A text area for entering new notes
- A "Add Note" button to save the current note
- A list of previously saved notes with timestamps
- Delete buttons for each note

### Data Flow

1. User enters text in the text area
2. User clicks "Add Note" button
3. Note is saved to the database
4. Notes list is refreshed to show the new note
5. Text area is cleared for new input

## Risks and Considerations

- Migration of existing notes data
- User experience changes (explicit save vs. auto-save)
- Potential increase in database size with multiple notes per move

### To-dos

- [ ] Design and implement the new move_notes table in the database schema
- [ ] Create new oRPC procedures for note management (addNote, getNotes, deleteNote)
- [ ] Redesign the NoteEditor component to support multiple notes with explicit save
- [ ] Update the PRD to reflect the new notes system