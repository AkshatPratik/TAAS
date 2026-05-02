import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { CheckCircle, Clock, Lock, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useRoadmaps, useSubmissions, useSubmitCheckpoint, useModuleQuizResults } from "@/lib/api";

export default function Roadmaps() {
  const { user } = useAuth();
  const { data: roadmaps, isLoading: loadingRoadmaps } = useRoadmaps();
  const { data: submissions, isLoading: loadingSubmissions } = useSubmissions(user?.id);
  const { data: quizResults, isLoading: loadingQuizzes } = useModuleQuizResults(user?.id);
  const submitMutation = useSubmitCheckpoint();
  
  const [expandedRoadmap, setExpandedRoadmap] = useState<string | null>(null);
  const [submitModal, setSubmitModal] = useState<string | null>(null);
  const [githubLink, setGithubLink] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const getCheckpointStatus = (cpId: string) => {
    if (!submissions) return "locked";
    const subs = submissions.filter((s) => s.checkpoint_id === cpId);
    const latest = subs[0]; // ordered by submitted_at DESC, so [0] is latest
    if (!latest) return "locked";
    if (latest.status === "pending") return "pending";
    if (latest.status === "evaluated" && (latest.score ?? 0) >= 60) return "completed";
    if (latest.status === "evaluated") return "failed";
    return "locked";
  };

  const getLatestScore = (cpId: string) => {
    if (!submissions) return null;
    const subs = submissions.filter((s) => s.checkpoint_id === cpId);
    return subs[0]?.score;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !submitModal) return;

    toast({ title: "📤 Submitting...", description: "Please wait" });

    try {
      await submitMutation.mutateAsync({
        student_id: user.id,
        checkpoint_id: submitModal,
        github_link: githubLink || null,
        description: description || "Project submission",
        status: "pending", // In real life, it stays pending until Admin reviews. For demo we used mock evaluate, but we'll stick to a real pending state for Supabase.
      });

      toast({ title: "📤 Submission received!", description: "It is now pending evaluation." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }

    setSubmitModal(null);
    setGithubLink("");
    setDescription("");
  };

  if (loadingRoadmaps || loadingSubmissions || loadingQuizzes || !roadmaps) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  // Set initial expanded roadmap
  if (!expandedRoadmap && roadmaps.length > 0) {
    setExpandedRoadmap(roadmaps[0].id);
  }

  return (
    <div className="container max-w-5xl py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold">Learning Roadmaps</h1>
        <p className="mt-1 text-muted-foreground">Follow structured paths to verify your skills.</p>
      </motion.div>

      <div className="mt-8 space-y-6">
        {roadmaps.map((roadmap) => {
          const allCps = roadmap.modules.flatMap((m) => m.checkpoints);
          const completed = allCps.filter((cp) => getCheckpointStatus(cp.id) === "completed").length;
          const progress = allCps.length ? (completed / allCps.length) * 100 : 0;

          return (
            <motion.div key={roadmap.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card overflow-hidden">
              <button
                onClick={() => setExpandedRoadmap(expandedRoadmap === roadmap.id ? null : roadmap.id)}
                className="flex w-full items-center justify-between p-6 text-left"
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{roadmap.icon}</span>
                  <div>
                    <h2 className="font-display text-xl font-semibold">{roadmap.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{roadmap.description}</p>
                  </div>
                </div>
                <div className="hidden items-center gap-4 sm:flex">
                  <div className="text-right">
                    <div className="text-sm font-medium">{completed}/{allCps.length}</div>
                    <div className="text-xs text-muted-foreground">completed</div>
                  </div>
                  <div className="w-24">
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
              </button>

              {expandedRoadmap === roadmap.id && (
                <div className="border-t border-border p-6 pt-4">
                  {roadmap.modules.map((mod) => (
                    <div key={mod.id} className="mb-6 last:mb-0">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                          Module {mod.order}: {mod.title}
                        </h3>
                        {(() => {
                          const attempts = quizResults?.filter(r => r.module_id === mod.id) || [];
                          if (attempts.length > 0) {
                            const bestScore = attempts.reduce((prev, current) => (prev.score > current.score) ? prev : current);
                            const pct = Math.round((bestScore.score / bestScore.total_questions) * 100);
                            return (
                              <div className="flex items-center gap-2">
                                <Badge className={pct >= 70 ? "bg-success text-success-foreground" : pct >= 40 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}>
                                  Best Score: {pct}%
                                </Badge>
                                {attempts.length < 3 && (
                                  <Button size="sm" variant="outline" className="h-7 text-xs" asChild>
                                    <Link to={`/quiz/${mod.id}`}>Retake</Link>
                                  </Button>
                                )}
                              </div>
                            );
                          }
                          return (
                            <Button size="sm" variant="outline" className="h-7 text-xs" asChild>
                              <Link to={`/quiz/${mod.id}`}>Take Module Quiz</Link>
                            </Button>
                          );
                        })()}
                      </div>
                      <div className="space-y-2">
                        {mod.checkpoints.map((cp) => {
                          const status = getCheckpointStatus(cp.id);
                          const score = getLatestScore(cp.id);
                          return (
                            <div key={cp.id} className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
                              <div className="flex items-center gap-3">
                                {status === "completed" ? (
                                  <CheckCircle className="h-5 w-5 text-success" />
                                ) : status === "pending" ? (
                                  <Loader2 className="h-5 w-5 animate-spin text-warning" />
                                ) : status === "failed" ? (
                                  <Clock className="h-5 w-5 text-destructive" />
                                ) : (
                                  <Lock className="h-5 w-5 text-muted-foreground" />
                                )}
                                <div>
                                  <div className="text-sm font-medium">{cp.title}</div>
                                  <div className="text-xs text-muted-foreground">{cp.description}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {status === "completed" && (
                                  <Badge className="bg-success text-success-foreground">{score}%</Badge>
                                )}
                                {status === "pending" && (
                                  <Badge variant="outline" className="border-warning text-warning">Pending Review</Badge>
                                )}
                                {status === "failed" && (
                                  <>
                                    <Badge variant="outline" className="border-destructive text-destructive">{score}%</Badge>
                                    <Button size="sm" variant="outline" onClick={() => setSubmitModal(cp.id)}>Resubmit</Button>
                                  </>
                                )}
                                {status === "locked" && (
                                  <Button size="sm" variant="outline" onClick={() => setSubmitModal(cp.id)}>Submit Checkpoint</Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Submit Modal */}
      {submitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setSubmitModal(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-card-hover"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg font-semibold">Submit Checkpoint</h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">GitHub Link (optional)</label>
                <Input placeholder="https://github.com/..." value={githubLink} onChange={(e) => setGithubLink(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Description</label>
                <Textarea placeholder="Describe your implementation..." rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-gradient-primary text-primary-foreground" disabled={submitMutation.isPending}>
                  {submitMutation.isPending ? "Submitting..." : "Submit"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setSubmitModal(null)} disabled={submitMutation.isPending}>Cancel</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
