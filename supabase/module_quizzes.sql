-- =============================================
-- Module Quiz System — Tables + Seed Questions
-- =============================================

-- 1. Quiz Questions table
CREATE TABLE IF NOT EXISTS public.module_quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('A','B','C','D')),
  "order" INTEGER NOT NULL DEFAULT 1
);

-- 2. Quiz Results table
CREATE TABLE IF NOT EXISTS public.module_quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  answers JSONB,
  violations INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, module_id)
);

-- 3. RLS Policies
ALTER TABLE public.module_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quiz questions viewable by everyone" ON public.module_quiz_questions FOR SELECT USING (true);
CREATE POLICY "Quiz results viewable by everyone" ON public.module_quiz_results FOR SELECT USING (true);
CREATE POLICY "Students insert own quiz results" ON public.module_quiz_results FOR INSERT WITH CHECK (auth.uid() = student_id);

-- =============================================
-- Seed: 5 MCQs per Module (Full Stack Roadmap)
-- =============================================

-- Module 1: Frontend Fundamentals (00000000-0000-0000-0001-000000000001)
INSERT INTO public.module_quiz_questions (module_id, question_text, option_a, option_b, option_c, option_d, correct_option, "order") VALUES
('00000000-0000-0000-0001-000000000001', 'Which HTML tag is used to define an internal stylesheet?', '<css>', '<style>', '<script>', '<link>', 'B', 1),
('00000000-0000-0000-0001-000000000001', 'What does CSS stand for?', 'Creative Style Sheets', 'Cascading Style Sheets', 'Computer Style Sheets', 'Colorful Style Sheets', 'B', 2),
('00000000-0000-0000-0001-000000000001', 'Which JavaScript method is used to select an element by its ID?', 'document.querySelector()', 'document.getElement()', 'document.getElementById()', 'document.selectId()', 'C', 3),
('00000000-0000-0000-0001-000000000001', 'What is the correct CSS property to change the text color?', 'font-color', 'text-color', 'color', 'foreground-color', 'C', 4),
('00000000-0000-0000-0001-000000000001', 'Which HTML5 element is used for navigation links?', '<navigation>', '<nav>', '<links>', '<menu>', 'B', 5);

-- Module 2: React & Modern Frontend (00000000-0000-0000-0001-000000000002)
INSERT INTO public.module_quiz_questions (module_id, question_text, option_a, option_b, option_c, option_d, correct_option, "order") VALUES
('00000000-0000-0000-0001-000000000002', 'What hook is used to manage state in a React functional component?', 'useEffect', 'useState', 'useReducer', 'useContext', 'B', 1),
('00000000-0000-0000-0001-000000000002', 'What is JSX in React?', 'A database query language', 'A JavaScript XML syntax extension', 'A CSS preprocessor', 'A testing framework', 'B', 2),
('00000000-0000-0000-0001-000000000002', 'Which lifecycle method equivalent runs after every render in React hooks?', 'useState', 'useCallback', 'useEffect', 'useMemo', 'C', 3),
('00000000-0000-0000-0001-000000000002', 'How do you pass data from a parent to child component in React?', 'Using state', 'Using props', 'Using context only', 'Using localStorage', 'B', 4),
('00000000-0000-0000-0001-000000000002', 'What does the virtual DOM do in React?', 'Replaces the real DOM entirely', 'Creates a lightweight copy to minimize real DOM updates', 'Stores data in the browser cache', 'Manages server-side rendering', 'B', 5);

-- Module 3: Backend & APIs (00000000-0000-0000-0001-000000000003)
INSERT INTO public.module_quiz_questions (module_id, question_text, option_a, option_b, option_c, option_d, correct_option, "order") VALUES
('00000000-0000-0000-0001-000000000003', 'What does REST stand for?', 'Remote Execution of Server Tasks', 'Representational State Transfer', 'Rapid Endpoint Service Technology', 'Resource Exchange Standard Type', 'B', 1),
('00000000-0000-0000-0001-000000000003', 'Which HTTP method is used to update an existing resource?', 'GET', 'POST', 'PUT', 'DELETE', 'C', 2),
('00000000-0000-0000-0001-000000000003', 'What is middleware in Express.js?', 'A database connector', 'Functions that execute during request-response cycle', 'A frontend framework', 'A CSS preprocessor', 'B', 3),
('00000000-0000-0000-0001-000000000003', 'Which status code indicates a successful POST request that created a resource?', '200', '201', '204', '301', 'B', 4),
('00000000-0000-0000-0001-000000000003', 'What does JWT stand for?', 'JavaScript Web Token', 'JSON Web Token', 'Java Web Technology', 'JSON Web Transfer', 'B', 5);
