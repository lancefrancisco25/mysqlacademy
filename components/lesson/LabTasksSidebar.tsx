"use client";

import React, { useState } from "react";
import {
  BookOpen,
  RotateCcw,
  CheckCircle2,
  Circle,
  Lightbulb,
  Copy,
  Check,
  Award,
  Terminal,
  Code2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLessonStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Lesson, TrackInfo, Task, CheckpointQuestion } from "@/types";

interface LabTasksSidebarProps {
  lesson: Lesson;
  track?: TrackInfo;
  onBackToPrimer: () => void;
  onResetDB: () => void;
  isResetting: boolean;
}

export function LabTasksSidebar({
  lesson,
  track,
  onBackToPrimer,
  onResetDB,
  isResetting,
}: LabTasksSidebarProps) {
  const progress = useLessonStore((s) => s.progress);
  const toggleTask = useLessonStore((s) => s.toggleTask);
  const verifyPendingTasks = useLessonStore((s) => s.verifyPendingTasks);

  const lessonProgress = progress[lesson.slug];
  const completedTaskIds = lessonProgress?.completedTaskIds || [];
  const completedCount = lesson.tasks.filter((t) => completedTaskIds.includes(t.id)).length;
  const percent = Math.round((completedCount / Math.max(lesson.tasks.length, 1)) * 100);

  // Hidden hint states
  const [openHints, setOpenHints] = useState<Record<string, boolean>>({});
  const [copiedTaskId, setCopiedTaskId] = useState<string | null>(null);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [showSolutions, setShowSolutions] = useState(false);

  const toggleHint = (id: string) => {
    setOpenHints((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyHint = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTaskId(id);
    setTimeout(() => setCopiedTaskId(null), 1500);
  };

  return (
    <div className="h-full flex flex-col bg-card border-r border-border overflow-hidden">
      {/* Top Header: Navigation & Reset */}
      <div className="p-3.5 border-b border-border/80 bg-muted/20 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onBackToPrimer}
            className="text-xs text-muted-foreground hover:text-emerald-500 dark:hover:text-emerald-400 flex items-center gap-1.5 font-medium transition-colors bg-accent/60 hover:bg-accent px-2 py-1 rounded-md border border-border/60"
            title="Switch to full-screen concept primer"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Concept Primer</span>
          </button>
          <span className="text-zinc-600">/</span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold truncate">
            {track?.title || "Track"}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onResetDB}
          disabled={isResetting}
          className="h-7 px-2.5 text-xs gap-1.5 border-border hover:bg-destructive/10 hover:text-destructive"
          title="Roll back database to lesson seed state"
        >
          <RotateCcw className={`h-3 w-3 ${isResetting ? "animate-spin" : ""}`} />
          Reset DB
        </Button>
      </div>

      {/* Main Content Area: Focused on Tasks & Final Objective */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 terminal-scrollbar">
        {/* Lesson Focus Header */}
        <div className="space-y-1.5 border-b border-border/60 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Interactive Lab
            </span>
            <span className="text-xs font-mono text-muted-foreground">
              Execute in CLI to solve
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
            {lesson.title}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {lesson.description}
          </p>
        </div>

        {/* Section 1: Needed Tasks to Try */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-sky-500" />
              <h3 className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">
                Lab Tasks to Try
              </h3>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">
              {completedCount}/{lesson.tasks.length} Completed
            </span>
          </div>

          <Progress value={percent} className="h-1.5 bg-muted" />

          {/* Task Items */}
          <div className="space-y-2.5 pt-1">
            {lesson.tasks.map((task, idx) => {
              const isDone = completedTaskIds.includes(task.id);
              const isHintOpen = !!openHints[task.id];

              return (
                <div
                  key={task.id}
                  className={cn(
                    "rounded-xl border p-3.5 transition-all text-xs",
                    isDone
                      ? "border-emerald-500/40 bg-emerald-500/[0.06] dark:bg-emerald-500/10"
                      : "border-border bg-card hover:border-border/80"
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <button
                      onClick={() => toggleTask(lesson.slug, task.id)}
                      className="mt-0.5 shrink-0 transition-transform hover:scale-110 active:scale-95"
                      title={isDone ? "Mark pending" : "Mark completed"}
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-500/10" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground/60 hover:text-emerald-500 transition-colors" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "font-semibold tracking-tight",
                            isDone ? "line-through text-muted-foreground" : "text-foreground"
                          )}
                        >
                          {idx + 1}. {task.title}
                        </span>
                        {isDone && (
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-1.5 py-0.2 rounded shrink-0">
                            ✓ Done
                          </span>
                        )}
                      </div>

                      <p className="text-muted-foreground leading-relaxed text-[11px]">
                        {task.description}
                      </p>

                      {/* Hint Button: Hidden until clicked */}
                      {task.hint && !isDone && (
                        <div className="pt-1.5">
                          <button
                            type="button"
                            onClick={() => toggleHint(task.id)}
                            className="text-[11px] font-mono text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 transition-colors"
                          >
                            <Lightbulb className="h-3 w-3" />
                            <span>{isHintOpen ? "Hide hint" : "Need a hint?"}</span>
                          </button>

                          {isHintOpen && (
                            <div className="mt-1.5 p-2 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 font-mono text-[11px] flex items-center justify-between gap-2">
                              <span className="break-all">{task.hint}</span>
                              <button
                                onClick={() => handleCopyHint(task.hint!, task.id)}
                                className="shrink-0 p-1 hover:bg-amber-500/20 rounded transition-colors"
                                title="Copy hint SQL"
                              >
                                {copiedTaskId === task.id ? (
                                  <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                  <Copy className="h-3 w-3 text-amber-700 dark:text-amber-300" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Final Objective (Expected Result) */}
        <div className={cn(
          "rounded-xl border-2 p-4 space-y-3 shadow-xs transition-all",
          completedCount === lesson.tasks.length && lesson.tasks.length > 0
            ? "border-emerald-500/50 bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent"
            : "border-border bg-gradient-to-br from-muted/30 to-transparent"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Award className="h-4 w-4" />
              <span>Final Objective</span>
            </div>
            {completedCount === lesson.tasks.length && lesson.tasks.length > 0 ? (
              <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 text-[10px] font-mono">
                ✓ Objective Achieved
              </Badge>
            ) : completedCount > 0 ? (
              <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40 text-[10px] font-mono">
                Partially Complete ({completedCount}/{lesson.tasks.length})
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground border-border">
                Pending (0/{lesson.tasks.length})
              </Badge>
            )}
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-bold text-foreground">
              {lesson.finalObjective?.title || (lesson.checkpointExam ? lesson.checkpointExam.title : `${lesson.title} Expected Outcome`)}
            </h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {lesson.finalObjective?.description ||
                (lesson.checkpointExam
                  ? lesson.checkpointExam.scenarioContext
                  : "Consolidate and verify the target dataset and query results against business requirements.")}
            </p>
          </div>

          {/* Expected Outcome Specifications */}
          <div className="p-3 rounded-lg bg-card/90 border border-border/80 text-xs font-mono space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Target Result</span>
              <span className={completedCount === lesson.tasks.length ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
                {completedCount} / {lesson.tasks.length} Requirements
              </span>
            </div>

            {lesson.finalObjective?.expectedOutput ? (
              <pre className="p-2 rounded bg-muted/50 border border-border/50 text-[11px] text-foreground overflow-x-auto whitespace-pre-wrap">
                {lesson.finalObjective.expectedOutput}
              </pre>
            ) : (
              <div className="space-y-1.5 text-[11px]">
                {lesson.tasks.map((t, idx) => (
                  <div key={t.id} className="flex items-center gap-2 text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="truncate">
                      Target {idx + 1}: {t.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Objective Auto-check Status & Right Answer / Reset Terminal */}
          {completedCount === lesson.tasks.length && lesson.tasks.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200 text-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-semibold text-emerald-700 dark:text-emerald-300">
                    All Tasks Completed!
                  </div>
                  <div className="text-[11px] text-emerald-800 dark:text-emerald-300/90 font-sans leading-relaxed">
                    All {lesson.tasks.length} lab tasks have been executed and validated. The final objective is achieved.
                  </div>
                </div>
              </div>

              {/* Right Answers: Collapsed until clicked */}
              <div className="p-3 rounded-lg bg-card/95 border border-emerald-500/30 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3" />
                    <span>Right Answers</span>
                  </div>
                  <button
                    onClick={() => setShowSolutions(!showSolutions)}
                    className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>{showSolutions ? "Hide Right Answers" : "Show Right Answers"}</span>
                    {showSolutions ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                </div>
                {showSolutions && (
                  <div className="space-y-2 font-mono pt-1 animate-in fade-in">
                    {lesson.tasks.map((t, idx) => (
                      <div key={t.id} className="space-y-1 bg-muted/40 p-2 rounded border border-border/60">
                        <div className="text-[11px] font-semibold text-foreground flex items-center justify-between">
                          <span>Task {idx + 1}: {t.title}</span>
                          <span className="text-[10px] text-emerald-500 font-bold">✓ Mastered</span>
                        </div>
                        {t.hint && (
                          <pre className="p-1.5 rounded bg-[#0c0d11] text-emerald-400 text-[11px] overflow-x-auto border border-zinc-800">
                            <code>{t.hint}</code>
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Prompt to Reset Terminal */}
              <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-2">
                <div className="text-[11px] text-muted-foreground font-sans leading-relaxed">
                  💡 <strong className="text-foreground">Done with this lab?</strong> Reset the database sandbox to restore clean initial tables before practicing new queries:
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onResetDB}
                  disabled={isResetting}
                  className="w-full h-8 text-xs font-mono font-bold gap-2 border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shadow-xs"
                >
                  <RotateCcw className={cn("h-3.5 w-3.5", isResetting && "animate-spin")} />
                  Reset Database
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/40 border border-border/80 text-muted-foreground text-xs">
              <Circle className="h-4 w-4 text-muted-foreground/60 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-medium text-foreground">Verification Requirement</div>
                <div className="text-[11px] text-muted-foreground font-sans leading-relaxed">
                  Complete all {lesson.tasks.length} guided tasks in &ldquo;Lab Tasks to Try&rdquo; above. This final objective will automatically check off once all tasks are satisfied ({completedCount}/{lesson.tasks.length} completed).
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Quick Syntax Reference Sheet (Collapsed Accordion) */}
        <div className="rounded-xl border border-border bg-card p-3 space-y-2">
          <button
            type="button"
            onClick={() => setShowCheatSheet(!showCheatSheet)}
            className="w-full flex items-center justify-between text-xs font-mono font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Code2 className="h-3.5 w-3.5 text-sky-500" />
              <span>SQL Syntax Quick Reference</span>
            </span>
            {showCheatSheet ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>

          {showCheatSheet && (
            <div className="pt-2 border-t border-border/60 space-y-2 text-xs font-mono">
              {lesson.content
                .filter((s) => s.code)
                .map((s, idx) => (
                  <div key={idx} className="space-y-1">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold">{s.heading}</span>
                    <pre className="p-2 rounded bg-[#0c0d11] text-zinc-200 text-[11px] overflow-x-auto border border-zinc-800">
                      <code>{s.code}</code>
                    </pre>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
