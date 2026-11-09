"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Terminal as TerminalIcon,
  Database,
  Cpu,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Layers,
  Code2,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const [demoQuery, setDemoQuery] = useState(
    "SELECT name, salary FROM engineers WHERE salary > 90000 ORDER BY salary DESC;"
  );
  const [demoOutput, setDemoOutput] = useState<string | null>(
    `+---------------+--------+
| name          | salary |
+---------------+--------+
| Carol Reed    | 105000 |
| Alice Johnson |  95000 |
+---------------+--------+
2 rows in set (0.001 sec)`
  );

  const runSample = (sample: string) => {
    setDemoQuery(sample);
    if (sample.includes("COUNT")) {
      setDemoOutput(
        `+---------------+
| total_staff   |
+---------------+
|            12 |
+---------------+
1 row in set (0.000 sec)`
      );
    } else if (sample.includes("JOIN")) {
      setDemoOutput(
        `+----------------+----------------+
| staff_name     | department     |
+----------------+----------------+
| Alice Chen     | Engineering    |
| Bob Park       | Engineering    |
| Frank Liu      | Engineering    |
+----------------+----------------+
3 rows in set (0.002 sec)`
      );
    } else {
      setDemoOutput(
        `+---------------+--------+
| name          | salary |
+---------------+--------+
| Carol Reed    | 105000 |
| Alice Johnson |  95000 |
+---------------+--------+
2 rows in set (0.001 sec)`
      );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-emerald-500/20 selection:text-emerald-400">
      <Header />

      {/* ── Hero Section ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24 border-b border-border/50">
        {/* Subtle grid background */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium tracking-wide">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Free for Students • Runs 100% in Your Browser</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground font-sans">
            Learn MySQL by Writing Real Queries. <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
              Zero Setup Needed.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed">
            Practice database skills right in your browser with immediate feedback and smart, guided hints.
            No Docker, no command-line setup, and no paywalls.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/learn/create-database">
              <Button
                size="lg"
                className="group relative inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold tracking-tight border border-emerald-500/40 dark:border-emerald-400/30 shadow-sm hover:shadow-md hover:shadow-emerald-950/20 transition-all duration-150 ease-out active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <span>Start Learning</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-150 ease-out group-hover:translate-x-0.5 group-active:translate-x-1" />
              </Button>
            </Link>
            <Link href="/learn">
              <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-accent font-medium">
                View Curriculum Roadmap
              </Button>
            </Link>
          </div>

          {/* Interactive "Try a Query Instantly" Live Demo */}
          <div className="pt-10 max-w-3xl mx-auto text-left">
            <div className="rounded-xl border border-zinc-800 bg-[#0c0d0e] shadow-2xl overflow-hidden font-mono text-xs">
              {/* Window Header */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#141518] border-b border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="text-zinc-400 text-[11px] ml-2 font-sans font-medium">mysql-sandbox ~ demo</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => runSample("SELECT name, salary FROM engineers WHERE salary > 90000;")}
                    className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-300 transition-colors"
                  >
                    WHERE Filter
                  </button>
                  <button
                    onClick={() => runSample("SELECT COUNT(*) AS total_staff FROM engineers;")}
                    className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-300 transition-colors"
                  >
                    Aggregation
                  </button>
                  <button
                    onClick={() => runSample("SELECT s.name AS staff_name, d.name AS department FROM staff s JOIN departments d ON s.dept_id = d.id;")}
                    className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-300 transition-colors"
                  >
                    INNER JOIN
                  </button>
                </div>
              </div>

              {/* Code input */}
              <div className="p-4 bg-[#0a0a0c] border-b border-zinc-800/60 flex items-start gap-2">
                <span className="text-sky-400 select-none font-bold">mysql&gt;</span>
                <input
                  type="text"
                  value={demoQuery}
                  onChange={(e) => setDemoQuery(e.target.value)}
                  className="w-full bg-transparent outline-none text-zinc-100 font-mono text-xs caret-emerald-400"
                />
              </div>

              {/* Terminal Output */}
              {demoOutput && (
                <div className="p-4 bg-[#0a0a0c] text-emerald-400/90 whitespace-pre overflow-x-auto leading-relaxed">
                  {demoOutput}
                </div>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground text-center mt-2.5 font-sans">
              Type real SQL, hit run, and see your tables update immediately.
            </p>
          </div>
        </div>
      </section>

      {/* ── Curriculum Roadmap Syllabus Tree ────────────────────────── */}
      <section id="curriculum" className="py-20 border-b border-border/50 bg-card/30 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3 mb-14">
            <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-xs px-3 py-1 font-mono">
              CURRICULUM SYLLABUS
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Structured Path to SQL Confidence</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Four progressive stages designed to take you from your first table to writing production-ready queries.
            </p>
          </div>

          {/* Roadmap Stage Tree */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {/* Stage 1 */}
            <div className="p-5 rounded-xl border border-border bg-card relative group hover:border-emerald-500/50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm mb-3">
                1
              </div>
              <h3 className="font-semibold text-base mb-1">Stage 1: The Basics</h3>
              <p className="text-xs text-muted-foreground mb-4">
                How databases organize data, creating your first tables, and primary keys.
              </p>
              <ul className="text-xs space-y-1.5 text-muted-foreground font-mono">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> CREATE DATABASE / USE</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Tables, Rows &amp; Columns</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Primary Keys &amp; Data Types</li>
              </ul>
            </div>

            {/* Stage 2 */}
            <div className="p-5 rounded-xl border border-border bg-card relative group hover:border-sky-500/50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-sm mb-3">
                2
              </div>
              <h3 className="font-semibold text-base mb-1">Stage 2: Finding &amp; Editing Data</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Filtering records (WHERE), searching text (LIKE), and updating or deleting rows safely.
              </p>
              <ul className="text-xs space-y-1.5 text-muted-foreground font-mono">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-sky-500" /> Adding Data (INSERT INTO)</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-sky-500" /> Filtering (WHERE &amp; LIKE)</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-sky-500" /> Safe UPDATE &amp; DELETE</li>
              </ul>
            </div>

            {/* Stage 3 */}
            <div className="p-5 rounded-xl border border-border bg-card relative group hover:border-violet-500/50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center font-bold text-sm mb-3">
                3
              </div>
              <h3 className="font-semibold text-base mb-1">Stage 3: Connecting Tables</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Combining data across multiple sheets with JOINs and calculating sums, counts, and averages.
              </p>
              <ul className="text-xs space-y-1.5 text-muted-foreground font-mono">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-violet-500" /> Multi-Table INNER / LEFT JOIN</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-violet-500" /> Summaries (COUNT, SUM, AVG)</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-violet-500" /> Grouping with GROUP BY</li>
              </ul>
            </div>

            {/* Stage 4 */}
            <div className="p-5 rounded-xl border border-border bg-card relative group hover:border-amber-500/50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-sm mb-3">
                4
              </div>
              <h3 className="font-semibold text-base mb-1">Stage 4: Speed &amp; Safety</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Making queries fast with indexes and protecting information using transactions (COMMIT &amp; ROLLBACK).
              </p>
              <ul className="text-xs space-y-1.5 text-muted-foreground font-mono">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-amber-500" /> Changing Tables (ALTER TABLE)</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-amber-500" /> Transactions (COMMIT / ROLLBACK)</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-amber-500" /> High-Speed B-Tree Indexes</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ───────────────────────────────────────────── */}
      <section className="py-20 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3 mb-14">
            <h2 className="text-3xl font-bold tracking-tight">Why Learn SQL Here?</h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Built like a hands-on coding lab: zero setup friction, real muscle memory, and clear visual feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl border border-border bg-card/50 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base">Instant Browser Labs</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Everything executes locally on your device—no servers to spin up or break.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card/50 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                <TerminalIcon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base">Real Practice Terminal</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Gain muscle memory with a realistic SQL command line featuring arrow-key history and tab completion.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card/50 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center">
                <Database className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base">Live Visual Table Inspector</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Watch schemas and rows automatically reflect your changes after every query.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card/50 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base">Smart Socratic Guidance</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Receive targeted hints for syntax errors rather than generic failure messages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Call to Action ──────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
            Ready to write your first SQL query?
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
            Jump into the sandbox and test your skills immediately—no sign-up required.
          </p>
          <div className="pt-2">
            <Link href="/learn">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white gap-2 font-medium transition-all duration-150 ease-out active:scale-[0.98]">
                Open Free Sandbox
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="mt-auto border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        <div className="max-w-screen-2xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-emerald-500" />
            <span className="font-semibold">MySQL Academy</span>
            <span>— Free In-Browser Interactive SQL Education</span>
          </div>
          <p className="text-[11px] text-zinc-500">
            Interactive hands-on SQL practice for students and aspiring developers.
          </p>
        </div>
      </footer>
    </div>
  );
}
