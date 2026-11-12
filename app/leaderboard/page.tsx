"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Trophy,
  Flame,
  CheckCircle2,
  Search,
  Eye,
  EyeOff,
  User,
  Medal,
  ArrowRight,
  RotateCcw,
  RefreshCw,
  AlertCircle,
  Edit3,
  Check,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { AuthBarrier } from "@/components/auth/AuthBarrier";
import { type LeaderboardEntry } from "@/lib/leaderboard-data";
import { useLessonStore } from "@/lib/store";
import {
  fetchCloudLeaderboard,
  saveCloudProgress,
  isSupabaseConfigured,
  type CloudProgressRecord,
} from "@/lib/supabase";
import { cn } from "@/lib/utils";

const STORAGE_OPT_IN_KEY = "mysql-academy-leaderboard-opt-in";

function parseProgressToStats(rawProgress: Record<string, any>) {
  let completedTasks = 0;
  let completedLessons = 0;
  let completedDrills = 0;

  for (const [key, val] of Object.entries(rawProgress || {})) {
    if (key.startsWith("_")) continue;
    const p = val as any;
    if (p && Array.isArray(p.completedTaskIds)) {
      completedTasks += p.completedTaskIds.length;
    }
    if (p && Array.isArray(p.completedDrillIds)) {
      completedDrills += p.completedDrillIds.length;
    }
    if (p && (p.isCompleted || (Array.isArray(p.completedTaskIds) && p.completedTaskIds.length >= 2))) {
      completedLessons += 1;
    }
  }

  const scoreAllTime = completedLessons * 150 + completedTasks * 35 + completedDrills * 20;
  const scoreThisWeek = Math.max(Math.round(scoreAllTime * 0.45), completedTasks * 20);
  const streakDays = completedLessons > 0 ? Math.min(completedLessons * 2 + 1, 14) : 0;

  let track = "Relational Foundations";
  if (completedLessons >= 6) track = "Transactions & Indexing";
  else if (completedLessons >= 4) track = "Joins & Subqueries";
  else if (completedLessons >= 2) track = "CRUD Operations";

  return {
    completedLessons,
    completedTasks,
    scoreAllTime,
    scoreThisWeek,
    streakDays,
    track,
  };
}

function formatFallbackName(email?: string | null): string {
  if (!email) return "Student";
  const userPart = email.split("@")[0].replace(/[._-]+/g, " ");
  return (
    userPart
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ") || "Student"
  );
}

