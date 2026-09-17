# TAAS — Talent Assessment & Advancement System

> An AI-enabled talent assessment and career development platform designed to evaluate skills, identify gaps, and help individuals build a structured path toward their career goals.

---

## 📌 Overview

**TAAS (Talent Assessment & Advancement System)** is a modern web platform for skill assessment, talent evaluation, and career development.

The platform brings together assessments, skill tests, proctored examinations, performance tracking, and AI/ML-powered capabilities into a single system.

TAAS is designed to support multiple use cases, including:

- Individual learners and candidates
- Organizations and institutions
- NGOs and training programs
- Administrators and platform managers
- Skill assessment and certification workflows

The long-term vision of TAAS is to move beyond traditional assessments and provide **data-driven career guidance** by understanding a user's skills, identifying skill gaps, and helping them determine what to learn next.

---

## 🚀 Key Features

### 🎯 Skill Assessment

TAAS provides structured assessments to evaluate users across different technical and professional skills.

Features include:

- Skill-based tests
- Multiple-choice questions
- Timed assessments
- Category-wise evaluation
- Score calculation
- Performance analysis
- Assessment history

### 📝 Tests & Examinations

TAAS supports different testing workflows, including:

- Main skill tests
- NGO-specific tests
- Practice assessments
- Timed examinations
- Question navigation
- Result generation

### 🔐 Proctored Assessments

TAAS includes a browser-based proctoring workflow designed to improve assessment integrity.

The current technology stack includes:

- TensorFlow.js
- COCO-SSD
- Browser-based computer vision

These technologies can be used to detect objects and potential irregularities during an examination.

> Proctoring functionality is intended as an assistance mechanism. Detection results should be reviewed according to the application's assessment policies rather than being treated as definitive evidence of misconduct.

### 📊 Performance Tracking

TAAS provides performance tracking and analytics to help users understand their progress.

Potential metrics include:

- Test scores
- Skill-wise performance
- Assessment history
- Strengths
- Skill gaps
- Progress over time

### 🤖 AI/ML Career Development

A major direction of TAAS is the integration of AI/ML into the career-development workflow.

The platform is designed to support:

- Personalized skill-gap analysis
- Recommended learning areas
- Career development roadmaps
- Skill progression plans
- Role-oriented recommendations
- Personalized next steps

The goal is to create an **individualized career roadmap** instead of providing the same learning path to every user.

### 👤 User Management

TAAS supports role-based workflows and user management.

Development workflows also include administrative capabilities such as switching between users for development and testing purposes.

### 🎨 Modern User Interface

The frontend is built using a modern React component architecture with:

- Tailwind CSS
- Radix UI
- shadcn/ui-style components
- Lucide icons
- Framer Motion
- Responsive layouts
- Accessible UI components

---

# 🛠️ Technology Stack

## Frontend

| Technology | Purpose |
|---|---|
| React 18 | UI development |
| TypeScript | Type-safe development |
| Vite | Development server and build tool |
| React Router | Client-side routing |
| Tailwind CSS | Styling |
| Radix UI | Accessible UI primitives |
| shadcn/ui | Reusable UI components |
| Framer Motion | Animations |
| Lucide React | Icons |

## State & Data Management

| Technology | Purpose |
|---|---|
| TanStack React Query | Server-state and asynchronous data management |
| React Hook Form | Form management |
| Zod | Schema validation |
| Supabase JS | Backend/database integration |

## Backend & Database

TAAS uses **Supabase** for backend services and database integration.

Supabase provides capabilities such as:

- Database services
- Authentication
- API access
- User management
- Persistent application data

## AI / Machine Learning

TAAS includes browser-based machine-learning capabilities using:

| Technology | Purpose |
|---|---|
| TensorFlow.js | Machine-learning inference in the browser |
| COCO-SSD | Object detection |
| JavaScript ML models | Browser-based analysis |

These technologies are particularly relevant to the platform's proctoring and future AI-powered capabilities.

## Testing

The project includes:

- Vitest
- Testing Library
- Jest DOM
- Playwright

These tools allow TAAS to support both component-level testing and browser-based end-to-end testing.

