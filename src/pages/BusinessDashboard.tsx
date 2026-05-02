import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Users, Search, Filter, Star, Send, Briefcase, Loader2, Heart, Plus, X, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBusinessStudents, useBusinessShortlist, useShortlistStudent, useSendOpportunity, useProjects, useCreateProject, useStartupApplications, useUpdateApplicationStatus } from "@/lib/api";

export default function BusinessDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { data: students, isLoading: loadingStudents } = useBusinessStudents();
  const { data: shortlist, isLoading: loadingShortlist } = useBusinessShortlist(user?.id);
  const shortlistMutation = useShortlistStudent();
  const sendOpportunityMutation = useSendOpportunity();
  const { data: myProjects, isLoading: loadingProjects } = useProjects(user?.id);
  const { data: allApps, isLoading: loadingApps } = useStartupApplications(user?.id);
  const createProjectMutation = useCreateProject();
  const updateAppMutation = useUpdateApplicationStatus();

  // Active tab
  const [activeTab, setActiveTab] = useState<"talent" | "jobs">("talent");

  // Filters
  const [minScore, setMinScore] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [skillSearch, setSkillSearch] = useState("");

  // Opportunity Modal
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [oppTitle, setOppTitle] = useState("");
  const [oppDesc, setOppDesc] = useState("");
  const [oppType, setOppType] = useState<"internship" | "job">("internship");
  const [oppSalary, setOppSalary] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Job Post Modal
  const [jobOpen, setJobOpen] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobSkillInput, setJobSkillInput] = useState("");
  const [jobSkills, setJobSkills] = useState<string[]>([]);
  const [jobMinScore, setJobMinScore] = useState(60);

  if (loadingStudents || loadingShortlist || loadingProjects || loadingApps) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const projects = myProjects || [];
  const applications = allApps || [];

  const addJobSkill = () => {
    const s = jobSkillInput.trim();
    if (s && !jobSkills.includes(s)) {
      setJobSkills([...jobSkills, s]);
      setJobSkillInput("");
    }
  };

  const handleCreateJob = async () => {
    if (!user?.id) {
      toast({ title: "Not logged in", description: "Please log in to post a job.", variant: "destructive" });
      return;
    }
    if (!jobTitle.trim() || !jobDesc.trim()) {
      toast({ title: "Missing fields", description: "Please fill in title and description.", variant: "destructive" });
      return;
    }
    if (jobSkills.length === 0) {
      toast({ title: "Add skills", description: "Please add at least one required skill.", variant: "destructive" });
      return;
    }
    try {
      await createProjectMutation.mutateAsync({
        startup_id: user?.id ?? "",
        title: jobTitle.trim(),
        description: jobDesc.trim(),
        required_skills: jobSkills,
        min_score: jobMinScore,
        status: "open",
      });
      toast({ title: "🚀 Job posted!", description: `"${jobTitle.trim()}" is now live on the marketplace.` });
      setJobTitle("");
      setJobDesc("");
      setJobSkills([]);
      setJobSkillInput("");
      setJobMinScore(60);
      setJobOpen(false);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleAcceptApp = async (appId: string, name: string) => {
    try {
      await updateAppMutation.mutateAsync({ id: appId, status: "accepted" });
      toast({ title: "✅ Candidate accepted!", description: `${name} has been accepted.` });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleRejectApp = async (appId: string, name: string) => {
    try {
      await updateAppMutation.mutateAsync({ id: appId, status: "rejected" });
      toast({ title: "Candidate rejected", description: `${name} has been rejected.` });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const shortlistedIds = new Set(shortlist?.map(s => s.student_id) || []);

  const filteredStudents = (students || []).filter(s => {
    const matchesScore = (s.score || 0) >= minScore;
    const matchesCategory = categoryFilter === "" || s.challengeTitle.toLowerCase().includes(categoryFilter.toLowerCase());
    const matchesSkill = skillSearch === "" || s.skills.some((sk: string) => sk.toLowerCase().includes(skillSearch.toLowerCase()));
    return matchesScore && matchesCategory && matchesSkill;
  });

  const handleShortlist = async (studentId: string) => {
    const isShortlisted = shortlistedIds.has(studentId);
    try {
      await shortlistMutation.mutateAsync({ 
        business_id: user?.id || "", 
        student_id: studentId, 
        isShortlisted 
      });
      toast({ 
        title: isShortlisted ? "Removed from shortlist" : "Added to shortlist!", 
        description: isShortlisted ? "Candidate removed." : "Candidate added to your talent pool." 
      });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleSendOpportunity = async () => {
    if (!oppTitle || !oppDesc) {
      toast({ title: "Missing fields", description: "Please fill in title and description.", variant: "destructive" });
      return;
    }

    try {
      await sendOpportunityMutation.mutateAsync({
        business_id: user?.id || "",
        student_id: selectedStudent.studentId,
        title: oppTitle,
        description: oppDesc,
        type: oppType,
        salary_range: oppSalary,
        status: "sent"
      });
      toast({ title: "🚀 Opportunity sent!", description: `Your offer has been sent to ${selectedStudent.studentName}.` });
      setIsModalOpen(false);
      setOppTitle("");
      setOppDesc("");
      setOppSalary("");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="container max-w-6xl py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold">Business Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Discover and hire top talent verified by real-world NGO challenges.</p>
      </motion.div>

      {/* Tab Switcher */}
      <div className="mt-8 flex gap-2 rounded-xl border border-border bg-card p-1.5">
        <button
          onClick={() => setActiveTab("talent")}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
            activeTab === "talent"
              ? "bg-gradient-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="mr-2 inline h-4 w-4" /> Discover Talent
        </button>
        <button
          onClick={() => setActiveTab("jobs")}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
            activeTab === "jobs"
              ? "bg-gradient-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Briefcase className="mr-2 inline h-4 w-4" /> Marketplace Jobs ({projects.length})
        </button>
      </div>

      {activeTab === "talent" && (<>

      {/* Filters */}
      <div className="mt-8 grid grid-cols-1 gap-4 rounded-2xl border border-border bg-card p-6 md:grid-cols-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Minimum Score</label>
          <div className="flex items-center gap-2">
            <Input type="number" min={0} max={100} value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} className="h-10" />
            <Star className="h-4 w-4 text-warning" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Challenge Category</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="e.g. Web, Design..." value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="h-10 pl-9" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Skill Keyword</label>
          <div className="relative">
            <Filter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="e.g. React, Python..." value={skillSearch} onChange={(e) => setSkillSearch(e.target.value)} className="h-10 pl-9" />
          </div>
        </div>
        <div className="flex items-end">
          <div className="w-full rounded-lg bg-primary/5 p-3 text-center">
            <div className="text-sm font-medium text-primary">{filteredStudents.length} Candidates Found</div>
          </div>
        </div>
      </div>

      {/* Talent List */}
      <div className="mt-8 space-y-4">
        {filteredStudents.map((s) => (
          <motion.div 
            key={s.id} 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="group relative rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-glow"
          >
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-xl font-bold text-primary">
                  {s.studentName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold">{s.studentName}</h3>
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="h-3 w-3" />
                    <span>Completed: <span className="font-medium text-foreground">{s.challengeTitle}</span></span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {s.skills.map((skill: string) => (
                      <Badge key={skill} variant="secondary" className="bg-secondary/50 text-[10px] uppercase tracking-wider">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Score</div>
                  <div className="text-2xl font-bold text-primary">{s.score}%</div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button 
                    variant={shortlistedIds.has(s.studentId) ? "default" : "outline"}
                    size="sm"
                    className="gap-2"
                    onClick={() => handleShortlist(s.studentId)}
                  >
                    <Heart className={`h-4 w-4 ${shortlistedIds.has(s.studentId) ? "fill-current" : ""}`} />
                    {shortlistedIds.has(s.studentId) ? "Shortlisted" : "Shortlist"}
                  </Button>
                  
                  <Dialog open={isModalOpen && selectedStudent?.id === s.id} onOpenChange={(val) => {
                    setIsModalOpen(val);
                    if (val) setSelectedStudent(s);
                  }}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-gradient-primary text-primary-foreground gap-2">
                        <Send className="h-4 w-4" /> Send Offer
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Send Opportunity to {s.studentName}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Opportunity Title</label>
                          <Input placeholder="e.g. Frontend Intern" value={oppTitle} onChange={(e) => setOppTitle(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Type</label>
                          <Select value={oppType} onValueChange={(v: any) => setOppType(v)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="internship">Internship</SelectItem>
                              <SelectItem value="job">Full-time Job</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Salary / Stipend Range</label>
                          <Input placeholder="e.g. $1000 - $1500 / month" value={oppSalary} onChange={(e) => setOppSalary(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Description</label>
                          <Textarea 
                            placeholder="Tell the student about the role and why they are a good fit..." 
                            value={oppDesc} 
                            onChange={(e) => setOppDesc(e.target.value)}
                            rows={4}
                          />
                        </div>
                        <Button 
                          className="w-full bg-gradient-primary text-primary-foreground" 
                          onClick={handleSendOpportunity}
                          disabled={sendOpportunityMutation.isPending}
                        >
                          {sendOpportunityMutation.isPending ? "Sending..." : "Send Opportunity"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredStudents.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No candidates match your criteria</h3>
            <p className="mt-1 text-muted-foreground">Try adjusting your filters to find more talent.</p>
          </div>
        )}
      </div>
      </>)}

      {/* ========== JOBS TAB ========== */}
      {activeTab === "jobs" && (
        <div className="mt-8">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: Briefcase, label: "Posted Jobs", value: projects.length, color: "text-primary" },
              { icon: Users, label: "Total Applicants", value: applications.length, color: "text-info" },
              { icon: CheckCircle, label: "Accepted", value: applications.filter(a => a.status === "accepted").length, color: "text-success" },
              { icon: Clock, label: "Pending", value: applications.filter(a => a.status === "pending").length, color: "text-warning" },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="rounded-xl border border-border bg-card p-5">
                <s.icon className={`mb-2 h-5 w-5 ${s.color}`} />
                <div className="font-display text-2xl font-bold">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Post Job Button + Dialog */}
          <div className="mt-8 mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Your Job Listings</h2>
            <Dialog open={jobOpen} onOpenChange={setJobOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-gradient-primary text-primary-foreground">
                  <Plus className="mr-1 h-4 w-4" /> Post New Job
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Post a Job to Marketplace</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Job Title</label>
                    <Input placeholder="e.g. Frontend Developer Intern" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Description</label>
                    <Textarea placeholder="Describe the role, responsibilities, and what you're looking for..." value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} rows={4} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Required Skills</label>
                    <div className="flex gap-2">
                      <Input placeholder="Add a skill" value={jobSkillInput} onChange={(e) => setJobSkillInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addJobSkill())} />
                      <Button type="button" size="sm" variant="secondary" onClick={addJobSkill}>Add</Button>
                    </div>
                    {jobSkills.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {jobSkills.map(s => (
                          <Badge key={s} variant="secondary" className="gap-1">
                            {s}
                            <X className="h-3 w-3 cursor-pointer" onClick={() => setJobSkills(jobSkills.filter(x => x !== s))} />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Minimum Talent Score: {jobMinScore}</label>
                    <Input type="range" min={0} max={100} value={jobMinScore} onChange={(e) => setJobMinScore(Number(e.target.value))} className="h-8" />
                  </div>
                  <Button className="w-full bg-gradient-primary text-primary-foreground" onClick={handleCreateJob} disabled={createProjectMutation.isPending}>
                    {createProjectMutation.isPending ? "Publishing..." : "Publish Job"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Job Listings */}
          <div className="space-y-4">
            {projects.map((proj) => {
              const projApps = applications.filter(a => a.project_id === proj.id);
              const reqSkills = (proj.required_skills as string[]) || [];

              return (
                <motion.div key={proj.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-lg font-semibold">{proj.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{proj.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {reqSkills.map(s => (<Badge key={s} variant="secondary">{s}</Badge>))}
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
                        {projApps.map(app => (
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
                                  <Button size="sm" variant="outline" className="border-success text-success hover:bg-success/10" onClick={() => handleAcceptApp(app.id, app.studentName)} disabled={updateAppMutation.isPending}>Accept</Button>
                                  <Button size="sm" variant="outline" className="border-destructive text-destructive hover:bg-destructive/10" onClick={() => handleRejectApp(app.id, app.studentName)} disabled={updateAppMutation.isPending}>Reject</Button>
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
              <div className="rounded-xl border border-dashed border-border p-12 text-center">
                <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">No jobs posted yet</h3>
                <p className="mt-1 text-muted-foreground">Post your first job to start receiving applications from verified talent.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
