"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TRACKS, LESSONS, getLessonsForTrack } from "@/lib/lessons";
import { useLessonStore } from "@/lib/store";

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
  const progress = useLessonStore((s) => s.progress);
  const getOverallStats = useLessonStore((s) => s.getOverallStats);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("mysql-academy-progress");
        if (saved) {
          useLessonStore.setState({ progress: JSON.parse(saved) });
        }
      } catch {}
    }
  }, []);

  const stats = mounted
    ? getOverallStats()
    : { completedLessons: 0, totalTasksDone: 0, masteryScore: 0 };

  const totalLessons = LESSONS.length;
  const overallPercentage = Math.round(
    (stats.completedLessons / Math.max(totalLessons, 1)) * 100
  );

  const currentProgress = mounted ? progress : {};

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

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
            <Link href="/learn/create-database">
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2">
                Resume Learning
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

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
                <p className="text-xs text-muted-foreground font-medium">Lab Tasks Completed</p>
                <p className="text-2xl font-bold tracking-tight">{stats.totalTasksDone}</p>
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

              // Calculate track completion
              const completedInTrack = lessons.filter((l) => {
                const p = currentProgress[l.slug];
                return p && p.completedTaskIds && p.completedTaskIds.length >= l.tasks.length;
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
                        <p className="text-xs font-semibold">{trackPercent}% Complete</p>
                        <p className="text-[11px] text-muted-foreground">
                          {completedInTrack} of {lessons.length} lessons
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
                      const tasksDone = lessonProg?.completedTaskIds?.length || 0;
                      const isComplete = tasksDone >= lesson.tasks.length && lesson.tasks.length > 0;

                      return (
                        <Link
                          key={lesson.slug}
                          href={`/learn/${lesson.slug}`}
                          className="p-4 px-5 flex items-center justify-between hover:bg-accent/40 transition-colors group"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            {isComplete ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground font-mono">
                                  {trackIdx + 1}.{lessonIdx + 1}
                                </span>
                                <h4 className="text-sm font-semibold truncate group-hover:text-emerald-400 transition-colors">
                                  {lesson.title}
                                </h4>
                              </div>
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {lesson.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 ml-4">
                            <span className="text-[11px] font-mono text-muted-foreground">
                              {tasksDone}/{lesson.tasks.length} tasks
                            </span>
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
    </div>
  );
}
