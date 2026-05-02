-- ======================================================
-- NGO Test System Migration
-- Run this in your Supabase SQL Editor
-- ======================================================

-- 1. Tests table (created by NGOs)
CREATE TABLE IF NOT EXISTS public.tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  time_limit_minutes INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Questions table (MCQ, linked to a test)
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Test Results table (student attempts)
CREATE TABLE IF NOT EXISTS public.test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  answers JSONB,  -- { question_id: "selected_option" }
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(test_id, student_id)  -- one attempt per student per test
);

-- ======================================================
-- Row Level Security
-- ======================================================

ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

-- Tests: everyone can view published tests, NGOs manage their own
CREATE POLICY "Published tests viewable by everyone" ON public.tests
  FOR SELECT USING (is_published = true OR auth.uid() = ngo_id);

CREATE POLICY "NGOs can create tests" ON public.tests
  FOR INSERT WITH CHECK (auth.uid() = ngo_id);

CREATE POLICY "NGOs can update own tests" ON public.tests
  FOR UPDATE USING (auth.uid() = ngo_id);

CREATE POLICY "NGOs can delete own tests" ON public.tests
  FOR DELETE USING (auth.uid() = ngo_id);

-- Questions: viewable if test is published or owned by NGO
CREATE POLICY "Questions viewable for accessible tests" ON public.questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tests t 
      WHERE t.id = test_id 
      AND (t.is_published = true OR t.ngo_id = auth.uid())
    )
  );

CREATE POLICY "NGOs can manage questions for own tests" ON public.questions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tests t 
      WHERE t.id = test_id AND t.ngo_id = auth.uid()
    )
  );

CREATE POLICY "NGOs can update own questions" ON public.questions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.tests t 
      WHERE t.id = test_id AND t.ngo_id = auth.uid()
    )
  );

CREATE POLICY "NGOs can delete own questions" ON public.questions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.tests t 
      WHERE t.id = test_id AND t.ngo_id = auth.uid()
    )
  );

-- Test Results: students can insert their own, NGOs can view results for their tests
CREATE POLICY "Students can submit test results" ON public.test_results
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "View own results or NGO views their test results" ON public.test_results
  FOR SELECT USING (
    auth.uid() = student_id 
    OR EXISTS (
      SELECT 1 FROM public.tests t 
      WHERE t.id = test_id AND t.ngo_id = auth.uid()
    )
  );
