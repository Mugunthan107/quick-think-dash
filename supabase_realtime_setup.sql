-- Enable real-time for test_sessions and exam_results
DO $$
BEGIN
    -- Check and add test_sessions
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'test_sessions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.test_sessions;
    END IF;

    -- Check and add exam_results
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'exam_results'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.exam_results;
    END IF;
END $$;
