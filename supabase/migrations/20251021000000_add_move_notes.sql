-- Create move_notes table
CREATE TABLE move_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  move_id UUID NOT NULL REFERENCES moves(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK(char_length(content) <= 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id, move_id) REFERENCES user_move_statuses(user_id, move_id) ON DELETE CASCADE
);

-- Add index for faster queries by user_id and move_id
CREATE INDEX idx_move_notes_user_move ON move_notes(user_id, move_id);
