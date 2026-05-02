import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Clock, CheckCircle, AlertTriangle, Loader2, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTestQuestions, useSubmitTestResult, usePublishedTests } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export default function TakeTest() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: tests } = usePublishedTests();
  const test = tests?.find((t) => t.id === testId);
  const { data: questions, isLoading: loadingQ } = useTestQuestions(testId);
  const submitResultMutation = useSubmitTestResult();

  // Check if already completed
  const { data: existingResult } = useQuery({
    queryKey: ['myTestResult', testId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('test_results')
        .select('*')
        .eq('test_id', testId!)
        .eq('student_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!testId && !!user?.id,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [started, setStarted] = useState(false);

  // Timer
  useEffect(() => {
    if (!started || submitted || timeLeft === null || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [started, submitted, timeLeft]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && started && !submitted) {
      handleSubmit();
    }
  }, [timeLeft, started, submitted]);

  const handleSubmit = useCallback(async () => {
    if (!questions || !user || submitted) return;

    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct_option) correct++;
    });

    setScore(correct);
    setSubmitted(true);

    try {
      await submitResultMutation.mutateAsync({
        test_id: testId!,
        student_id: user.id,
        score: correct,
        total_questions: questions.length,
        answers: answers,
      });
      toast({ title: "📊 Test submitted!", description: `You scored ${correct}/${questions.length}` });
    } catch (e: any) {
      toast({ title: "Error saving result", description: e.message, variant: "destructive" });
    }
  }, [questions, user, answers, submitted, testId]);

  if (loadingQ || !test) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  // Already completed
  if (existingResult) {
    const pct = Math.round((existingResult.score / existingResult.total_questions) * 100);
    return (
      <div className="container max-w-2xl py-12">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-border bg-card p-8 text-center">
          <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${pct >= 70 ? "bg-success/10" : "bg-warning/10"}`}>
            <Trophy className={`h-10 w-10 ${pct >= 70 ? "text-success" : "text-warning"}`} />
          </div>
          <h1 className="font-display text-2xl font-bold">Test Already Completed</h1>
          <p className="mt-2 text-muted-foreground">{test.title}</p>
          <div className="mt-4">
            <Badge className={`text-lg px-4 py-2 ${pct >= 70 ? "bg-success text-success-foreground" : pct >= 40 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}`}>
              Score: {existingResult.score}/{existingResult.total_questions} ({pct}%)
            </Badge>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Completed on {new Date(existingResult.completed_at).toLocaleDateString()}</p>
          <Button variant="outline" className="mt-6" onClick={() => navigate("/tests")}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Tests
          </Button>
        </motion.div>
      </div>
    );
  }

  const totalQ = questions?.length || 0;
  const currentQ = questions?.[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  // Pre-test start screen
  if (!started) {
    return (
      <div className="container max-w-2xl py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Clock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold">{test.title}</h1>
          <p className="mt-2 text-muted-foreground">{test.description}</p>
          <div className="mt-6 flex justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-success" /> {totalQ} questions</div>
            <div className="flex items-center gap-1"><Clock className="h-4 w-4 text-warning" /> {test.time_limit_minutes ?? 30} minutes</div>
          </div>
          <div className="mt-6 rounded-lg border border-warning/20 bg-warning/5 p-3 text-sm text-warning">
            <AlertTriangle className="mr-1 inline h-4 w-4" />
            Once you start, the timer begins. You can only attempt this test once.
          </div>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" onClick={() => navigate("/tests")}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Go Back
            </Button>
            <Button
              className="bg-gradient-primary text-primary-foreground px-8"
              onClick={() => {
                setTimeLeft((test.time_limit_minutes ?? 30) * 60);
                setStarted(true);
              }}
            >
              Start Test
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Results screen (after submission)
  if (submitted) {
    const pct = Math.round((score / totalQ) * 100);
    return (
      <div className="container max-w-2xl py-12">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-border bg-card p-8 text-center">
          <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${pct >= 70 ? "bg-success/10" : pct >= 40 ? "bg-warning/10" : "bg-destructive/10"}`}>
            <Trophy className={`h-10 w-10 ${pct >= 70 ? "text-success" : pct >= 40 ? "text-warning" : "text-destructive"}`} />
          </div>
          <h1 className="font-display text-2xl font-bold">
            {pct >= 70 ? "Excellent!" : pct >= 40 ? "Good Effort!" : "Keep Practicing!"}
          </h1>
          <p className="mt-2 text-muted-foreground">{test.title}</p>
          <div className="mt-6">
            <div className={`inline-flex items-center rounded-full px-6 py-3 text-2xl font-bold ${
              pct >= 70 ? "bg-success/10 text-success" : pct >= 40 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
            }`}>
              {score}/{totalQ}
              <span className="ml-2 text-base font-normal">({pct}%)</span>
            </div>
          </div>

          {/* Review answers */}
          <div className="mt-8 text-left space-y-3">
            <h3 className="font-display text-sm font-semibold text-muted-foreground">Answer Review</h3>
            {questions?.map((q, i) => {
              const selected = answers[q.id];
              const isCorrect = selected === q.correct_option;
              const getOptionText = (opt: string) => opt === "A" ? q.option_a : opt === "B" ? q.option_b : opt === "C" ? q.option_c : q.option_d;
              return (
                <div key={q.id} className={`rounded-lg border p-3 text-sm ${isCorrect ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"}`}>
                  <div className="flex items-start gap-2">
                    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isCorrect ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}`}>
                      {isCorrect ? "✓" : "✗"}
                    </span>
                    <div>
                      <p className="font-medium">{i + 1}. {q.question_text}</p>
                      {!isCorrect && selected && (
                        <p className="mt-1 text-destructive">Your answer: {selected}) {getOptionText(selected)}</p>
                      )}
                      <p className="mt-0.5 text-success">Correct: {q.correct_option}) {getOptionText(q.correct_option)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Button variant="outline" className="mt-8" onClick={() => navigate("/tests")}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Tests
          </Button>
        </motion.div>
      </div>
    );
  }

  // Active test UI
  return (
    <div className="container max-w-3xl py-8">
      {/* Header with timer */}
      <div className="sticky top-16 z-10 mb-6 rounded-xl border border-border bg-card/95 p-4 shadow-card backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-semibold">{test.title}</h2>
            <p className="text-xs text-muted-foreground">Question {currentIndex + 1} of {totalQ} · {answeredCount} answered</p>
          </div>
          <div className={`flex items-center gap-2 rounded-full px-4 py-2 font-mono text-sm font-bold ${
            timeLeft !== null && timeLeft < 60 ? "bg-destructive/10 text-destructive animate-pulse" :
            timeLeft !== null && timeLeft < 300 ? "bg-warning/10 text-warning" :
            "bg-secondary text-secondary-foreground"
          }`}>
            <Clock className="h-4 w-4" />
            {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
          </div>
        </div>
        <Progress value={(answeredCount / totalQ) * 100} className="mt-3 h-1.5" />
      </div>

      {/* Question navigator pills */}
      <div className="mb-6 flex flex-wrap gap-1.5">
        {questions?.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(i)}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-all ${
              i === currentIndex
                ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                : answers[q.id]
                ? "bg-success/10 text-success border border-success/30"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Current Question */}
      {currentQ && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="mb-6">
              <Badge variant="secondary" className="mb-3">Question {currentIndex + 1}</Badge>
              <p className="text-lg font-medium leading-relaxed">{currentQ.question_text}</p>
            </div>

            <div className="space-y-3">
              {(["A", "B", "C", "D"] as const).map((opt) => {
                const text = opt === "A" ? currentQ.option_a : opt === "B" ? currentQ.option_b : opt === "C" ? currentQ.option_c : currentQ.option_d;
                const isSelected = answers[currentQ.id] === opt;

                return (
                  <button
                    key={opt}
                    onClick={() => setAnswers({ ...answers, [currentQ.id]: opt })}
                    className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:border-primary/30 hover:bg-secondary/30"
                    }`}
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all ${
                      isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                    }`}>
                      {opt}
                    </span>
                    <span className="text-sm">{text}</span>
                    {isSelected && <CheckCircle className="ml-auto h-5 w-5 text-primary" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="outline"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(currentIndex - 1)}
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Previous
        </Button>

        {currentIndex < totalQ - 1 ? (
          <Button onClick={() => setCurrentIndex(currentIndex + 1)}>
            Next <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button
            className="bg-gradient-primary text-primary-foreground"
            onClick={handleSubmit}
            disabled={submitResultMutation.isPending}
          >
            {submitResultMutation.isPending ? "Submitting..." : `Submit Test (${answeredCount}/${totalQ} answered)`}
          </Button>
        )}
      </div>
    </div>
  );
}
