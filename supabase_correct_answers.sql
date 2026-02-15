-- Add correct_answers column to exam_results table
ALTER TABLE exam_results 
ADD COLUMN correct_answers INTEGER DEFAULT 0;

-- Optional: Update existing records to have 0 instead of null if needed (though DEFAULT handles new ones)
UPDATE exam_results 
SET correct_answers = 0 
WHERE correct_answers IS NULL;
