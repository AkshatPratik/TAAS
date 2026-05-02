-- Add new statuses to submission_status enum
ALTER TYPE submission_status ADD VALUE IF NOT EXISTS 'accepted';
ALTER TYPE submission_status ADD VALUE IF NOT EXISTS 'rejected';
