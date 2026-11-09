"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  Database,
  Terminal as TerminalIcon,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sparkles,
  Rows3,
  Layers,
  Code2,
  PanelLeft,
  PanelLeftClose,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SplitPane } from "@/components/lesson/SplitPane";
import { TaskList } from "@/components/lesson/TaskList";
import { LessonContent } from "@/components/lesson/LessonContent";
import { ConceptPrimer } from "@/components/lesson/ConceptPrimer";
import { LabTasksSidebar } from "@/components/lesson/LabTasksSidebar";
import { CurriculumSidebar } from "@/components/lesson/CurriculumSidebar";
import { SchemaViewer } from "@/components/lesson/SchemaViewer";
import { HintPanel } from "@/components/lesson/HintPanel";
import { AuthBarrier } from "@/components/auth/AuthBarrier";
import { ModuleUpdatesModal } from "@/components/lesson/ModuleUpdatesModal";
import SQLTerminal from "@/components/terminal/SQLTerminal";
import {
  getLessonBySlug,
  getNextLesson,
  getPrevLesson,
  getTrackForLesson,
} from "@/lib/lessons";
import { useLessonStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function LessonWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const lesson = getLessonBySlug(slug);
  const nextLesson = getNextLesson(slug);
  const prevLesson = getPrevLesson(slug);
  const track = getTrackForLesson(slug);

  const initDB = useLessonStore((s) => s.initDB);
  const resetDB = useLessonStore((s) => s.resetDB);
  const setCurrentLesson = useLessonStore((s) => s.setCurrentLesson);
  const dbReady = useLessonStore((s) => s.dbReady);
  const isLessonCompleted = useLessonStore((s) => s.isLessonCompleted);
  const markLessonComplete = useLessonStore((s) => s.markLessonComplete);
  const resetLessonProgress = useLessonStore((s) => s.resetLessonProgress);
  const progress = useLessonStore((s) => s.progress);

  const isCompleted = lesson ? isLessonCompleted(lesson.slug) : false;

  const handleToggleComplete = () => {
    if (!lesson) return;
    if (isCompleted) {
      resetLessonProgress(lesson.slug);
    } else {
      markLessonComplete(lesson.slug);
    }
  };

  // Synchronously ensure active lesson is set on store
  if (lesson && useLessonStore.getState().currentLesson?.slug !== lesson.slug) {
    useLessonStore.setState({ currentLesson: lesson });
  }

  // Dual-mode state: "concept" (full screen reading) vs "lab" (CLI split workspace)
  const [viewMode, setViewMode] = useState<"concept" | "lab">("concept");
  const [activeTab, setActiveTab] = useState<"terminal" | "schema">("terminal");
  const [isResetting, setIsResetting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showUpdates, setShowUpdates] = useState(false);

  // Require user to see website updates once before continuing
  useEffect(() => {
    if (typeof window !== "undefined") {
      const seen = localStorage.getItem("mysql-academy-seen-platform-updates");
      if (seen !== "true") {
        setShowUpdates(true);
      }
    }
  }, []);

  const handleDismissUpdates = () => {
    setShowUpdates(false);
  };

  // Auto-expand sidebar on larger desktop monitors
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1280) {
      setIsSidebarOpen(true);
    }
  }, []);

  // Reset to concept mode when slug changes (so each lesson starts with the concept primer)
  useEffect(() => {
    setViewMode("concept");
  }, [slug]);

  // Initialize or update lesson and database seed
  useEffect(() => {
    if (!lesson) return;

    setCurrentLesson(lesson);

    let isMounted = true;
    (async () => {
      try {
        await initDB(lesson.seedSQL);
      } catch (e) {
        console.error("Failed to initialize database:", e);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [slug, lesson, initDB, setCurrentLesson]);

  const handleReset = async () => {
    if (!lesson) return;
    setIsResetting(true);
    try {
      await resetDB(lesson.seedSQL);
    } finally {
      setTimeout(() => setIsResetting(false), 300);
    }
  };

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h1 className="text-2xl font-bold">Lesson Not Found</h1>
        <p className="text-sm text-muted-foreground">
          The requested tutorial slug &quot;{slug}&quot; does not exist.
        </p>
        <Link href="/learn">
          <Button>Return to Curriculum</Button>
        </Link>
      </div>
    );
  }

  // Left Tasks Panel (for Interactive Lab Mode)
  const leftPanel = (
    <div className="h-full flex flex-col bg-card border-r border-border overflow-hidden">
      <div className="flex-1 overflow-hidden">
        <LabTasksSidebar
          lesson={lesson}
          track={track}
          onBackToPrimer={() => setViewMode("concept")}
          onResetDB={handleReset}
          isResetting={isResetting}
        />
      </div>

      {/* Navigation Footer */}
      <div className="p-3 border-t border-border bg-muted/10 flex items-center justify-between shrink-0">
        {prevLesson ? (
          <Link href={`/learn/${prevLesson.slug}`}>
            <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </Button>
          </Link>
        ) : (
          <div />
        )}

        {nextLesson && (
          <Link href={`/learn/${nextLesson.slug}`}>
            <Button size="sm" className="gap-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white">
              Next Lesson
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );

  // Right Workspace (Terminal + Live Schema Inspector)
  const rightPanel = (
    <div className="h-full flex flex-col bg-background text-foreground overflow-hidden">
      {/* Workspace Tabs Header */}
      <div className="h-11 px-3 border-b border-border bg-card/80 dark:bg-[#121316] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("terminal")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors",
              activeTab === "terminal"
                ? "bg-accent dark:bg-[#1c1d22] text-foreground dark:text-white shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            <TerminalIcon className="h-3.5 w-3.5 text-sky-500 dark:text-sky-400" />
            MySQL CLI (Interactive)
          </button>

          <button
            onClick={() => setActiveTab("schema")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors",
              activeTab === "schema"
                ? "bg-accent dark:bg-[#1c1d22] text-foreground dark:text-white shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            <Rows3 className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
            Live Schema &amp; Data
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span
            className={`w-2 h-2 rounded-full ${
              dbReady ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
            }`}
          />
          <span className={dbReady ? "text-muted-foreground" : "text-amber-500"}>
            {dbReady ? "WASM Engine Online" : "Engine Initializing..."}
          </span>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        {activeTab === "terminal" ? (
          <div className="flex-1 overflow-hidden flex flex-col">
            <SQLTerminal />
            <HintPanel />
          </div>
        ) : (
          <div className="flex-1 overflow-hidden bg-background text-foreground flex flex-col">
            <SchemaViewer />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <Header />

      <AuthBarrier
        title="Student Sign-In Required"
        description={`Please sign in to access "${lesson.title}", run queries in the interactive database sandbox, and save your progress.`}
      >
        {/* Platform Updates Interstitial Modal */}
        <ModuleUpdatesModal
          isOpen={showUpdates}
          onContinue={handleDismissUpdates}
          onClose={() => setShowUpdates(false)}
        />

        {/* ── Subheader with Mode Switcher Bar ────────────────────────── */}
      <div className="h-11 border-b border-border bg-card/60 backdrop-blur px-3 sm:px-4 flex items-center justify-between gap-4 shrink-0">
        {/* Left: Sidebar Toggle & Lesson Breadcrumb */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          {/* Collapsible Curriculum Sidebar Trigger */}
          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-mono transition-colors border shrink-0",
              isSidebarOpen
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            title={isSidebarOpen ? "Collapse curriculum sidebar" : "Expand curriculum sidebar"}
            aria-label="Toggle Curriculum Sidebar"
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="h-3.5 w-3.5" />
            ) : (
              <PanelLeft className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">Curriculum</span>
          </button>

          <span className="text-zinc-600 hidden sm:inline shrink-0">/</span>

          <Link
            href="/learn"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium shrink-0"
            title="Back to All Tracks"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="hidden md:inline">All Lessons</span>
          </Link>

          <span className="text-zinc-600 hidden md:inline shrink-0">/</span>
          <span className="text-xs font-semibold text-emerald-400 truncate max-w-[160px] sm:max-w-[240px] md:max-w-md">
            {lesson.title}
          </span>
        </div>

        {/* Right: Mode Switcher & Lab Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mode Switcher Pill */}
          <div className="flex items-center gap-1 bg-muted/60 p-0.5 sm:p-1 rounded-lg border border-border text-xs font-medium">
            <button
              onClick={() => setViewMode("concept")}
              className={cn(
                "flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-md transition-all text-xs",
                viewMode === "concept"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
              <span>Concept Primer</span>
            </button>
            <button
              onClick={() => setViewMode("lab")}
              className={cn(
                "flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-md transition-all text-xs",
                viewMode === "lab"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <TerminalIcon className="h-3.5 w-3.5 text-sky-400" />
              <span>Interactive Lab</span>
            </button>
          </div>

          {/* Mark as Done / Completed Toggle Button */}
          <Button
            variant={isCompleted ? "default" : "outline"}
            size="sm"
            onClick={handleToggleComplete}
            className={cn(
              "h-7 px-2.5 text-xs gap-1.5 font-medium shrink-0 transition-all",
              isCompleted
                ? "bg-emerald-600 hover:bg-emerald-500 text-white border-transparent shadow-xs"
                : "border-border text-muted-foreground hover:text-foreground hover:border-emerald-500/50"
            )}
            title={
              isCompleted
                ? "Lesson marked as done. Click to reset this lesson's progress."
                : "Click to mark this lesson as completed (fills all exercises & terminal)"
            }
          >
            <CheckCircle2 className={cn("h-3.5 w-3.5", isCompleted ? "text-white" : "text-emerald-500")} />
            <span>{isCompleted ? "Completed" : "Mark as Done"}</span>
          </Button>

          {/* Platform Updates Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUpdates(true)}
            className="h-7 px-2 text-xs gap-1 border-border text-muted-foreground hover:text-foreground shrink-0"
            title="Review website release notes and updates"
          >
            <Sparkles className="h-3 w-3 text-emerald-400" />
            <span className="hidden sm:inline">Updates</span>
          </Button>

          {/* Reset DB Button in Lab Mode */}
          {viewMode === "lab" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={isResetting}
              className="h-7 px-2 text-xs gap-1 border-border hover:bg-destructive/10 hover:text-destructive shrink-0"
              title="Roll back database to lesson seed state"
            >
              <RotateCcw className={`h-3 w-3 ${isResetting ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Reset DB</span>
            </Button>
          )}
        </div>
      </div>

      {/* ── Main Workspace Body with Collapsible Curriculum Sidebar ─── */}
      <div className="flex-1 overflow-hidden flex relative min-h-0">
        <CurriculumSidebar
          currentSlug={slug}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* ── Main View: Full-Screen Concept Primer OR Split-Pane Lab ─── */}
        <div className="flex-1 overflow-hidden flex flex-col min-w-0">
          {viewMode === "concept" ? (
            <div className="h-full overflow-y-auto terminal-scrollbar">
              <ConceptPrimer
                lesson={lesson}
                track={track}
                onStartLab={() => setViewMode("lab")}
                prevLesson={prevLesson}
                nextLesson={nextLesson}
              />
            </div>
          ) : (
            <SplitPane
              left={leftPanel}
              right={rightPanel}
              defaultLeftWidth={42}
              minLeftWidth={28}
              maxLeftWidth={65}
            />
          )}
        </div>
      </div>
    </AuthBarrier>
  </div>
);
}
