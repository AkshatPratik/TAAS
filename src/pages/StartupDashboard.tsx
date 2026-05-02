import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Briefcase, Users, CheckCircle, Clock, Plus, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProjects, useStartupApplications, useCreateProject, useUpdateApplicationStatus } from "@/lib/api";

export default function StartupDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { data: myProjects, isLoading: loadingProjects } = useProjects(user?.id);
  const { data: allApps, isLoading: loadingApps } = useStartupApplications(user?.id);
  const createProjectMutation = useCreateProject();
  const updateAppMutation = useUpdateApplicationStatus();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [minScore, setMinScore] = useState(70);

  if (loadingProjects || loadingApps) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const projects = myProjects || [];
  const applications = allApps || [];
  const accepted = applications.filter((a) => a.status === "accepted");

  const stats = [
    { icon: Briefcase, label: "Active Projects", value: projects.length, color: "text-primary" },
    { icon: Users, label: "Total Applicants", value: applications.length, color: "text-info" },
    { icon: CheckCircle, label: "Accepted", value: accepted.length, color: "text-success" },
    { icon: Clock, label: "Pending Review", value: applications.filter((a) => a.status === "pending").length, color: "text-warning" },
  ];

  const handleAccept = async (appId: string, name: string) => {
    try {
      await updateAppMutation.mutateAsync({ id: appId, status: "accepted" });
      toast({ title: "✅ Candidate accepted!", description: `${name} has been accepted for the project.` });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleReject = async (appId: string, name: string) => {
    try {
      await updateAppMutation.mutateAsync({ id: appId, status: "rejected" });
      toast({ title: "Candidate rejected", description: `${name} has been rejected.` });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
      setSkillInput("");
    }
  };

  const handleCreateProject = async () => {
    if (!title.trim() || !description.trim()) {
      toast({ title: "Missing fields", description: "Please fill in title and description.", variant: "destructive" });
      return;
    }
    if (skills.length === 0) {
      toast({ title: "Add skills", description: "Please add at least one required skill.", variant: "destructive" });
      return;
    }
    
    try {
      await createProjectMutation.mutateAsync({
        startup_id: user?.id ?? "",
        title: title.trim(),
        description: description.trim(),
        required_skills: skills,
        min_score: minScore,
        status: "open",
      });
      toast({ title: "🚀 Project posted!", description: `"${title.trim()}" is now live on the marketplace.` });
      setTitle("");
      setDescription("");
      setSkills([]);
      setSkillInput("");
      setMinScore(70);
      setOpen(false);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="container max-w-6xl py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold">Startup Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Manage projects and review verified candidates.</p>
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

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Your Projects</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-primary text-primary-foreground">
                <Plus className="mr-1 h-4 w-4" /> Post New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Post a New Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Project Title</label>
                  <Input placeholder="e.g. Build a React Dashboard" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Description</label>
                  <Textarea placeholder="Describe the project scope and expectations..." value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Required Skills</label>
                  <div className="flex gap-2">
                    <Input placeholder="Add a skill" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())} />
                    <Button type="button" size="sm" variant="secondary" onClick={addSkill}>Add</Button>
                  </div>
                  {skills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {skills.map((s) => (
                        <Badge key={s} variant="secondary" className="gap-1">
                          {s}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => setSkills(skills.filter((x) => x !== s))} />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Minimum Talent Score: {minScore}</label>
                  <Input type="range" min={0} max={100} value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} className="h-8" />
                </div>
                <Button className="w-full bg-gradient-primary text-primary-foreground" onClick={handleCreateProject} disabled={createProjectMutation.isPending}>
                  {createProjectMutation.isPending ? "Publishing..." : "Publish Project"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="space-y-4">
          {projects.map((proj) => {
            const projApps = applications.filter((a) => a.project_id === proj.id);
            const reqSkills = (proj.required_skills as string[]) || [];
            
            return (
              <motion.div key={proj.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-lg font-semibold">{proj.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{proj.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {reqSkills.map((s) => (<Badge key={s} variant="secondary">{s}</Badge>))}
                      <Badge variant="outline">Min Score: {proj.min_score}</Badge>
                    </div>
                  </div>
                  <Badge className={proj.status === "open" ? "bg-success text-success-foreground" : "bg-secondary text-secondary-foreground"}>
                    {proj.status}
                  </Badge>
                </div>

                {projApps.length > 0 && (
                  <div className="mt-4 border-t border-border pt-4">
                    <h4 className="mb-2 text-sm font-medium">Applicants ({projApps.length})</h4>
                    <div className="space-y-2">
                      {projApps.map((app) => (
                        <div key={app.id} className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                              {app.studentName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-medium">{app.studentName}</div>
                              <div className="text-xs text-muted-foreground">Talent Score: {app.talent_score}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {app.status === "pending" ? (
                              <>
                                <Button size="sm" variant="outline" className="border-success text-success hover:bg-success/10" onClick={() => handleAccept(app.id, app.studentName)} disabled={updateAppMutation.isPending}>Accept</Button>
                                <Button size="sm" variant="outline" className="border-destructive text-destructive hover:bg-destructive/10" onClick={() => handleReject(app.id, app.studentName)} disabled={updateAppMutation.isPending}>Reject</Button>
                              </>
                            ) : (
                              <Badge variant="outline" className={app.status === "accepted" ? "border-success text-success" : "border-destructive text-destructive"}>
                                {app.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
          {projects.length === 0 && (
            <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
              No projects yet. Post your first project to start hiring verified talent!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
