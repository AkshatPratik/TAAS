import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ClipboardList, Clock, Users, CheckCircle, Loader2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { usePublishedTests, useSubmissions } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export default function StudentTests() {
  const { user } = useAuth();
  const { data: publishedTests, isLoading: loadingTests } = usePublishedTests();

  // Fetch this student's test results to mark completed tests
  const { data: myResults, isLoading: loadingResults } = useQuery({
    queryKey: ['myTestResults', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('test_results')
        .select('*')
        .eq('student_id', user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  if (loadingTests || loadingResults) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const tests = publishedTests || [];
  const results = myResults || [];

  const getResult = (testId: string) => results.find(r => r.test_id === testId);

  return (
    <div className="container max-w-4xl py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <ClipboardList className="h-7 w-7 text-primary" />
          <div>
            <h1 className="font-display text-3xl font-bold">Skill Tests</h1>
            <p className="mt-1 text-muted-foreground">Take proctored MCQ tests created by verified NGOs to prove your skills.</p>
          </div>
        </div>
      </motion.div>

      <div className="mt-8 space-y-4">
        {tests.map((test, i) => {
          const result = getResult(test.id);
          const completed = !!result;
          const pct = result ? Math.round((result.score / result.total_questions) * 100) : 0;

          return (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border bg-card p-6 transition-all hover:shadow-card"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-semibold">{test.title}</h3>
                    {completed && (
                      <Badge className="bg-success text-success-foreground">
                        <CheckCircle className="mr-1 h-3 w-3" /> Completed
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{test.description}</p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ClipboardList className="h-3 w-3" /> {test.questionCount} questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {test.time_limit_minutes ?? 30} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {test.resultCount} attempts
                    </span>
                    <span>by {test.ngoName}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {completed ? (
                    <>
                      <Badge className={pct >= 70 ? "bg-success text-success-foreground" : pct >= 40 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}>
                        Score: {result!.score}/{result!.total_questions} ({pct}%)
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(result!.completed_at).toLocaleDateString()}
                      </span>
                    </>
                  ) : (
                    <Button size="sm" className="bg-gradient-primary text-primary-foreground" asChild>
                      <Link to={`/tests/${test.id}`}>
                        Start Test <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
        {tests.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <ClipboardList className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-muted-foreground">No tests available yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
