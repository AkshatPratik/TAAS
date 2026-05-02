export type UserRole = "student" | "startup" | "admin" | "ngo";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Roadmap {
  id: string;
  title: string;
  description: string;
  modules: Module[];
  icon: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  checkpoints: Checkpoint[];
}

export interface Checkpoint {
  id: string;
  title: string;
  description: string;
  order: number;
  passingScore: number;
}

export interface Submission {
  id: string;
  studentId: string;
  checkpointId: string;
  challengeId?: string;
  githubLink?: string;
  description: string;
  status: "pending" | "evaluated";
  score?: number;
  feedback?: string;
  submittedAt: string;
}

export interface Project {
  id: string;
  startupId: string;
  startupName: string;
  title: string;
  description: string;
  requiredSkills: string[];
  minScore: number;
  requiredCheckpoints: string[];
  applicants: number;
  status: "open" | "closed";
  postedAt: string;
}

export interface Application {
  id: string;
  studentId: string;
  studentName: string;
  projectId: string;
  projectTitle: string;
  status: "pending" | "accepted" | "rejected";
  appliedAt: string;
  talentScore: number;
}

export interface NgoChallenge {
  id: string;
  ngoId: string;
  ngoName: string;
  title: string;
  description: string;
  skills: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  postedAt: string;
  status: "open" | "closed";
}

export const mockRoadmaps: Roadmap[] = [
  {
    id: "rm-1",
    title: "Full-Stack Web Development",
    description: "Master modern web development from frontend to backend, including React, Node.js, and databases.",
    icon: "🌐",
    modules: [
      {
        id: "mod-1",
        title: "Frontend Fundamentals",
        description: "HTML, CSS, JavaScript essentials",
        order: 1,
        checkpoints: [
          { id: "cp-1", title: "Responsive Portfolio Website", description: "Build a responsive portfolio using HTML & CSS", order: 1, passingScore: 60 },
          { id: "cp-2", title: "Interactive Dashboard", description: "Create a dashboard with vanilla JavaScript", order: 2, passingScore: 65 },
        ],
      },
      {
        id: "mod-2",
        title: "React & Modern Frontend",
        description: "Component-based UI development",
        order: 2,
        checkpoints: [
          { id: "cp-3", title: "Task Manager App", description: "Build a full CRUD task manager with React", order: 1, passingScore: 70 },
          { id: "cp-4", title: "E-Commerce UI", description: "Create a product listing with cart functionality", order: 2, passingScore: 70 },
        ],
      },
      {
        id: "mod-3",
        title: "Backend & APIs",
        description: "Server-side development with Node.js",
        order: 3,
        checkpoints: [
          { id: "cp-5", title: "REST API", description: "Build a RESTful API with authentication", order: 1, passingScore: 75 },
          { id: "cp-6", title: "Full-Stack App", description: "Connect frontend to backend with database", order: 2, passingScore: 80 },
        ],
      },
    ],
  },
  {
    id: "rm-2",
    title: "Data Science & Analytics",
    description: "Learn data analysis, visualization, and machine learning fundamentals with Python.",
    icon: "📊",
    modules: [
      {
        id: "mod-4",
        title: "Python & Data Analysis",
        description: "Python, Pandas, NumPy fundamentals",
        order: 1,
        checkpoints: [
          { id: "cp-7", title: "Data Cleaning Pipeline", description: "Clean and transform a messy dataset", order: 1, passingScore: 60 },
          { id: "cp-8", title: "Exploratory Analysis", description: "Perform EDA on a real-world dataset", order: 2, passingScore: 65 },
        ],
      },
      {
        id: "mod-5",
        title: "Machine Learning",
        description: "ML algorithms and model building",
        order: 2,
        checkpoints: [
          { id: "cp-9", title: "Prediction Model", description: "Build and evaluate a prediction model", order: 1, passingScore: 70 },
        ],
      },
    ],
  },
  {
    id: "rm-3",
    title: "UI/UX Design",
    description: "Design thinking, wireframing, prototyping, and user research methodologies.",
    icon: "🎨",
    modules: [
      {
        id: "mod-6",
        title: "Design Foundations",
        description: "Principles of visual design",
        order: 1,
        checkpoints: [
          { id: "cp-10", title: "Mobile App Wireframes", description: "Create wireframes for a mobile application", order: 1, passingScore: 60 },
          { id: "cp-11", title: "Design System", description: "Build a reusable design system in Figma", order: 2, passingScore: 70 },
        ],
      },
    ],
  },
];

