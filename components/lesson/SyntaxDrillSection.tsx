"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Database,
  Table as TableIcon,
  ChevronDown,
  ChevronUp,
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

interface SchemaTablePreview {
  name: string;
  description?: string;
  columns: { name: string; type: string; pk?: boolean }[];
  rows: (string | number | null)[][];
}

const LESSON_SAMPLE_SCHEMAS: Record<string, SchemaTablePreview[]> = {
  "select-basics": [
    {
      name: "students",
      description: "Undergraduate student enrollment records",
      columns: [
        { name: "stu_num", type: "INTEGER", pk: true },
        { name: "stu_name", type: "VARCHAR(50)" },
        { name: "course", type: "VARCHAR(10)" },
        { name: "units", type: "INTEGER" },
        { name: "contact_no", type: "VARCHAR(20)" },
      ],
      rows: [
        [101, "Ky", "CS", 21, "0915-11-06"],
        [102, "Airus", "IT", 24, "0922-24-12"],
        [103, "Alex", "CS", 18, "0916-42-84"],
        [104, "Ethan", "IT", 21, "0932-61-92"],
        [105, "Ara", "IS", 18, null],
        [106, "Jo", "CS", 21, "0917-5501"],
      ],
    },
    {
      name: "employees",
      description: "Company personnel payroll register",
      columns: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "first_name", type: "VARCHAR(50)" },
        { name: "last_name", type: "VARCHAR(50)" },
        { name: "department", type: "VARCHAR(50)" },
        { name: "salary", type: "REAL" },
        { name: "hire_date", type: "TEXT" },
        { name: "is_active", type: "INTEGER" },
      ],
      rows: [
        [1, "Alice", "Johnson", "Engineering", 95000, "2020-03-15", 1],
        [2, "Bob", "Smith", "Marketing", 65000, "2019-07-22", 1],
        [3, "Carol", "Williams", "Engineering", 105000, "2018-01-10", 1],
        [4, "David", "Brown", "Sales", 55000, "2021-11-01", 1],
        [5, "Eve", "Davis", "Marketing", 72000, "2020-06-30", 0],
      ],
    },
  ],
  "where-clauses": [
    {
      name: "students",
      description: "Undergraduate student enrollment records",
      columns: [
        { name: "stu_num", type: "INTEGER", pk: true },
        { name: "stu_name", type: "VARCHAR(50)" },
        { name: "course", type: "VARCHAR(10)" },
        { name: "units", type: "INTEGER" },
        { name: "contact_no", type: "VARCHAR(20)" },
      ],
      rows: [
        [101, "Ky", "CS", 21, "0915-11-06"],
        [102, "Airus", "IT", 24, "0922-24-12"],
        [103, "Alex", "CS", 18, "0916-42-84"],
        [104, "Ethan", "IT", 21, "0932-61-92"],
        [105, "Ara", "IS", 18, null],
        [106, "Jo", "CS", 21, "0917-5501"],
      ],
    },
    {
      name: "orders",
      description: "Customer sales orders ledger",
      columns: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "customer_name", type: "VARCHAR(100)" },
        { name: "product", type: "VARCHAR(100)" },
        { name: "quantity", type: "INTEGER" },
        { name: "price", type: "REAL" },
        { name: "order_date", type: "TEXT" },
        { name: "status", type: "VARCHAR(20)" },
      ],
      rows: [
        [1, "Alice Johnson", "Laptop", 1, 999.99, "2024-01-15", "completed"],
        [2, "Bob Smith", "Mouse", 3, 29.99, "2024-01-16", "completed"],
        [3, "Alice Johnson", "Keyboard", 1, 79.99, "2024-01-17", "shipped"],
        [4, "Carol Williams", "Monitor", 2, 349.99, "2024-02-01", "pending"],
        [5, "David Brown", "Laptop", 1, 1299.99, "2024-02-05", "completed"],
      ],
    },
  ],
  "subqueries": [
    {
      name: "products",
      description: "Retail merchandise catalog",
      columns: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "name", type: "VARCHAR(100)" },
        { name: "category", type: "VARCHAR(50)" },
        { name: "price", type: "REAL" },
      ],
      rows: [
        [1, "Laptop Pro", "Electronics", 1299.99],
        [2, "Wireless Mouse", "Accessories", 29.99],
        [3, "Mechanical Keyboard", "Accessories", 89.99],
        [4, "4K Monitor", "Electronics", 449.99],
        [5, "USB-C Hub", "Accessories", 49.99],
      ],
    },
    {
      name: "order_items",
      description: "Order line item details",
      columns: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "product_id", type: "INTEGER" },
        { name: "quantity", type: "INTEGER" },
        { name: "total", type: "REAL" },
        { name: "order_date", type: "TEXT" },
      ],
      rows: [
        [1, 1, 2, 2599.98, "2024-01-10"],
        [2, 2, 10, 299.90, "2024-01-12"],
        [3, 3, 5, 449.95, "2024-01-15"],
        [4, 4, 1, 449.99, "2024-02-01"],
        [5, 1, 1, 1299.99, "2024-02-10"],
      ],
    },
    {
      name: "movies",
      description: "Cinema production archive",
      columns: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "title", type: "VARCHAR(100)" },
        { name: "year", type: "INTEGER" },
        { name: "length", type: "INTEGER" },
        { name: "in_color", type: "VARCHAR(10)" },
        { name: "studio_name", type: "VARCHAR(50)" },
      ],
      rows: [
        [1, "Gone With the Wind", 1939, 238, "TRUE", "MGM"],
        [2, "Star Trek: The Motion Picture", 1979, 132, "TRUE", "Paramount"],
        [3, "Star Trek: The Movie", 1978, 125, "TRUE", "Paramount"],
        [4, "The Godfather", 1972, 175, "TRUE", "Paramount"],
        [5, "Star Wars", 1977, 121, "TRUE", "Fox"],
      ],
    },
    {
      name: "class_a",
      description: "Section A student enrollment",
      columns: [
        { name: "stu_num", type: "INTEGER", pk: true },
        { name: "stu_name", type: "VARCHAR(50)" },
        { name: "units", type: "INTEGER" },
      ],
      rows: [
        [101, "Ky", 21],
        [102, "Airus", 24],
        [103, "Alex", 18],
      ],
    },
    {
      name: "class_b",
      description: "Section B student enrollment",
      columns: [
        { name: "stu_num", type: "INTEGER", pk: true },
        { name: "stu_name", type: "VARCHAR(50)" },
        { name: "units", type: "INTEGER" },
      ],
      rows: [
        [103, "Alex", 18],
        [104, "Ethan", 21],
        [105, "Cedric", 15],
      ],
    },
  ],
};

