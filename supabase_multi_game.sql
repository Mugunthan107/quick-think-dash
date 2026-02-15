-- Add num_games column to test_sessions
ALTER TABLE public.test_sessions ADD COLUMN IF NOT EXISTS num_games integer DEFAULT 1;

-- Add correct_answers column if not exists
ALTER TABLE public.exam_results ADD COLUMN IF NOT EXISTS correct_answers integer DEFAULT 0;
