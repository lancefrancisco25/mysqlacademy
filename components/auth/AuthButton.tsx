/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useEffect } from "react";
import {
  Cloud,
  CloudOff,
  RefreshCw,
  LogOut,
  ChevronDown,
  Sparkles,
  Database,
  ExternalLink,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLessonStore } from "@/lib/store";
import {
  isSupabaseConfigured,
  signInWithGoogle,
  signOutStudent,
} from "@/lib/supabase";
import { CloudSetupModal } from "./CloudSetupModal";
import { toast } from "sonner";

export function AuthButton() {
  const { user, cloudSyncStatus, syncWithCloud, getOverallStats } =
    useLessonStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isConfigured = isSupabaseConfigured();
  const stats = getOverallStats();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignIn = async () => {
    if (!isConfigured) {
      setIsSetupModalOpen(true);
      return;
    }

    try {
      setIsSigningIn(true);
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error(`Sign in error: ${error.message}`);
        setIsSigningIn(false);
      }
    } catch (err: any) {
      toast.error(`Sign in failed: ${err.message}`);
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutStudent();
      useLessonStore.getState().setUser(null);
      setIsDropdownOpen(false);
      toast.info("Signed out. Local progress remains preserved on this device.");
    } catch (err: any) {
      toast.error(`Sign out error: ${err.message}`);
    }
  };

  const handleManualSync = async () => {
    try {
      await syncWithCloud();
      toast.success("Progress synchronized with cloud!");
    } catch {
      toast.error("Failed to sync progress with cloud");
    }
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {user ? (
          // Logged In Student Button
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full border border-border bg-card/80 hover:bg-accent hover:border-emerald-500/50 transition-all text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name || "Student"}
                className="w-6 h-6 rounded-full object-cover border border-emerald-500/40"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-[11px] border border-emerald-500/40">
                {(user.name?.[0] || user.email?.[0] || "S").toUpperCase()}
              </div>
            )}

            <span className="font-medium text-foreground max-w-[100px] truncate hidden sm:inline">
              {user.name || user.email}
            </span>

            {/* Cloud Status Dot */}
            <span
              className="flex items-center"
              title={
                cloudSyncStatus === "syncing"
                  ? "Syncing with cloud..."
                  : cloudSyncStatus === "synced"
                  ? "Progress synced to cloud"
                  : "Cloud sync offline"
              }
            >
              {cloudSyncStatus === "syncing" ? (
                <RefreshCw className="h-3 w-3 text-sky-400 animate-spin" />
              ) : cloudSyncStatus === "synced" ? (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              ) : (
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              )}
            </span>

            <ChevronDown className="h-3 w-3 text-muted-foreground ml-0.5" />
          </button>
        ) : (
          // Guest / Not Logged In Button
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="h-8 px-2.5 sm:px-3 text-xs gap-2 border-border/80 hover:border-emerald-500/50 hover:bg-emerald-500/10 font-medium transition-all"
            >
              {/* Google G Icon */}
              <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24">
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
              <span>{isSigningIn ? "Signing in..." : "Google Login"}</span>
            </Button>

            {!isConfigured && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSetupModalOpen(true)}
                className="h-8 px-2 text-[11px] text-muted-foreground hover:text-foreground hidden lg:flex items-center gap-1"
                title="Setup Supabase Google Auth & Cloud Storage"
              >
                <Settings className="h-3 w-3" />
                <span>Cloud Setup</span>
              </Button>
            )}
          </div>
        )}

        {/* Dropdown Menu for Logged In Student */}
        {user && isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-xl z-50 p-3 space-y-3 animate-in fade-in-50 zoom-in-95">
            {/* Student Profile Info */}
            <div className="flex items-center gap-3 pb-3 border-b border-border/80">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name || "Student"}
                  className="w-10 h-10 rounded-full object-cover border border-emerald-500/40"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-sm border border-emerald-500/40">
                  {(user.name?.[0] || user.email?.[0] || "S").toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">
                  {user.name || "Student"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Cloud Status Indicator */}
            <div className="bg-muted/40 rounded-lg p-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4 text-emerald-500" />
                <span className="text-muted-foreground">Cloud Sync:</span>
              </div>
              <span className="font-medium text-foreground capitalize flex items-center gap-1">
                {cloudSyncStatus === "synced" && (
                  <span className="text-emerald-500 font-semibold">Synced</span>
                )}
                {cloudSyncStatus === "syncing" && (
                  <span className="text-sky-400">Syncing...</span>
                )}
                {cloudSyncStatus === "error" && (
                  <span className="text-rose-400">Sync Error</span>
                )}
                {cloudSyncStatus === "offline" && (
                  <span className="text-zinc-400">Offline</span>
                )}
              </span>
            </div>

            {/* Progress Summary */}
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className="block text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.completedLessons}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Lessons Mastered
                </span>
              </div>
              <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20">
                <span className="block text-base font-bold text-sky-500">
                  {stats.totalTasksDone}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Tasks Solved
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-1 pt-1 border-t border-border/80">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleManualSync}
                className="w-full justify-start text-xs h-8 gap-2"
              >
                <RefreshCw className="h-3.5 w-3.5 text-sky-400" />
                <span>Sync Progress Now</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsDropdownOpen(false);
                  setIsSetupModalOpen(true);
                }}
                className="w-full justify-start text-xs h-8 gap-2 text-muted-foreground"
              >
                <Settings className="h-3.5 w-3.5" />
                <span>Cloud Setup Guide</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="w-full justify-start text-xs h-8 gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Cloud Setup Modal */}
      <CloudSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
      />
    </>
  );
}
