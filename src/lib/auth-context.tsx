import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";
import type { Database } from "./database.types";
export type UserRole = "student" | "startup" | "admin" | "ngo" | "business";

type DbUser = Database['public']['Tables']['users']['Row'];

// We extend the Supabase auth user with our public.users data
export interface User extends DbUser {
  // role, name, etc. are already in DbUser
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    // 1. Try to fetch the profile
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data && !error) {
      setUser(data);
      setIsLoading(false);
      return;
    }

    // 2. If profile is missing, try to create it from Auth metadata
    // This happens if the DB trigger failed during signup
    console.log("Profile missing, attempting to create from Auth metadata...");
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (authUser) {
      const newProfile = {
        id: authUser.id,
        name: authUser.user_metadata?.full_name || 'User',
        email: authUser.email || '',
        role: (authUser.user_metadata?.role as UserRole) || 'student',
      };

      const { data: createdProfile, error: insertError } = await supabase
        .from('users')
        .insert([newProfile])
        .select()
        .single();

      if (!insertError && createdProfile) {
        setUser(createdProfile);
      } else {
        console.error("Failed to auto-create profile:", insertError);
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setIsLoading(false);
      return { success: false, error: error.message };
    }
    return { success: true };
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: role,
        }
      }
    });
    
    if (error) {
      setIsLoading(false);
      return { success: false, error: error.message };
    }
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
