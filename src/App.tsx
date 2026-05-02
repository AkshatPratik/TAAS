import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";

import Navbar from "@/components/Navbar";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import StudentDashboard from "@/pages/StudentDashboard";
import StartupDashboard from "@/pages/StartupDashboard";
import NgoDashboard from "@/pages/NgoDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import BusinessDashboard from "@/pages/BusinessDashboard";
import Roadmaps from "@/pages/Roadmaps";
import Marketplace from "@/pages/Marketplace";
import NgoTestBuilder from "@/pages/NgoTestBuilder";
import StudentTests from "@/pages/StudentTests";
import TakeTest from "@/pages/TakeTest";
import ModuleQuiz from "@/pages/ModuleQuiz";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>

            <Navbar />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/startup" element={<StartupDashboard />} />
              <Route path="/ngo" element={<NgoDashboard />} />
              <Route path="/business" element={<BusinessDashboard />} />
              <Route path="/ngo/test/:testId" element={<NgoTestBuilder />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/roadmaps" element={<Roadmaps />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/tests" element={<StudentTests />} />
              <Route path="/tests/:testId" element={<TakeTest />} />
              <Route path="/quiz/:moduleId" element={<ModuleQuiz />} />
              <Route path="/admin/roadmaps" element={<Roadmaps />} />
              <Route path="/admin/submissions" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>

        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