---

# 🏗️ Architecture

At a high level, TAAS follows a modern client-side web application architecture:

```text
                    ┌─────────────────────┐
                    │        TAAS         │
                    │     Web Platform    │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
       ┌───────────┐     ┌────────────┐    ┌────────────┐
       │   React   │     │  Supabase  │    │  AI / ML   │
       │ Frontend  │     │  Backend   │    │  Services  │
       └─────┬─────┘     └─────┬──────┘    └─────┬──────┘
             │                 │                 │
             ▼                 ▼                 ▼
       ┌───────────┐     ┌────────────┐    ┌────────────┐
       │ UI / UX   │     │ Database   │    │ TensorFlow │
       │ Components│     │ & Auth     │    │  COCO-SSD  │
       └───────────┘     └────────────┘    └────────────┘
             │
             ▼
       ┌─────────────────────────────────────────────┐
       │ Assessments → Skills → Performance →        │
       │ Skill Gaps → AI Analysis → Career Roadmap   │
       └─────────────────────────────────────────────┘

# 📂 Project Structure

A typical TAAS project structure looks like this:

    TAAS/
    ├── public/
    │
    ├── src/
    │   ├── components/
    │   │   ├── ui/
    │   │   └── ...
    │   │
    │   ├── pages/
    │   │   └── ...
    │   │
    │   ├── hooks/
    │   │   └── ...
    │   │
    │   ├── lib/
    │   │   └── ...
    │   │
    │   ├── integrations/
    │   │   └── supabase/
    │   │
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── ...
    │
    ├── tests/
    │
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── tailwind.config.ts
    ├── postcss.config.js
    └── README.md

> The exact directory structure may vary depending on the current implementation.

---

# ⚙️ Getting Started

## Prerequisites

Make sure the following are installed:

- [Node.js](https://nodejs.org/)
- npm
- Git

Verify your installation:

    node --version
    npm --version
    git --version

---

## 📥 Installation

Clone the repository:

    git clone <repository-url>

Navigate into the project directory:

    cd TAAS

Install the project dependencies:

    npm install

---

# 🔑 Environment Variables

TAAS uses Supabase for backend services.

Create a `.env` file in the project root:

    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

### Important

Do **not** commit private credentials or secrets to GitHub.

For production deployments, configure environment variables through your hosting provider.

---

# 💻 Development

Start the development server:

    npm run dev

Vite will display the local development URL in the terminal.

---

# 📦 Production Build

Create a production build:

    npm run build

Create a development-mode build:

    npm run build:dev

Preview the production build locally:

    npm run preview

---

# 🧹 Code Quality

Run ESLint:

    npm run lint

---

# 🧪 Testing

Run the test suite:

    npm run test

Run tests in watch mode:

    npm run test:watch

TAAS also includes Playwright for browser-based end-to-end testing.

---

# 📝 Assessment Flow

A typical TAAS assessment workflow looks like this:

    User
     │
     ▼
    Select Assessment
     │
     ▼
    Assessment Instructions
     │
     ▼
    Start Test
     │
     ├───────────────┐
     │               │
     ▼               ▼
    Questions      Proctoring
     │               │
     └───────┬───────┘
             ▼
        Submit Test
             │
             ▼
       Evaluate Answers
             │
             ▼
       Generate Results
             │
             ▼
        Skill Analysis
             │
             ▼
        Identify Gaps
             │
             ▼
        AI Career Roadmap

---

# 🤖 AI/ML Roadmap

AI is an important part of the future direction of TAAS.

## 1. Skill Gap Detection

Analyze assessment results to identify areas where a user has demonstrated lower proficiency.

## 2. Personalized Learning Paths

Generate learning sequences based on:

    Current Skills
          +
    Assessment Results
          +
    Target Career
          ↓
    Personalized Learning Path

## 3. Career Roadmap Generation

The platform can generate individualized career development roadmaps:

    Current Level
          │
          ▼
    Skill Assessment
          │
          ▼
    Skill Gap Analysis
          │
          ▼
    Foundation Skills
          │
          ▼
    Intermediate Skills
          │
          ▼
    Advanced Skills
          │
          ▼
    Projects / Experience
          │
          ▼
    Target Career Role

## 4. Intelligent Recommendations

Future versions can incorporate additional signals such as:

- Assessment performance
- Skill proficiency
- Learning progress
- User-selected career goals
- Project experience
- Certifications
- Preferred technologies
- Job-role requirements

---

# 🔒 Security & Privacy

Because TAAS can process assessment and user data, security and privacy are important platform requirements.

Recommended practices include:

- Never commit API secrets to Git
- Use environment variables for configuration
- Apply appropriate Supabase Row Level Security policies
- Validate user input
- Restrict administrative functionality
- Protect assessment results
- Minimize unnecessary personal-data collection
- Clearly communicate how proctoring data is processed
- Apply appropriate retention policies for assessment and proctoring data

---

# 👨‍💻 Development Guidelines

## Components

Prefer reusable React components instead of duplicating UI logic.

## TypeScript

Use explicit types for important application data and avoid unnecessary use of `any`.

## Validation

Use Zod and React Hook Form where appropriate for validated forms.

## Data Fetching

Use TanStack Query for server-state operations where appropriate.

## UI

Prefer the existing component system and Tailwind CSS instead of introducing unnecessary styling frameworks.

## AI/ML

AI/ML functionality should be designed with:

- Explainability
- Data minimization
- Error handling
- Human review where appropriate
- Clear distinction between recommendations and definitive decisions

---

# 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run build:dev` | Create development-mode build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest tests |
| `npm run test:watch` | Run Vitest in watch mode |

