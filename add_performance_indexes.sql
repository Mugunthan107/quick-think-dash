-- Index for performance during student joins and real-time filtering
CREATE INDEX IF NOT EXISTS idx_exam_results_test_pin ON public.exam_results(test_pin);

-- Index for unique check and lookups during join/re-entry
CREATE INDEX IF NOT EXISTS idx_exam_results_test_pin_student_name ON public.exam_results(test_pin, student_name);

-- Index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_exam_results_score_time ON public.exam_results(score DESC, completed_at ASC) WHERE completed_at IS NOT NULL;