export const mockNgoChallenges: NgoChallenge[] = [
  {
    id: "ngo-ch-1",
    ngoId: "ngo-1",
    ngoName: "EduBridge Foundation",
    title: "Build a Donation Tracker for Rural Schools",
    description: "Create a web dashboard that tracks donations, maps school locations, and visualizes funding progress for rural education programs.",
    skills: ["React", "Data Visualization", "UI/UX"],
    difficulty: "intermediate",
    postedAt: "2026-03-15",
    status: "open",
  },
  {
    id: "ngo-ch-2",
    ngoId: "ngo-1",
    ngoName: "EduBridge Foundation",
    title: "Student Attendance Analytics System",
    description: "Design and build an analytics tool that processes attendance data and generates insights to help NGOs improve student retention.",
    skills: ["Python", "Data Analysis", "Machine Learning"],
    difficulty: "advanced",
    postedAt: "2026-03-18",
    status: "open",
  },
  {
    id: "ngo-ch-3",
    ngoId: "ngo-2",
    ngoName: "GreenEarth Initiative",
    title: "Community Clean-Up Coordination App",
    description: "Build a mobile-responsive web app for volunteers to sign up for local clean-up events, track participation, and share progress photos.",
    skills: ["React", "Node.js", "UI/UX"],
    difficulty: "beginner",
    postedAt: "2026-03-20",
    status: "open",
  },
  {
    id: "ngo-ch-4",
    ngoId: "ngo-2",
    ngoName: "GreenEarth Initiative",
    title: "Carbon Footprint Calculator",
    description: "Create an interactive calculator that helps users estimate their carbon footprint and suggests personalized reduction strategies.",
    skills: ["JavaScript", "Data Visualization", "UI/UX"],
    difficulty: "intermediate",
    postedAt: "2026-03-22",
    status: "open",
  },
];

export const mockProjects: Project[] = [
  {
    id: "proj-1",
    startupId: "startup-1",
    startupName: "TechFlow AI",
    title: "Build AI-Powered Dashboard",
    description: "We need a talented frontend developer to build a real-time analytics dashboard with AI insights integration. Must be proficient in React and data visualization.",
    requiredSkills: ["React", "TypeScript", "Data Visualization"],
    minScore: 70,
    requiredCheckpoints: ["cp-3", "cp-4"],
    applicants: 12,
    status: "open",
    postedAt: "2026-03-20",
  },
  {
    id: "proj-2",
    startupId: "startup-2",
    startupName: "GreenLeaf",
    title: "Sustainability Tracking Platform",
    description: "Full-stack developer needed to build a carbon footprint tracking platform. Backend API experience required.",
    requiredSkills: ["Node.js", "React", "PostgreSQL"],
    minScore: 75,
    requiredCheckpoints: ["cp-5", "cp-6"],
    applicants: 8,
    status: "open",
    postedAt: "2026-03-18",
  },
  {
    id: "proj-3",
    startupId: "startup-3",
    startupName: "DataPulse",
    title: "Customer Analytics Engine",
    description: "Data scientist needed to build predictive models for customer behavior analysis.",
    requiredSkills: ["Python", "Machine Learning", "Data Analysis"],
    minScore: 65,
    requiredCheckpoints: ["cp-7", "cp-8"],
    applicants: 15,
    status: "open",
    postedAt: "2026-03-22",
  },
  {
    id: "proj-4",
    startupId: "startup-1",
    startupName: "TechFlow AI",
    title: "Mobile App Redesign",
    description: "Looking for a UI/UX designer to completely redesign our mobile application experience.",
    requiredSkills: ["UI/UX", "Figma", "Design Systems"],
    minScore: 60,
    requiredCheckpoints: ["cp-10"],
    applicants: 20,
    status: "open",
    postedAt: "2026-03-25",
  },
];

export const mockSubmissions: Submission[] = [
  { id: "sub-1", studentId: "student-1", checkpointId: "cp-1", githubLink: "https://github.com/user/portfolio", description: "Responsive portfolio with CSS Grid and Flexbox", status: "evaluated", score: 85, feedback: "Excellent responsive design. Clean code structure.", submittedAt: "2026-03-10" },
  { id: "sub-2", studentId: "student-1", checkpointId: "cp-2", githubLink: "https://github.com/user/dashboard", description: "Interactive sales dashboard with charts", status: "evaluated", score: 78, feedback: "Good interactivity. Could improve accessibility.", submittedAt: "2026-03-14" },
  { id: "sub-3", studentId: "student-1", checkpointId: "cp-3", githubLink: "https://github.com/user/taskmanager", description: "React task manager with drag and drop", status: "evaluated", score: 92, feedback: "Outstanding work! Great use of React patterns.", submittedAt: "2026-03-18" },
  { id: "sub-4", studentId: "student-1", checkpointId: "cp-4", description: "E-commerce product listing with cart", status: "pending", submittedAt: "2026-03-25" },
];

export const mockApplications: Application[] = [
  { id: "app-1", studentId: "student-1", studentName: "Alex Rivera", projectId: "proj-1", projectTitle: "Build AI-Powered Dashboard", status: "pending", appliedAt: "2026-03-22", talentScore: 85 },
  { id: "app-2", studentId: "student-2", studentName: "Priya Sharma", projectId: "proj-1", projectTitle: "Build AI-Powered Dashboard", status: "accepted", appliedAt: "2026-03-21", talentScore: 91 },
  { id: "app-3", studentId: "student-3", studentName: "Jordan Lee", projectId: "proj-2", projectTitle: "Sustainability Tracking Platform", status: "rejected", appliedAt: "2026-03-19", talentScore: 72 },
  { id: "app-4", studentId: "student-4", studentName: "Maria Garcia", projectId: "proj-3", projectTitle: "Customer Analytics Engine", status: "pending", appliedAt: "2026-03-24", talentScore: 88 },
];
