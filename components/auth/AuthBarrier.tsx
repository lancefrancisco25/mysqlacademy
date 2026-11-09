"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Lock,
  Database,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  ArrowRight,
  User,
  Mail,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLessonStore } from "@/lib/store";
import { isSupabaseConfigured, signInWithGoogle } from "@/lib/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AuthBarrierProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function AuthBarrier({
  children,
  title = "Student Sign-In Required",
  description = "Please sign in to access the MySQL curriculum, practice in the live database sandbox, and save your progress.",
}: AuthBarrierProps) {
  const user = useLessonStore((s) => s.user);
  const setUser = useLessonStore((s) => s.setUser);
  const [mounted, setMounted] = useState(false);
  const [isSigningInWithGoogle, setIsSigningInWithGoogle] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!useLessonStore.getState().user && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("mysql-academy-student-user");
        if (stored) {
          const student = JSON.parse(stored);
          if (student?.id) {
            useLessonStore.getState().setUser(student);
          }
        }
      } catch {}
    }
  }, []);

  const handleGoogleSignIn = async () => {
    if (!isSupabaseConfigured()) {
      toast.info("Supabase is not configured for Google OAuth. You can use Quick Student Sign-In below.");
      setShowEmailForm(true);
      return;
    }

    try {
      setIsSigningInWithGoogle(true);
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error(`Sign in error: ${error.message}`);
        setIsSigningInWithGoogle(false);
      }
    } catch (err: any) {
      toast.error(`Sign in failed: ${err.message}`);
      setIsSigningInWithGoogle(false);
    }
  };

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid student email address.");
      return;
    }

    const studentName = name.trim() || email.split("@")[0] || "Student";
    const studentUser = {
      id: "student-" + btoa(email.toLowerCase().trim()).substring(0, 16),
      name: studentName,
      email: email.trim().toLowerCase(),
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(studentName)}`,
    };

    setUser(studentUser);
    toast.success(`Welcome back, ${studentName}!`);
  };

  const handleDemoSignIn = () => {
    const demoStudent = {
      id: "student-demo-alex",
      name: "Alex Rivera",
      email: "alex.rivera@academy.edu",
      avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Alex%20Rivera",
    };
    setUser(demoStudent);
    toast.success("Signed in as Demo Student (Alex Rivera)!");
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-muted-foreground font-mono">Verifying student authentication...</p>
      </div>
    );
  }

  // If user is authenticated, render the protected content
  if (user) {
    return <>{children}</>;
  }

  // Auth Barrier Gate
  return (
    <div className="min-h-[85vh] bg-background text-foreground flex items-center justify-center p-4 sm:p-6 md:p-10 relative overflow-hidden">
      {/* Background glow and subtle grid */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-md w-full bg-card border border-border/80 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 relative">
        {/* Top Lock Badge */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shadow-sm">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        {/* What You'll Get Feature Pills */}
        <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 space-y-2 text-xs">
          <div className="font-semibold text-foreground flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
            Included with Free Student Account
          </div>
          <div className="space-y-1.5 text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Full curriculum access across all 6 specialized tracks</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Interactive in-memory MySQL terminal sandbox</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Automatic progress saving across browser reloads</span>
            </div>
          </div>
        </div>

        {/* Primary Actions */}
        <div className="space-y-3">
          {/* Continue with Google */}
          <Button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSigningInWithGoogle}
            className="w-full bg-foreground text-background hover:bg-foreground/90 font-medium h-10 gap-2.5 text-xs sm:text-sm shadow-xs"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isSigningInWithGoogle ? "Connecting to Google..." : "Continue with Google"}</span>
          </Button>

          {/* Quick Email / Name Sign-In Accordion */}
          {!showEmailForm ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEmailForm(true)}
              className="w-full text-xs font-mono h-9 gap-1.5 border-border"
            >
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Sign in with Student Email / ID</span>
            </Button>
          ) : (
            <form onSubmit={handleStudentLogin} className="space-y-2.5 pt-1 animate-in fade-in">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Chen"
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-emerald-500 font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Student Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-emerald-500 font-sans"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold h-9 gap-1.5"
              >
                <span>Enter Academy Workspace</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </form>
          )}

          {/* Divider */}
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono">
              <span className="bg-card px-2 text-muted-foreground">or quick test</span>
            </div>
          </div>

          {/* Demo Instant Login */}
          <Button
            type="button"
            variant="ghost"
            onClick={handleDemoSignIn}
            className="w-full text-xs font-mono h-8 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 gap-1.5"
          >
            <Flame className="h-3.5 w-3.5" />
            <span>Continue as Demo Student (1-Click)</span>
          </Button>
        </div>

        {/* Back Link */}
        <div className="text-center pt-2">
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground font-mono transition-colors"
          >
            ← Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
