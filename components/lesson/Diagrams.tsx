"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  Database,
  Filter,
  Layers,
  Sparkles,
  Search,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  GitCommit,
  GitBranch,
  Key,
  Link as LinkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── 1. SQL Pipeline Execution Order Diagram ────────────────────────────────

export function SQLPipelineDiagram() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: 1,
      name: "FROM & JOIN",
      desc: "Loads candidate tables into memory and links foreign keys.",
      rule: "The base relation is established first.",
    },
    {
      num: 2,
      name: "WHERE",
      desc: "Discards individual rows BEFORE any grouping occurs.",
      rule: "Cannot access aliases created in SELECT or aggregate functions.",
    },
    {
      num: 3,
      name: "GROUP BY",
      desc: "Splits remaining rows into categories/buckets based on identical keys.",
      rule: "Rows become distinct partitions ready for aggregation.",
    },
    {
      num: 4,
      name: "HAVING",
      desc: "Filters entire grouped buckets based on aggregate calculations.",
      rule: "Works on summary results (e.g., HAVING COUNT(*) > 5).",
    },
    {
      num: 5,
      name: "SELECT",
      desc: "Projects specified columns and creates mathematical expressions / aliases.",
      rule: "This is where column aliases are officially born.",
    },
    {
      num: 6,
      name: "ORDER BY",
      desc: "Sorts the final projected rows ascending or descending.",
      rule: "Can now safely use aliases defined in SELECT.",
    },
    {
      num: 7,
      name: "LIMIT",
      desc: "Slices off the top N rows and sends the result to the client.",
      rule: "Executed last to minimize network payload.",
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4 my-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
          <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-foreground">
            SQL Execution Lifecycle Pipeline
          </h4>
        </div>
        <span className="text-[11px] text-muted-foreground font-mono">
          Click any phase to inspect behavior
        </span>
      </div>

      {/* Pipeline Track */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5">
        {steps.map((s, i) => (
          <button
            key={s.name}
            onClick={() => setActiveStep(i)}
            className={cn(
              "p-2.5 rounded-lg border text-left transition-all",
              activeStep === i
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-white font-bold shadow-xs"
                : "border-border bg-muted/40 text-muted-foreground hover:border-border/80 hover:text-foreground"
            )}
          >
            <div className="text-[10px] font-mono text-muted-foreground font-bold mb-1">
              Phase 0{s.num}
            </div>
            <div className="text-xs font-mono font-semibold truncate">
              {s.name}
            </div>
          </button>
        ))}
      </div>

      {/* Active Phase Details */}
      <div className="rounded-lg border border-border bg-muted/30 dark:bg-zinc-950 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
            Step {steps[activeStep].num}: {steps[activeStep].name}
          </span>
          <span className="text-xs text-foreground/90 font-medium">
            {steps[activeStep].desc}
          </span>
        </div>
        <div className="text-xs text-amber-600 dark:text-amber-400 font-mono flex items-start gap-1.5 pt-1">
          <Sparkles className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" />
          <span>Execution Rule: {steps[activeStep].rule}</span>
        </div>
      </div>
    </div>
  );
}

// ─── 2. Interactive JOIN Mechanics Diagram ──────────────────────────────────