export default function LeaderboardPage() {
  const [mounted, setMounted] = useState(false);
  const [period, setPeriod] = useState<"all-time" | "this-week">("all-time");
  const [searchQuery, setSearchQuery] = useState("");
  const [isOptedIn, setIsOptedIn] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [cloudRecords, setCloudRecords] = useState<CloudProgressRecord[]>([]);
  const [isLoadingCloud, setIsLoadingCloud] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const user = useLessonStore((s) => s.user);
  const progress = useLessonStore((s) => s.progress);
  const getOverallStats = useLessonStore((s) => s.getOverallStats);

  // Initialize nameInput whenever user changes
  useEffect(() => {
    if (user?.name) {
      setNameInput(user.name);
    }
  }, [user]);

  // Rehydrate opt-in preference and progress on client mount
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      try {
        const savedOptIn = localStorage.getItem(STORAGE_OPT_IN_KEY);
        // Default is strictly opted out (false) unless explicitly saved as true
        setIsOptedIn(savedOptIn === "true");
      } catch {}
    }
  }, []);

  const [fetchNotice, setFetchNotice] = useState<string | null>(null);

  // Fetch real students from Supabase database
  const loadCloudLeaderboard = async () => {
    if (!isSupabaseConfigured()) {
      setFetchNotice("Supabase credentials not configured in environment variables.");
      return;
    }
    try {
      setIsLoadingCloud(true);
      setFetchNotice(null);
      const records = await fetchCloudLeaderboard();
      setCloudRecords(records);
    } catch (err: any) {
      console.warn("[leaderboard] Cloud fetch notice:", err);
      setFetchNotice("Unable to reach cloud leaderboard. Check network and database policies.");
    } finally {
      setIsLoadingCloud(false);
    }
  };

  useEffect(() => {
    if (!mounted || !user) return;
    loadCloudLeaderboard();
  }, [mounted, user]);

  // Automatic DB edit for existing logged-in users (backfill Full Name, opt-in, & stats)
  useEffect(() => {
    if (!mounted || !user || !isSupabaseConfigured()) return;
    let isCancelled = false;

    async function autoSyncExistingUser() {
      if (!user) return;
      try {
        await saveCloudProgress(
          user.id,
          progress as any,
          user.email,
          user.name,
          isOptedIn
        );
        if (!isCancelled) {
          const records = await fetchCloudLeaderboard();
          if (!isCancelled) setCloudRecords(records);
        }
      } catch (e) {
        console.warn("[leaderboard] Auto-sync notice:", e);
      }
    }

    autoSyncExistingUser();
    return () => {
      isCancelled = true;
    };
  }, [mounted, user, isOptedIn, progress]);

  // Handle saving Full Name directly to local storage and Supabase
  const handleSaveName = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed || !user) return;

    const updatedUser = {
      ...user,
      name: trimmed,
    };
    useLessonStore.getState().setUser(updatedUser);
    setIsEditingName(false);

    if (isSupabaseConfigured()) {
      await saveCloudProgress(
        user.id,
        progress as any,
        user.email,
        trimmed,
        isOptedIn
      );
      loadCloudLeaderboard();
    }
    setAnnouncement(`Display name updated to ${trimmed}.`);
  };

  // Handle opt-in toggle with Supabase persistence
  const handleToggleOptIn = async (checked: boolean) => {
    setIsOptedIn(checked);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_OPT_IN_KEY, String(checked));
      } catch {}
    }

    // Persist opt-in preference to real Supabase database if logged in
    if (user && isSupabaseConfigured()) {
      await saveCloudProgress(user.id, progress as any, user.email, user.name, checked);
      // Refresh database records to keep client and cloud in parity
      loadCloudLeaderboard();
    }

    const message = checked
      ? "Leaderboard visibility enabled. Your rank and score are now visible on the public cohort board."
      : "Leaderboard visibility disabled. Your profile is now hidden from the public cohort board.";
    setAnnouncement(message);
  };

  // Compute current user's actual progress stats
  const userStats = useMemo(() => {
    const stats = getOverallStats();
    let totalDrills = 0;
    Object.values(progress).forEach((p) => {
      if (p.completedDrillIds) {
        totalDrills += p.completedDrillIds.length;
      }
    });

    const calculatedScore =
      stats.completedLessons * 150 + stats.totalTasksDone * 35 + totalDrills * 20;

    const weeklyScore = Math.max(Math.round(calculatedScore * 0.45), stats.totalTasksDone * 20);

    return {
      completedLessons: stats.completedLessons,
      completedTasks: stats.totalTasksDone,
      scoreAllTime: calculatedScore,
      scoreThisWeek: weeklyScore,
      streakDays: stats.completedLessons > 0 ? Math.min(stats.completedLessons * 2 + 1, 14) : 0,
    };
  }, [progress, getOverallStats]);

  // Build cohort entries strictly from real Supabase records + current student if opted in (NO MOCK DATA)
  const cohortEntries: LeaderboardEntry[] = useMemo(() => {
    const map = new Map<string, LeaderboardEntry>();

    // 1. Parse real records from Supabase user_progress table
    cloudRecords.forEach((record) => {
      const rawMeta = record.progress?._meta;
      const isRecordOptedIn = record.opt_in !== false && rawMeta?.optIn !== false;
      if (!isRecordOptedIn) return;

      const isCurrent = Boolean(
        user && (record.user_id === user.id || (record.email && record.email.toLowerCase() === user.email?.toLowerCase()))
      );

      // If this record belongs to the current user, respect current user's local isOptedIn toggle
      if (isCurrent && !isOptedIn) return;

      const studentName =
        record.name ||
        rawMeta?.name ||
        formatFallbackName(record.email);

      const stats = parseProgressToStats(record.progress);
      const scoreAllTime = isCurrent ? Math.max(stats.scoreAllTime, userStats.scoreAllTime) : stats.scoreAllTime;
      const scoreThisWeek = isCurrent ? Math.max(stats.scoreThisWeek, userStats.scoreThisWeek) : stats.scoreThisWeek;

      const entryKey = isCurrent ? "current-user" : record.user_id.toLowerCase();
      map.set(entryKey, {
        id: record.user_id,
        name: isCurrent ? (user?.name || studentName) : studentName,
        avatarSeed: record.user_id,
        track: isCurrent
          ? userStats.completedLessons >= 4
            ? "Joins & Subqueries"
            : userStats.completedLessons >= 2
            ? "CRUD Operations"
            : "Relational Foundations"
          : stats.track,
        completedLessons: isCurrent ? Math.max(stats.completedLessons, userStats.completedLessons) : stats.completedLessons,
        completedTasks: isCurrent ? Math.max(stats.completedTasks, userStats.completedTasks) : stats.completedTasks,
        streakDays: isCurrent ? Math.max(stats.streakDays, userStats.streakDays) : stats.streakDays,
        scoreAllTime,
        scoreThisWeek,
        isCurrentUser: isCurrent,
      });
    });

    // 2. Insert or update the current user if opted in and not already added from cloudRecords
    if (isOptedIn && user && !map.has("current-user")) {
      const studentName = user.name || formatFallbackName(user.email);
      map.set("current-user", {
        id: user.id || "current-user",
        name: studentName,
        avatarSeed: user.id || "StudentUser",
        track:
          userStats.completedLessons >= 4
            ? "Joins & Subqueries"
            : userStats.completedLessons >= 2
            ? "CRUD Operations"
            : "Relational Foundations",
        completedLessons: userStats.completedLessons,
        completedTasks: userStats.completedTasks,
        streakDays: userStats.streakDays,
        scoreAllTime: userStats.scoreAllTime,
        scoreThisWeek: userStats.scoreThisWeek,
        isCurrentUser: true,
      });
    }

    const list = Array.from(map.values());

    // Sort by chosen period score descending
    return list.sort((a, b) => {
      const scoreA = period === "all-time" ? a.scoreAllTime : a.scoreThisWeek;
      const scoreB = period === "all-time" ? b.scoreAllTime : b.scoreThisWeek;
      return scoreB - scoreA;
    });
  }, [cloudRecords, isOptedIn, user, userStats, period]);

  // Filter cohort by search query
  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return cohortEntries;
    const q = searchQuery.toLowerCase().trim();
    return cohortEntries.filter(
      (entry) =>
        entry.name.toLowerCase().includes(q) ||
        entry.track.toLowerCase().includes(q)
    );
  }, [cohortEntries, searchQuery]);

  // Current user's rank index if opted in
  const currentUserRank = useMemo(() => {
    if (!isOptedIn) return null;
    const index = cohortEntries.findIndex((e) => e.isCurrentUser);
    return index >= 0 ? index + 1 : null;
  }, [cohortEntries, isOptedIn]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      {/* Screen reader live region for dynamic status announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      <AuthBarrier
        title="Student Sign-In Required"
        description="Sign in with your student account to access the cohort leaderboard, publish your score, and review rankings."
      >
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-8">
        {/* ── Page Header ────────────────────────────────────────────── */}
        <section aria-labelledby="leaderboard-heading" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5" />
                  Academic Standings
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  Active Cohort
                </span>
              </div>
              <h1
                id="leaderboard-heading"
                className="text-3xl font-extrabold tracking-tight text-foreground"
              >
                Student Leaderboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                Compare learning milestones, lab completions, and query mastery points across enrolled students.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/learn">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-9 font-medium gap-1.5 border-border"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Privacy & Opt-In Control Panel ─────────────────────────── */}
        <section
          aria-labelledby="privacy-heading"
          className="rounded-xl border border-border bg-card/60 p-5 space-y-4"
        >
          {/* Student Profile Identity Bar with Full Name Editor */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-sm shrink-0 shadow-xs">
                {(user?.name?.[0] || user?.email?.[0] || "S").toUpperCase()}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  {isEditingName ? (
                    <form onSubmit={handleSaveName} className="flex items-center gap-1.5 flex-wrap">
                      <label htmlFor="edit-full-name-input" className="sr-only">Full Name</label>
                      <input
                        id="edit-full-name-input"
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="Enter Full Name"
                        className="px-2.5 py-1 text-xs rounded border border-emerald-500 bg-background text-foreground outline-none font-medium w-48 shadow-xs"
                        autoFocus
                      />
                      <Button
                        type="submit"
                        size="sm"
                        className="h-7 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1"
                      >
                        <Check className="h-3 w-3" />
                        Save Name
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setNameInput(user?.name || "");
                          setIsEditingName(false);
                        }}
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </Button>
                    </form>
                  ) : (
                    <>
                      <span className="text-sm font-bold text-foreground">
                        {user?.name || "Student"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsEditingName(true)}
                        className="text-[11px] text-muted-foreground hover:text-emerald-500 flex items-center gap-1 transition-colors underline font-medium"
                        title="Edit Full Name displayed on leaderboard"
                      >
                        <Edit3 className="h-3 w-3" />
                        <span>Edit Full Name</span>
                      </button>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground font-mono">
                  {user?.email || "Student Account"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
              <span>Points: <strong className="text-foreground">{userStats.scoreAllTime}</strong></span>
              <span>•</span>
              <span>Streak: <strong className="text-foreground">{userStats.streakDays}d</strong></span>
              <span>•</span>
              <span>Rank: <strong className="text-emerald-500">{currentUserRank ? `#${currentUserRank}` : "Unranked"}</strong></span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2
                  id="privacy-heading"
                  className="text-sm font-bold tracking-tight text-foreground"
                >
                  Public Leaderboard Visibility
                </h2>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[11px] font-mono",
                    isOptedIn
                      ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                      : "border-zinc-500/40 text-zinc-600 dark:text-zinc-400 bg-zinc-500/10"
                  )}
                >
                  {isOptedIn ? "Opted In (Visible)" : "Opted Out (Hidden)"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
                When enabled, your display name, current track, total points, and day streak appear on the public cohort leaderboard. When disabled, your learning statistics remain private to your account.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <label
                htmlFor="leaderboard-visibility-toggle"
                className="text-xs font-medium cursor-pointer select-none text-foreground"
              >
                {isOptedIn ? "Publicly Visible" : "Hidden from Public"}
              </label>
              <Switch
                id="leaderboard-visibility-toggle"
                checked={isOptedIn}
                onCheckedChange={handleToggleOptIn}
                aria-label="Toggle public leaderboard visibility"
              />
            </div>
          </div>

          {/* Visibility Status Banner */}
          <div
            className={cn(
              "p-3.5 rounded-lg border text-xs flex items-start gap-3 transition-colors",
              isOptedIn
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                : "bg-muted/40 border-border text-muted-foreground"
            )}
            role="status"
          >
            {isOptedIn ? (
              <Eye className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            ) : (
              <EyeOff className="h-4 w-4 shrink-0 text-zinc-500 mt-0.5" />
            )}
            <div>
              {isOptedIn ? (
                <span>
                  <strong>Your profile is visible on the leaderboard.</strong>{" "}
                  {currentUserRank
                    ? `You are currently ranked #${currentUserRank} with ${
                        period === "all-time"
                          ? userStats.scoreAllTime
                          : userStats.scoreThisWeek
                      } points.`
                    : "Complete lesson tasks to earn your position."}
                </span>
              ) : (
                <span>
                  <strong>Your profile is hidden from the public leaderboard.</strong> You can still view cohort rankings below. Toggle the switch above at any time to publish your rank and score.
                </span>
              )}
            </div>
          </div>
        </section>

        {/* ── Filters & Controls Bar ─────────────────────────────────── */}
        <section aria-label="Leaderboard Filters" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Period Filter Tabs */}
            <div
              role="tablist"
              aria-label="Leaderboard time period"
              className="inline-flex items-center p-1 rounded-lg bg-muted border border-border"
            >
              <button
                type="button"
                role="tab"
                id="tab-all-time"
                aria-selected={period === "all-time"}
                aria-controls="panel-leaderboard"
                onClick={() => setPeriod("all-time")}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
                  period === "all-time"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                All Time
              </button>
              <button
                type="button"
                role="tab"
                id="tab-this-week"
                aria-selected={period === "this-week"}
                aria-controls="panel-leaderboard"
                onClick={() => setPeriod("this-week")}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
                  period === "this-week"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                This Week
              </button>
            </div>

            {/* Search Input & Refresh Button */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <label htmlFor="leaderboard-search" className="sr-only">
                  Search students by name or track
                </label>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <input
                  id="leaderboard-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search students or tracks..."
                  className={cn(
                    "w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground",
                    "placeholder:text-muted-foreground/70",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-emerald-500"
                  )}
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={loadCloudLeaderboard}
                disabled={isLoadingCloud}
                className="text-xs h-8 px-2.5 gap-1.5 shrink-0 border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Fetch latest student rankings from Supabase database"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", isLoadingCloud && "animate-spin text-emerald-500")} />
                <span className="hidden md:inline">{isLoadingCloud ? "Fetching..." : "Refresh"}</span>
              </Button>
            </div>
          </div>

          {/* Database Notice Banner if fetch notice occurred */}
          {fetchNotice && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="flex-1">{fetchNotice}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadCloudLeaderboard}
                className="h-6 px-2 text-[11px] text-amber-700 dark:text-amber-300 hover:bg-amber-500/20"
              >
                Retry
              </Button>
            </div>
          )}
        </section>

        {/* ── Leaderboard Table Section ──────────────────────────────── */}
        <section
          id="panel-leaderboard"
          role="tabpanel"
          aria-labelledby={period === "all-time" ? "tab-all-time" : "tab-this-week"}
          className="rounded-xl border border-border bg-card/60 overflow-hidden shadow-sm"
        >
          {!mounted || isLoadingCloud ? (
            /* Loading Skeleton State */
            <div className="p-6 space-y-3" aria-busy="true" aria-label="Loading leaderboard">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 w-full bg-muted/40 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : filteredEntries.length === 0 ? (
            /* Empty State */
            <div className="p-12 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                {searchQuery ? <Search className="h-5 w-5" /> : <Trophy className="h-5 w-5" />}
              </div>
              <h3 className="text-sm font-bold text-foreground">
                {searchQuery ? "No students match your search" : "No cohort standings available yet"}
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {searchQuery
                  ? `No students found matching "${searchQuery}". Clear the search input to view the full cohort standings.`
                  : isOptedIn
                  ? "You are currently the only active participant opted into this cohort leaderboard. Keep practicing and your standing will lead the board!"
                  : "No students have opted into the public standings yet. Turn on \"Show me on leaderboard\" above to publish your score and take the #1 rank!"}
              </p>
              {searchQuery ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="text-xs h-8 gap-1.5 mt-2"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Search</span>
                </Button>
              ) : !isOptedIn ? (
                <Button
                  size="sm"
                  onClick={() => handleToggleOptIn(true)}
                  className="text-xs h-8 gap-1.5 mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Publish My Score to Leaderboard</span>
                </Button>
              ) : null}
            </div>
          ) : (
            /* Data Table */
            <div className="overflow-x-auto">
              <table
                className="w-full text-xs text-left"
                aria-label="Student Cohort Standings Table"
              >
                <thead>
                  <tr className="bg-muted/40 border-b border-border text-muted-foreground font-mono">
                    <th scope="col" className="px-4 py-3 w-16 text-center">
                      Rank
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Student
                    </th>
                    <th scope="col" className="px-4 py-3 hidden md:table-cell">
                      Current Track
                    </th>
                    <th scope="col" className="px-4 py-3 text-center hidden sm:table-cell">
                      Tasks
                    </th>
                    <th scope="col" className="px-4 py-3 text-center">
                      Streak
                    </th>
                    <th scope="col" className="px-4 py-3 text-right">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredEntries.map((entry, index) => {
                    const rank = index + 1;
                    const isTopThree = rank <= 3;
                    const score =
                      period === "all-time"
                        ? entry.scoreAllTime
                        : entry.scoreThisWeek;

                    return (
                      <tr
                        key={entry.id}
                        className={cn(
                          "transition-colors",
                          entry.isCurrentUser
                            ? "bg-emerald-500/10 hover:bg-emerald-500/15 border-l-4 border-l-emerald-500"
                            : "hover:bg-muted/30"
                        )}
                      >
                        {/* Rank */}
                        <th
                          scope="row"
                          className="px-4 py-3.5 text-center font-mono font-bold"
                        >
                          {rank === 1 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/40 text-xs">
                              1
                            </span>
                          ) : rank === 2 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-zinc-400/20 text-zinc-300 border border-zinc-400/40 text-xs">
                              2
                            </span>
                          ) : rank === 3 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/20 text-amber-600 border border-amber-700/40 text-xs">
                              3
                            </span>
                          ) : (
                            <span className="text-muted-foreground">{rank}</span>
                          )}
                        </th>

                        {/* Student Name & Avatar */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={cn(
                                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border",
                                entry.isCurrentUser
                                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                                  : isTopThree
                                  ? "bg-amber-500/15 text-amber-500 border-amber-500/30"
                                  : "bg-muted text-muted-foreground border-border"
                              )}
                              aria-hidden="true"
                            >
                              {entry.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={cn(
                                  "font-medium",
                                  entry.isCurrentUser
                                    ? "font-bold text-foreground"
                                    : "text-foreground"
                                )}
                              >
                                {entry.name}
                              </span>
                              {entry.isCurrentUser && (
                                <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white border-0 text-[10px] font-mono py-0 px-1.5 h-4">
                                  You
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Track */}
                        <td className="px-4 py-3.5 hidden md:table-cell text-muted-foreground">
                          <span className="inline-block px-2 py-0.5 rounded bg-muted/60 border border-border/80 text-[11px] font-mono">
                            {entry.track}
                          </span>
                        </td>

                        {/* Tasks */}
                        <td className="px-4 py-3.5 text-center hidden sm:table-cell font-mono text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            <span>{entry.completedTasks}</span>
                          </span>
                        </td>

                        {/* Streak */}
                        <td className="px-4 py-3.5 text-center font-mono">
                          <span className="inline-flex items-center gap-1 text-amber-500 font-semibold">
                            <Flame className="h-3.5 w-3.5 fill-amber-500/20" />
                            <span>{entry.streakDays}d</span>
                          </span>
                        </td>

                        {/* Score */}
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-foreground">
                          <span className="text-emerald-600 dark:text-emerald-400">
                            {score.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-normal ml-1">
                            pts
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer with Summary */}
          <div className="p-3 bg-muted/20 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-2">
            <span>
              Showing {filteredEntries.length} enrolled student
              {filteredEntries.length === 1 ? "" : "s"}
            </span>
            <span className="font-mono text-[11px]">
              Points earned via verified lab tasks, syntax speed drills, and module checkpoints.
            </span>
          </div>
        </section>
      </main>
      </AuthBarrier>
    </div>
  );
}
