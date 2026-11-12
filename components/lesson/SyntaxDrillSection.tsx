"use client";

import React, { useState, useEffect } from "react";
import {
  Code2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Lightbulb,
  Check,
  Copy,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLessonStore } from "@/lib/store";
import { rollbackIfInTransaction } from "@/lib/sql-engine/engine";
import { cn } from "@/lib/utils";
import type { SyntaxDrillItem, QueryResult } from "@/types";

interface SyntaxDrillSectionProps {
  lessonSlug: string;
  drills: SyntaxDrillItem[];
}

interface ItemState {
  code: string;
  passed: boolean;
  status: "idle" | "correct" | "partial" | "incorrect";
  message?: string;
  showHint?: boolean;
  showSolution?: boolean;
  copiedSolution?: boolean;
}

function compareValuesLoose(
  actual: (string | number | null)[][] | undefined,
  expected: (string | number | null)[][] | undefined
): boolean {
  if (!Array.isArray(actual) || !Array.isArray(expected)) return false;
  if (actual.length !== expected.length) return false;
  for (let i = 0; i < expected.length; i++) {
    const actRow = actual[i];
    const expRow = expected[i];
    if (!actRow || actRow.length !== expRow.length) return false;
    for (let j = 0; j < expRow.length; j++) {
      const a = actRow[j];
      const e = expRow[j];
      if (a === e) continue;
      const numA = Number(a);
      const numE = Number(e);
      if (!isNaN(numA) && !isNaN(numE) && a !== null && e !== null && a !== "" && e !== "") {
        if (Math.abs(numA - numE) < 0.01) continue;
        return false;
      }
      if (String(a ?? "").trim().toLowerCase() !== String(e ?? "").trim().toLowerCase()) {
        return false;
      }
    }
  }
  return true;
}