export function JoinVisualDiagram() {
  const [joinType, setJoinType] = useState<"inner" | "left">("inner");

  const customers = [
    { id: 1, name: "Alice Chen" },
    { id: 2, name: "Bob Park" },
    { id: 3, name: "Charlie Roy (No Orders)" },
  ];

  const orders = [
    { orderId: "#101", customerId: 1, item: "MacBook Pro" },
    { orderId: "#102", customerId: 1, item: "Magic Mouse" },
    { orderId: "#103", customerId: 2, item: "4K Monitor" },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4 my-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-sky-500 dark:text-sky-400" />
          <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-foreground">
            Visual Relational Join Simulator
          </h4>
        </div>
        <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg border border-border">
          <button
            onClick={() => setJoinType("inner")}
            className={cn(
              "px-2.5 py-1 rounded text-xs font-mono transition-colors",
              joinType === "inner"
                ? "bg-sky-600 text-white font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            INNER JOIN
          </button>
          <button
            onClick={() => setJoinType("left")}
            className={cn(
              "px-2.5 py-1 rounded text-xs font-mono transition-colors",
              joinType === "left"
                ? "bg-emerald-600 text-white font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            LEFT JOIN
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
        {/* Left Table */}
        <div className="p-3 rounded-lg border border-border bg-muted/30 dark:bg-zinc-950 space-y-2">
          <p className="font-semibold text-sky-600 dark:text-sky-400 flex items-center justify-between">
            <span>Left: customers</span>
            <span className="text-[10px] text-muted-foreground">PK: id</span>
          </p>
          <div className="space-y-1.5">
            {customers.map((c) => (
              <div
                key={c.id}
                className={cn(
                  "p-2 rounded border text-[11px]",
                  c.id === 3 && joinType === "inner"
                    ? "opacity-40 border-border bg-muted/20 line-through"
                    : "border-sky-500/30 bg-sky-500/10 text-foreground"
                )}
              >
                <span className="text-sky-600 dark:text-sky-300 font-bold">[{c.id}]</span> {c.name}
              </div>
            ))}
          </div>
        </div>

        {/* Right Table */}
        <div className="p-3 rounded-lg border border-border bg-muted/30 dark:bg-zinc-950 space-y-2">
          <p className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
            <span>Right: orders</span>
            <span className="text-[10px] text-muted-foreground">FK: customer_id</span>
          </p>
          <div className="space-y-1.5">
            {orders.map((o) => (
              <div
                key={o.orderId}
                className="p-2 rounded border border-emerald-500/30 bg-emerald-500/10 text-foreground text-[11px]"
              >
                <span className="text-emerald-600 dark:text-emerald-300 font-bold">{o.orderId}</span>: {o.item} (Cust #{o.customerId})
              </div>
            ))}
          </div>
        </div>

        {/* Result Table */}
        <div className="p-3 rounded-lg border border-border bg-muted/30 dark:bg-zinc-950 space-y-2">
          <p className="font-semibold text-amber-600 dark:text-amber-400 flex items-center justify-between">
            <span>Result Stream</span>
            <span className="text-[10px] text-muted-foreground">
              {joinType === "inner" ? "3 Matched Rows" : "4 Rows (Includes NULL)"}
            </span>
          </p>
          <div className="space-y-1.5 text-[11px]">
            <div className="p-1.5 rounded bg-card border border-border text-foreground">
              Alice Chen $\to$ MacBook Pro
            </div>
            <div className="p-1.5 rounded bg-card border border-border text-foreground">
              Alice Chen $\to$ Magic Mouse
            </div>
            <div className="p-1.5 rounded bg-card border border-border text-foreground">
              Bob Park $\to$ 4K Monitor
            </div>
            {joinType === "left" && (
              <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 flex items-center justify-between">
                <span>Charlie Roy $\to$</span>
                <span className="font-bold underline">NULL</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed font-sans pt-1">
        {joinType === "inner" ? (
          <span>
            💡 <strong className="text-foreground">INNER JOIN Rule</strong>: Charlie Roy is discarded entirely because he has zero corresponding orders in the right table. Only records with bilateral matches survive.
          </span>
        ) : (
          <span>
            💡 <strong className="text-foreground">LEFT JOIN Rule</strong>: Charlie Roy is preserved! Because he has no order, MySQL fills all missing order columns with <code className="text-amber-600 dark:text-amber-400 font-bold">NULL</code>.
          </span>
        )}
      </p>
    </div>
  );
}

// ─── 3. Relational Model & Foreign Key Link Diagram ─────────────────────────

export function RelationalModelDiagram() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4 my-6 shadow-xs font-mono">
      <div className="flex items-center gap-2 border-b border-border/80 pb-3">
        <LinkIcon className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
        <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
          Relational Entity Links: Primary Key $\to$ Foreign Key
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Parent Table */}
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">Parent: departments</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold">Target</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="p-2 rounded bg-card border border-border flex items-center justify-between shadow-xs">
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                <Key className="h-3 w-3" /> id (PK)
              </span>
              <span className="text-muted-foreground">INTEGER</span>
            </div>
            <div className="p-2 rounded bg-card border border-border flex items-center justify-between shadow-xs">
              <span className="text-foreground">name</span>
              <span className="text-muted-foreground">VARCHAR(50)</span>
            </div>
          </div>
        </div>

        {/* Child Table */}
        <div className="rounded-lg border border-sky-500/30 bg-sky-500/5 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sky-600 dark:text-sky-400 text-xs">Child: staff</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-700 dark:text-sky-300 font-semibold">References Parent</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="p-2 rounded bg-card border border-border flex items-center justify-between shadow-xs">
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                <Key className="h-3 w-3" /> id (PK)
              </span>
              <span className="text-muted-foreground">INTEGER</span>
            </div>
            <div className="p-2 rounded bg-card border border-border flex items-center justify-between shadow-xs">
              <span className="text-foreground">name</span>
              <span className="text-muted-foreground">VARCHAR(100)</span>
            </div>
            <div className="p-2 rounded bg-sky-500/10 border border-sky-500/30 flex items-center justify-between text-sky-700 dark:text-sky-300 shadow-xs">
              <span className="flex items-center gap-1.5 font-bold">
                <LinkIcon className="h-3 w-3" /> department_id (FK)
              </span>
              <span className="text-[11px] underline">$\to$ departments.id</span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground font-sans leading-relaxed pt-1">
        🧠 <strong className="text-foreground">Integrity Guarantee</strong>: You can never assign a staff member to <code className="text-emerald-600 dark:text-emerald-400 font-bold">department_id = 99</code> if department #99 doesn&apos;t exist in the parent table. The database rejects it at the gate.
      </p>
    </div>
  );
}

// ─── 4. B-Tree Index vs Full Table Scan Diagram ─────────────────────────────

export function BTreeDiagram() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4 my-6 shadow-xs font-mono text-xs">
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-amber-500 dark:text-amber-400" />
          <h4 className="font-semibold uppercase tracking-wider text-foreground">
            Query Performance: Full Table Scan vs B-Tree Index
          </h4>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Scan */}
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
              <XCircle className="h-4 w-4" /> Full Table Scan
            </span>
            <span className="text-[10px] text-red-700 dark:text-red-300 bg-red-500/15 px-2 py-0.5 rounded font-semibold">
              Cost: $O(N)$
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground font-sans leading-relaxed">
            Without an index on <code className="text-red-600 dark:text-red-300 font-bold">user_id</code>, the engine scans every single page from row 1 to row 10,000,000 looking for matches.
          </p>
          <div className="space-y-1 text-[11px]">
            <div className="p-1 rounded bg-card border border-border text-muted-foreground">Row #1: user_id=14 (Mismatch)</div>
            <div className="p-1 rounded bg-card border border-border text-muted-foreground">Row #2: user_id=89 (Mismatch)</div>
            <div className="p-1 rounded bg-card border border-border text-muted-foreground">... Scanning 10M rows ...</div>
          </div>
        </div>

        {/* B-Tree Search */}
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> B-Tree Index Lookup
            </span>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded font-semibold">
              Cost: $O(\log N)$
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground font-sans leading-relaxed">
            With <code className="text-emerald-600 dark:text-emerald-300 font-bold">INDEX idx_user_id(user_id)</code>, the engine binary-searches balanced tree nodes, finding any row in ~3 pointer hops.
          </p>
          <div className="space-y-1 text-[11px]">
            <div className="p-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">Root Node: user_id &gt; 50? Go Right</div>
            <div className="p-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">Branch Node: user_id &lt; 75? Go Left</div>
            <div className="p-1 rounded bg-emerald-500/20 border border-emerald-500/50 text-emerald-800 dark:text-white font-bold">Leaf Found in 3 I/O cycles!</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 5. ACID Transaction State Flow Diagram ─────────────────────────────────

export function TransactionFlowDiagram() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4 my-6 shadow-xs font-mono text-xs">
      <div className="flex items-center gap-2 border-b border-border/80 pb-3">
        <GitBranch className="h-4 w-4 text-violet-500 dark:text-violet-400" />
        <h4 className="font-semibold uppercase tracking-wider text-foreground">
          ACID Transaction Lifecycle: All-Or-Nothing Atomicity
        </h4>
      </div>

      <div className="space-y-3">
        <div className="p-2.5 rounded-lg border border-border bg-muted/30 dark:bg-zinc-950 flex items-center gap-2 text-sky-600 dark:text-sky-400">
          <GitCommit className="h-4 w-4" />
          <span className="font-bold">1. START TRANSACTION;</span>
          <span className="text-muted-foreground text-[11px]">— Open atomic isolation boundary</span>
        </div>

        <div className="p-2.5 rounded-lg border border-border bg-muted/30 dark:bg-zinc-950 ml-4 space-y-1.5 text-foreground/90">
          <div>Step A: UPDATE accounts SET balance = balance - 500 WHERE holder = &apos;Alice&apos;;</div>
          <div>Step B: UPDATE accounts SET balance = balance + 500 WHERE holder = &apos;Bob&apos;;</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 ml-4">
          <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 space-y-1">
            <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Both Steps Succeeded
            </div>
            <p className="text-[11px] text-muted-foreground font-sans">
              Run <code className="text-emerald-600 dark:text-emerald-300 font-mono font-bold">COMMIT;</code> $\to$ Changes written permanently to disk.
            </p>
          </div>

          <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/5 space-y-1">
            <div className="font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5" /> Crash / Constraint Failure
            </div>
            <p className="text-[11px] text-muted-foreground font-sans">
              Run <code className="text-red-600 dark:text-red-300 font-mono font-bold">ROLLBACK;</code> $\to$ Reverts all changes back to initial state.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
