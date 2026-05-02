-- Clean existing mock data
TRUNCATE public.roadmaps CASCADE;
TRUNCATE public.ngo_challenges CASCADE;
TRUNCATE public.projects CASCADE;

-- Insert Roadmaps
INSERT INTO public.roadmaps (id, title, description, icon) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Full-Stack Web Development', 'Master modern web development from frontend to backend, including React, Node.js, and databases.', '🌐'),
  ('00000000-0000-0000-0000-000000000002', 'Data Science & Analytics', 'Learn data analysis, visualization, and machine learning fundamentals with Python.', '📊'),
  ('00000000-0000-0000-0000-000000000003', 'UI/UX Design', 'Design thinking, wireframing, prototyping, and user research methodologies.', '🎨');

-- Insert Modules for Roadmap 1
INSERT INTO public.modules (id, roadmap_id, title, description, "order") VALUES
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'Frontend Fundamentals', 'HTML, CSS, JavaScript essentials', 1),
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001', 'React & Modern Frontend', 'Component-based UI development', 2),
  ('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000001', 'Backend & APIs', 'Server-side development with Node.js', 3);

-- Insert Checkpoints for Roadmap 1 Modules
INSERT INTO public.checkpoints (id, module_id, title, description, "order", passing_score) VALUES
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0001-000000000001', 'Responsive Portfolio Website', 'Build a responsive portfolio using HTML & CSS', 1, 60),
  ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0001-000000000001', 'Interactive Dashboard', 'Create a dashboard with vanilla JavaScript', 2, 65),
  ('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0001-000000000002', 'Task Manager App', 'Build a full CRUD task manager with React', 1, 70),
  ('00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0001-000000000002', 'E-Commerce UI', 'Create a product listing with cart functionality', 2, 70),
  ('00000000-0000-0000-0002-000000000005', '00000000-0000-0000-0001-000000000003', 'REST API', 'Build a RESTful API with authentication', 1, 75),
  ('00000000-0000-0000-0002-000000000006', '00000000-0000-0000-0001-000000000003', 'Full-Stack App', 'Connect frontend to backend with database', 2, 80);

-- Note: NGO challenges and Projects require user_ids (neo_id, startup_id).
-- Please sign up a user, find their UUID in `auth.users`, and insert rows manually into `ngo_challenges` and `projects`.
