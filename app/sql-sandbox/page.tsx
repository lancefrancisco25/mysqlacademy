"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Database,
  Play,
  RotateCcw,
  Table as TableIcon,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Key,
  X,
  FileCode,
  ArrowRight,
  CornerDownLeft,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  initSandboxDatabase,
  executeSandboxSQL,
  resetSandboxDatabase,
  getSandboxSchemaDetails,
  type SandboxTableDetails,
  type SandboxExecutionResponse,
  SANDBOX_LAST_QUERY_KEY,
} from "@/lib/sql-engine/sandbox-engine";
import { cn } from "@/lib/utils";

const SAMPLE_QUERIES = [
  {
    label: "All Students",
    sql: "SELECT student_id, first_name, last_name, major, gpa FROM students ORDER BY student_id;",
  },
  {
    label: "Courses & Credits",
    sql: "SELECT course_id, title, department, credits FROM courses ORDER BY credits DESC;",
  },
  {
    label: "Enrollments by Course",
    sql: `SELECT c.course_id, c.title, COUNT(e.enrollment_id) AS total_enrolled
FROM courses c
LEFT JOIN enrollments e ON c.course_id = e.course_id
GROUP BY c.course_id, c.title
ORDER BY total_enrolled DESC;`,
  },
  {
    label: "Honor Students (GPA >= 3.75)",
    sql: "SELECT student_id, first_name, last_name, major, gpa FROM students WHERE gpa >= 3.75 ORDER BY gpa DESC;",
  },
];

const DEFAULT_QUERY = `SELECT s.student_id, s.first_name, s.last_name, s.major, s.gpa
FROM students s
ORDER BY s.gpa DESC
LIMIT 10;`;

