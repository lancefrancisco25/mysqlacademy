"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  XCircle,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLessonStore } from "@/lib/store";
import { validateTask } from "@/lib/agents/validator";
import { cn } from "@/lib/utils";
import type { CheckpointExam as CheckpointExamType, CheckpointQuestion, Task } from "@/types";

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

  // Per-question state: code input, status (passed / failed / null), feedback message
  const [questionStates, setQuestionStates] = useState<
    Record<
      string,
      {
        code: string;
        passed: boolean;
        feedback?: string;
        showHint?: boolean;
      }
    >
  >(() => {
    const initial: Record<string, any> = {};
    exam.questions.forEach((q) => {
      initial[q.id] = {
        code: q.starterSQL || "",
        passed: false,
        feedback: undefined,
        showHint: false,
      };
    });
    return initial;
  });

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

  const handleTestQuestion = (q: CheckpointQuestion) => {
    const currentCode = questionStates[q.id]?.code || "";
    if (!currentCode.trim()) return;

    try {
      const result = executeQuery(currentCode);

      // Construct a Task-like structure for the validator
      const mockTask: Task = {
        id: q.id,
        title: q.title,
        description: q.prompt,
        validation: q.validation,
      };

      const valResult = validateTask(mockTask, currentCode, result);

      if (valResult.passed) {
        setQuestionStates((prev) => ({
          ...prev,
          [q.id]: {
            ...prev[q.id],
            passed: true,
            feedback: "✓ Checkpoint Passed! Output meets required specification.",
          },
        }));
      } else {
        setQuestionStates((prev) => ({
          ...prev,
          [q.id]: {
            ...prev[q.id],
            passed: false,
            feedback: valResult.reason || "Requirement criteria not yet satisfied.",
          },
        }));
      }
    } catch (err: any) {
      setQuestionStates((prev) => ({
        ...prev,
        [q.id]: {
          ...prev[q.id],
          passed: false,
          feedback: `MySQL Execution Error: ${err.message || "Unknown error"}`,
        },
      }));
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

        {/* Score indicator */}
        <div className="flex items-center gap-2 bg-muted/60 px-3.5 py-2 rounded-xl border border-border/80 self-start sm:self-center font-mono">
          <span className="text-xs text-muted-foreground">Checkpoint Score:</span>
          <span
            className={cn(
              "text-sm font-bold",
              isAllPassed ? "text-emerald-500" : "text-foreground"
            )}
          >
            {passedCount}/{exam.questions.length} Mastered
          </span>
        </div>
      </div>

      {/* Mission Narrative Briefing */}
      <div className="rounded-xl border border-border/80 bg-muted/30 p-4 sm:p-5 space-y-2">
        <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          Mission Context Briefing
        </div>
        <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-line font-sans">
          {exam.scenarioContext}
        </p>
      </div>

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
                      Pending Verification
                    </Badge>
                  )}
                </div>
              </div>

              {/* Prompt */}
              <p className="text-xs sm:text-sm text-foreground/90 font-medium">
                {q.prompt}
              </p>

              {/* Hint */}
              {q.hint && (
                <div>
                  <button
                    onClick={() => toggleHint(q.id)}
                    className="text-xs text-muted-foreground hover:text-foreground font-mono flex items-center gap-1 transition-colors"
                  >
                    <Lightbulb className="h-3 w-3 text-amber-500" />
                    {state.showHint ? "Hide Exam Hint" : "Need a hint?"}
                  </button>
                  {state.showHint && (
                    <div className="mt-2 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs text-amber-900 dark:text-amber-200">
                      💡 {q.hint}
                    </div>
                  )}
                </div>
              )}

              {/* Code Editor */}
              <div className="space-y-2">
                <div className="rounded-lg border border-zinc-800 bg-[#0c0d11] overflow-hidden focus-within:border-emerald-500 transition-colors">
                  <div className="flex items-center justify-between px-3 py-1.5 bg-[#14151a] border-b border-zinc-800 text-[11px] font-mono text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Code2 className="h-3 w-3 text-emerald-400" />
                      Candidate Solution SQL
                    </span>
                    <button
                      onClick={() => handleCodeChange(q.id, "")}
                      className="text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      Clear
                    </button>
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
                    <span className="text-red-600 dark:text-red-400 font-semibold flex items-center gap-1.5">
                      <XCircle className="h-4 w-4" />
                      {state.feedback}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      Click below to verify against live database.
                    </span>
                  )}
                </div>

                <Button
                  onClick={() => handleTestQuestion(q)}
                  disabled={!state.code.trim()}
                  size="sm"
                  className={cn(
                    "w-full sm:w-auto font-mono text-xs font-bold gap-1.5",
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
          );
        })}
      </div>

      {/* Final Celebration Banner when all passed */}
      {isAllPassed && (
        <div className="rounded-2xl border-2 border-emerald-500 bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-transparent p-6 sm:p-8 text-center space-y-4 animate-in zoom-in-95">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30 text-2xl">
            🏆
          </div>

          <div className="space-y-1">
            <h4 className="text-2xl font-extrabold tracking-tight text-foreground">
              Checkpoint Mastered!
            </h4>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              You&apos;ve proven your SQL fluency by passing all checkpoint tasks with 100% precision. You are ready for the next level!
            </p>
          </div>

          {nextLessonSlug && (
            <div className="pt-2">
              <Link href={`/learn/${nextLessonSlug}`}>
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold gap-2 shadow-lg shadow-emerald-950/20">
                  Advance to Next Lesson: {nextLessonTitle}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
