import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Search, Filter, MapPin, Clock, Check, Heart, Award, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMarketplaceProjects, useApplyToProject, useSubmissions, useApplications } from "@/lib/api";

export default function Marketplace() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { data: marketplaceProjects, isLoading: loadingProjects } = useMarketplaceProjects();
  const { data: submissions, isLoading: loadingSubmissions } = useSubmissions(user?.id);
  const { data: myApps, isLoading: loadingApps } = useApplications(user?.id);
  const applyMutation = useApplyToProject();

  const [search, setSearch] = useState("");
  const [filterNgo, setFilterNgo] = useState(false);

  if (loadingProjects || loadingSubmissions || loadingApps) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const projects = marketplaceProjects || [];
  const mySubmissions = submissions || [];
  
  // Computed scores for the logged in student
  const checkSubs = mySubmissions.filter((s) => s.status === "evaluated" && s.checkpoint_id);
  const studentScore = checkSubs.length ? Math.round(checkSubs.reduce((acc, s) => acc + (s.score || 0), 0) / checkSubs.length) : 0;
  
  const challengeSubs = mySubmissions.filter((s) => s.status === "evaluated" && s.challenge_id);
  const impactScore = challengeSubs.length ? Math.round(challengeSubs.reduce((acc, s) => acc + (s.score || 0), 0) / challengeSubs.length) : 0;
  
  const completedNgo = challengeSubs.filter(s => (s.score ?? 0) >= 60);

  const isEligible = (project: any) => {
    if (user?.role !== "student") return false;
    // Simple mock logic: check if the overall student score is >= project min score
    // Full real logic would check the exact required checkpoints from the array
    return studentScore >= project.min_score;
  };

  const hasApplied = (projectId: string) => {
    return myApps?.some(a => a.project_id === projectId);
  };

  const filtered = projects.filter(
    (p) => 
      p.title.toLowerCase().includes(search.toLowerCase()) || 
      (p.required_skills as string[] || []).some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  const handleApply = async (projectId: string, title: string) => {
    if (!user) return;
    
    try {
      await applyMutation.mutateAsync({
        student_id: user.id,
        project_id: projectId,
        status: "pending",
        talent_score: studentScore,
      });
      toast({ title: "✅ Application submitted!", description: `You applied to "${title}". The startup will review your profile.` });
    } catch (e: any) {
      if (e.code === '23505') { // Postgres unique constraint violation
        toast({ title: "Already applied", description: "You've already applied to this project.", variant: "destructive" });
      } else {
        toast({ title: "Error", description: e.message, variant: "destructive" });
      }
    }
  };

  return (
    <div className="container max-w-5xl py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold">Project Marketplace</h1>
        <p className="mt-1 text-muted-foreground">Browse real projects from startups. Apply with your verified skills.</p>
      </motion.div>

      {user?.role === "student" && (completedNgo.length > 0 || impactScore > 0) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-6 rounded-xl border border-success/20 bg-success/5 p-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-success" />
            <span className="text-sm font-medium text-success">Your profile shows NGO Verified Experience to businesses</span>
            {impactScore > 0 && <Badge variant="secondary" className="ml-auto">Impact Score: {impactScore}%</Badge>}
          </div>
        </motion.div>
      )}

      <div className="mt-6 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by project or skill..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button variant={filterNgo ? "default" : "outline"} size="sm" onClick={() => setFilterNgo(!filterNgo)} className="gap-1">
          <Heart className="h-3 w-3" /> NGO Exp
        </Button>
        <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
      </div>

      <div className="mt-8 space-y-4">
        {filtered.map((project, i) => {
          const eligible = isEligible(project);
          const applied = user ? hasApplied(project.id) : false;
          const skillsStr = (project.required_skills as string[]) || [];

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border bg-card p-6 transition-all hover:shadow-card"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-semibold">{project.title}</h3>
                    <Badge className={project.status === "open" ? "bg-success/10 text-success" : "bg-secondary"}>{project.status}</Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {project.startupName}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(project.posted_at).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{project.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {skillsStr.map((s) => (<Badge key={s} variant="secondary">{s}</Badge>))}
                    <Badge variant="outline">Min Score: {project.min_score}</Badge>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-sm text-muted-foreground">{project.applicants} applicants</div>
                  {user?.role === "student" && (
                    applied ? (
                      <Button size="sm" variant="outline" disabled className="border-success text-success">
                        <Check className="mr-1 h-3 w-3" /> Applied
                      </Button>
                    ) : eligible ? (
                      <Button size="sm" className="bg-gradient-primary text-primary-foreground" onClick={() => handleApply(project.id, project.title)} disabled={applyMutation.isPending}>
                        {applyMutation.isPending ? "Applying..." : "Apply Now"}
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled className="opacity-50">Not Eligible (Score {studentScore}/{project.min_score})</Button>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            No projects found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
