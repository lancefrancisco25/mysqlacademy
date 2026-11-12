"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  Code2,
  ChevronRight,
  Check,
  Copy,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLessonStore } from "@/lib/store";
import { validateTask } from "@/lib/agents/validator";
import { rollbackIfInTransaction, getTableNames } from "@/lib/sql-engine/engine";
import { CHECKPOINT_TO_TASK_MAP } from "@/lib/lessons/problem-linking";
import { cn } from "@/lib/utils";
import type { CheckpointExam as CheckpointExamType, CheckpointQuestion, Task, QueryResult } from "@/types";

interface CheckpointExamProps {
  exam: CheckpointExamType;
  nextLessonSlug?: string;
  nextLessonTitle?: string;
  onOpenLab?: () => void;
}

export function CheckpointExam({
  exam,
  nextLessonSlug,
  nextLessonTitle,
  onOpenLab,
}: CheckpointExamProps) {
  const executeQuery = useLessonStore((s) => s.executeQuery);
  const resetDB = useLessonStore((s) => s.resetDB);
  const currentLesson = useLessonStore((s) => s.currentLesson);
  const saveCheckpointProgress = useLessonStore((s) => s.saveCheckpointProgress);
  const lessonProg = useLessonStore((s) => (currentLesson ? s.progress[currentLesson.slug] : undefined));

  const [isResettingDB, setIsResettingDB] = useState(false);
  const [resetNotice, setResetNotice] = useState<string | null>(null);

  // Per-question state: code input, status (passed / failed / null), feedback message
  const [questionStates, setQuestionStates] = useState<
    Record<
      string,
      {
        code: string;
        passed: boolean;
        feedback?: string;
        showHint?: boolean;
        showSolution?: boolean;
      }
    >
  >(() => {
    let saved: any = null;
    let isExplicitlyReset = false;
    if (typeof window !== "undefined") {
      try {
        isExplicitlyReset = localStorage.getItem(`mysql-academy-checkpoint-reset-${exam.id}`) === "true";
        const raw = localStorage.getItem(`mysql-academy-checkpoint-${exam.id}`);
        if (raw) saved = JSON.parse(raw);
      } catch {}
    }
    const curLesson = useLessonStore.getState().currentLesson;
    const prog = curLesson ? useLessonStore.getState().progress[curLesson.slug] : undefined;

    const passedIds = saved?.passedQuestionIds || prog?.checkpointPassedIds || [];
    const completedTasks = prog?.completedTaskIds || [];
    const codes = saved?.codes || prog?.checkpointCodes || {};

    const initial: Record<string, any> = {};
    exam.questions.forEach((q) => {
      const isPassed =
        !isExplicitlyReset &&
        (passedIds.includes(q.id) ||
          (CHECKPOINT_TO_TASK_MAP[q.id] && completedTasks.includes(CHECKPOINT_TO_TASK_MAP[q.id])));
      const code = isPassed ? (codes[q.id] || q.solutionSQL || "") : (codes[q.id] || "");
      initial[q.id] = {
        code: code,
        passed: isPassed,
        feedback: isPassed ? "✓ Checkpoint Passed! Output meets required specification." : undefined,
        showHint: false,
        showSolution: false,
      };
    });
    return initial;
  });

  // Rehydrate persisted checkpoint state across page refreshes or cloud progress sync
  useEffect(() => {
    let saved: any = null;
    let isExplicitlyReset = false;
    if (typeof window !== "undefined") {
      try {
        isExplicitlyReset = localStorage.getItem(`mysql-academy-checkpoint-reset-${exam.id}`) === "true";
        const raw = localStorage.getItem(`mysql-academy-checkpoint-${exam.id}`);
        if (raw) saved = JSON.parse(raw);
      } catch {}
    }

    const passedIds = saved?.passedQuestionIds || lessonProg?.checkpointPassedIds || [];
    const completedTasks = lessonProg?.completedTaskIds || [];
    const codes = saved?.codes || lessonProg?.checkpointCodes || {};

    const initial: Record<string, any> = {};
    exam.questions.forEach((q) => {
      const isPassed =
        !isExplicitlyReset &&
        (passedIds.includes(q.id) ||
          (CHECKPOINT_TO_TASK_MAP[q.id] && completedTasks.includes(CHECKPOINT_TO_TASK_MAP[q.id])));
      const code = isPassed ? (codes[q.id] || q.solutionSQL || "") : (codes[q.id] || "");
      initial[q.id] = {
        code: code,
        passed: isPassed,
        feedback: isPassed ? "✓ Checkpoint Passed! Output meets required specification." : undefined,
        showHint: false,
        showSolution: false, // Never auto-open reference solution or hints unless user explicitly clicks
      };
    });
    setQuestionStates(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam.id, exam.questions]);

  const handleCodeChange = (id: string, val: string) => {
    setQuestionStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        code: val,
      },
    }));
  };

  const toggleHint = (id: string) => {
    setQuestionStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        showHint: !prev[id]?.showHint,
      },
    }));
  };

  const toggleSolution = (id: string) => {
    setQuestionStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        showSolution: !prev[id]?.showSolution,
      },
    }));
  };

  const handleTestQuestion = (q: CheckpointQuestion) => {
    const currentCode = questionStates[q.id]?.code || "";
    if (!currentCode.trim()) return;

    const tables = getTableNames();
    const targetTable = q.validation.table;
    const isTablePresent = targetTable
      ? tables.some((t) => t.toLowerCase() === targetTable.toLowerCase())
      : (q.validation.type === "query_result" && q.validation.query
          ? tables.some((t) => new RegExp(`\\b${t}\\b`, "i").test(q.validation.query!))
          : tables.some((t) => new RegExp(`\\b${t}\\b`, "i").test(currentCode)));

    let result: QueryResult | null = null;
    let execError: Error | null = null;

    try {
      rollbackIfInTransaction();
      result = executeQuery(currentCode, { skipTaskValidation: true });
    } catch (err: any) {
      execError = err;
    }

    // STRICT CHECK: When the table/schema IS present in the database,
    // any SQL runtime error must strictly fail the checkpoint!
    if (isTablePresent && execError) {
      setQuestionStates((prev) => ({
        ...prev,
        [q.id]: {
          ...prev[q.id],
          passed: false,
          feedback: `MySQL Execution Error: ${execError!.message || "Unknown error"}`,
        },
      }));
      return;
    }

    // Construct a Task-like structure for the validator
    const mockTask: Task = {
      id: q.id,
      title: q.title,
      description: q.prompt,
      validation: q.validation,
    };

    const valResult = validateTask(mockTask, currentCode, result);

    if (valResult.passed) {
      setQuestionStates((prev) => {
        const next = {
          ...prev,
          [q.id]: {
            ...prev[q.id],
            passed: true,
            feedback: "✓ Checkpoint Passed! Output meets required specification.",
            showHint: false,
            showSolution: false, // Do not open hint or solution automatically unless user specifically clicks it
          },
        };
        if (typeof window !== "undefined") {
          try {
            const passedIds = exam.questions.filter((item) => next[item.id]?.passed).map((item) => item.id);
            if (passedIds.length === exam.questions.length) {
              localStorage.removeItem(`mysql-academy-checkpoint-reset-${exam.id}`);
            }
            const codes: Record<string, string> = {};
            exam.questions.forEach((item) => {
              codes[item.id] = next[item.id]?.code || "";
            });
            if (currentLesson) {
              saveCheckpointProgress(
                exam.id,
                currentLesson.slug,
                passedIds,
                codes,
                passedIds.length === exam.questions.length
              );
            }
          } catch {}
        }
        return next;
      });
    } else {
      setQuestionStates((prev) => ({
        ...prev,
        [q.id]: {
          ...prev[q.id],
          passed: false,
          feedback: valResult.reason || (execError ? `Execution Notice: ${execError.message}` : "Requirement criteria not yet satisfied."),
        },
      }));
    }
  };

  const handleResetQuestion = (qId: string) => {
    rollbackIfInTransaction();
    setQuestionStates((prev) => {
      const next = {
        ...prev,
        [qId]: {
          code: "",
          passed: false,
          feedback: undefined,
          showHint: false,
          showSolution: false,
        },
      };
      if (typeof window !== "undefined") {
        try {
          const passedIds = exam.questions.filter((item) => next[item.id]?.passed).map((item) => item.id);
          const codes: Record<string, string> = {};
          exam.questions.forEach((item) => {
            codes[item.id] = next[item.id]?.code || "";
          });
          if (currentLesson) {
            saveCheckpointProgress(
              exam.id,
              currentLesson.slug,
              passedIds,
              codes,
              passedIds.length === exam.questions.length
            );
          }
        } catch {}
      }
      return next;
    });
  };

  const handleResetCheckpoint = async () => {
    setIsResettingDB(true);
    try {
      rollbackIfInTransaction();
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem(`mysql-academy-checkpoint-${exam.id}`);
          localStorage.setItem(`mysql-academy-checkpoint-reset-${exam.id}`, "true");
        } catch {}
      }

      if (currentLesson) {
        saveCheckpointProgress(exam.id, currentLesson.slug, [], {}, false);
      }

      const resetQuestions: Record<string, any> = {};
      exam.questions.forEach((q) => {
        resetQuestions[q.id] = {
          code: "",
          passed: false,
          feedback: undefined,
          showHint: false,
          showSolution: false,
        };
      });
      setQuestionStates(resetQuestions);

      if (currentLesson?.seedSQL) {
        await resetDB(currentLesson.seedSQL);
      }
      setResetNotice("✓ Checkpoint reset to unanswered. Database sandbox and editor restored.");
      setTimeout(() => setResetNotice(null), 3500);
    } catch (err: any) {
      console.warn("[Checkpoint] Reset DB error:", err);
    } finally {
      setIsResettingDB(false);
    }
  };

  const passedCount = exam.questions.filter((q) => questionStates[q.id]?.passed).length;
  const isAllPassed = passedCount === exam.questions.length && exam.questions.length > 0;

  return (
    <div className="rounded-2xl border-2 border-emerald-500/40 bg-card p-6 sm:p-8 space-y-6 shadow-md relative overflow-hidden">
      {/* Background Accent glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              Final Lesson Checkpoint
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Live Coding Test
            </span>
          </div>
          <h3 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Award className="h-6 w-6 text-emerald-500" />
            {exam.title}
          </h3>
          {exam.subtitle && (
            <p className="text-xs sm:text-sm text-muted-foreground">
              {exam.subtitle}
            </p>
          )}
        </div>

        {/* Score & Interactive Lab Controls */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center">
          {onOpenLab && (
            <Button
              type="button"
              onClick={() => onOpenLab()}
              className="font-mono text-xs font-bold gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm h-9 px-3.5"
              title="Open full interactive terminal and schema sandbox to practice this checkpoint"
            >
              <Terminal className="h-4 w-4" />
              <span>Try in Interactive Lab</span>
            </Button>
          )}

          <div className="flex items-center gap-2 bg-muted/60 px-3.5 py-2 rounded-xl border border-border/80 font-mono">
            <span className="text-xs text-muted-foreground">Score:</span>
            <span
              className={cn(
                "text-sm font-bold",
                isAllPassed
                  ? "text-emerald-500"
                  : passedCount > 0
                  ? "text-amber-500"
                  : "text-foreground"
              )}
            >
              {passedCount}/{exam.questions.length} Passed
            </span>
          </div>
        </div>
      </div>

      {/* Scenario Briefing */}
      <div className="rounded-xl border border-border/80 bg-muted/30 p-4 sm:p-5 space-y-2">
        <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          Scenario Context
        </div>
        <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-line font-sans">
          {exam.scenarioContext}
        </p>
      </div>

      {/* Top Callout: Try in Interactive Lab */}
      {onOpenLab && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-emerald-500/35 bg-emerald-500/10 text-xs shadow-2xs">
          <div className="space-y-1">
            <div className="font-bold text-foreground flex items-center gap-2 text-sm">
              <Terminal className="h-4 w-4 text-emerald-500" />
              <span>Practice in the Interactive Sandbox</span>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed font-sans">
              Test and debug these exact certification queries in the full MySQL CLI sandbox with live schema tables and instant execution feedback.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => onOpenLab()}
            className="shrink-0 font-mono text-xs font-bold gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs h-9 px-4"
          >
            <Terminal className="h-3.5 w-3.5" />
            Try in Interactive Lab
          </Button>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-6">
        {exam.questions.map((q, idx) => {
          const state = questionStates[q.id] || {
            code: "",
            passed: false,
            feedback: undefined,
            showHint: false,
          };

          return (
            <div
              key={q.id}
              className={cn(
                "rounded-xl border p-5 space-y-4 transition-all",
                state.passed
                  ? "border-emerald-500/50 bg-emerald-500/5"
                  : state.feedback && (state.feedback.includes("Partial") || state.feedback.includes("partially"))
                  ? "border-amber-500/40 bg-amber-500/5"
                  : state.feedback && !state.passed
                  ? "border-red-500/40 bg-red-500/5"
                  : "border-border bg-card"
              )}
            >
              {/* Question Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-foreground">
                    {q.title}
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  {state.passed ? (
                    <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white font-mono text-[11px] gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Passed
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground font-mono text-[11px]">
                      Pending
                    </Badge>
                  )}
                </div>
              </div>

              {/* Prompt */}
              <p className="text-xs sm:text-sm text-foreground/90 font-medium">
                {q.prompt}
              </p>

              {/* Hint and Solution toggles */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                {q.hint && (
                  <div>
                    <button
                      onClick={() => toggleHint(q.id)}
                      className="text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                    >
                      <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                      <span>{state.showHint ? "Hide Hint" : "Need a hint?"}</span>
                    </button>
                    {state.showHint && (
                      <div className="mt-2 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs text-amber-900 dark:text-amber-200">
                        💡 {q.hint}
                      </div>
                    )}
                  </div>
                )}

                {q.solutionSQL && (
                  <div>
                    <button
                      onClick={() => toggleSolution(q.id)}
                      className="text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-sky-500" />
                      <span>{state.showSolution ? "Hide Right Answer" : "Show Right Answer"}</span>
                    </button>
                    {state.showSolution && (
                      <div className="mt-2 p-3 rounded-lg border border-sky-500/30 bg-sky-500/10 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sky-900 dark:text-sky-200">Right Answer:</span>
                          <button
                            onClick={() => handleCodeChange(q.id, q.solutionSQL || "")}
                            className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline"
                          >
                            Insert into Editor
                          </button>
                        </div>
                        <pre className="p-2 rounded bg-zinc-950 font-mono text-emerald-400 text-[11px] overflow-x-auto">
                          <code>{q.solutionSQL}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Code Editor */}
              <div className="space-y-2">
                <div className="rounded-lg border border-zinc-800 bg-[#0c0d11] overflow-hidden focus-within:border-emerald-500 transition-colors">
                  <div className="flex items-center justify-between px-3 py-1.5 bg-[#14151a] border-b border-zinc-800 text-[11px] font-mono text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Code2 className="h-3 w-3 text-emerald-400" />
                      Your SQL Query
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResetQuestion(q.id)}
                        className="text-zinc-500 hover:text-zinc-300 transition-colors"
                        title="Reset question to unanswered"
                      >
                        Reset
                      </button>
                      <span className="text-zinc-700">|</span>
                      <button
                        onClick={() => handleCodeChange(q.id, "")}
                        className="text-zinc-500 hover:text-zinc-300 transition-colors"
                        title="Clear editor code"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={state.code}
                    onChange={(e) => handleCodeChange(q.id, e.target.value)}
                    placeholder="-- Write your SQL query to pass this checkpoint..."
                    rows={4}
                    className="w-full p-3 font-mono text-xs sm:text-sm text-zinc-100 bg-transparent resize-y outline-none leading-relaxed placeholder:text-zinc-600"
                  />
                </div>
              </div>

              {/* Test Button & Feedback */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                <div className="text-xs font-mono">
                  {state.passed ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      {state.feedback}
                    </span>
                  ) : state.feedback ? (
                    <span
                      className={cn(
                        "font-semibold flex items-center gap-1.5",
                        state.feedback.includes("Partial") || state.feedback.includes("partially")
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-red-600 dark:text-red-400"
                      )}
                    >
                      {state.feedback.includes("Partial") || state.feedback.includes("partially") ? (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      {state.feedback}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      Click below to verify against live database.
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  {onOpenLab && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenLab()}
                      className="font-mono text-xs gap-1.5 border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                      title="Open interactive terminal and database sandbox to practice this question"
                    >
                      <Terminal className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Try in Interactive Lab</span>
                    </Button>
                  )}

                  <Button
                    onClick={() => handleTestQuestion(q)}
                    disabled={!state.code.trim()}
                    size="sm"
                    className={cn(
                      "font-mono text-xs font-bold gap-1.5",
                      state.passed
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    <Play className="h-3 w-3 fill-current" />
                    {state.passed ? "Re-Test Solution" : "Test Solution"}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Final Celebration Banner when all passed */}
      {isAllPassed && (
        <div className="rounded-2xl border-2 border-emerald-500 bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-transparent p-6 sm:p-8 text-center space-y-5 animate-in zoom-in-95">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30 text-2xl">
            🏆
          </div>

          <div className="space-y-1">
            <h4 className="text-2xl font-extrabold tracking-tight text-foreground">
              Checkpoint Mastered!
            </h4>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              You&apos;ve proven your SQL fluency by passing all checkpoint tasks with 100% precision. Review the canonical answers above and reset your terminal before advancing!
            </p>
          </div>

          {resetNotice && (
            <div className="max-w-md mx-auto p-2.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-xs font-mono text-sky-900 dark:text-sky-200 flex items-center justify-center gap-2 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-sky-500 shrink-0" />
              <span>{resetNotice}</span>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              type="button"
              onClick={handleResetCheckpoint}
              disabled={isResettingDB}
              variant="outline"
              className="border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono text-xs gap-1.5"
              title="Reset checkpoint exam back to unanswered and restore initial database state"
            >
              <RotateCcw className={cn("h-3.5 w-3.5", isResettingDB && "animate-spin")} />
              Reset Checkpoint
            </Button>

            {nextLessonSlug && (
              <Link href={`/learn/${nextLessonSlug}`}>
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold gap-2 shadow-lg shadow-emerald-950/20">
                  Advance to Next Lesson: {nextLessonTitle}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
