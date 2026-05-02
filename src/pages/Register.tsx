import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { UserRole } from "@/lib/auth-context";

const roles: { value: UserRole; label: string; desc: string }[] = [
  { value: "student", label: "🎓 Student", desc: "Learn, build & get verified" },
  { value: "business", label: "💼 Business", desc: "Shortlist & hire top talent" },
  { value: "ngo", label: "💚 NGO", desc: "Post real-world challenges" },
];

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await register(name, email, password, role);
    setIsSubmitting(false);

    if (result.success) {
      toast({ title: "Account created!", description: `Check your email to verify (or wait a bit if email verification is off).`, duration: 5000 });
      // Go to login so they can log in once verified, or auto-redirect if auto-signed in.
      navigate('/login');
    } else {
      toast({ title: "Registration failed", description: result.error || "An error occurred.", variant: "destructive" });
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold">Join TAAS</h1>
          <p className="mt-2 text-muted-foreground">Start your skill-verified journey</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-border bg-card p-8 shadow-card">
          <div>
            <Label className="mb-3 block text-sm font-medium">Join as</Label>
            <div className="grid grid-cols-3 gap-3">
              {roles.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    role === r.value
                      ? "border-primary bg-primary/5 shadow-glow"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className="text-lg font-semibold">{r.label}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground" disabled={isSubmitting}>
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
