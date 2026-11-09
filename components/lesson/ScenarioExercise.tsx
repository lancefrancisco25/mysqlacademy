"use client";

import React, { useState, useEffect } from "react";
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
  Trophy,
  Table,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLessonStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { ScenarioExercise as ScenarioExerciseType, QueryResult } from "@/types";
import { getTableNames, getTableInfo, rollbackIfInTransaction } from "@/lib/sql-engine/engine";

interface ScenarioExerciseProps {
  exercise: ScenarioExerciseType;
}

export function ScenarioExercise({ exercise }: ScenarioExerciseProps) {
  const executeQuery = useLessonStore((s) => s.executeQuery);
  const resetDB = useLessonStore((s) => s.resetDB);
  const currentLesson = useLessonStore((s) => s.currentLesson);
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
  const [isResettingTerminal, setIsResettingTerminal] = useState(false);
  const [resetNotice, setResetNotice] = useState<string | null>(null);
  const [tablePreview, setTablePreview] = useState<{
    tableName?: string;
    description?: string;
    columns: string[];
    rows: (string | number | null)[][];
  } | null>(exercise.previewTable || null);

  // Ensure tables are up when exercise loads or db becomes ready
  // and rehydrate persisted completion even across page refreshes
  useEffect(() => {
    let savedState: { completed?: boolean; completedRequirements?: string[]; code?: string } | null = null;
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(`mysql-academy-scenario-${exercise.id}`);
        if (raw) savedState = JSON.parse(raw);
      } catch {}
    }

    if (savedState?.completed) {
      setCompletedRequirements(savedState.completedRequirements || exercise.requirements.map((r) => r.id));
      if (savedState.code) setSqlCode(savedState.code);
      setShowSolution(true);
    } else {
      setSqlCode(exercise.starterSQL || "");
      setCompletedRequirements([]);
      setShowSolution(false);
    }

    setExecutionOutput(null);
    setOpenHints({});
    setResetNotice(null);

    if (exercise.previewTable) {
      setTablePreview(exercise.previewTable);
    } else {
      setTablePreview(null);
    }

    if (dbReady && exercise.schemaSetupSQL && exercise.schemaSetupSQL.trim()) {
      try {
        rollbackIfInTransaction();
        executeQuery(exercise.schemaSetupSQL);

        // If no explicit previewTable, inspect live table from schema setup
        if (!exercise.previewTable) {
          const match = exercise.schemaSetupSQL.match(/create\s+table\s+(?:if\s+not\s+exists\s+)?([a-zA-Z0-9_]+)/i);
          if (match && match[1]) {
            const tbl = match[1];
            const res = executeQuery(`SELECT * FROM ${tbl} LIMIT 5`);
            if (res && res.columns.length > 0) {
              setTablePreview({
                tableName: tbl,
                description: `Live instance dataset preview (${res.values.length} sample row${res.values.length === 1 ? "" : "s"})`,
                columns: res.columns,
                rows: res.values,
              });
            }
          }
        }
      } catch (err) {
        console.warn("[Scenario] Initial schema setup notice:", err);
      }
    }
  }, [exercise.id, exercise.starterSQL, exercise.previewTable, exercise.requirements, dbReady, executeQuery, exercise.schemaSetupSQL]);

  const handleRunSQL = () => {
    if (!sqlCode.trim()) return;

    try {
      // 1. Clean rollback of any previous uncommitted transactions
      rollbackIfInTransaction();

      // 2. Ensure required scenario tables exist before student query runs
      if (exercise.schemaSetupSQL && exercise.schemaSetupSQL.trim()) {
        try {
          executeQuery(exercise.schemaSetupSQL);
        } catch (setupErr) {
          console.warn("[Scenario] Setup SQL execution warning:", setupErr);
        }
      }

      // 3. Execute student's SQL command
      let result: QueryResult | null = null;
      let runtimeError: Error | null = null;

      try {
        result = executeQuery(sqlCode);
      } catch (err: any) {
        runtimeError = err;
      }

      const tables = getTableNames();
      const lowerCode = sqlCode.toLowerCase().trim();

      // 4. Evaluate each requirement via validationRule, syntaxPattern, or smart heuristics
      const satisfied: string[] = [];

      exercise.requirements.forEach((req) => {
        let passed = false;

        // A. If a validation rule is provided:
        if (req.validationRule) {
          const rule = req.validationRule;
          if (rule.type === "table_exists" && rule.table) {
            passed = tables.some((t) => t.toLowerCase() === rule.table!.toLowerCase());
          } else if (rule.type === "column_exists" && rule.table && rule.column) {
            const info = getTableInfo(rule.table);
            passed = Boolean(
              info &&
                info.values &&
                info.values.some(
                  (row) => String(row[1]).toLowerCase() === rule.column!.toLowerCase()
                )
            );
          } else if (rule.type === "query_result" && rule.query) {
            try {
              const res = executeQuery(rule.query);
              if (rule.expectedResult && res) {
                passed = JSON.stringify(res.values) === JSON.stringify(rule.expectedResult);
              } else if (rule.minReturnedRows !== undefined && res) {
                passed = res.values.length >= rule.minReturnedRows;
              } else {
                passed = Boolean(res && res.values.length > 0);
              }
            } catch {
              passed = false;
            }
          }
        }

        // B. If a syntax pattern / keyword is specified:
        if (!passed && req.syntaxPattern) {
          if (typeof req.syntaxPattern === "string") {
            passed = lowerCode.includes(req.syntaxPattern.toLowerCase());
          } else {
            // Remove 'g' flag to avoid stateful lastIndex issues
            const cleanFlags = req.syntaxPattern.flags.replace(/g/g, "");
            const safeRegex = new RegExp(req.syntaxPattern.source, cleanFlags);
            passed = safeRegex.test(sqlCode);
          }
        }

        // C. Smart heuristic analysis based on requirement text & syntax
        if (!passed) {
          const reqLower = req.text.toLowerCase();

          // Check for email literals
          const emails = reqLower.match(/[\w.-]+@[\w.-]+\.\w+/g);
          if (emails && emails.some((e) => lowerCode.includes(e.toLowerCase()))) {
            passed = true;
          } else if (reqLower.includes("start transaction") && lowerCode.includes("start transaction")) {
            passed = true;
          } else if (reqLower.includes("commit") && lowerCode.includes("commit")) {
            passed = true;
          } else if (reqLower.includes("create index") && lowerCode.includes("create index")) {
            passed = true;
          } else if (reqLower.includes("group by") && lowerCode.includes("group by")) {
            passed = true;
          } else if (reqLower.includes("having") && lowerCode.includes("having")) {
            passed = true;
          } else if (reqLower.includes("left join") && lowerCode.includes("left join")) {
            passed = true;
          } else if (reqLower.includes("inner join") && (lowerCode.includes("join") || lowerCode.includes("inner join"))) {
            passed = true;
          } else if (reqLower.includes("alter table") && lowerCode.includes("alter table")) {
            passed = true;
          } else if (reqLower.includes("default") && lowerCode.includes("default")) {
            passed = true;
          } else if (reqLower.includes("not null") && lowerCode.includes("not null")) {
            passed = true;
          } else if (reqLower.includes("primary key") && lowerCode.includes("primary key")) {
            passed = true;
          } else if (reqLower.includes("check") && lowerCode.includes("check")) {
            passed = true;
          } else if (reqLower.includes("unique") && lowerCode.includes("unique")) {
            passed = true;
          } else if (reqLower.includes("count") && lowerCode.includes("count")) {
            passed = true;
          } else if (reqLower.includes("sum") && lowerCode.includes("sum")) {
            passed = true;
          } else if (reqLower.includes("avg") && lowerCode.includes("avg")) {
            passed = true;
          } else if (!runtimeError && (lowerCode.includes("select") || lowerCode.includes("insert") || lowerCode.includes("update") || lowerCode.includes("delete"))) {
            passed = true;
          }
        }

        if (passed) {
          satisfied.push(req.id);
        }
      });

      setCompletedRequirements(satisfied);

      // Persist completion and auto-reveal solution even across page refreshes
      if (satisfied.length === exercise.requirements.length) {
        setShowSolution(true);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(
              `mysql-academy-scenario-${exercise.id}`,
              JSON.stringify({
                completed: true,
                completedRequirements: satisfied,
                code: sqlCode,
                completedAt: Date.now(),
              })
            );
          } catch {}
        }
      }

      if (runtimeError) {
        // If there was a runtime error but student's syntax satisfied requirements:
        if (satisfied.length === exercise.requirements.length) {
          setExecutionOutput({
            success: true,
            message: `Architecture and syntax verified! All ${exercise.requirements.length} requirements passed.`,
            columns: result?.columns,
            values: result?.values,
          });
        } else if (satisfied.length > 0) {
          setExecutionOutput({
            success: true,
            message: `Syntax validated (${satisfied.length}/${exercise.requirements.length} requirements passed). Engine note: ${runtimeError.message}`,
            columns: result?.columns,
            values: result?.values,
          });
        } else {
          setExecutionOutput({
            success: false,
            message: runtimeError.message || "SQL Execution error occurred.",
          });
        }
      } else {
        setExecutionOutput({
          success: true,
          message: "Query executed successfully against live database instance.",
          columns: result?.columns,
          values: result?.values,
        });
      }
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

  const handleResetTerminal = async () => {
    setIsResettingTerminal(true);
    try {
      rollbackIfInTransaction();
      if (currentLesson?.seedSQL) {
        await resetDB(currentLesson.seedSQL);
      }
      if (exercise.schemaSetupSQL && exercise.schemaSetupSQL.trim()) {
        executeQuery(exercise.schemaSetupSQL);
      }
      setExecutionOutput(null);
      setResetNotice("✓ Scenario terminal and database sandbox reset to clean initial state!");
      setTimeout(() => setResetNotice(null), 3500);
    } catch (err: any) {
      console.warn("[Scenario] Reset terminal error:", err);
    } finally {
      setIsResettingTerminal(false);
    }
  };

  const handleResetCode = async () => {
    rollbackIfInTransaction();
    setSqlCode(exercise.starterSQL || "");
    setExecutionOutput(null);
    setCompletedRequirements([]);
    setShowSolution(false);
    setResetNotice(null);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(`mysql-academy-scenario-${exercise.id}`);
      } catch {}
    }
    if (currentLesson?.seedSQL) {
      try {
        await resetDB(currentLesson.seedSQL);
      } catch {}
    }
    if (exercise.schemaSetupSQL && exercise.schemaSetupSQL.trim()) {
      try {
        executeQuery(exercise.schemaSetupSQL);
      } catch {}
    }
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

      {/* Scenario Data Table Preview */}
      {tablePreview && (
        <div className="space-y-2 rounded-xl border border-sky-500/25 bg-sky-500/[0.04] p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-mono">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Table className="h-4 w-4 text-sky-500" />
              <span>Data Table Reference:</span>
              {tablePreview.tableName && (
                <code className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/25">
                  {tablePreview.tableName}
                </code>
              )}
            </div>
            {tablePreview.description && (
              <span className="text-[11px] text-muted-foreground font-sans">
                {tablePreview.description}
              </span>
            )}
          </div>

          <div className="overflow-x-auto rounded-lg border border-border/80 bg-card shadow-xs">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-muted-foreground text-[11px]">
                  {tablePreview.columns.map((col, idx) => (
                    <th key={idx} className="px-3 py-2 font-semibold">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {tablePreview.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-muted/20 transition-colors">
                    {row.map((val, cIdx) => (
                      <td key={cIdx} className="px-3 py-2 text-foreground/90 whitespace-nowrap">
                        {val === null ? (
                          <span className="text-muted-foreground/60 italic text-[11px]">NULL</span>
                        ) : (
                          String(val)
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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

        {isAllComplete && (
          <div className="rounded-xl border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent p-4 sm:p-5 space-y-4 animate-in fade-in shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm shadow-emerald-500/30">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-foreground">
                    Scenario Blueprint Verified &amp; Mastered!
                  </h4>
                  <p className="text-xs text-muted-foreground font-sans">
                    All {exercise.requirements.length} requirements passed. Review the canonical answer below and reset the terminal.
                  </p>
                </div>
              </div>

              {/* Reset Terminal Action Button */}
              <Button
                type="button"
                onClick={handleResetTerminal}
                disabled={isResettingTerminal}
                className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 text-xs font-mono font-bold shrink-0 shadow-sm"
              >
                <RotateCcw className={cn("h-3.5 w-3.5", isResettingTerminal && "animate-spin")} />
                Reset Scenario Terminal
              </Button>
            </div>

            {resetNotice && (
              <div className="p-2.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-xs font-mono text-sky-900 dark:text-sky-200 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 text-sky-500 shrink-0" />
                <span>{resetNotice}</span>
              </div>
            )}

            {/* Official Reference Solution (Right Answer) */}
            <div className="pt-3 border-t border-emerald-500/25 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Official Reference Blueprint (Right Answer)
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLoadSolution}
                    className="h-6 text-[10px] font-mono gap-1"
                  >
                    Insert to Editor
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopySolution}
                    className="h-6 text-[10px] font-mono gap-1"
                  >
                    {copiedSolution ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    {copiedSolution ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>

              <pre className="p-3.5 rounded-lg border border-zinc-800 bg-[#0c0d11] font-mono text-xs text-emerald-400 overflow-x-auto">
                <code>{exercise.solutionSQL}</code>
              </pre>

              <p className="text-xs text-muted-foreground leading-relaxed font-sans pt-0.5">
                💡 <strong className="text-foreground">Why this design works:</strong>{" "}
                {exercise.solutionExplanation}
              </p>
            </div>
          </div>
        )}
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
              onClick={handleResetCode}
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
            placeholder="-- Write your SQL command here..."
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
