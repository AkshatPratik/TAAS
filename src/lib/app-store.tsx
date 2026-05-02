import React, { createContext, useContext, useState, useCallback } from "react";
import type { Submission, Application, Project, NgoChallenge } from "./mock-data";
import { mockSubmissions, mockApplications, mockProjects, mockNgoChallenges } from "./mock-data";

interface AppState {
  submissions: Submission[];
  applications: Application[];
  projects: Project[];
  ngoChallenges: NgoChallenge[];
  addSubmission: (sub: Omit<Submission, "id" | "submittedAt">) => string;
  simulateEvaluation: (submissionId: string) => void;
  applyToProject: (projectId: string, studentId: string, studentName: string, talentScore: number) => boolean;
  hasApplied: (projectId: string, studentId: string) => boolean;
  updateApplicationStatus: (appId: string, status: "accepted" | "rejected") => void;
  evaluateSubmission: (subId: string, score: number, feedback: string) => void;
  getStudentScore: (studentId: string) => number;
  getImpactScore: (studentId: string) => number;
  getCompletedCheckpoints: (studentId: string) => string[];
  getCompletedChallenges: (studentId: string) => NgoChallenge[];
  addProject: (proj: Omit<Project, "id" | "postedAt" | "applicants">) => void;
  addNgoChallenge: (ch: Omit<NgoChallenge, "id" | "postedAt" | "status">) => void;
}

const AppContext = createContext<AppState | null>(null);

let subCounter = Date.now();

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [submissions, setSubmissions] = useState<Submission[]>([...mockSubmissions]);
  const [applications, setApplications] = useState<Application[]>([...mockApplications]);
  const [projects, setProjects] = useState<Project[]>([...mockProjects]);
  const [ngoChallenges, setNgoChallenges] = useState<NgoChallenge[]>([...mockNgoChallenges]);

  const addSubmission = useCallback((sub: Omit<Submission, "id" | "submittedAt">): string => {
    const id = `sub-${++subCounter}`;
    const newSub: Submission = {
      ...sub,
      id,
      submittedAt: new Date().toISOString().split("T")[0],
    };
    setSubmissions((prev) => [...prev, newSub]);
    return id;
  }, []);

  const simulateEvaluation = useCallback((submissionId: string) => {
    setTimeout(() => {
      const score = Math.floor(Math.random() * 26) + 70; // 70-95
      const feedbacks = [
        "Excellent implementation! Clean code and great structure.",
        "Well done! Shows strong understanding of concepts.",
        "Great work! Minor improvements possible in error handling.",
        "Impressive solution with good documentation.",
      ];
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === submissionId
            ? { ...s, status: "evaluated" as const, score, feedback: feedbacks[Math.floor(Math.random() * feedbacks.length)] }
            : s
        )
      );
    }, 2500);
  }, []);

  const applyToProject = useCallback((projectId: string, studentId: string, studentName: string, talentScore: number) => {
    let already = false;
    setApplications((prev) => {
      already = prev.some((a) => a.projectId === projectId && a.studentId === studentId);
      if (already) return prev;
      return [...prev, {
        id: `app-${++subCounter}`,
        studentId,
        studentName,
        projectId,
        projectTitle: projects.find((p) => p.id === projectId)?.title ?? "",
        status: "pending" as const,
        appliedAt: new Date().toISOString().split("T")[0],
        talentScore,
      }];
    });
    return !already;
  }, [projects]);

  const hasApplied = useCallback((projectId: string, studentId: string) => {
    return applications.some((a) => a.projectId === projectId && a.studentId === studentId);
  }, [applications]);

  const updateApplicationStatus = useCallback((appId: string, status: "accepted" | "rejected") => {
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status } : a))
    );
  }, []);

  const evaluateSubmission = useCallback((subId: string, score: number, feedback: string) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, status: "evaluated" as const, score, feedback } : s))
    );
  }, []);

  const getStudentScore = useCallback((studentId: string) => {
    const evaluated = submissions.filter((s) => s.studentId === studentId && s.status === "evaluated" && s.score);
    if (!evaluated.length) return 0;
    return Math.round(evaluated.reduce((sum, s) => sum + (s.score ?? 0), 0) / evaluated.length);
  }, [submissions]);

  const getImpactScore = useCallback((studentId: string) => {
    const ngoSubs = submissions.filter(
      (s) => s.studentId === studentId && s.challengeId && s.status === "evaluated" && s.score
    );
    if (!ngoSubs.length) return 0;
    return Math.round(ngoSubs.reduce((sum, s) => sum + (s.score ?? 0), 0) / ngoSubs.length);
  }, [submissions]);

  const getCompletedCheckpoints = useCallback((studentId: string) => {
    return submissions
      .filter((s) => s.studentId === studentId && s.status === "evaluated" && (s.score ?? 0) >= 60)
      .map((s) => s.checkpointId);
  }, [submissions]);

  const getCompletedChallenges = useCallback((studentId: string) => {
    const completedChallengeIds = submissions
      .filter((s) => s.studentId === studentId && s.challengeId && s.status === "evaluated" && (s.score ?? 0) >= 60)
      .map((s) => s.challengeId!);
    return ngoChallenges.filter((c) => completedChallengeIds.includes(c.id));
  }, [submissions, ngoChallenges]);

  const addProject = useCallback((proj: Omit<Project, "id" | "postedAt" | "applicants">) => {
    setProjects((prev) => [...prev, {
      ...proj,
      id: `proj-${++subCounter}`,
      postedAt: new Date().toISOString().split("T")[0],
      applicants: 0,
    }]);
  }, []);

  const addNgoChallenge = useCallback((ch: Omit<NgoChallenge, "id" | "postedAt" | "status">) => {
    setNgoChallenges((prev) => [...prev, {
      ...ch,
      id: `ngo-ch-${++subCounter}`,
      postedAt: new Date().toISOString().split("T")[0],
      status: "open",
    }]);
  }, []);

  return (
    <AppContext.Provider
      value={{
        submissions, applications, projects, ngoChallenges,
        addSubmission, simulateEvaluation, applyToProject, hasApplied,
        updateApplicationStatus, evaluateSubmission, getStudentScore, getImpactScore,
        getCompletedCheckpoints, getCompletedChallenges, addProject, addNgoChallenge,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppStore must be used within AppProvider");
  return ctx;
}
