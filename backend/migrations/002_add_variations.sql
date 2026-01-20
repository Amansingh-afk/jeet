-- Add support for question variations (lightweight questions for embedding coverage)

-- Add is_variation flag
ALTER TABLE questions ADD COLUMN is_variation BOOLEAN DEFAULT FALSE;

-- Make fields nullable for variations
ALTER TABLE questions ALTER COLUMN options DROP NOT NULL;
ALTER TABLE questions ALTER COLUMN correct_option DROP NOT NULL;
ALTER TABLE questions ALTER COLUMN extracted_values DROP NOT NULL;
ALTER TABLE questions ALTER COLUMN solution DROP NOT NULL;

-- Index for filtering variations
CREATE INDEX idx_questions_is_variation ON questions(is_variation);
