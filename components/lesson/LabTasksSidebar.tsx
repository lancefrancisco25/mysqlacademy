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
  ChevronRight,
  ShieldCheck,
  Sparkles,
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

        {/* Section 2: Final Objective Task (Checkpoint Mission) */}
        {lesson.checkpointExam && (
          <div className="rounded-xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <Award className="h-4 w-4" />
                <span>Final Objective Task</span>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
                Checkpoint Mission
              </Badge>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-foreground">
                {lesson.checkpointExam.title}
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {lesson.checkpointExam.scenarioContext}
              </p>
            </div>

            {/* Checkpoint questions summary */}
            <div className="space-y-2 pt-1 border-t border-emerald-500/20">
              {lesson.checkpointExam.questions.map((q, qIdx) => {
                const hintId = `cp-${q.id}`;
                const isHintOpen = !!openHints[hintId];

                return (
                  <div key={q.id} className="p-2.5 rounded-lg bg-card/80 border border-border/80 text-xs space-y-1">
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] flex items-center justify-center font-bold">
                        {qIdx + 1}
                      </span>
                      <span>{q.title}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground pl-5.5">
                      {q.prompt}
                    </p>

                    {/* Checkpoint Hint: Hidden until clicked */}
                    {q.hint && (
                      <div className="pl-5.5 pt-1">
                        <button
                          type="button"
                          onClick={() => toggleHint(hintId)}
                          className="text-[10px] font-mono text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                        >
                          <Lightbulb className="h-2.5 w-2.5" />
                          <span>{isHintOpen ? "Hide objective hint" : "Need a hint?"}</span>
                        </button>
                        {isHintOpen && (
                          <div className="mt-1 p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 font-mono text-[10px] flex items-center justify-between gap-2">
                            <span>{q.hint}</span>
                            <button
                              onClick={() => handleCopyHint(q.hint!, hintId)}
                              className="shrink-0 p-1 hover:bg-amber-500/20 rounded"
                            >
                              {copiedTaskId === hintId ? (
                                <Check className="h-2.5 w-2.5 text-emerald-500" />
                              ) : (
                                <Copy className="h-2.5 w-2.5 text-amber-600" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
