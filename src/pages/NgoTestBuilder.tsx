import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Edit2, GripVertical, CheckCircle, Loader2, Users, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useTestQuestions, useAddQuestion, useUpdateQuestion, useDeleteQuestion,
  usePublishTest, useTestResults, useNgoTests
} from "@/lib/api";

type CorrectOption = "A" | "B" | "C" | "D";

export default function NgoTestBuilder() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: tests } = useNgoTests(user?.id);
  const test = tests?.find((t) => t.id === testId);
  const { data: questions, isLoading: loadingQ } = useTestQuestions(testId);
  const { data: results, isLoading: loadingR } = useTestResults(testId);
  
  const addQuestionMutation = useAddQuestion();
  const updateQuestionMutation = useUpdateQuestion();
  const deleteQuestionMutation = useDeleteQuestion();
  const publishMutation = usePublishTest();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [questionText, setQuestionText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctOption, setCorrectOption] = useState<CorrectOption>("A");

  const [activeTab, setActiveTab] = useState<"questions" | "results">("questions");

  if (!test) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const resetForm = () => {
    setEditingId(null);
    setQuestionText("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectOption("A");
    setShowAddForm(false);
  };

  const handleEditClick = (q: any) => {
    setEditingId(q.id);
    setQuestionText(q.question_text);
    setOptionA(q.option_a);
    setOptionB(q.option_b);
    setOptionC(q.option_c);
    setOptionD(q.option_d);
    setCorrectOption(q.correct_option as CorrectOption);
    setShowAddForm(true);
    
    // Scroll to form (simple approach)
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const handleSaveQuestion = async () => {
    if (!questionText.trim() || !optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      toast({ title: "Missing fields", description: "Fill in all question fields and options.", variant: "destructive" });
      return;
    }

    try {
      if (editingId) {
        await updateQuestionMutation.mutateAsync({
          id: editingId,
          test_id: testId!,
          question_text: questionText.trim(),
          option_a: optionA.trim(),
          option_b: optionB.trim(),
          option_c: optionC.trim(),
          option_d: optionD.trim(),
          correct_option: correctOption,
        });
        toast({ title: "✅ Question updated!" });
      } else {
        await addQuestionMutation.mutateAsync({
          test_id: testId!,
          question_text: questionText.trim(),
          option_a: optionA.trim(),
          option_b: optionB.trim(),
          option_c: optionC.trim(),
          option_d: optionD.trim(),
          correct_option: correctOption,
          order: (questions?.length ?? 0) + 1,
        });
        toast({ title: "✅ Question added!" });
      }
      resetForm();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    try {
      await deleteQuestionMutation.mutateAsync({ id: qId, test_id: testId! });
      toast({ title: "Question removed" });
      if (editingId === qId) resetForm();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleTogglePublish = async () => {
    if (!test.is_published && (!questions || questions.length === 0)) {
      toast({ title: "Cannot publish", description: "Add at least one question before publishing.", variant: "destructive" });
      return;
    }
    try {
      await publishMutation.mutateAsync({ id: testId!, is_published: !test.is_published });
      toast({
        title: test.is_published ? "Test unpublished" : "🎉 Test published!",
        description: test.is_published ? "Students can no longer see this test." : "Students can now take this test.",
      });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const optionLabels = ["A", "B", "C", "D"] as const;

  const isSaving = addQuestionMutation.isPending || updateQuestionMutation.isPending;

  return (
    <div className="container max-w-4xl py-8">
      <Button variant="ghost" size="sm" className="mb-4 gap-1" onClick={() => navigate("/ngo")}>
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold">{test.title}</h1>
            <Badge className={test.is_published ? "bg-success text-success-foreground" : "bg-warning/10 text-warning"}>
              {test.is_published ? "Published" : "Draft"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{test.description}</p>
        </div>
        <Button
          onClick={handleTogglePublish}
          disabled={publishMutation.isPending}
          className={test.is_published ? "border-warning text-warning hover:bg-warning/10" : "bg-gradient-primary text-primary-foreground"}
          variant={test.is_published ? "outline" : "default"}
        >
          <Eye className="mr-1 h-4 w-4" />
          {publishMutation.isPending ? "Updating..." : test.is_published ? "Unpublish" : "Publish Test"}
        </Button>
      </motion.div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 rounded-lg border border-border bg-secondary/30 p-1">
        <button
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${activeTab === "questions" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          onClick={() => setActiveTab("questions")}
        >
          Questions ({questions?.length ?? 0})
        </button>
        <button
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${activeTab === "results" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          onClick={() => setActiveTab("results")}
        >
          <Users className="mr-1 inline h-4 w-4" /> Results ({results?.length ?? 0})
        </button>
      </div>

      {/* Questions Tab */}
      {activeTab === "questions" && (
        <div className="mt-6 space-y-4">
          {loadingQ ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <>
              {questions?.map((q, i) => (
                <motion.div key={q.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`rounded-xl border p-5 transition-colors ${editingId === q.id ? 'border-primary ring-1 ring-primary shadow-sm bg-primary/5' : 'border-border bg-card'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-medium">{q.question_text}</p>
                        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {(["A", "B", "C", "D"] as const).map((opt) => {
                            const text = opt === "A" ? q.option_a : opt === "B" ? q.option_b : opt === "C" ? q.option_c : q.option_d;
                            const isCorrect = q.correct_option === opt;
                            return (
                              <div
                                key={opt}
                                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                                  isCorrect ? "border-success bg-success/5 text-success" : "border-border text-muted-foreground"
                                }`}
                              >
                                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                  isCorrect ? "bg-success text-success-foreground" : "bg-secondary text-secondary-foreground"
                                }`}>
                                  {opt}
                                </span>
                                {text}
                                {isCorrect && <CheckCircle className="ml-auto h-3.5 w-3.5" />}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-primary"
                        onClick={() => handleEditClick(q)}
                        disabled={editingId === q.id}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteQuestion(q.id)}
                        disabled={deleteQuestionMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {(!questions || questions.length === 0) && !showAddForm && (
                <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
                  <p className="text-muted-foreground">No questions yet. Add your first MCQ question below.</p>
                </div>
              )}

              {/* Add/Edit Question Form */}
              {showAddForm ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-primary/20 bg-card p-6 shadow-md mt-8">
                  <h3 className="mb-4 font-display text-lg font-semibold">{editingId ? "Edit MCQ Question" : "New MCQ Question"}</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium">Question</label>
                      <Textarea placeholder="Enter your question..." value={questionText} onChange={(e) => setQuestionText(e.target.value)} rows={2} />
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {optionLabels.map((opt) => {
                        const val = opt === "A" ? optionA : opt === "B" ? optionB : opt === "C" ? optionC : optionD;
                        const setter = opt === "A" ? setOptionA : opt === "B" ? setOptionB : opt === "C" ? setOptionC : setOptionD;
                        return (
                          <div key={opt} className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setCorrectOption(opt)}
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                                correctOption === opt
                                  ? "bg-success text-success-foreground ring-2 ring-success/30"
                                  : "bg-secondary text-secondary-foreground hover:bg-primary/10"
                              }`}
                            >
                              {opt}
                            </button>
                            <Input
                              placeholder={`Option ${opt}`}
                              value={val}
                              onChange={(e) => setter(e.target.value)}
                              className="flex-1"
                            />
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Click the letter circle to mark the <span className="font-medium text-success">correct answer</span>. Currently: <strong>{correctOption}</strong>
                    </p>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveQuestion} disabled={isSaving} className="bg-gradient-primary text-primary-foreground">
                        {isSaving ? "Saving..." : editingId ? "Save Changes" : "Add Question"}
                      </Button>
                      <Button variant="outline" onClick={resetForm}>Cancel</Button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <Button variant="outline" className="w-full border-dashed mt-4" onClick={() => { resetForm(); setShowAddForm(true); }}>
                  <Plus className="mr-1 h-4 w-4" /> Add Question
                </Button>
              )}
            </>
          )}
        </div>
      )}

      {/* Results Tab */}
      {activeTab === "results" && (
        <div className="mt-6">
          {loadingR ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : results && results.length > 0 ? (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">#</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Student</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Email</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Score</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => {
                    const pct = Math.round((r.score / r.total_questions) * 100);
                    return (
                      <tr key={r.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3 text-sm text-muted-foreground">{i + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                              {r.studentName?.charAt(0)?.toUpperCase()}
                            </div>
                            <span className="text-sm font-medium">{r.studentName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{r.studentEmail}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge className={pct >= 70 ? "bg-success text-success-foreground" : pct >= 40 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}>
                            {r.score}/{r.total_questions} ({pct}%)
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                          {new Date(r.completed_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
              No students have taken this test yet.
              {!test.is_published && <p className="mt-1 text-xs">Publish the test first so students can see it.</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
