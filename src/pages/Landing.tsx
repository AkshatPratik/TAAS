import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Users, Briefcase, BarChart3, Shield, Zap } from "lucide-react";

const features = [
  { icon: BarChart3, title: "Skill Verification", desc: "Project-based checkpoints replace resumes with real proof of ability." },
  { icon: Users, title: "Verified Talent Pool", desc: "Businesses access only candidates who've demonstrated their skills." },
  { icon: Briefcase, title: "Project-Based Hiring", desc: "Post real projects, not job descriptions. Hire for what matters." },
  { icon: Shield, title: "NGO Impact Challenges", desc: "Real-world NGO challenges give students verified social impact experience." },
  { icon: Zap, title: "Learning Roadmaps", desc: "Structured paths from beginner to hire-ready with guided milestones." },
  { icon: CheckCircle, title: "Talent + Impact Scores", desc: "Dual scoring system tracks both technical ability and social impact." },
];

const stats = [
  { value: "2,400+", label: "Verified Students" },
  { value: "180+", label: "Startup Partners" },
  { value: "95%", label: "Hire Success Rate" },
  { value: "12", label: "Learning Paths" },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-20 pt-24 sm:pt-32">
        <div className="absolute inset-0 -z-10 bg-gradient-hero opacity-[0.03]" />
        <div className="absolute right-0 top-0 -z-10 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="container max-w-5xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Zap className="h-3.5 w-3.5" /> Skill-based hiring platform
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Hire talent by{" "}
            <span className="text-gradient-hero">what they can do</span>
            <br />
            not what they claim
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
          >
            TAAS connects verified student talent with startups through project-based assessments. No resumes. No guesswork. Just proven skills.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Button size="lg" className="bg-gradient-primary px-8 text-primary-foreground shadow-glow" onClick={() => navigate("/register")}>
              Start Your Journey <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/login")}>
              Sign In
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card py-12">
        <div className="container grid max-w-4xl grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="font-display text-3xl font-bold text-primary">{s.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-20">
        <div className="container max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">How TAAS Works</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              A simple three-step process from learning to landing your dream project.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: "01", title: "Learn & Build", desc: "Follow structured roadmaps and complete real-world NGO challenges and project checkpoints." },
              { step: "02", title: "Get Verified", desc: "Your submissions are evaluated and scored. Earn NGO Verified Experience badges for impact work." },
              { step: "03", title: "Get Hired", desc: "Businesses see your verified skills and impact score. Apply to projects that match your profile." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="group relative rounded-2xl border border-border bg-card p-8 transition-all hover:shadow-card-hover"
              >
                <div className="mb-4 font-display text-4xl font-bold text-primary/15">{item.step}</div>
                <h3 className="mb-2 font-display text-xl font-semibold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-secondary/50 px-4 py-20">
        <div className="container max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Everything you need</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="rounded-xl border border-border bg-card p-6"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20">
        <div className="container max-w-3xl text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Ready to prove your skills?</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Join thousands of students and startups building the future of hiring.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="bg-gradient-primary px-8 text-primary-foreground" onClick={() => navigate("/register")}>
              Create Account <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/marketplace")}>
              Browse Projects
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-10">
        <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-primary font-display text-xs font-bold text-primary-foreground">T</div>
            <span className="font-display font-semibold">TAAS</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 Talent as a Service. Skill-based hiring for the future.</p>
        </div>
      </footer>
    </div>
  );
}
