"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import {
  Blocks,
  PenLine,
  BarChart3,
  GitMerge,
  Wrench,
  Zap,
  CheckCircle2,
  Circle,
  ArrowRight,
  Trophy,
  Flame,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AuthBarrier } from "@/components/auth/AuthBarrier";
import { ModuleUpdatesModal } from "@/components/lesson/ModuleUpdatesModal";
import { TRACKS, LESSONS, getLessonsForTrack } from "@/lib/lessons";
import { getLessonActivityStats } from "@/lib/lessons/activities";
import { TASK_TO_CHECKPOINT_MAP } from "@/lib/lessons/problem-linking";
import { useLessonStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, any> = {
  Blocks,
  PenLine,
  BarChart3,
  GitMerge,
  Wrench,
  Zap,
};

export default function LearnDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [showUpdates, setShowUpdates] = useState(false);
  const user = useLessonStore((s) => s.user);
  const progress = useLessonStore((s) => s.progress);
  const getOverallStats = useLessonStore((s) => s.getOverallStats);
  const rehydrateProgress = useLessonStore((s) => s.rehydrateProgress);
  const syncWithCloud = useLessonStore((s) => s.syncWithCloud);

  useEffect(() => {
    setMounted(true);
    rehydrateProgress();
    if (user) {
      syncWithCloud();
    }
    if (typeof window !== "undefined") {
      const platformSeen = localStorage.getItem("mysql-academy-seen-platform-updates");
      if (platformSeen !== "true") {
        setShowUpdates(true);
      }
    }
  }, [user, rehydrateProgress, syncWithCloud]);

  const stats = mounted
    ? getOverallStats()
    : { completedLessons: 0, totalTasksDone: 0, totalTasks: 31, masteryScore: 0 };

  const totalLessons = LESSONS.length;
  const currentProgress = useMemo(() => (mounted ? progress : {}), [mounted, progress]);

  // Compute dynamic next lesson slug for Resume Learning
  const nextLessonSlug = useMemo(() => {
    const firstIncomplete = LESSONS.find((l) => {
      const p = currentProgress[l.slug];
      const s = getLessonActivityStats(l, p);
      return !s.isCompleted;
    });
    return firstIncomplete?.slug || LESSONS[0]?.slug || "create-database";
  }, [currentProgress]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <AuthBarrier
        title="Student Sign-In Required"
        description="Please sign in to access the MySQL curriculum dashboard and track your progress across all specialized tracks."
      >
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-10">
        {/* ── Top Header & Stats Card ────────────────────────────────── */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Curriculum Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Progress through 6 specialized tracks from relational basics to ACID transactions and index optimization.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUpdates(true)}
                className="gap-1.5 border-border text-muted-foreground hover:text-foreground text-xs font-mono h-10 px-3"
                title="Review website release notes and updates"
              >
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <span>Updates</span>
              </Button>
              <Link href={`/learn/${nextLessonSlug}`}>
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 h-10 font-semibold shadow-xs">
                  Resume Learning
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <ModuleUpdatesModal
            isOpen={showUpdates}
            onContinue={() => setShowUpdates(false)}
            onClose={() => setShowUpdates(false)}
          />

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-border bg-card/60 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Lessons Mastered</p>
                <p className="text-2xl font-bold tracking-tight">
                  {stats.completedLessons} <span className="text-xs text-muted-foreground font-normal">/ {totalLessons}</span>
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card/60 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-sky-500/10 text-sky-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Tasks Completed</p>
                <p className="text-2xl font-bold tracking-tight">
                  {stats.totalTasksDone} <span className="text-xs text-muted-foreground font-normal">/ {stats.totalTasks || 31}</span>
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card/60 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400">
                <Flame className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground font-medium">Mastery Score</span>
                  <span className="font-bold text-amber-400">{stats.masteryScore}%</span>
                </div>
                <Progress value={stats.masteryScore} className="h-2" />
              </div>
            </div>
          </div>

          {/* Quick Tools & Features Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/leaderboard"
              className="p-4 rounded-xl border border-border bg-card/40 hover:bg-card hover:border-emerald-500/40 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500 group-hover:scale-105 transition-transform">
                  <Trophy className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-foreground">
                    Student Leaderboard
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Cohort standings, day streaks, and mastery rankings.
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/sql-sandbox"
              className="p-4 rounded-xl border border-border bg-card/40 hover:bg-card hover:border-emerald-500/40 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-105 transition-transform">
                  <Wrench className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-foreground">
                    In-Browser MySQL Sandbox
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Test queries and create tables with local persistence.
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>

        {/* ── Categorized Curriculum Tracks ───────────────────────────── */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-500" />
              Learning Tracks
            </h2>
            <span className="text-xs text-muted-foreground">
              {TRACKS.length} Tracks • {LESSONS.length} Modules
            </span>
          </div>

          <div className="space-y-6">
            {TRACKS.map((track, trackIdx) => {
              const TrackIcon = ICON_MAP[track.iconName] || Blocks;
              const lessons = getLessonsForTrack(track.id);

              let trackTasksTotal = 0;
              let trackTasksDone = 0;

              lessons.forEach((l) => {
                const p = currentProgress[l.slug];
                const passedCheckpoints = p?.checkpointPassedIds || [];
                const completedTasks = p?.completedTaskIds || [];

                l.tasks.forEach((t) => {
                  trackTasksTotal += 1;
                  const linkedCheckpoint = TASK_TO_CHECKPOINT_MAP[t.id];
                  if (
                    completedTasks.includes(t.id) ||
                    (linkedCheckpoint && passedCheckpoints.includes(linkedCheckpoint))
                  ) {
                    trackTasksDone += 1;
                  }
                });
              });

              // Calculate track lesson completion based on 100% activity mastery
              const completedInTrack = lessons.filter((l) => {
                const p = currentProgress[l.slug];
                const s = getLessonActivityStats(l, p);
                return s.isCompleted;
              }).length;

              const trackPercent = lessons.length > 0
                ? Math.round((completedInTrack / lessons.length) * 100)
                : 0;

              return (
                <div
                  key={track.id}
                  className="rounded-xl border border-border bg-card/40 overflow-hidden shadow-sm"
                >
                  {/* Track Header */}
                  <div className="p-5 border-b border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-background border border-border shadow-xs text-foreground shrink-0">
                        <TrackIcon className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base">{track.title}</h3>
                          {trackPercent === 100 && (
                            <Badge variant="success" className="text-[10px] py-0 px-2">
                              Mastered
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 max-w-xl">
                          {track.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-semibold">{trackPercent}% Mastered</p>
                        <p className="text-[11px] text-muted-foreground">
                          {completedInTrack} of {lessons.length} lessons • {trackTasksDone}/{trackTasksTotal} tasks
                        </p>
                      </div>
                      <div className="w-20">
                        <Progress value={trackPercent} className="h-1.5" />
                      </div>
                    </div>
                  </div>

                  {/* Lessons List in Track */}
                  <div className="divide-y divide-border/40">
                    {lessons.map((lesson, lessonIdx) => {
                      const lessonProg = currentProgress[lesson.slug];
                      const passedCheckpoints = lessonProg?.checkpointPassedIds || [];
                      const completedTasks = lessonProg?.completedTaskIds || [];

                      const tasksCount = lesson.tasks?.length || 0;
                      const tasksDone = lesson.tasks?.filter((t) => {
                        const linkedCheckpoint = TASK_TO_CHECKPOINT_MAP[t.id];
                        return (
                          completedTasks.includes(t.id) ||
                          (linkedCheckpoint && passedCheckpoints.includes(linkedCheckpoint))
                        );
                      }).length || 0;

                      const actStats = getLessonActivityStats(lesson, lessonProg);
                      const isComplete = actStats.isCompleted;
                      const isTasksDone = tasksDone === tasksCount && tasksCount > 0;

                      return (
                        <Link
                          key={lesson.slug}
                          href={`/learn/${lesson.slug}`}
                          className="p-4 px-5 flex items-center justify-between hover:bg-accent/40 transition-colors group"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            {isComplete ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            ) : tasksDone > 0 || actStats.completedActivities > 0 ? (
                              <div
                                className="h-4 w-4 rounded-full border-2 border-amber-500 flex items-center justify-center shrink-0"
                                title="In Progress"
                              >
                                <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                              </div>
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground font-mono">
                                  {trackIdx + 1}.{lessonIdx + 1}
                                </span>
                                <h4 className="text-sm font-semibold truncate group-hover:text-emerald-400 transition-colors">
                                  {lesson.title}
                                </h4>
                                {isComplete && (
                                  <Badge variant="success" className="text-[10px] py-0 px-1.5 h-4">
                                    Mastered
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {lesson.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 ml-4">
                            <div className="text-right">
                              <span
                                className={cn(
                                  "text-[11px] font-mono block",
                                  isTasksDone
                                    ? "text-emerald-600 dark:text-emerald-400 font-bold"
                                    : tasksDone > 0
                                    ? "text-amber-600 dark:text-amber-400 font-semibold"
                                    : "text-muted-foreground"
                                )}
                              >
                                {tasksDone}/{tasksCount} tasks
                              </span>
                              {actStats.totalActivities > tasksCount && (
                                <span className="text-[10px] text-muted-foreground font-mono block">
                                  {actStats.percent}% activities
                                </span>
                              )}
                            </div>

                            {isComplete ? (
                              <Badge variant="success" className="text-[10px] py-0 px-2 hidden sm:inline-flex">
                                Mastered
                              </Badge>
                            ) : actStats.percent > 0 ? (
                              <Badge
                                variant="outline"
                                className="text-[10px] py-0 px-1.5 font-mono text-amber-500 border-amber-500/30 bg-amber-500/10 hidden sm:inline-flex"
                              >
                                {actStats.percent}%
                              </Badge>
                            ) : null}

                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </AuthBarrier>
  </div>
);
}
