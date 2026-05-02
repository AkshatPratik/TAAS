import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Heart, FileCheck, Users, Plus, X, Award, Loader2, ClipboardList, Eye, EyeOff, Trash2, ArrowRight, Check, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useNgoChallenges, useNgoSubmissions, useCreateNgoChallenge,
  useNgoTests, useCreateTest, usePublishTest, useDeleteTest,
  useNgoEvaluateSubmission
} from "@/lib/api";

const difficultyColors: Record<string, string> = {
  beginner: "bg-success/10 text-success",
  intermediate: "bg-warning/10 text-warning",
  advanced: "bg-destructive/10 text-destructive",
};

export default function NgoDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Challenges
  const { data: myChallenges, isLoading: loadingChallenges } = useNgoChallenges(user?.id);
  const { data: challengeSubs, isLoading: loadingSubs } = useNgoSubmissions(user?.id);
  const createChallengeMutation = useCreateNgoChallenge();
  const evaluateSubmissionMutation = useNgoEvaluateSubmission();

  // Tests
  const { data: myTests, isLoading: loadingTests } = useNgoTests(user?.id);
  const createTestMutation = useCreateTest();
  const publishTestMutation = usePublishTest();
  const deleteTestMutation = useDeleteTest();

  const [challengeOpen, setChallengeOpen] = useState(false);
  const [testOpen, setTestOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("intermediate");

  // Test create form
  const [testTitle, setTestTitle] = useState("");
  const [testDesc, setTestDesc] = useState("");
  const [testTimeLimit, setTestTimeLimit] = useState(30);

  if (loadingChallenges || loadingSubs || loadingTests) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const challenges = myChallenges || [];
  const submissions = challengeSubs || [];
  const tests = myTests || [];

  const stats = [
    { icon: Heart, label: "Challenges", value: challenges.length, color: "text-primary" },
    { icon: ClipboardList, label: "Tests Created", value: tests.length, color: "text-info" },
    { icon: Award, label: "Published Tests", value: tests.filter(t => t.is_published).length, color: "text-success" },
    { icon: Users, label: "Submissions", value: submissions.length, color: "text-warning" },
  ];

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
      setSkillInput("");
    }
  };

  const handleCreateChallenge = async () => {
    if (!title.trim() || !description.trim()) {
      toast({ title: "Missing fields", description: "Please fill in title and description.", variant: "destructive" });
      return;
    }
    if (skills.length === 0) {
      toast({ title: "Add skills", description: "Please add at least one skill tag.", variant: "destructive" });
      return;
    }
    try {
      await createChallengeMutation.mutateAsync({
        ngo_id: user?.id ?? "",
        title: title.trim(),
        description: description.trim(),
        skills,
        difficulty,
        status: "open",
      });
      toast({ title: "🌟 Challenge posted!", description: `"${title.trim()}" is now available for students.` });
      setTitle(""); setDescription(""); setSkills([]); setSkillInput(""); setDifficulty("intermediate");
      setChallengeOpen(false);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleCreateTest = async () => {
    if (!testTitle.trim() || !testDesc.trim()) {
      toast({ title: "Missing fields", description: "Please fill in title and description.", variant: "destructive" });
      return;
    }
    try {
      const newTest = await createTestMutation.mutateAsync({
        ngo_id: user?.id ?? "",
        title: testTitle.trim(),
        description: testDesc.trim(),
        time_limit_minutes: testTimeLimit,
      });
      toast({ title: "📝 Test created!", description: "Now add MCQ questions to your test." });
      setTestTitle(""); setTestDesc(""); setTestTimeLimit(30);
      setTestOpen(false);
      navigate(`/ngo/test/${newTest.id}`);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleTogglePublish = async (testId: string, currentlyPublished: boolean) => {
    try {
      await publishTestMutation.mutateAsync({ id: testId, is_published: !currentlyPublished });
      toast({ title: currentlyPublished ? "Test unpublished" : "🎉 Test published!" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleDeleteTest = async (testId: string) => {
    try {
      await deleteTestMutation.mutateAsync(testId);
      toast({ title: "Test deleted" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleReviewSubmission = async (subId: string, newStatus: 'accepted' | 'rejected') => {
    try {
      await evaluateSubmissionMutation.mutateAsync({ id: subId, status: newStatus });
      toast({ 
        title: newStatus === 'accepted' ? "Submission Accepted!" : "Submission Rejected",
        description: `The student's submission has been ${newStatus}.` 
      });
    } catch (e: any) {
      toast({ title: "Error processing review", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="container max-w-6xl py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold">NGO Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Create tests, post challenges, and empower students.</p>
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

      {/* ==================== TESTS SECTION ==================== */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-info" />
            <h2 className="font-display text-xl font-semibold">MCQ Tests</h2>
          </div>
          <Dialog open={testOpen} onOpenChange={setTestOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-primary text-primary-foreground">
                <Plus className="mr-1 h-4 w-4" /> Create Test
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create a New Test</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Test Title</label>
                  <Input placeholder="e.g. Web Development Fundamentals" value={testTitle} onChange={(e) => setTestTitle(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Description</label>
                  <Textarea placeholder="What does this test assess?" value={testDesc} onChange={(e) => setTestDesc(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Time Limit (minutes): {testTimeLimit}</label>
                  <Input type="range" min={5} max={120} value={testTimeLimit} onChange={(e) => setTestTimeLimit(Number(e.target.value))} className="h-8" />
                </div>
                <Button className="w-full bg-gradient-primary text-primary-foreground" onClick={handleCreateTest} disabled={createTestMutation.isPending}>
                  {createTestMutation.isPending ? "Creating..." : "Create & Add Questions"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {tests.map((test) => (
            <motion.div key={test.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:shadow-card"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-semibold truncate">{test.title}</h3>
                  <Badge className={test.is_published ? "bg-success text-success-foreground" : "bg-warning/10 text-warning"}>
                    {test.is_published ? "Published" : "Draft"}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground truncate">{test.description}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{test.questionCount} questions</span>
                  <span>·</span>
                  <span>{test.resultCount} attempts</span>
                  <span>·</span>
                  <span>{test.time_limit_minutes ?? 30} min</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => handleTogglePublish(test.id, test.is_published)} disabled={publishTestMutation.isPending}>
                  {test.is_published ? <><EyeOff className="mr-1 h-3 w-3" /> Unpublish</> : <><Eye className="mr-1 h-3 w-3" /> Publish</>}
                </Button>
                <Button size="sm" className="bg-gradient-primary text-primary-foreground" onClick={() => navigate(`/ngo/test/${test.id}`)}>
                  Manage <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
                <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={() => handleDeleteTest(test.id)} disabled={deleteTestMutation.isPending}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
          {tests.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center text-muted-foreground">
              No tests created yet. Click "Create Test" to get started!
            </div>
          )}
        </div>
      </motion.div>

      {/* ==================== CHALLENGES SECTION ==================== */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-destructive" />
            <h2 className="font-display text-xl font-semibold">Challenges</h2>
          </div>
          <Dialog open={challengeOpen} onOpenChange={setChallengeOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="mr-1 h-4 w-4" /> Post Challenge
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Post a New Challenge</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Challenge Title</label>
                  <Input placeholder="e.g. Build a Donation Tracker" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Description</label>
                  <Textarea placeholder="Describe the challenge..." value={description} onChange={(e) => setDescription(e.target.value)} />
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
                          {s} <X className="h-3 w-3 cursor-pointer" onClick={() => setSkills(skills.filter((x) => x !== s))} />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Difficulty</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["beginner", "intermediate", "advanced"] as const).map((d) => (
                      <button key={d} type="button" onClick={() => setDifficulty(d)}
                        className={`rounded-lg border p-2 text-center text-sm capitalize transition-all ${
                          difficulty === d ? "border-primary bg-primary/5 font-medium text-primary" : "border-border text-muted-foreground hover:border-primary/30"
                        }`}
                      >{d}</button>
                    ))}
                  </div>
                </div>
                <Button className="w-full bg-gradient-primary text-primary-foreground" onClick={handleCreateChallenge} disabled={createChallengeMutation.isPending}>
                  {createChallengeMutation.isPending ? "Publishing..." : "Publish Challenge"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {challenges.map((ch) => {
            const chSubs = submissions.filter((s) => s.challenge_id === ch.id);
            const skillsArr = (ch.skills as string[]) || [];
            return (
              <motion.div key={ch.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-lg font-semibold">{ch.title}</h3>
                      <Badge className={difficultyColors[ch.difficulty]}>{ch.difficulty}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{ch.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {skillsArr.map((s) => (<Badge key={s} variant="secondary">{s}</Badge>))}
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div>{chSubs.length} submissions</div>
                    <div className="text-xs">{new Date(ch.posted_at).toLocaleDateString()}</div>
                  </div>
                </div>
                {chSubs.length > 0 && (
                  <div className="mt-4 border-t border-border pt-4">
                    <h4 className="mb-2 text-sm font-medium">Submissions</h4>
                    <div className="space-y-2">
                      {chSubs.map((sub) => (
                        <div key={sub.id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-secondary/50 p-3">
                          <div>
                            <div className="text-sm font-medium">Student: {sub.studentName}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              <strong>Submission Link/Desc:</strong> {sub.description}
                              {sub.github_link && (
                                <span className="ml-2">
                                  <a href={sub.github_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View Link</a>
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0">
                            {sub.status === "pending" ? (
                              <>
                                <Badge variant="outline" className="border-warning text-warning mr-2">Pending Review</Badge>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="border-success text-success hover:bg-success/10"
                                  onClick={() => handleReviewSubmission(sub.id, 'accepted')}
                                  disabled={evaluateSubmissionMutation.isPending}
                                >
                                  <Check className="mr-1 h-3 w-3" /> Accept
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="border-destructive text-destructive hover:bg-destructive/10"
                                  onClick={() => handleReviewSubmission(sub.id, 'rejected')}
                                  disabled={evaluateSubmissionMutation.isPending}
                                >
                                  <XCircle className="mr-1 h-3 w-3" /> Reject
                                </Button>
                              </>
                            ) : sub.status === "accepted" ? (
                              <Badge className="bg-success text-success-foreground">Accepted</Badge>
                            ) : sub.status === "rejected" ? (
                              <Badge className="bg-destructive text-destructive-foreground">Rejected</Badge>
                            ) : sub.status === "evaluated" ? (
                              <Badge className="bg-blue-500 text-white">Evaluated: {sub.score}%</Badge>
                            ) : null}
                          </div>
                          
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
          {challenges.length === 0 && (
            <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
              No challenges posted yet. Create your first challenge to engage students!
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
