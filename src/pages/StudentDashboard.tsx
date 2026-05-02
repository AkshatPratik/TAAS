import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { CheckCircle, Clock, Trophy, ArrowRight, Heart, Loader2, Award, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRoadmaps, useSubmissions, useNgoChallenges, useApplications, useSubmitCheckpoint, useStudentOpportunities, useModuleQuizResults, useStudentTestResults } from "@/lib/api";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { data: roadmaps, isLoading: loadingRoadmaps } = useRoadmaps();
  const { data: submissions, isLoading: loadingSubmissions } = useSubmissions(user?.id);
  const { data: ngoChallenges, isLoading: loadingChallenges } = useNgoChallenges();
  const { data: applications, isLoading: loadingApps } = useApplications(user?.id);
  const { data: opportunities, isLoading: loadingOpps } = useStudentOpportunities(user?.id);
  const { data: quizResults, isLoading: loadingQuizzes } = useModuleQuizResults(user?.id);
  const { data: testResults, isLoading: loadingTests } = useStudentTestResults(user?.id);
  const submitMutation = useSubmitCheckpoint();

  const [challengeSubmitId, setChallengeSubmitId] = useState<string | null>(null);
  const [githubLink, setGithubLink] = useState("");
  const [description, setDescription] = useState("");

  if (loadingRoadmaps || loadingSubmissions || loadingChallenges || loadingApps || loadingOpps || loadingQuizzes || loadingTests) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const mySubmissions = submissions || [];
  const completedCheckpoints = mySubmissions.filter((s) => s.status === "evaluated" && (s.score ?? 0) >= 60 && s.checkpoint_id);
  const pendingSubmissions = mySubmissions.filter((s) => s.status === "pending");
  const myApps = applications || [];

  // Scored calculations
  const checkSubs = mySubmissions.filter((s) => s.status === "evaluated" && s.checkpoint_id);
  const checkpointAvg = checkSubs.length ? Math.round(checkSubs.reduce((acc, s) => acc + (s.score || 0), 0) / checkSubs.length) : 0;

  const qResults = quizResults || [];
  // Pick highest score for each module across all attempts
  const bestQuizScores = Object.values(
    qResults.reduce((acc, r) => {
      const pct = Math.round((r.score / r.total_questions) * 100);
      if (!acc[r.module_id] || pct > acc[r.module_id]) acc[r.module_id] = pct;
      return acc;
    }, {} as Record<string, number>)
  );
  const quizAvg = bestQuizScores.length ? Math.round(bestQuizScores.reduce((sum, score) => sum + score, 0) / bestQuizScores.length) : 0;

  const tResults = testResults || [];
  const testAvg = tResults.length ? Math.round(tResults.reduce((acc, r) => acc + Math.round((r.score / r.total_questions) * 100), 0) / tResults.length) : 0;

  // Unified Talent Score Logic
  // Weights: Checkpoints (40%), Quizzes (30%), NGO Tests (30%)
  let totalWeight = 0;
  let weightedScore = 0;

  if (checkSubs.length > 0) { totalWeight += 0.4; weightedScore += checkpointAvg * 0.4; }
  if (qResults.length > 0) { totalWeight += 0.3; weightedScore += quizAvg * 0.3; }
  if (tResults.length > 0) { totalWeight += 0.3; weightedScore += testAvg * 0.3; }

  const unifiedTalentScore = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;

  const challengeSubs = mySubmissions.filter((s) => s.status === "evaluated" && s.challenge_id);
  const impactScore = challengeSubs.length ? Math.round(challengeSubs.reduce((acc, s) => acc + (s.score || 0), 0) / challengeSubs.length) : 0;
  
  const completedNgoChallenges = challengeSubs.filter(s => (s.score ?? 0) >= 60);

  const totalCheckpoints = roadmaps?.reduce((sum, r) => sum + r.modules.reduce((ms, m) => ms + m.checkpoints.length, 0), 0) || 0;

  const skills = completedCheckpoints.map((s) => {
    const cp = roadmaps?.flatMap((r) => r.modules.flatMap((m) => m.checkpoints)).find((c) => c.id === s.checkpoint_id);
    return cp?.title;
  }).filter(Boolean);

  const hasChallengeSubmission = (challengeId: string) => {
    return mySubmissions.some((s) => s.challenge_id === challengeId);
  };
  const getChallengeSubmission = (challengeId: string) => {
    return mySubmissions.filter((s) => s.challenge_id === challengeId).slice(-1)[0];
  };

  const handleChallengeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !challengeSubmitId) return;

    toast({ title: "📤 Submitting...", description: "Please wait" });

    try {
      await submitMutation.mutateAsync({
        student_id: user.id,
        challenge_id: challengeSubmitId,
        github_link: githubLink || null,
        description: description || "NGO challenge submission",
        status: "pending",
      });
      toast({ title: "📤 Challenge submission received!", description: "It is now pending evaluation." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }

    setChallengeSubmitId(null);
    setGithubLink("");
    setDescription("");
  };

  const statCards = [
    { icon: CheckCircle, label: "Completed", value: completedCheckpoints.length, color: "text-success" },
    { icon: Clock, label: "Pending", value: pendingSubmissions.length, color: "text-warning" },
    { icon: Trophy, label: "Talent Score", value: `${unifiedTalentScore}%`, color: "text-primary" },
    { icon: Heart, label: "Impact Score", value: impactScore ? `${impactScore}%` : "N/A", color: "text-destructive" },
  ];

  return (
    <div className="container max-w-6xl py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold">Welcome back, {user?.name} 👋</h1>
        <p className="mt-1 text-muted-foreground">Track your progress and discover new opportunities.</p>
      </motion.div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="rounded-xl border border-border bg-card p-5">
            <s.icon className={`mb-2 h-5 w-5 ${s.color}`} />
            <div className="font-display text-2xl font-bold">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold">Verified Talent Score</h2>
            <p className="text-sm text-muted-foreground">Based on checkpoints (40%), module quizzes (30%), and NGO tests (30%)</p>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary font-display text-2xl font-bold text-primary-foreground shadow-md">
              {unifiedTalentScore}
            </div>
            <div className="mt-2 text-xs text-muted-foreground flex gap-2">
              <span title="Checkpoints">CP: {checkpointAvg}%</span>
              <span title="Module Quizzes">MQ: {quizAvg}%</span>
              <span title="NGO Tests">NT: {testAvg}%</span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{completedCheckpoints.length}/{totalCheckpoints} checkpoints</span>
          </div>
          <Progress value={totalCheckpoints > 0 ? (completedCheckpoints.length / totalCheckpoints) * 100 : 0} className="h-2" />
        </div>
        {completedNgoChallenges.length > 0 && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-success/20 bg-success/5 px-3 py-2">
            <Award className="h-5 w-5 text-success" />
            <span className="text-sm font-medium text-success">NGO Verified Experience</span>
            <Badge variant="secondary" className="ml-auto">{completedNgoChallenges.length} completed</Badge>
          </div>
        )}
        {skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Verified Skills:</span>
            {skills.map((s) => (
              <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <Heart className="h-5 w-5 text-destructive" />
          <h2 className="font-display text-lg font-semibold">Real-World NGO Challenges</h2>
        </div>
        <div className="space-y-3">
          {ngoChallenges?.filter((c) => c.status === "open").map((ch) => {
            const sub = getChallengeSubmission(ch.id);
            const submitted = hasChallengeSubmission(ch.id);
            const skillsArr = (ch.skills as string[]) || [];

            return (
              <div key={ch.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-destructive/30 text-destructive text-xs">NGO Challenge</Badge>
                      <Badge className={
                        ch.difficulty === "beginner" ? "bg-success/10 text-success" :
                        ch.difficulty === "intermediate" ? "bg-warning/10 text-warning" :
                        "bg-destructive/10 text-destructive"
                      }>{ch.difficulty}</Badge>
                    </div>
                    <h3 className="mt-2 font-semibold">{ch.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{ch.description}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>by {ch.ngoName}</span>
                      <span>·</span>
                      <span>{new Date(ch.posted_at).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {skillsArr.map((s) => (<Badge key={s} variant="secondary" className="text-xs">{s}</Badge>))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {submitted && sub ? (
                      sub.status === "evaluated" ? (
                        <Badge className="bg-success text-success-foreground">{sub.score}%</Badge>
                      ) : sub.status === "accepted" ? (
                        <Badge className="bg-success text-success-foreground">Accepted</Badge>
                      ) : sub.status === "rejected" ? (
                        <Badge className="bg-destructive text-destructive-foreground">Rejected</Badge>
                      ) : (
                        <Badge variant="outline" className="border-warning text-warning">
                          Pending Review
                        </Badge>
                      )
                    ) : (
                      <Button size="sm" className="bg-gradient-primary text-primary-foreground" onClick={() => setChallengeSubmitId(ch.id)}>
                        Start Challenge
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {(!ngoChallenges || ngoChallenges.filter((c) => c.status === "open").length === 0) && (
            <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
              No NGO challenges available right now.
            </div>
          )}
        </div>
      </motion.div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Recent Submissions</h2>
            <Link to="/roadmaps" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {mySubmissions.slice(0, 4).map((sub) => {
              const cp = roadmaps?.flatMap((r) => r.modules.flatMap((m) => m.checkpoints)).find((c) => c.id === sub.checkpoint_id);
              const ngoChallenge = sub.challenge_id ? ngoChallenges?.find((c) => c.id === sub.challenge_id) : null;
              const label = ngoChallenge?.title ?? cp?.title ?? "Submission";
              return (
                <div key={sub.id} className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      {sub.challenge_id && <Heart className="h-3 w-3 text-destructive" />}
                      {label}
                    </div>
                    <div className="text-xs text-muted-foreground">{new Date(sub.submitted_at).toLocaleDateString()}</div>
                  </div>
                  {sub.status === "evaluated" ? (
                    <Badge variant={sub.score! >= 70 ? "default" : "secondary"} className={sub.score! >= 70 ? "bg-success text-success-foreground" : ""}>
                      {sub.score}%
                    </Badge>
                  ) : sub.status === "accepted" ? (
                    <Badge className="bg-success text-success-foreground">Accepted</Badge>
                  ) : sub.status === "rejected" ? (
                    <Badge className="bg-destructive text-destructive-foreground">Rejected</Badge>
                  ) : (
                    <Badge variant="outline" className="border-warning text-warning">Pending Review</Badge>
                  )}
                </div>
              );
            })}
            {mySubmissions.length === 0 && (
              <div className="py-4 text-center text-sm text-muted-foreground">No submissions yet. <Link to="/roadmaps" className="text-primary hover:underline">Start a roadmap</Link></div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">My Applications</h2>
            <Link to="/marketplace" className="text-sm text-primary hover:underline">Browse projects</Link>
          </div>
          {myApps.length > 0 ? (
            <div className="space-y-3">
              {myApps.map((app) => (
                <div key={app.id} className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                  <div>
                    <div className="text-sm font-medium">{app.projectTitle}</div>
                    <div className="text-xs text-muted-foreground">{new Date(app.applied_at).toLocaleDateString()}</div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      app.status === "accepted" ? "border-success text-success" :
                      app.status === "rejected" ? "border-destructive text-destructive" :
                      "border-warning text-warning"
                    }
                  >
                    {app.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <p>No applications yet.</p>
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <Link to="/marketplace">Explore Projects <ArrowRight className="ml-1 h-3 w-3" /></Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-semibold">Opportunities & Offers</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(opportunities || []).map((opp) => (
            <div key={opp.id} className="rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30">
              <div className="flex items-center justify-between mb-3">
                <Badge className={opp.type === 'job' ? "bg-primary text-primary-foreground" : "bg-info text-info-foreground"}>
                  {opp.type}
                </Badge>
                <div className="text-xs text-muted-foreground">{new Date(opp.created_at).toLocaleDateString()}</div>
              </div>
              <h3 className="font-semibold text-lg">{opp.title}</h3>
              <p className="text-sm font-medium text-primary mb-2">at {opp.companyName}</p>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{opp.description}</p>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="text-xs font-semibold text-muted-foreground">
                  {opp.salary_range || 'Competitive Pay'}
                </div>
                <Badge variant="outline" className="capitalize">{opp.status}</Badge>
              </div>
            </div>
          ))}
          {(!opportunities || opportunities.length === 0) && (
            <div className="col-span-full rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
              No opportunities received yet. Complete NGO challenges to get noticed by businesses!
            </div>
          )}
        </div>
      </motion.div>

      {challengeSubmitId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setChallengeSubmitId(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-card-hover"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-1">
              <Heart className="h-4 w-4 text-destructive" />
              <h3 className="font-display text-lg font-semibold">Submit NGO Challenge</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{ngoChallenges?.find((c) => c.id === challengeSubmitId)?.title}</p>
            <form onSubmit={handleChallengeSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">GitHub Link (optional)</label>
                <Input placeholder="https://github.com/..." value={githubLink} onChange={(e) => setGithubLink(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Description</label>
                <Textarea placeholder="Describe your solution..." rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-gradient-primary text-primary-foreground" disabled={submitMutation.isPending}>
                  {submitMutation.isPending ? "Submitting..." : "Submit Solution"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setChallengeSubmitId(null)}>Cancel</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
