import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'student') navigate('/student');
      else if (user.role === 'startup') navigate('/startup');
      else if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'ngo') navigate('/ngo');
      else if (user.role === 'business') navigate('/business');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      toast({ title: "Welcome back!", description: "You've signed in successfully." });
      // Redirect happens via useEffect when user state populates
    } else {
      toast({ title: "Login failed", description: result.error || "Invalid email or password.", variant: "destructive" });
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold">Welcome back</h1>
          <p className="mt-2 text-muted-foreground">Sign in to your TAAS account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-border bg-card p-8 shadow-card">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground" disabled={isSubmitting}>
            {isSubmitting ? "Signing In..." : "Sign In"}
          </Button>
          <div className="rounded-lg bg-secondary/50 p-3 text-xs text-muted-foreground">
            <strong>Demo accounts (If manually added to Supabase DB):</strong><br />
            Student: alex@student.com · Business: team@techflow.ai · NGO: ngo@edubridge.org · Admin: admin@taas.com<br />
            (password: <code>password</code>)
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
