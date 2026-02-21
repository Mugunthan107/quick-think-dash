-- Add game_history column to exam_results table
ALTER TABLE exam_results 
ADD COLUMN IF NOT EXISTS game_history JSONB DEFAULT '[]'::jsonb;

-- Update existing rows to have empty array if null (optional, handled by default above)
UPDATE exam_results 
SET game_history = '[]'::jsonb 
WHERE game_history IS NULL;