export default function SqlSandboxPage() {
  const [engineReady, setEngineReady] = useState(false);
  const [loadingEngine, setLoadingEngine] = useState(true);
  const [sqlInput, setSqlInput] = useState(DEFAULT_QUERY);
  const [executionOutput, setExecutionOutput] = useState<SandboxExecutionResponse | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [schemaTables, setSchemaTables] = useState<SandboxTableDetails[]>([]);
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({
    students: true,
    courses: false,
    enrollments: false,
  });
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [copiedSQL, setCopiedSQL] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize sandbox database and schema introspection
  useEffect(() => {
    let isMounted = true;

    async function loadSandbox() {
      try {
        setLoadingEngine(true);
        await initSandboxDatabase();
        if (isMounted) {
          const details = getSandboxSchemaDetails();
          setSchemaTables(details);
          setEngineReady(true);
          setLoadingEngine(false);

          // Restore last query if saved
          if (typeof window !== "undefined") {
            try {
              const savedQuery = localStorage.getItem(SANDBOX_LAST_QUERY_KEY);
              if (savedQuery && savedQuery.trim()) {
                setSqlInput(savedQuery);
              }
            } catch {}
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setExecutionError(`Failed to initialize WebAssembly SQL engine: ${err.message}`);
          setLoadingEngine(false);
        }
      }
    }

    loadSandbox();

    return () => {
      isMounted = false;
    };
  }, []);

  // Refresh schema details
  const refreshSchema = () => {
    const details = getSandboxSchemaDetails();
    setSchemaTables(details);
  };

  // Run SQL query
  const handleRunQuery = () => {
    if (!sqlInput.trim()) return;

    setIsExecuting(true);
    setExecutionError(null);

    // Save query to localStorage
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(SANDBOX_LAST_QUERY_KEY, sqlInput);
      } catch {}
    }

    try {
      const response = executeSandboxSQL(sqlInput);
      setExecutionOutput(response);
      refreshSchema();

      // Announce result for accessibility
      const rowCount = response.result?.values.length || 0;
      const announcementText =
        response.rowsAffected !== undefined
          ? `Statement executed successfully. ${response.rowsAffected} rows affected in ${response.executionTimeMs} milliseconds.`
          : `Query executed successfully. ${rowCount} rows returned in ${response.executionTimeMs} milliseconds.`;
      setLiveAnnouncement(announcementText);
    } catch (err: any) {
      const errorMessage = err.message || "SQL execution failed.";
      setExecutionError(errorMessage);
      setExecutionOutput(null);
      setLiveAnnouncement(`Query execution error: ${errorMessage}`);
    } finally {
      setIsExecuting(false);
    }
  };

  // Handle Ctrl+Enter / Cmd+Enter execution
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleRunQuery();
    }
    // Allow Tab key indent in textarea
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const value = target.value;
      target.value = value.substring(0, start) + "  " + value.substring(end);
      target.selectionStart = target.selectionEnd = start + 2;
      setSqlInput(target.value);
    }
  };

  // Confirm database reset
  const handleConfirmReset = async () => {
    try {
      await resetSandboxDatabase();
      refreshSchema();
      setSqlInput(DEFAULT_QUERY);
      setExecutionOutput(null);
      setExecutionError(null);
      setIsResetModalOpen(false);
      setLiveAnnouncement("Database reset to default schema (students, courses, enrollments).");
    } catch (err: any) {
      setExecutionError(`Failed to reset database: ${err.message}`);
      setIsResetModalOpen(false);
    }
  };

  // Toggle table expansion in schema sidebar
  const toggleTableExpansion = (tableName: string) => {
    setExpandedTables((prev) => ({
      ...prev,
      [tableName]: !prev[tableName],
    }));
  };

  // Load sample query into editor
  const handleLoadSample = (sql: string) => {
    setSqlInput(sql);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Quick query table from schema sidebar
  const handleQueryTable = (tableName: string) => {
    const query = `SELECT * FROM ${tableName} LIMIT 50;`;
    setSqlInput(query);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Copy SQL to clipboard
  const handleCopySQL = () => {
    navigator.clipboard.writeText(sqlInput);
    setCopiedSQL(true);
    setTimeout(() => setCopiedSQL(false), 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      {/* Screen reader live region for query feedback and errors */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {liveAnnouncement}
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6">
        {/* ── Subheader Bar ───────────────────────────────────────────── */}
        <section aria-labelledby="sandbox-heading" className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5" />
                  Client-Side WASM Engine
                </span>
                <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Zero Backend Requests • Auto-Persisted Locally
                </span>
              </div>
              <h1
                id="sandbox-heading"
                className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground"
              >
                In-Browser MySQL Sandbox
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-3xl">
                Execute queries, test DDL/DML, and introspect database state in an isolated sandbox. All tables and modifications automatically persist in your browser storage.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsResetModalOpen(true)}
                className="text-xs h-9 font-medium gap-1.5 border-border text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                title="Reset database to default schema"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset to Default Tables</span>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Workspace Grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ── Left: Schema Sidebar ──────────────────────────────────── */}
          <aside
            aria-label="Database Schema Explorer"
            className={cn(
              "lg:col-span-4 rounded-xl border border-border bg-card/60 flex flex-col shadow-sm overflow-hidden",
              "transition-all duration-200"
            )}
          >
            {/* Sidebar Header */}
            <div className="p-3.5 border-b border-border bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-500" />
                <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-foreground">
                  Schema Explorer
                </h2>
                <Badge
                  variant="outline"
                  className="text-[10px] font-mono px-1.5 py-0 border-border"
                >
                  {schemaTables.length} {schemaTables.length === 1 ? "table" : "tables"}
                </Badge>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={refreshSchema}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                title="Refresh database schema"
                aria-label="Refresh database schema"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Sidebar Table List */}
            <div className="p-3 space-y-2 max-h-[560px] overflow-y-auto terminal-scrollbar">
              {loadingEngine ? (
                <div className="p-4 space-y-2 text-center" aria-busy="true">
                  <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-muted-foreground font-mono">
                    Loading database engine...
                  </p>
                </div>
              ) : schemaTables.length === 0 ? (
                <div className="p-4 text-center space-y-1">
                  <p className="text-xs text-muted-foreground font-mono">
                    No tables in database.
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Create a table using CREATE TABLE or reset to default tables.
                  </p>
                </div>
              ) : (
                schemaTables.map((table) => {
                  const isExpanded = Boolean(expandedTables[table.name]);
                  return (
                    <div
                      key={table.name}
                      className="rounded-lg border border-border/80 bg-background/50 overflow-hidden"
                    >
                      {/* Table Header Row */}
                      <div className="flex items-center justify-between p-2.5 hover:bg-muted/40 transition-colors">
                        <button
                          type="button"
                          onClick={() => toggleTableExpansion(table.name)}
                          className="flex items-center gap-2 text-left flex-1 font-mono text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 rounded"
                          aria-expanded={isExpanded}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          )}
                          <TableIcon className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span className="font-semibold text-foreground truncate">
                            {table.name}
                          </span>
                          {table.type === "view" && (
                            <Badge
                              variant="outline"
                              className="text-[9px] font-mono px-1 py-0 border-sky-500/30 text-sky-400 bg-sky-500/10"
                            >
                              VIEW
                            </Badge>
                          )}
                        </button>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {table.rowCount} {table.rowCount === 1 ? "row" : "rows"}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQueryTable(table.name)}
                            className="h-6 px-1.5 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                            title={`Select all rows from ${table.name}`}
                          >
                            SELECT
                          </Button>
                        </div>
                      </div>

                      {/* Columns List (Expanded) */}
                      {isExpanded && (
                        <div className="border-t border-border/60 bg-muted/20 p-2 space-y-1">
                          {table.columns.length === 0 ? (
                            <p className="text-[11px] text-muted-foreground font-mono px-2 py-1">
                              No columns defined.
                            </p>
                          ) : (
                            <ul
                              className="space-y-1 text-[11px] font-mono text-muted-foreground"
                              aria-label={`Columns for ${table.name}`}
                            >
                              {table.columns.map((col) => (
                                <li
                                  key={col.cid}
                                  className="flex items-center justify-between px-2 py-0.5 rounded hover:bg-muted/40"
                                >
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    {col.pk === 1 ? (
                                      <span title="Primary Key" className="inline-flex items-center shrink-0">
                                        <Key className="h-3 w-3 text-amber-500" />
                                      </span>
                                    ) : (
                                      <span className="w-3 shrink-0" />
                                    )}
                                    <span className="truncate text-foreground font-medium">
                                      {col.name}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-muted-foreground shrink-0 uppercase">
                                    {col.type}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Sidebar Footer Info */}
            <div className="p-2.5 bg-muted/30 border-t border-border text-[11px] text-muted-foreground font-mono flex items-center justify-between">
              <span>Default: students, courses, enrollments</span>
            </div>
          </aside>

          {/* ── Right: Query Editor & Results ─────────────────────────── */}
          <section
            aria-label="SQL Query Workspace"
            className="lg:col-span-8 space-y-4"
          >
            {/* Quick Sample Queries */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-muted-foreground block font-mono">
                Sample Practice Queries:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 terminal-scrollbar">
                {SAMPLE_QUERIES.map((sample) => (
                  <button
                    key={sample.label}
                    type="button"
                    onClick={() => handleLoadSample(sample.sql)}
                    className={cn(
                      "text-xs font-medium px-2.5 py-1 rounded-md border border-border bg-card/60 shrink-0",
                      "hover:bg-muted hover:text-foreground transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    )}
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Query Editor Card */}
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm flex flex-col">
              {/* Editor Toolbar */}
              <div className="p-2.5 border-b border-border bg-muted/30 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-emerald-500" />
                  <label
                    htmlFor="sandbox-query-input"
                    className="text-xs font-bold font-mono uppercase tracking-wider text-foreground"
                  >
                    SQL Query Editor
                  </label>
                  <span className="text-[11px] text-muted-foreground font-mono hidden sm:inline">
                    (Press Ctrl+Enter or ⌘Enter to run)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopySQL}
                    className="h-7 text-xs px-2 gap-1 text-muted-foreground hover:text-foreground"
                    title="Copy SQL to clipboard"
                  >
                    {copiedSQL ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-500" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSqlInput("")}
                    className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
                    title="Clear editor"
                  >
                    Clear
                  </Button>
                </div>
              </div>

              {/* Code Textarea Area */}
              <div className="relative bg-zinc-950 dark:bg-black p-3">
                <textarea
                  id="sandbox-query-input"
                  ref={textareaRef}
                  value={sqlInput}
                  onChange={(e) => setSqlInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={7}
                  spellCheck={false}
                  placeholder="-- Enter SQL statement here... (e.g. SELECT * FROM students;)"
                  className={cn(
                    "w-full bg-transparent text-emerald-400 dark:text-emerald-300 font-mono text-xs sm:text-sm",
                    "resize-y leading-relaxed outline-none border-0",
                    "placeholder:text-zinc-600 focus:ring-0"
                  )}
                />
              </div>

              {/* Editor Bottom Bar */}
              <div className="p-2.5 border-t border-border bg-muted/20 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground font-mono">
                  Supported: SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, DROP, VIEW
                </span>

                <Button
                  onClick={handleRunQuery}
                  disabled={isExecuting || !sqlInput.trim() || !engineReady}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-8 px-4 gap-1.5 shadow-sm"
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  <span>Run Query</span>
                  <span className="text-[10px] opacity-75 font-mono ml-0.5 hidden sm:inline">
                    (Ctrl+Enter)
                  </span>
                </Button>
              </div>
            </div>

            {/* ── Results & Feedback Pane ─────────────────────────────── */}
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm space-y-0">
              {/* Results Header Bar */}
              <div className="p-2.5 border-b border-border bg-muted/30 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-foreground">
                    Execution Output
                  </h3>
                  {executionOutput && (
                    <Badge
                      variant="outline"
                      className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                    >
                      <Clock className="h-3 w-3 mr-1 inline" />
                      {executionOutput.executionTimeMs} ms
                    </Badge>
                  )}
                </div>

                {executionOutput?.result && (
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {executionOutput.result.values.length}{" "}
                    {executionOutput.result.values.length === 1 ? "row" : "rows"} returned
                  </span>
                )}
                {executionOutput?.rowsAffected !== undefined && (
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {executionOutput.rowsAffected}{" "}
                    {executionOutput.rowsAffected === 1 ? "row" : "rows"} affected
                  </span>
                )}
              </div>

              {/* Execution Error Alert */}
              {executionError && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="p-4 bg-destructive/10 border-b border-destructive/20 text-destructive text-xs space-y-1"
                >
                  <div className="flex items-center gap-2 font-bold font-mono">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>SQL Execution Error</span>
                  </div>
                  <p className="font-mono text-xs pl-6 break-words">
                    {executionError}
                  </p>
                </div>
              )}

              {/* Execution Success / Results Table */}
              {executionOutput?.result ? (
                <div className="overflow-x-auto max-h-[460px] terminal-scrollbar">
                  <table
                    className="w-full text-xs text-left"
                    aria-label="SQL Execution Result Table"
                  >
                    <thead>
                      <tr className="bg-muted/40 border-b border-border text-muted-foreground font-mono">
                        <th scope="col" className="px-3 py-2 w-12 text-center">
                          #
                        </th>
                        {executionOutput.result.columns.map((colName) => (
                          <th
                            key={colName}
                            scope="col"
                            className="px-3 py-2 font-semibold text-foreground whitespace-nowrap"
                          >
                            {colName}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 font-mono">
                      {executionOutput.result.values.length === 0 ? (
                        <tr>
                          <td
                            colSpan={executionOutput.result.columns.length + 1}
                            className="px-4 py-6 text-center text-muted-foreground italic"
                          >
                            Query returned 0 rows.
                          </td>
                        </tr>
                      ) : (
                        executionOutput.result.values.map((row, ri) => (
                          <tr
                            key={ri}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            <th
                              scope="row"
                              className="px-3 py-2 text-center text-muted-foreground text-[10px] select-none"
                            >
                              {ri + 1}
                            </th>
                            {row.map((cell, ci) => (
                              <td
                                key={ci}
                                className={cn(
                                  "px-3 py-2 whitespace-nowrap text-foreground",
                                  cell === null && "text-zinc-500 italic"
                                )}
                              >
                                {cell === null ? "NULL" : String(cell)}
                              </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              ) : executionOutput && executionOutput.rowsAffected !== undefined ? (
                /* DDL or Mutation with no tabular result */
                <div className="p-8 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground font-mono">
                    Statement Executed Successfully
                  </h4>
                  <p className="text-xs text-muted-foreground font-mono">
                    {executionOutput.rowsAffected} {executionOutput.rowsAffected === 1 ? "row" : "rows"} affected. Schema and state saved to local storage.
                  </p>
                </div>
              ) : !executionError ? (
                /* Initial Empty State */
                <div className="p-12 text-center space-y-2">
                  <Database className="h-8 w-8 text-muted-foreground mx-auto stroke-1" />
                  <p className="text-xs font-mono text-muted-foreground">
                    Enter a SQL query above and click Run Query or press Ctrl+Enter.
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Tables available: students, courses, enrollments.
                  </p>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </main>

      {/* ── Reset Confirmation Modal ─────────────────────────────────── */}
      {isResetModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
          onKeyDown={(e) => {
            if (e.key === "Escape") setIsResetModalOpen(false);
          }}
        >
          <div className="max-w-md w-full bg-card border border-border rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-full bg-destructive/10 text-destructive shrink-0 mt-0.5">
                <Trash2 className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3
                  id="reset-modal-title"
                  className="text-base font-bold text-foreground"
                >
                  Reset Database to Default Tables?
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This action will clear all custom tables, rows, and schema modifications from this browser. The initial practice tables (students, courses, enrollments) will be freshly restored.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsResetModalOpen(false)}
                className="text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleConfirmReset}
                className="text-xs h-9 bg-destructive hover:bg-destructive/90 text-white font-bold"
              >
                Confirm Reset
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