export function SyntaxDrillSection({ lessonSlug, drills }: SyntaxDrillSectionProps) {
  const executeQuery = useLessonStore((s) => s.executeQuery);
  const resetDB = useLessonStore((s) => s.resetDB);
  const currentLesson = useLessonStore((s) => s.currentLesson);
  const saveDrillProgress = useLessonStore((s) => s.saveDrillProgress);
  const lessonProg = useLessonStore((s) => s.progress[lessonSlug]);
  const tables = useLessonStore((s) => s.tables);
  const getTableRows = useLessonStore((s) => s.getTableRows);

  const [selectedTableIndex, setSelectedTableIndex] = useState(0);
  const [isSchemaExpanded, setIsSchemaExpanded] = useState(true);

  useEffect(() => {
    setSelectedTableIndex(0);
  }, [lessonSlug]);

  const schemaTables = useMemo(() => {
    const staticTables = LESSON_SAMPLE_SCHEMAS[lessonSlug];
    if (staticTables && staticTables.length > 0) {
      return staticTables;
    }
    if (tables && tables.length > 0) {
      return tables.map((t) => {
        let rows: (string | number | null)[][] = [];
        try {
          const res = getTableRows(t.name);
          if (res?.values) rows = res.values.slice(0, 5);
        } catch {}
        return {
          name: t.name,
          description: `Active table with ${t.rowCount} record${t.rowCount === 1 ? "" : "s"}`,
          columns: t.columns.map((c) => ({
            name: c.name,
            type: c.type,
            pk: Boolean(c.pk),
          })),
          rows,
        };
      });
    }
    return [];
  }, [lessonSlug, tables, getTableRows]);

  const activeTable = schemaTables[selectedTableIndex] || schemaTables[0];

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
      const isPassed = !isExplicitlyReset && passedIds.includes(drill.id);
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
      const isPassed = !isExplicitlyReset && passedIds.includes(drill.id);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonSlug, drills, resetKey, storageKey]);

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
          executeQuery(drill.setupSQL, { skipTaskValidation: true });
        } catch (setupErr) {
          console.warn("Syntax drill setupSQL execution warning:", setupErr);
        }
      }

      // Execute user input query in sandbox
      let userRes: QueryResult | null = null;
      let runtimeError: Error | null = null;
      try {
        userRes = executeQuery(rawInput, { skipTaskValidation: true });
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
          const valRes = executeQuery(drill.validationQuery, { skipTaskValidation: true });
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

      {/* Sample Practice Schema & Reference Tables */}
      {schemaTables.length > 0 && (
        <div className="rounded-xl border border-border/80 bg-background/60 p-4 sm:p-5 space-y-3.5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-500" />
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                Sample Practice Schema
              </h4>
              <span className="text-[11px] text-muted-foreground font-mono">
                ({schemaTables.length} table{schemaTables.length === 1 ? "" : "s"})
              </span>
            </div>

            {/* Table Selector Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {schemaTables.map((t, idx) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => {
                    setSelectedTableIndex(idx);
                    setIsSchemaExpanded(true);
                  }}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 cursor-pointer",
                    selectedTableIndex === idx
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 font-semibold"
                      : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60"
                  )}
                >
                  <TableIcon className="h-3 w-3" />
                  {t.name}
                </button>
              ))}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsSchemaExpanded(!isSchemaExpanded)}
                className="text-xs font-mono text-muted-foreground hover:text-foreground gap-1 h-7 px-2"
                title={isSchemaExpanded ? "Collapse schema view" : "Expand schema view"}
              >
                {isSchemaExpanded ? (
                  <>
                    <ChevronUp className="h-3 w-3" />
                    Hide
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3" />
                    Show
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Active Table Schema & Data Preview */}
          {isSchemaExpanded && activeTable && (
            <div className="space-y-3 animate-in fade-in-50 duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-foreground text-sm">
                    {activeTable.name}
                  </span>
                  {activeTable.description && (
                    <span className="text-muted-foreground text-xs font-sans">
                      • {activeTable.description}
                    </span>
                  )}
                </div>

                {/* Column Types Summary */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {activeTable.columns.map((c) => (
                    <span
                      key={c.name}
                      className="px-1.5 py-0.5 rounded bg-muted/80 text-[10px] font-mono text-muted-foreground border border-border/50"
                      title={`${c.name} (${c.type}${c.pk ? " - PRIMARY KEY" : ""})`}
                    >
                      <strong className="text-foreground">{c.name}</strong>{" "}
                      <span className="opacity-75">{c.type}</span>
                      {c.pk && <span className="text-amber-500 ml-0.5 font-bold">PK</span>}
                    </span>
                  ))}
                </div>
              </div>

              {/* Data Rows Preview Table */}
              {activeTable.rows.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-border/70 bg-card shadow-2xs">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/50 text-muted-foreground text-[11px]">
                        {activeTable.columns.map((col, idx) => (
                          <th key={idx} className="px-3 py-1.5 font-semibold">
                            {col.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {activeTable.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-muted/20 transition-colors">
                          {row.map((val, cIdx) => (
                            <td key={cIdx} className="px-3 py-1.5 text-foreground/90 whitespace-nowrap text-[11px]">
                              {val === null ? (
                                <span className="text-muted-foreground/60 italic">NULL</span>
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
              ) : (
                <div className="text-xs text-muted-foreground font-mono p-3 bg-muted/30 rounded border border-border/50 text-center">
                  No preview records available.
                </div>
              )}
            </div>
          )}
        </div>
      )}

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

              {/* Scenario Context */}
              <div className="space-y-1 text-xs sm:text-sm font-sans">
                <p className="text-foreground/90 font-medium leading-relaxed">
                  {drill.scenario}
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
