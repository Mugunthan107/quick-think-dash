-- Add selected_games column to test_sessions table to support multi-game sessions
ALTER TABLE public.test_sessions 
ADD COLUMN IF NOT EXISTS selected_games text[] DEFAULT '{bubble}';

-- Update existing sessions to have a default game if they are missing it
UPDATE public.test_sessions 
SET selected_games = '{bubble}' 
WHERE selected_games IS NULL;
