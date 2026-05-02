# Full-Stack Migration Plan: Dummy Data to Real Backend

This document outlines the proposed system architecture, database schema, and key workflows to replace the current `mock-data.ts` and `app-store.tsx` dummy data with a realistic, scalable backend-driven infrastructure.

## System Architecture Proposed

To build a realistic, backend-driven flow while leveraging the existing Vite/React frontend, I propose the following architecture:

1.  **Frontend (Current)**:
    *   **Framework**: React (Vite) + TypeScript
    *   **Data Fetching**: `@tanstack/react-query` (already present) to handle caching, loading states, and API requests.
    *   **Routing**: `react-router-dom` (already present).
    *   **Styling**: Tailwind CSS + Shadcn UI.
2.  **Backend (Proposed)**:
    *   **Framework**: Node.js with Express.js.
    *   **ORM**: Prisma ORM for type-safe database access (pairs perfectly with TypeScript).
    *   **Authentication**: JWT-based stateless authentication (cookies or local storage).
3.  **Database**:
    *   PostgreSQL (provides strong relational integrity for interrelated concepts like students, submissions, startups, and NGOs).

> [!TIP]
> Alternatively, if you want a faster "Serverless" architecture without managing a Node.js server, we can use **Supabase** (PostgreSQL + Auth + Auto-generated APIs) or **Firebase**. Let me know your preference in the feedback!

---

## Database Schema (Relational structure)

The schema will be migrated from `mock-data.ts` to a robust relational model.

### 1. `User`
Stores all account types with a `Role` discriminator.
*   `id` (PK, UUID)
*   `name` (String)
*   `email` (String, Unique)
*   `passwordHash` (String)
*   `role` (Enum: `STUDENT`, `STARTUP`, `NGO`, `ADMIN`)
*   `avatarUrl` (String, nullable)
*   `createdAt` (DateTime)

### 2. `Roadmap` & `Module` & `Checkpoint`
*   **Roadmap**: `id` (PK), `title`, `description`, `icon`
*   **Module**: `id` (PK), `roadmapId` (FK), `title`, `description`, `order`
*   **Checkpoint**: `id` (PK), `moduleId` (FK), `title`, `description`, `order`, `passingScore`

### 3. `Project` (Created by Startups/Businesses)
*   `id` (PK)
*   `startupId` (FK -> User.id)
*   `title`, `description`
*   `requiredSkills` (JSON/Array of Strings)
*   `minScore` (Integer)
*   `status` (Enum: `OPEN`, `CLOSED`)
*   `postedAt` (DateTime)

### 4. `NgoChallenge` (Created by NGOs)
*   `id` (PK)
*   `ngoId` (FK -> User.id)
*   `title`, `description`
*   `skills` (JSON/Array of Strings)
*   `difficulty` (Enum: `BEGINNER`, `INTERMEDIATE`, `ADVANCED`)
*   `status` (Enum: `OPEN`, `CLOSED`)
*   `postedAt` (DateTime)

### 5. `Submission` (Student submitting work)
Handles both Checkpoint submissions (for Roadmap progress) and Challenge submissions (for NGOs).
*   `id` (PK)
*   `studentId` (FK -> User.id)
*   `checkpointId` (FK -> Checkpoint.id, nullable)
*   `challengeId` (FK -> NgoChallenge.id, nullable)
*   `githubLink` (String, nullable)
*   `description` (String)
*   `status` (Enum: `PENDING`, `EVALUATED`)
*   `score` (Integer, nullable)
*   `feedback` (Text, nullable)
*   `submittedAt` (DateTime)

### 6. `Application` (Student applying to Startup Projects)
*   `id` (PK)
*   `studentId` (FK -> User.id)
*   `projectId` (FK -> Project.id)
*   `status` (Enum: `PENDING`, `ACCEPTED`, `REJECTED`)
*   `talentScoreSnapshot` (Integer - Score at the time of application)
*   `appliedAt` (DateTime)

---

## Key Workflows by User Role

### 👩‍💻 1. Student Workflow
1.  **Authentication**: Signs up as a "Student".
2.  **Learning Journey**: Browses `Roadmaps`. Sees detailed `Modules` and `Checkpoints`.
3.  **Submission**: Uploads `.zip` or GitHub links to complete a `Checkpoint` or an `NgoChallenge`.
4.  **Profile Scoring**: Once the Admin evaluates their Checkpoint submission, their aggregate "Talent Score" updates. Once an NGO evaluates a challenge submission, their "Impact Score" updates.
5.  **Marketplace**: Browses open `Projects` (from Startups). If their `TalentScore >= Project.minScore`, they can submit an `Application`.

### 🏢 2. Startup / Business Workflow
1.  **Authentication**: Signs up as a "Startup".
2.  **Job Posting**: Creates new `Projects` indicating required skills, descriptions, and the minimum Talent Score required.
3.  **Hiring**: Reviews `Applications` from Students. Rejects or Accepts students. Accepted students' contact details become visible.

### 🤝 3. NGO Workflow
1.  **Authentication**: Signs up as an "NGO".
2.  **Challenge Posting**: Posts real-world problems as `NgoChallenges` (categorized by difficulty/skills).
3.  **Reviewing Impact**: Evaluates Student `Submissions` mapped to their challenges. NGO grades the submission and leaves qualitative `feedback`.

### 🛡️ 4. Admin Workflow
1.  **Platform Management**: Has CRUD access to `Roadmap`, `Module`, and `Checkpoint` catalogs.
2.  **Assessment**: Views a queue of pending `Submissions` targeting Checkpoints. Awards the `score` and `feedback` to progress students through their roadmaps.

---

## User Review Required

> [!IMPORTANT]  
> Please let me know your preferred architecture approach to proceed:
> 
> **Option A: Full Custom Backend**
> Initialize a Node.js + Express + Prisma backend alongside the React frontend. I will create a `backend/` folder, define the database schema, write APIs, and configure CORS.
> 
> **Option B: Backend-as-a-Service (Supabase / Firebase)**
> Directly integrate a service like Supabase into the React app for database, authentication, and API handling without writing custom Node.js boilerplate. (Supabase is highly recommended for speed and SQL capabilities here).
> 
> **Option C: Detailed Mock Backend (`json-server`)**
> If you are not ready for a real DB/Server and just want to solidify the frontend API calls, we can enhance `json-server` to emulate a fully functioning REST API instead of React Context.
> 
> **Which option would you prefer?**
