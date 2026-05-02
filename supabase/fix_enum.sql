-- Fix for submission_status enum to include accepted and rejected
-- Run this in the Supabase SQL Editor

ALTER TYPE public.submission_status ADD VALUE IF NOT EXISTS 'accepted';
ALTER TYPE public.submission_status ADD VALUE IF NOT EXISTS 'rejected';
