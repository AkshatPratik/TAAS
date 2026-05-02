import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

const roleNavLinks: Record<string, { label: string; to: string }[]> = {
  student: [
    { label: "Dashboard", to: "/student" },
    { label: "Roadmaps", to: "/roadmaps" },
    { label: "Tests", to: "/tests" },
    { label: "Marketplace", to: "/marketplace" },
  ],
  startup: [
    { label: "Dashboard", to: "/startup" },
    { label: "Marketplace", to: "/marketplace" },
  ],
  ngo: [
    { label: "Dashboard", to: "/ngo" },
    { label: "Marketplace", to: "/marketplace" },
  ],
  business: [
    { label: "Dashboard", to: "/business" },
    { label: "Marketplace", to: "/marketplace" },
  ],
  admin: [
    { label: "Dashboard", to: "/admin" },
    { label: "Roadmaps", to: "/admin/roadmaps" },
    { label: "Submissions", to: "/admin/submissions" },
  ],
};

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = user ? roleNavLinks[user.role] || [] : [];

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary font-display text-sm font-bold text-primary-foreground">
            T
          </div>
          <span className="font-display text-xl font-bold tracking-tight">TAAS</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 text-sm">
                <div className="h-2 w-2 rounded-full bg-success" />
                <span className="font-medium">{user?.name}</span>
                <span className="text-muted-foreground capitalize">({user?.role})</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { logout(); navigate("/"); }}>
                <LogOut className="mr-1 h-4 w-4" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>Sign In</Button>
              <Button size="sm" className="bg-gradient-primary text-primary-foreground" onClick={() => navigate("/register")}>
                Get Started
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-card p-4 md:hidden">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => { logout(); navigate("/"); setMobileOpen(false); }}>
              <LogOut className="mr-1 h-4 w-4" /> Logout
            </Button>
          ) : (
            <div className="mt-2 flex flex-col gap-2">
              <Button variant="ghost" size="sm" onClick={() => { navigate("/login"); setMobileOpen(false); }}>Sign In</Button>
              <Button size="sm" className="bg-gradient-primary text-primary-foreground" onClick={() => { navigate("/register"); setMobileOpen(false); }}>Get Started</Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