---

# 🗺️ Future Roadmap

## Assessment

- [ ] Expand skill-test question banks
- [ ] Improve assessment analytics
- [ ] Add more assessment types
- [ ] Improve test reliability and validation

## Proctoring

- [ ] Improve object-detection reliability
- [ ] Add configurable proctoring rules
- [ ] Improve event logging
- [ ] Add administrator review workflows
- [ ] Improve privacy controls

## AI/ML

- [ ] AI-powered skill-gap analysis
- [ ] Personalized career roadmaps
- [ ] AI learning recommendations
- [ ] Career-role matching based on skills
- [ ] Personalized assessment generation
- [ ] AI-powered performance insights

## Analytics

- [ ] User performance dashboards
- [ ] Skill progression visualization
- [ ] Assessment analytics
- [ ] Organization-level analytics
- [ ] Cohort analysis

## Platform

- [ ] Improved role-based access control
- [ ] Better administration tools
- [ ] Notifications
- [ ] Certifications
- [ ] Learning-resource integration
- [ ] Mobile-friendly assessment experience

---

# 🤝 Contributing

Contributions are welcome.

A typical contribution workflow:

    # Create a feature branch
    git checkout -b feature/your-feature

    # Install dependencies
    npm install

    # Start development
    npm run dev

    # Run linting
    npm run lint

    # Run tests
    npm run test

    # Build the project
    npm run build

When submitting a contribution, include:

- What was changed
- Why the change was needed
- Relevant screenshots for UI changes
- Tests added or updated
- Any database or configuration changes

---

# 📄 License

This project is currently maintained as part of the TAAS project.

Add the appropriate license information before publicly distributing the project.

---

# 🌟 TAAS Vision

TAAS aims to evolve from a traditional assessment platform into an intelligent talent-development ecosystem.

The core concept is:

    ┌─────────────────┐
    │      USER       │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │   ASSESSMENTS   │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  SKILL PROFILE  │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │   AI ANALYSIS   │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │   SKILL GAPS    │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ CAREER ROADMAP  │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │     GROWTH      │
    └─────────────────┘

### Assess → Analyze → Personalize → Develop → Advance

---

# 🛠️ Built With

TAAS is built using modern web technologies including:

**React • TypeScript • Vite • Tailwind CSS • Supabase • TanStack Query • TensorFlow.js • COCO-SSD • Radix UI • Framer Motion**

---

<p align="center">
  Built with ❤️ for better talent assessment and career development.
</p>

