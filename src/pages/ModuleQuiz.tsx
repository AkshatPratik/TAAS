import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Clock, CheckCircle, AlertTriangle, Loader2, Trophy, Camera, Mic, Eye, ShieldAlert, MonitorOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useModuleQuizQuestions, useSubmitModuleQuiz, useModuleQuizResults } from "@/lib/api";
import { useProctoring } from "@/hooks/useProctoring";
import { useRoadmaps } from "@/lib/api";

export default function ModuleQuiz() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: questions, isLoading: loadingQ } = useModuleQuizQuestions(moduleId);
  const { data: quizResults } = useModuleQuizResults(user?.id);
  const { data: roadmaps } = useRoadmaps();
  const submitMutation = useSubmitModuleQuiz();

  const previousAttempts = quizResults?.filter(r => r.module_id === moduleId) || [];
  const bestAttempt = previousAttempts.length > 0 ? previousAttempts.reduce((prev, current) => (prev.score > current.score) ? prev : current) : null;
  const attemptsUsed = previousAttempts.length;

  // Find the module info
  const moduleInfo = roadmaps
    ?.flatMap(r => r.modules)
    .find(m => m.id === moduleId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [started, setStarted] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [retaking, setRetaking] = useState(false);

  // Proctoring
  const proctoring = useProctoring(started && !submitted);

  // Timer
  useEffect(() => {
    if (!started || submitted || timeLeft === null || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
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

  // Attach webcam stream to video element when it mounts (after ML models finish loading)
  useEffect(() => {
    if (started && !proctoring.isModelLoading && proctoring.webcamRef.current && proctoring.webcamStream) {
      proctoring.webcamRef.current.srcObject = proctoring.webcamStream;
    }
  }, [started, proctoring.isModelLoading, proctoring.webcamStream, proctoring.webcamRef]);

  // Show violation toasts
  useEffect(() => {
    if (proctoring.violations.length > 0) {
      const latest = proctoring.violations[proctoring.violations.length - 1];
      toast({
        title: "⚠️ Proctoring Violation",
        description: latest.message,
        variant: "destructive",
      });
    }
  }, [proctoring.violations.length]);

  const handleSubmit = useCallback(async () => {
    if (!questions || !user || submitted) return;

    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct_option) correct++;
    });

    setScore(correct);
    setSubmitted(true);

    // Stop proctoring
    proctoring.stopProctoring();

    try {
      await submitMutation.mutateAsync({
        student_id: user.id,
        module_id: moduleId!,
        score: correct,
        total_questions: questions.length,
        answers: answers,
        violations: proctoring.violationCount,
      });
      toast({ title: "📊 Quiz submitted!", description: `You scored ${correct}/${questions.length}` });
    } catch (e: any) {
      console.error("Submit Error:", e);
      toast({ title: "Error saving result", description: e.message || JSON.stringify(e), variant: "destructive" });
    }
  }, [questions, user, answers, submitted, moduleId, proctoring.violationCount]);

  const handleStartQuiz = async () => {
    // Start proctoring (camera + mic)
    await proctoring.startProctoring();
    setPermissionsGranted(true);
    setTimeLeft(10 * 60); // 10 minutes
    setStarted(true);
  };

  if (loadingQ) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  // Already completed block (if they have attempts and aren't choosing to retake or haven't just submitted a new attempt)
  if (attemptsUsed > 0 && !retaking && !submitted && !started) {
    const pct = Math.round((bestAttempt!.score / bestAttempt!.total_questions) * 100);
    return (
      <div className="container max-w-2xl py-12">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-border bg-card p-8 text-center">
          <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${pct >= 70 ? "bg-success/10" : "bg-warning/10"}`}>
            <Trophy className={`h-10 w-10 ${pct >= 70 ? "text-success" : "text-warning"}`} />
          </div>
          <h1 className="font-display text-2xl font-bold">Quiz Attempt Summary</h1>
          <p className="mt-2 text-muted-foreground">{moduleInfo?.title || 'Module Quiz'}</p>
          <div className="mt-4 flex flex-col items-center gap-2">
            <Badge className={`text-lg px-4 py-2 ${pct >= 70 ? "bg-success text-success-foreground" : pct >= 40 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}`}>
              Best Score: {bestAttempt!.score}/{bestAttempt!.total_questions} ({pct}%)
            </Badge>
            <span className="text-sm font-medium text-muted-foreground">Attempts Used: {attemptsUsed} / 3</span>
          </div>
          {bestAttempt!.violations > 0 && (
            <p className="mt-3 text-sm text-destructive flex items-center justify-center gap-1">
              <ShieldAlert className="h-4 w-4" /> Best attempt had {bestAttempt!.violations} proctoring violation(s)
            </p>
          )}
          
          <div className="mt-8 flex justify-center gap-3">
            <Button variant="outline" onClick={() => navigate("/roadmaps")}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to Roadmaps
            </Button>
            {attemptsUsed < 3 && (
              <Button className="bg-primary text-primary-foreground" onClick={() => setRetaking(true)}>
                Retake Quiz (Attempts left: {3 - attemptsUsed})
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  const totalQ = questions?.length || 0;
  const currentQ = questions?.[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  // Pre-test screen with proctoring setup
  if (!started) {
    return (
      <div className="container max-w-2xl py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Eye className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold">{moduleInfo?.title || 'Module'} Quiz</h1>
            <p className="mt-2 text-muted-foreground">Proctored MCQ Assessment</p>
          </div>

          <div className="mt-6 flex justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-success" /> {totalQ} questions</div>
            <div className="flex items-center gap-1"><Clock className="h-4 w-4 text-warning" /> 10 minutes</div>
          </div>

          {/* Proctoring requirements */}
          <div className="mt-8 space-y-3">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">Proctoring Requirements</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl border border-border p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Camera className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium">Webcam</div>
                  <div className="text-xs text-muted-foreground">Face must be visible throughout</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Mic className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium">Microphone</div>
                  <div className="text-xs text-muted-foreground">Audio monitored for noise</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <MonitorOff className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium">Fullscreen</div>
                  <div className="text-xs text-muted-foreground">Must stay in fullscreen mode</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
                  <ShieldAlert className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <div className="text-sm font-medium">Tab Switching</div>
                  <div className="text-xs text-muted-foreground">Switching tabs = violation</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-warning/20 bg-warning/5 p-3 text-sm text-warning">
            <AlertTriangle className="mr-1 inline h-4 w-4" />
            Once you start, your camera, microphone, and screen activity will be monitored. You can only attempt this quiz once.
          </div>

          {proctoring.webcamError && (
            <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertTriangle className="mr-1 inline h-4 w-4" />
              Camera/Microphone error: {proctoring.webcamError}. Please allow access and try again.
            </div>
          )}

          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" onClick={() => navigate("/roadmaps")}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Go Back
            </Button>
            <Button
              className="bg-gradient-primary text-primary-foreground px-8"
              onClick={handleStartQuiz}
            >
              <Camera className="mr-2 h-4 w-4" /> Grant Access & Start Quiz
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Results screen
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
          <p className="mt-2 text-muted-foreground">{moduleInfo?.title || 'Module'} Quiz</p>
          <div className="mt-6">
            <div className={`inline-flex items-center rounded-full px-6 py-3 text-2xl font-bold ${
              pct >= 70 ? "bg-success/10 text-success" : pct >= 40 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
            }`}>
              {score}/{totalQ}
              <span className="ml-2 text-base font-normal">({pct}%)</span>
            </div>
          </div>

          {/* Proctoring Summary */}
          <div className="mt-6 rounded-xl border border-border p-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Proctoring Summary</h3>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className={`flex items-center gap-1 ${proctoring.violationCount === 0 ? 'text-success' : 'text-destructive'}`}>
                <ShieldAlert className="h-4 w-4" />
                {proctoring.violationCount} violation(s)
              </div>
            </div>
            {proctoring.violations.length > 0 && (
              <div className="mt-3 space-y-1 text-left">
                {proctoring.violations.map((v, i) => (
                  <div key={i} className="text-xs text-destructive/80 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    {v.message} — {new Date(v.timestamp).toLocaleTimeString()}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Answer Review */}
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

          <Button variant="outline" className="mt-8" onClick={() => navigate("/roadmaps")}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Roadmaps
          </Button>
        </motion.div>
      </div>
    );
  }

  // ==========================================
  // ACTIVE QUIZ WITH PROCTORING OVERLAY
  // ==========================================

  if (proctoring.isModelLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h2 className="text-xl font-display font-semibold">Initializing AI Proctoring...</h2>
        <p className="text-muted-foreground">Loading computer vision models. This may take a few seconds.</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background transition-colors duration-300 ${proctoring.currentWarning ? 'border-8 border-destructive' : ''}`}>
      {/* Massive Warning Overlay */}
      {proctoring.currentWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-destructive/95 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-background rounded-3xl p-10 max-w-xl w-full text-center shadow-2xl border-4 border-destructive/50">
            <ShieldAlert className="h-24 w-24 text-destructive mx-auto mb-6 animate-pulse" />
            <h2 className="text-4xl font-black text-destructive uppercase tracking-widest leading-tight">{proctoring.currentWarning}</h2>
            <p className="mt-6 text-foreground font-medium text-lg">This incident has been recorded and will affect your final score.</p>
          </div>
        </div>
      )}

      {/* Proctoring Overlay — Webcam + Status */}
      <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2">
        {/* Webcam Preview */}
        <div className="relative overflow-hidden rounded-xl border-2 border-primary/50 shadow-lg bg-black" style={{ width: 200, height: 150 }}>
          <video
            ref={proctoring.webcamRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover mirror"
            style={{ transform: 'scaleX(-1)' }}
          />
          <div className="absolute top-2 left-2 flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-bold text-white drop-shadow-md">REC</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
            <div className="flex items-center justify-between text-[10px] text-white">
              <span className="flex items-center gap-1"><Camera className="h-3 w-3" /> Live</span>
              <span className="flex items-center gap-1">
                <Mic className="h-3 w-3" />
                <div className="h-1 w-12 rounded-full bg-white/30 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${proctoring.audioLevel > 40 ? 'bg-red-400' : proctoring.audioLevel > 15 ? 'bg-yellow-400' : 'bg-green-400'}`}
                    style={{ width: `${proctoring.audioLevel}%` }}
                  />
                </div>
              </span>
            </div>
          </div>
        </div>

        {/* Violation counter */}
        {proctoring.violationCount > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            {proctoring.violationCount} violation(s)
          </motion.div>
        )}
      </div>

      <div className="container max-w-3xl py-8 pr-56">
        {/* Header with timer */}
        <div className="sticky top-4 z-10 mb-6 rounded-xl border border-border bg-card/95 p-4 shadow-card backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-semibold">{moduleInfo?.title || 'Module'} Quiz</h2>
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
                {(["A", "B", "C", "D"] as const).map(opt => {
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
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? "Submitting..." : `Submit Quiz (${answeredCount}/${totalQ} answered)`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
