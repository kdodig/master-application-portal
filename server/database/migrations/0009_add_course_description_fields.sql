-- Migration to add course description fields and application tracking
-- Add description and page number fields to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS page_number INTEGER;

-- Add description matching status fields to applications table
ALTER TABLE applications ADD COLUMN IF NOT EXISTS description_matching_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS description_matching_completed_at TIMESTAMP;
