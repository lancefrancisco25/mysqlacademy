"use client";

import React, { useState } from "react";
import {
  Building2,
  CheckCircle2,
  Circle,
  Play,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Check,
  Copy,
  Terminal,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLessonStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { ScenarioExercise as ScenarioExerciseType } from "@/types";
import { getTableNames, getTableInfo } from "@/lib/sql-engine/engine";

interface ScenarioExerciseProps {
  exercise: ScenarioExerciseType;
}

export function ScenarioExercise({ exercise }: ScenarioExerciseProps) {
  const executeQuery = useLessonStore((s) => s.executeQuery);
  const dbReady = useLessonStore((s) => s.dbReady);

  const [sqlCode, setSqlCode] = useState(exercise.starterSQL || "");
  const [executionOutput, setExecutionOutput] = useState<{
    success: boolean;
    message: string;
    columns?: string[];
    values?: (string | number | null)[][];
  } | null>(null);

  const [completedRequirements, setCompletedRequirements] = useState<string[]>([]);
  const [showSolution, setShowSolution] = useState(false);
  const [copiedSolution, setCopiedSolution] = useState(false);
  const [openHints, setOpenHints] = useState<Record<string, boolean>>({});

  const handleRunSQL = () => {
    if (!sqlCode.trim()) return;

    try {
      const result = executeQuery(sqlCode);
      const tables = getTableNames();

      // Check each requirement
      const satisfied: string[] = [];
      exercise.requirements.forEach((req) => {
        // If requirement has a specific validation rule, we check it
        if (req.validationRule) {
          const rule = req.validationRule;
          if (rule.type === "table_exists" && rule.table) {
            if (tables.some((t) => t.toLowerCase() === rule.table!.toLowerCase())) {
              satisfied.push(req.id);
            }
          } else if (rule.type === "column_exists" && rule.table && rule.column) {
            const info = getTableInfo(rule.table);
            if (
              info &&
              info.values &&
              info.values.some(
                (row) => String(row[1]).toLowerCase() === rule.column!.toLowerCase()
              )
            ) {
              satisfied.push(req.id);
            }
          } else {
            // Default heuristics or general execution success
            satisfied.push(req.id);
          }
        } else {
          // Heuristic matching against created tables or query keywords
          const lowerCode = sqlCode.toLowerCase();
          if (lowerCode.includes("create table") || lowerCode.includes("insert into") || lowerCode.includes("select")) {
            satisfied.push(req.id);
          }
        }
      });

      setCompletedRequirements(satisfied);
      setExecutionOutput({
        success: true,
        message: "Query executed successfully against live database instance.",
        columns: result?.columns,
        values: result?.values,
      });
    } catch (err: any) {
      setExecutionOutput({
        success: false,
        message: err.message || "SQL Execution error occurred.",
      });
    }
  };

  const handleCopySolution = () => {
    navigator.clipboard.writeText(exercise.solutionSQL);
    setCopiedSolution(true);
    setTimeout(() => setCopiedSolution(false), 1500);
  };

  const handleLoadSolution = () => {
    setSqlCode(exercise.solutionSQL);
  };

  const isAllComplete = completedRequirements.length === exercise.requirements.length;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              Scenario Blueprint
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Real-World Database Design
            </span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="h-5 w-5 text-emerald-500" />
            {exercise.title}
          </h3>
        </div>

        <Badge variant="outline" className="text-xs font-mono self-start sm:self-center border-border">
          {exercise.companyOrContext}
        </Badge>
      </div>

      {/* Scenario Narrative */}
      <div className="space-y-3">
        <div className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-line bg-muted/30 p-4 rounded-xl border border-border/60 font-sans">
          {exercise.problemStatement}
        </div>
      </div>

      {/* Architecture Requirements Checklist */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
          <span>Schema Architecture Requirements</span>
          <span>
            {completedRequirements.length}/{exercise.requirements.length} Completed
          </span>
        </h4>

        <div className="grid grid-cols-1 gap-2.5">
          {exercise.requirements.map((req) => {
            const isDone = completedRequirements.includes(req.id);
            return (
              <div
                key={req.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border text-xs sm:text-sm transition-all",
                  isDone
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200"
                    : "border-border/70 bg-background text-foreground"
                )}
              >
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className={cn(isDone && "font-semibold")}>{req.text}</div>
                  {req.hint && !isDone && (
                    <div className="pt-0.5">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenHints((prev) => ({
                            ...prev,
                            [req.id]: !prev[req.id],
                          }))
                        }
                        className="text-[11px] font-mono text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 transition-colors"
                      >
                        <Lightbulb className="h-3 w-3" />
                        <span>{openHints[req.id] ? "Hide hint" : "Need a hint?"}</span>
                      </button>
                      {openHints[req.id] && (
                        <div className="text-[11px] text-amber-800 dark:text-amber-200 font-mono mt-1 p-2 rounded bg-amber-500/10 border border-amber-500/20">
                          💡 {req.hint}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SQL Editor Area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Terminal className="h-3.5 w-3.5 text-emerald-500" />
            Live SQL DDL / DML Console
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSqlCode(exercise.starterSQL || "")}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Reset Code
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-[#0c0d11] overflow-hidden focus-within:border-emerald-500 transition-colors">
          <textarea
            value={sqlCode}
            onChange={(e) => setSqlCode(e.target.value)}
            placeholder="-- Write your CREATE TABLE or SQL solution here..."
            rows={6}
            className="w-full p-4 font-mono text-xs sm:text-sm text-zinc-100 bg-transparent resize-y outline-none leading-relaxed placeholder:text-zinc-600"
          />
        </div>
      </div>

      {/* Execution Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <Button
          onClick={handleRunSQL}
          disabled={!sqlCode.trim()}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold gap-2"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          Run &amp; Test Architecture
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSolution((prev) => !prev)}
          className="text-xs font-mono text-muted-foreground hover:text-foreground gap-1"
        >
          {showSolution ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" />
              Hide Solution Blueprint
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" />
              Reveal Teacher&apos;s Blueprint
            </>
          )}
        </Button>
      </div>

      {/* Output Console Feedback */}
      {executionOutput && (
        <div
          className={cn(
            "rounded-xl border p-4 space-y-2 text-xs sm:text-sm font-mono animate-in fade-in",
            executionOutput.success
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200"
              : "border-red-500/40 bg-red-500/10 text-red-950 dark:text-red-200"
          )}
        >
          <div className="flex items-center gap-2 font-bold">
            {executionOutput.success ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            )}
            <span>{executionOutput.message}</span>
          </div>

          {executionOutput.columns && executionOutput.columns.length > 0 && executionOutput.values && (
            <div className="mt-2 overflow-x-auto rounded border border-zinc-800 bg-[#0c0d11] p-2 text-zinc-300">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400">
                    {executionOutput.columns.map((c, i) => (
                      <th key={i} className="p-1 font-semibold">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {executionOutput.values.slice(0, 5).map((row, rIdx) => (
                    <tr key={rIdx} className="border-b border-zinc-900">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-1">{String(cell ?? "NULL")}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Teacher Solution Accordion */}
      {showSolution && (
        <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-5 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Teacher&apos;s Reference Blueprint
            </h5>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadSolution}
                className="h-7 text-[11px] font-mono gap-1"
              >
                Insert to Editor
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopySolution}
                className="h-7 text-[11px] font-mono gap-1"
              >
                {copiedSolution ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                {copiedSolution ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>

          <pre className="p-3 rounded-lg border border-zinc-800 bg-[#0c0d11] font-mono text-xs text-emerald-300 overflow-x-auto">
            <code>{exercise.solutionSQL}</code>
          </pre>

          <p className="text-xs text-muted-foreground leading-relaxed font-sans pt-1">
            💡 <strong className="text-foreground">Why this design works:</strong>{" "}
            {exercise.solutionExplanation}
          </p>
        </div>
      )}
    </div>
  );
}
