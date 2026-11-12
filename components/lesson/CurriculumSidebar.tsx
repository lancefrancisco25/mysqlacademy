"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Blocks,
  PenLine,
  BarChart3,
  GitMerge,
  Wrench,
  Zap,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  BookOpen,
  Trophy,
  X,
  Sparkles,
  Layers,
  Award,
  Terminal,
  Code2,
  Building2,
} from "lucide-react";
import { TRACKS, LESSONS, getLessonsForTrack, getTrackForLesson } from "@/lib/lessons";
import { getLessonActivityStats } from "@/lib/lessons/activities";
import { useLessonStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const ICON_MAP: Record<string, any> = {
  Blocks,
  PenLine,
  BarChart3,
  GitMerge,
  Wrench,
  Zap,
};

const SUBCAT_ICON_MAP: Record<string, any> = {
  BookOpen,
  Sparkles,
  Code2,
  Building2,
  Layers,
  Zap,
  Award,
  Terminal,
};

interface CurriculumSidebarProps {
  currentSlug: string;
  isOpen: boolean;
  onClose: () => void;
  onNavigateSection?: (sectionHash: string) => void;
}

export function CurriculumSidebar({
  currentSlug,
  isOpen,
  onClose,
  onNavigateSection,
}: CurriculumSidebarProps) {
  const progress = useLessonStore((s) => s.progress);
  const isLessonCompleted = useLessonStore((s) => s.isLessonCompleted);
  const currentTrack = getTrackForLesson(currentSlug);
  const router = useRouter();

  // Keep track of which tracks are expanded (auto-expand current track by default)
  const [expandedTracks, setExpandedTracks] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    TRACKS.forEach((t) => {
      // Default expand all or expand current track
      initial[t.id] = t.id === currentTrack?.id;
    });
    return initial;
  });

  // Keep track of which lessons have subcategories expanded (default auto-expand currentSlug)
  const [expandedLessons, setExpandedLessons] = useState<Record<string, boolean>>({
    [currentSlug]: true,
  });

  // Auto-expand track and lesson when currentSlug changes
  useEffect(() => {
    if (currentTrack) {
      setExpandedTracks((prev) => ({
        ...prev,
        [currentTrack.id]: true,
      }));
    }
    if (currentSlug) {
      setExpandedLessons((prev) => ({
        ...prev,
        [currentSlug]: true,
      }));
    }
  }, [currentSlug, currentTrack]);

  const toggleTrack = (trackId: string) => {
    setExpandedTracks((prev) => ({
      ...prev,
      [trackId]: !prev[trackId],
    }));
  };

  const toggleLessonExpanded = (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedLessons((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  // Calculate overall stats
  const completedLessonsCount = LESSONS.filter((l) => isLessonCompleted(l.slug)).length;

  const totalLessons = LESSONS.length;
  const overallPercent = Math.round((completedLessonsCount / Math.max(totalLessons, 1)) * 100);

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside
        className={cn(
          "h-full z-40 bg-card border-r border-border flex flex-col shrink-0 select-none transition-all duration-300 ease-in-out",
          // Mobile: fixed drawer overlay
          "fixed md:static inset-y-0 left-0 w-80 max-w-[85vw] shadow-2xl md:shadow-none"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-border/80 bg-muted/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                Course Curriculum
              </h3>
              <p className="text-[11px] text-muted-foreground font-mono">
                {completedLessonsCount} of {totalLessons} Mastered ({overallPercent}%)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-accent/60 transition-colors"
            title="Collapse Sidebar"
          >
            <PanelLeftClose className="h-4 w-4 hidden md:block" />
            <X className="h-4 w-4 md:hidden" />
          </button>
        </div>

        {/* Overall Progress Bar */}
        <div className="px-4 py-2 bg-muted/40 border-b border-border/40">
          <Progress value={overallPercent} className="h-1" />
        </div>

        {/* Scrollable Tracks & Lessons Tree */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 terminal-scrollbar">
          {TRACKS.map((track, trackIdx) => {
            const TrackIcon = ICON_MAP[track.iconName] || Blocks;
            const lessons = getLessonsForTrack(track.id);
            const isExpanded = !!expandedTracks[track.id];

            // Track completion count
            const completedInTrack = lessons.filter((l) => isLessonCompleted(l.slug)).length;

            const isTrackCompleted = completedInTrack === lessons.length && lessons.length > 0;
            const isCurrentTrack = track.id === currentTrack?.id;

            return (
              <div
                key={track.id}
                className={cn(
                  "rounded-lg border transition-colors overflow-hidden",
                  isCurrentTrack
                    ? "border-emerald-500/30 bg-emerald-500/[0.02]"
                    : "border-border/60 bg-card/30"
                )}
              >
                {/* Track Group Header */}
                <button
                  onClick={() => toggleTrack(track.id)}
                  className="w-full p-2.5 flex items-center justify-between text-left hover:bg-accent/40 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <TrackIcon
                      className={cn(
                        "h-3.5 w-3.5 shrink-0",
                        isCurrentTrack ? "text-emerald-400" : "text-muted-foreground"
                      )}
                    />
                    <span className="text-xs font-semibold truncate text-foreground">
                      {track.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {isTrackCompleted ? (
                      <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/15 px-1.5 py-0.5 rounded">
                        ✓ Done
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {completedInTrack}/{lessons.length}
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Lessons in Track */}
                {isExpanded && (
                  <div className="border-t border-border/40 divide-y divide-border/30 bg-muted/20 dark:bg-zinc-950/40">
                    {lessons.map((l, lIdx) => {
                      const isActive = l.slug === currentSlug;
                      const lessonProg = progress[l.slug];
                      const activityStats = getLessonActivityStats(l, lessonProg);
                      const isComplete = activityStats.isCompleted;
                      const isSubcatExpanded = Boolean(expandedLessons[l.slug]);

                      return (
                        <div key={l.slug} className="flex flex-col">
                          {/* Module Header Row */}
                          <div
                            className={cn(
                              "flex items-center justify-between px-3 py-2 text-xs transition-all group",
                              isActive
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold border-l-2 border-emerald-500 pl-2.5"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
                            )}
                          >
                            <Link
                              href={`/learn/${l.slug}`}
                              onClick={() => {
                                if (window.innerWidth < 768) {
                                  onClose();
                                }
                              }}
                              className="flex items-center gap-2 min-w-0 flex-1 py-0.5"
                            >
                              {isComplete ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                              ) : (
                                <Circle
                                  className={cn(
                                    "h-3.5 w-3.5 shrink-0",
                                    isActive ? "text-emerald-500" : "text-muted-foreground/60"
                                  )}
                                />
                              )}
                              <span className="text-[11px] font-mono opacity-60">
                                {trackIdx + 1}.{lIdx + 1}
                              </span>
                              <span className="truncate">{l.title}</span>
                            </Link>

                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                              {isComplete ? (
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-medium bg-emerald-500/10 px-1 rounded">
                                  100%
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono text-muted-foreground">
                                  {activityStats.completedActivities}/{activityStats.totalActivities}
                                </span>
                              )}

                              {/* Subcategories Expand / Collapse Button */}
                              <button
                                type="button"
                                onClick={(e) => toggleLessonExpanded(l.slug, e)}
                                className="p-1 rounded hover:bg-accent/60 text-muted-foreground hover:text-foreground transition-colors"
                                title={isSubcatExpanded ? "Collapse subcategories" : "Expand subcategories"}
                                aria-label="Toggle module subcategories"
                              >
                                {isSubcatExpanded ? (
                                  <ChevronDown className="h-3 w-3" />
                                ) : (
                                  <ChevronRight className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Subcategories Navigation List */}
                          {isSubcatExpanded && (
                            <div className="pl-6 pr-2 py-1.5 space-y-0.5 bg-background/60 dark:bg-zinc-950/60 border-t border-border/20">
                              {activityStats.subcategories.map((subcat) => {
                                const SubcatIcon = SUBCAT_ICON_MAP[subcat.iconName] || BookOpen;

                                return (
                                  <button
                                    key={subcat.id}
                                    type="button"
                                    onClick={() => {
                                      if (isActive && onNavigateSection) {
                                        onNavigateSection(subcat.hash);
                                      } else {
                                        router.push(`/learn/${l.slug}#${subcat.hash}`);
                                      }
                                      if (window.innerWidth < 768) {
                                        onClose();
                                      }
                                    }}
                                    className={cn(
                                      "w-full flex items-center justify-between px-2 py-1 rounded text-[11px] font-medium transition-colors text-left group",
                                      subcat.done
                                        ? "text-foreground hover:bg-emerald-500/10"
                                        : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                                    )}
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <SubcatIcon
                                        className={cn(
                                          "h-3 w-3 shrink-0",
                                          subcat.done
                                            ? "text-emerald-500"
                                            : "text-muted-foreground/70 group-hover:text-foreground"
                                        )}
                                      />
                                      <span className="truncate">{subcat.label}</span>
                                    </div>

                                    <div className="shrink-0 ml-1.5">
                                      {subcat.done ? (
                                        <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-1 rounded">
                                          ✓ Done
                                        </span>
                                      ) : (
                                        <span className="text-[9px] font-mono text-muted-foreground">
                                          {subcat.completed}/{subcat.total}
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer: Quick Link to Main Curriculum Dashboard */}
        <div className="p-3 border-t border-border/80 bg-muted/10 shrink-0">
          <Link
            href="/learn"
            className="flex items-center justify-center gap-2 w-full py-1.5 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-accent/40 font-mono transition-colors"
          >
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            <span>Full Syllabus &amp; Mastery Map</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
