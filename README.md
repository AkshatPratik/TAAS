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