export function SyntaxDrillSection({ lessonSlug, drills }: SyntaxDrillSectionProps) {
  const executeQuery = useLessonStore((s) => s.executeQuery);
  const resetDB = useLessonStore((s) => s.resetDB);
  const currentLesson = useLessonStore((s) => s.currentLesson);
  const isLessonCompleted = useLessonStore((s) => s.isLessonCompleted);
  const saveDrillProgress = useLessonStore((s) => s.saveDrillProgress);
  const lessonProg = useLessonStore((s) => s.progress[lessonSlug]);
  const isLessonDone = currentLesson ? isLessonCompleted(currentLesson.slug) : false;

  const storageKey = `mysql-academy-drills-${lessonSlug}`;
  const resetKey = `mysql-academy-drills-reset-${lessonSlug}`;

  const [itemStates, setItemStates] = useState<Record<string, ItemState>>(() => {
    let saved: any = null;
    let isExplicitlyReset = false;
    if (typeof window !== "undefined") {
      try {
        isExplicitlyReset = localStorage.getItem(resetKey) === "true";
        const raw = localStorage.getItem(storageKey);
        if (raw) saved = JSON.parse(raw);
      } catch {}
    }

    const passedIds = saved?.passedIds || lessonProg?.completedDrillIds || [];
    const codes = saved?.codes || lessonProg?.drillCodes || {};

    const initial: Record<string, ItemState> = {};
    drills.forEach((drill) => {
      const isPassed = !isExplicitlyReset && (isLessonDone || passedIds.includes(drill.id));
      initial[drill.id] = {
        code: isPassed ? (codes[drill.id] || drill.solutionSQL) : (codes[drill.id] || drill.starterSQL || ""),
        passed: isPassed,
        status: isPassed ? "correct" : "idle",
        message: isPassed ? "✓ Syntax verified! Solution passed." : undefined,
        showHint: false,
        showSolution: false,
        copiedSolution: false,
      };
    });
    return initial;
  });

  // Rehydrate on page load or lesson change or cloud progress sync
  useEffect(() => {
    let saved: any = null;
    let isExplicitlyReset = false;
    if (typeof window !== "undefined") {
      try {
        isExplicitlyReset = localStorage.getItem(resetKey) === "true";
        const raw = localStorage.getItem(storageKey);
        if (raw) saved = JSON.parse(raw);
      } catch {}
    }

    const passedIds = saved?.passedIds || lessonProg?.completedDrillIds || [];
    const codes = saved?.codes || lessonProg?.drillCodes || {};

    const next: Record<string, ItemState> = {};
    drills.forEach((drill) => {
      const isPassed = !isExplicitlyReset && (isLessonDone || passedIds.includes(drill.id));
      next[drill.id] = {
        code: isPassed ? (codes[drill.id] || drill.solutionSQL) : (codes[drill.id] || drill.starterSQL || ""),
        passed: isPassed,
        status: isPassed ? "correct" : "idle",
        message: isPassed ? "✓ Syntax verified! Solution passed." : undefined,
        showHint: false,
        showSolution: false,
        copiedSolution: false,
      };
    });
    setItemStates(next);
  }, [lessonSlug, drills, isLessonDone, resetKey, storageKey, lessonProg]);

  const handleCodeChange = (id: string, val: string) => {
    setItemStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        code: val,
      },
    }));
  };

  const handleToggleHint = (id: string) => {
    setItemStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        showHint: !prev[id]?.showHint,
      },
    }));
  };

  const handleToggleSolution = (id: string) => {
    setItemStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        showSolution: !prev[id]?.showSolution,
      },
    }));
  };

  const handleCopySolution = (id: string, sol: string) => {
    navigator.clipboard.writeText(sol);
    setItemStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], copiedSolution: true },
    }));
    setTimeout(() => {
      setItemStates((prev) => ({
        ...prev,
        [id]: { ...prev[id], copiedSolution: false },
      }));
    }, 1500);
  };

  const handleInsertSolution = (id: string, sol: string) => {
    setItemStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], code: sol },
    }));
  };

  const handleResetItem = (id: string, starter = "") => {
    rollbackIfInTransaction();
    setItemStates((prev) => {
      const next = {
        ...prev,
        [id]: {
          code: starter,
          passed: false,
          status: "idle" as const,
          message: undefined,
          showHint: false,
          showSolution: false,
          copiedSolution: false,
        },
      };

      const passedIds = drills.filter((d) => next[d.id]?.passed).map((d) => d.id);
      const codes: Record<string, string> = {};
      drills.forEach((d) => {
        codes[d.id] = next[d.id]?.code || "";
      });
      saveDrillProgress(lessonSlug, passedIds, codes);

      return next;
    });
  };

  const handleResetAll = async () => {
    rollbackIfInTransaction();
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(storageKey);
        localStorage.setItem(resetKey, "true");
      } catch {}
    }

    const resetStates: Record<string, ItemState> = {};
    drills.forEach((drill) => {
      resetStates[drill.id] = {
        code: drill.starterSQL || "",
        passed: false,
        status: "idle",
        message: undefined,
        showHint: false,
        showSolution: false,
        copiedSolution: false,
      };
    });
    setItemStates(resetStates);
    saveDrillProgress(lessonSlug, [], {});

    if (currentLesson?.seedSQL) {
      try {
        await resetDB(currentLesson.seedSQL);
      } catch {}
    }
  };

  const handleCheckSyntax = (drill: SyntaxDrillItem) => {
    const rawInput = itemStates[drill.id]?.code || "";
    if (!rawInput.trim()) return;

    try {
      rollbackIfInTransaction();

      // Execute setup SQL if drill requires pre-requisite views or cleanup
      if (drill.setupSQL) {
        try {
          executeQuery(drill.setupSQL);
        } catch (setupErr) {
          console.warn("Syntax drill setupSQL execution warning:", setupErr);
        }
      }

      // Execute user input query in sandbox
      let userRes: QueryResult | null = null;
      let runtimeError: Error | null = null;
      try {
        userRes = executeQuery(rawInput);
      } catch (err: any) {
        runtimeError = err;
      }

      const inputLower = rawInput.toLowerCase().trim();

      // Syntax Pattern check (with whitespace normalization tolerance)
      let matchesPattern = true;
      if (drill.syntaxPattern) {
        if (typeof drill.syntaxPattern === "string") {
          matchesPattern = inputLower.includes(drill.syntaxPattern.toLowerCase());
        } else {
          const cleanFlags = drill.syntaxPattern.flags.replace(/g/g, "");
          const regex = new RegExp(drill.syntaxPattern.source, cleanFlags);
          const normalized = rawInput.replace(/\s+/g, " ").trim();
          matchesPattern = regex.test(rawInput) || regex.test(normalized);
        }
      }

      // Expected Result check if provided
      let matchesResult = true;
      if (drill.validationQuery) {
        try {
          const valRes = executeQuery(drill.validationQuery);
          if (drill.expectedResult && valRes) {
            matchesResult = compareValuesLoose(valRes.values, drill.expectedResult);
          } else {
            matchesResult = Boolean(valRes && valRes.values.length > 0);
          }
        } catch {
          matchesResult = false;
        }
      } else if (drill.expectedResult && userRes) {
        matchesResult = compareValuesLoose(userRes.values, drill.expectedResult);
      }

      const passed = !runtimeError && matchesPattern && matchesResult;
      const partial = !passed && (!runtimeError || matchesPattern);

      setItemStates((prev) => {
        const next = {
          ...prev,
          [drill.id]: {
            ...prev[drill.id],
            passed,
            status: passed ? ("correct" as const) : partial ? ("partial" as const) : ("incorrect" as const),
            message: passed
              ? "✓ Correct! Syntax requirement satisfied."
              : partial
              ? `Partially correct: ${runtimeError?.message || "Check your target columns, predicate logic, or operators."}`
              : `Syntax Error: ${runtimeError?.message || "Query failed syntax check."}`,
            showSolution: false, // Do not auto-open solution
          },
        };

        const passedIds = drills.filter((d) => next[d.id]?.passed).map((d) => d.id);
        if (passedIds.length === drills.length && typeof window !== "undefined") {
          try {
            localStorage.removeItem(resetKey);
          } catch {}
        }
        const codes: Record<string, string> = {};
        drills.forEach((d) => {
          codes[d.id] = next[d.id]?.code || "";
        });
        saveDrillProgress(lessonSlug, passedIds, codes);

        return next;
      });
    } catch (err: any) {
      setItemStates((prev) => ({
        ...prev,
        [drill.id]: {
          ...prev[drill.id],
          passed: false,
          status: "incorrect",
          message: `Execution error: ${err.message}`,
        },
      }));
    }
  };

  const passedCount = drills.filter((d) => itemStates[d.id]?.passed).length;
  const totalCount = drills.length;
  const progressPercent = Math.round((passedCount / Math.max(totalCount, 1)) * 100);
  const isAllPassed = passedCount === totalCount && totalCount > 0;

  return (
    <div className="rounded-2xl border-2 border-emerald-500/35 bg-card p-6 sm:p-8 space-y-6 shadow-sm relative overflow-hidden">
      {/* Background accent glow */}
      <div className="absolute top-0 left-1/3 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" />
              Syntax Speed Drills
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Pure Syntax &amp; Operator Verification
            </span>
          </div>

          <h3 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Code2 className="h-6 w-6 text-emerald-500" />
            Situational Syntax Practice
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl font-sans">
            Solve these rapid situational coding challenges to verify pure SQL syntax, relational operators, and command structure before attempting the final lesson exam.
          </p>
        </div>

        {/* Score & Reset Controls */}
        <div className="flex flex-col sm:items-end gap-2 shrink-0">
          <div className="flex items-center gap-2 bg-muted/60 px-3.5 py-1.5 rounded-xl border border-border/80 font-mono text-xs">
            <span className="text-muted-foreground">Drill Score:</span>
            <span className={cn("font-bold text-sm", isAllPassed ? "text-emerald-500" : passedCount > 0 ? "text-amber-500" : "text-foreground")}>
              {passedCount}/{totalCount} Passed
            </span>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetAll}
            className="text-xs font-mono text-muted-foreground hover:text-foreground gap-1.5 h-7"
            title="Reset all drills to unanswered"
          >
            <RotateCcw className="h-3 w-3" />
            Reset All Drills
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
          <span>Drill Mastery Progress</span>
          <span className="font-bold text-foreground">{progressPercent}%</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Drills List */}
      <div className="space-y-4">
        {drills.map((drill, idx) => {
          const state = itemStates[drill.id] || {
            code: "",
            passed: false,
            status: "idle",
            showHint: false,
            showSolution: false,
          };

          return (
            <div
              key={drill.id}
              className={cn(
                "rounded-xl border p-4 sm:p-5 space-y-3.5 transition-all",
                state.passed
                  ? "border-emerald-500/40 bg-emerald-500/[0.04]"
                  : state.status === "partial"
                  ? "border-amber-500/40 bg-amber-500/[0.03]"
                  : state.status === "incorrect"
                  ? "border-red-500/40 bg-red-500/[0.03]"
                  : "border-border bg-card"
              )}
            >
              {/* Top row: Number, Tag, Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-foreground">
                    {drill.title}
                  </h4>
                  {drill.categoryTag && (
                    <Badge variant="outline" className="text-[10px] font-mono border-border/80">
                      {drill.categoryTag}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  {state.passed ? (
                    <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white font-mono text-[11px] gap-1 shadow-xs">
                      <CheckCircle2 className="h-3 w-3" />
                      Passed
                    </Badge>
                  ) : state.status === "partial" ? (
                    <Badge variant="outline" className="border-amber-500/50 text-amber-600 dark:text-amber-400 font-mono text-[11px] gap-1">
                      <AlertTriangle className="h-3 w-3 text-amber-500" />
                      Partial
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground font-mono text-[11px]">
                      Pending
                    </Badge>
                  )}
                </div>
              </div>

              {/* Scenario Context & Instruction */}
              <div className="space-y-1 text-xs sm:text-sm font-sans">
                <p className="text-foreground/90 font-medium leading-relaxed">
                  {drill.scenario}
                </p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  👉 <span className="font-semibold text-foreground">Instruction:</span> {drill.instruction}
                </p>
              </div>

              {/* Interactive SQL Editor Line */}
              <div className="space-y-1.5">
                <div className="rounded-lg border border-zinc-800 bg-[#0c0d11] overflow-hidden focus-within:border-emerald-500 transition-colors">
                  <div className="flex items-center justify-between px-3 py-1 bg-[#14151a] border-b border-zinc-800 text-[11px] font-mono text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Code2 className="h-3 w-3 text-emerald-400" />
                      SQL Syntax
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResetItem(drill.id, drill.starterSQL || "")}
                        className="text-zinc-500 hover:text-zinc-300 transition-colors font-mono"
                        title="Reset this drill item to unanswered"
                      >
                        Reset
                      </button>
                      <span className="text-zinc-700">|</span>
                      <button
                        onClick={() => handleCodeChange(drill.id, "")}
                        className="text-zinc-500 hover:text-zinc-300 transition-colors font-mono"
                        title="Clear input"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={state.code}
                    onChange={(e) => handleCodeChange(drill.id, e.target.value)}
                    placeholder="-- Write the single-line SQL syntax here..."
                    rows={2}
                    className="w-full p-2.5 font-mono text-xs sm:text-sm text-zinc-100 bg-transparent resize-y outline-none leading-relaxed placeholder:text-zinc-600"
                  />
                </div>
              </div>

              {/* Action row: Check button, hint toggle, right answer toggle, feedback message */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
                <div className="text-xs font-mono flex-1">
                  {state.status === "correct" ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      {state.message}
                    </span>
                  ) : state.status === "partial" ? (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      {state.message}
                    </span>
                  ) : state.status === "incorrect" ? (
                    <span className="text-red-600 dark:text-red-400 font-semibold flex items-center gap-1.5">
                      <XCircle className="h-4 w-4 shrink-0" />
                      {state.message}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-[11px]">
                      Enter query above and click &quot;Check Syntax&quot; to test against database.
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => handleCheckSyntax(drill)}
                    disabled={!state.code.trim()}
                    className={cn(
                      "font-mono text-xs font-bold gap-1.5 h-8 px-3.5",
                      state.passed
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    <Play className="h-3 w-3 fill-current" />
                    {state.passed ? "Re-Check" : "Check Syntax"}
                  </Button>
                </div>
              </div>

              {/* Collapsed Hint and Solution Drawers */}
              <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-border/50 text-xs font-mono">
                {drill.hint && (
                  <div>
                    <button
                      onClick={() => handleToggleHint(drill.id)}
                      className="text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors text-[11px]"
                    >
                      <Lightbulb className="h-3 w-3 text-amber-500" />
                      <span>{state.showHint ? "Hide hint" : "Need a hint?"}</span>
                    </button>
                    {state.showHint && (
                      <div className="mt-2 p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs text-amber-900 dark:text-amber-200">
                        💡 {drill.hint}
                      </div>
                    )}
                  </div>
                )}

                {drill.solutionSQL && (
                  <div>
                    <button
                      onClick={() => handleToggleSolution(drill.id)}
                      className="text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors text-[11px]"
                    >
                      <Sparkles className="h-3 w-3 text-sky-500" />
                      <span>{state.showSolution ? "Hide Right Answer" : "Show Right Answer"}</span>
                    </button>
                    {state.showSolution && (
                      <div className="mt-2 p-3 rounded-lg border border-sky-500/30 bg-sky-500/10 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sky-900 dark:text-sky-200">Right Answer:</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleInsertSolution(drill.id, drill.solutionSQL)}
                              className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline"
                            >
                              Insert into Editor
                            </button>
                            <span className="text-zinc-600">|</span>
                            <button
                              onClick={() => handleCopySolution(drill.id, drill.solutionSQL)}
                              className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-0.5"
                            >
                              {state.copiedSolution ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                              {state.copiedSolution ? "Copied" : "Copy"}
                            </button>
                          </div>
                        </div>
                        <pre className="p-2 rounded bg-zinc-950 font-mono text-emerald-400 text-[11px] overflow-x-auto">
                          <code>{drill.solutionSQL}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Banner */}
      {isAllPassed && (
        <div className="rounded-xl border-2 border-emerald-500 bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-transparent p-5 text-center space-y-3 animate-in zoom-in-95 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/30 text-lg font-bold">
            🏆
          </div>
          <div>
            <h4 className="text-lg font-bold tracking-tight text-foreground">
              All Situational Syntax Drills Certified!
            </h4>
            <p className="text-xs text-muted-foreground max-w-md mx-auto font-sans">
              You&apos;ve proven precision across all {totalCount} situational syntax problems. You are fully primed to conquer the Final Lesson Checkpoint Exam below!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
