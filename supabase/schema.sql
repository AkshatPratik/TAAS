-- Create Enums
CREATE TYPE user_role AS ENUM ('student', 'startup', 'admin', 'ngo');
CREATE TYPE submission_status AS ENUM ('pending', 'evaluated', 'accepted', 'rejected');
CREATE TYPE project_status AS ENUM ('open', 'closed');
CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');

-- 1. Users Table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  avatar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Roadmaps, Modules, Checkpoints
CREATE TABLE public.roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL
);

CREATE TABLE public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  "order" INTEGER NOT NULL
);

CREATE TABLE public.checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  passing_score INTEGER NOT NULL DEFAULT 60
);

-- 3. Projects (created by startups)
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  required_skills JSONB, -- Array of strings
  min_score INTEGER NOT NULL DEFAULT 0,
  required_checkpoints JSONB, -- Array of UUIDs
  status project_status NOT NULL DEFAULT 'open',
  posted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. NGO Challenges
CREATE TABLE public.ngo_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  skills JSONB, -- Array of strings
  difficulty difficulty_level NOT NULL,
  status project_status NOT NULL DEFAULT 'open',
  posted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Submissions (for both Checkpoints and NGO Challenges)
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  checkpoint_id UUID REFERENCES public.checkpoints(id) ON DELETE CASCADE, -- can be null if it's purely a challenge
  challenge_id UUID REFERENCES public.ngo_challenges(id) ON DELETE CASCADE, -- can be null if it's purely a checkpoint
  github_link TEXT,
  description TEXT NOT NULL,
  status submission_status NOT NULL DEFAULT 'pending',
  score INTEGER,
  feedback TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Applications (students applying to projects)
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  status application_status NOT NULL DEFAULT 'pending',
  talent_score INTEGER NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, project_id) -- Prevent duplicate applications
);

-- Enable RLS (Row Level Security) - Basic Setup Default Deny All
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ngo_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Creating basic policies to allow reads for logged in users (or public)
-- For demonstration, allowing widespread reads, restricted writes

-- Users: Read all users, update self
CREATE POLICY "Users are viewable by everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Roadmaps/Modules/Checkpoints: Public read, Admin write (mocking admin access for now by allowing all or using a role check)
CREATE POLICY "Roadmaps viewable by everyone" ON public.roadmaps FOR SELECT USING (true);
CREATE POLICY "Modules viewable by everyone" ON public.modules FOR SELECT USING (true);
CREATE POLICY "Checkpoints viewable by everyone" ON public.checkpoints FOR SELECT USING (true);

-- Submissions: Students can insert their own, all can view (for leaderboard/impact)
CREATE POLICY "Submissions viewable by everyone" ON public.submissions FOR SELECT USING (true);
CREATE POLICY "Students insert own submissions" ON public.submissions FOR INSERT WITH CHECK (auth.uid() = student_id);
-- only admins or NGOs should update scores/feedback. To keep it simple, letting authenticated users do it for the mock.
CREATE POLICY "Anyone authenticated can evaluate" ON public.submissions FOR UPDATE USING (auth.role() = 'authenticated');

-- Projects / NGO Challenges: Public read
CREATE POLICY "Projects viewable by everyone" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Startups can insert projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = startup_id);
CREATE POLICY "Startups can update own projects" ON public.projects FOR UPDATE USING (auth.uid() = startup_id);

CREATE POLICY "Challenges viewable by everyone" ON public.ngo_challenges FOR SELECT USING (true);
CREATE POLICY "NGOs can insert challenges" ON public.ngo_challenges FOR INSERT WITH CHECK (auth.uid() = ngo_id);

-- Applications: Startups read relevant, Students read own, Students insert
CREATE POLICY "Applications viewable by involved parties" ON public.applications FOR SELECT USING (auth.uid() = student_id OR auth.uid() IN (SELECT startup_id FROM public.projects WHERE id = project_id));
CREATE POLICY "Students insert own applications" ON public.applications FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Startups can update application status" ON public.applications FOR UPDATE USING (auth.uid() IN (SELECT startup_id FROM public.projects WHERE id = project_id));

-- Trigger to create a user profile when a new user signs up in Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Student User'),
    new.email,
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'student'::user_role)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  
-- Mock Data Insertion (Optional: to keep dummy data for testing)
INSERT INTO public.roadmaps (title, description, icon) VALUES ('Full-Stack Web Development', 'Master modern web development.', '🌐');
-- ... we can add more mock data via app, or they can insert via Supabase editor.
