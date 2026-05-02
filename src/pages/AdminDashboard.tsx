import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Users, BookOpen, FileCheck, BarChart3, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAdminSubmissions, useEvaluateSubmission, useAdminApplications, useMarketplaceProjects, useRoadmaps } from "@/lib/api";

export default function AdminDashboard() {
  const { toast } = useToast();
  
  const { data: allSubmissions, isLoading: loadingSubs } = useAdminSubmissions();
  const { data: allApplications, isLoading: loadingApps } = useAdminApplications();
  const { data: projects, isLoading: loadingProjects } = useMarketplaceProjects();
  const { data: roadmaps, isLoading: loadingRoadmaps } = useRoadmaps();
  const evaluateMutation = useEvaluateSubmission();

  if (loadingSubs || loadingApps || loadingProjects || loadingRoadmaps) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const submissions = allSubmissions || [];
  const applications = allApplications || [];
  const activeProjects = projects || [];
  
  const pendingSubs = submissions.filter((s) => s.status === "pending");
  const evaluatedSubs = submissions.filter((s) => s.status === "evaluated");

  const stats = [
    { icon: Users, label: "Total Submissions", value: submissions.length, color: "text-primary" },
    { icon: BookOpen, label: "Roadmaps", value: roadmaps?.length || 0, color: "text-info" },
    { icon: FileCheck, label: "Pending Reviews", value: pendingSubs.length, color: "text-warning" },
    { icon: BarChart3, label: "Active Projects", value: activeProjects.length, color: "text-success" },
  ];

  const handleEvaluate = async (subId: string, cpTitle: string) => {
    const score = Math.floor(Math.random() * 21) + 75; // Random score 75-95 for dummy realistic grading
    const feedbacks = [
      "Excellent implementation! Clean code and great structure.",
      "Well done! Shows strong understanding of concepts.",
      "Great work! Minor improvements possible in error handling.",
      "Impressive solution with good documentation.",
    ];
    const feedback = feedbacks[Math.floor(Math.random() * feedbacks.length)];
    
    try {
      await evaluateMutation.mutateAsync({ id: subId, score, feedback });
      toast({ title: `📊 Evaluated: ${score}%`, description: `"${cpTitle}" has been scored. ${feedback}` });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="container max-w-6xl py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Monitor platform activity and review submissions.</p>
      </motion.div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="rounded-xl border border-border bg-card p-5">
            <s.icon className={`mb-2 h-5 w-5 ${s.color}`} />
            <div className="font-display text-2xl font-bold">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Pending Submissions */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">Pending Submissions</h2>
          {pendingSubs.length > 0 ? (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {pendingSubs.map((sub) => {
                const title = sub.checkpointTitle || "NGO Challenge / Unknown";
                return (
                  <div key={sub.id} className="rounded-lg bg-secondary/50 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-sm">{title}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{sub.description}</div>
                        {sub.github_link && (
                          <a href={sub.github_link} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs text-primary hover:underline">
                            View on GitHub →
                          </a>
                        )}
                      </div>
                      <Badge variant="outline" className="border-warning text-warning">Pending</Badge>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" className="bg-gradient-primary text-primary-foreground" onClick={() => handleEvaluate(sub.id, title)} disabled={evaluateMutation.isPending}>
                        Evaluate Mock Score
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-2 py-8 text-center text-muted-foreground">
              <CheckCircle className="h-5 w-5 text-success" />
              All submissions reviewed!
            </div>
          )}
        </div>

        {/* Recent Evaluations */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">Recent Evaluations</h2>
          <div className="space-y-3">
            {evaluatedSubs.slice(0, 5).map((sub) => {
              const title = sub.checkpointTitle || "NGO Challenge / Unknown";
              return (
                <div key={sub.id} className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                  <div>
                    <div className="text-sm font-medium">{title}</div>
                    <div className="text-xs text-muted-foreground">{sub.feedback}</div>
                  </div>
                  <Badge className={sub.score! >= 70 ? "bg-success text-success-foreground" : "bg-secondary text-secondary-foreground"}>
                    {sub.score}%
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Platform Analytics */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-8 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Platform Overview</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="text-center">
            <div className="font-display text-2xl font-bold text-primary">{applications.length}</div>
            <div className="text-sm text-muted-foreground">Total Applications</div>
          </div>
          <div className="text-center">
            <div className="font-display text-2xl font-bold text-success">{applications.filter(a => a.status === "accepted").length}</div>
            <div className="text-sm text-muted-foreground">Accepted</div>
          </div>
          <div className="text-center">
            <div className="font-display text-2xl font-bold text-warning">{submissions.length}</div>
            <div className="text-sm text-muted-foreground">Submissions</div>
          </div>
          <div className="text-center">
            <div className="font-display text-2xl font-bold text-info">
              {evaluatedSubs.length ? Math.round(evaluatedSubs.filter(s => (s.score ?? 0) >= 60).length / evaluatedSubs.length * 100) : 0}%
            </div>
            <div className="text-sm text-muted-foreground">Pass Rate</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
