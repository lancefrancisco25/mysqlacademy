"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Table,
  AlertTriangle,
  Lightbulb,
  RotateCcw,
  Layers,
  Database,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Lesson } from "@/types";

interface ModuleUpdatesModalProps {
  lesson?: Lesson;
  isOpen: boolean;
  onContinue: () => void;
  onClose?: () => void;
}

export function ModuleUpdatesModal({
  lesson,
  isOpen,
  onContinue,
  onClose,
}: ModuleUpdatesModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(true);

  if (!isOpen) return null;

  const handleContinue = () => {
    if (typeof window !== "undefined" && dontShowAgain) {
      try {
        localStorage.setItem("mysql-academy-seen-platform-updates", "true");
        if (lesson) {
          localStorage.setItem(`mysql-academy-seen-updates-${lesson.slug}`, "true");
        }
      } catch {}
    }
    onContinue();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="max-w-2xl w-full bg-card border-2 border-emerald-500/40 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Optional Close Button if user re-opened it manually */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close updates modal"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Header */}
        <div className="space-y-2 pr-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Website Release Notes
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Version 2.4 Platform Update
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
            What&apos;s New in MySQL Academy
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Welcome to the updated learning platform! Review the new interactive tools, real-world scenario builders, and grading engines added across the academy.
          </p>
        </div>

        {/* Feature Updates List (Scrollable if needed) */}
        <div className="space-y-3 overflow-y-auto terminal-scrollbar pr-1 flex-1 py-1">
          {/* Update 1: Real-World Scenarios */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border/80 bg-muted/30">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500 shrink-0 mt-0.5">
              <Table className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs sm:text-sm font-bold text-foreground">
                Real-World Scenarios with Data Tables
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Practice questions now feature concrete business problems with sample data tables so you can verify queries against practical requirements.
              </p>
            </div>
          </div>

          {/* Update 2: Yellow Warning on Partial Answers */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border/80 bg-muted/30">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 shrink-0 mt-0.5">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs sm:text-sm font-bold text-foreground">
                Dynamic Grading &amp; Yellow Partial Warnings
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Queries now give real-time feedback: partial answers show a yellow warning until all requirements are met and the status turns green.
              </p>
            </div>
          </div>

          {/* Update 3: Right Answer on Demand */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border/80 bg-muted/30">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0 mt-0.5">
              <Lightbulb className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs sm:text-sm font-bold text-foreground">
                Right Answers on Demand
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Hints and canonical solutions stay collapsed so you can think through queries independently, but are available with a single click if you get stuck.
              </p>
            </div>
          </div>

          {/* Update 4: Visual Block Sequence Builder */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border/80 bg-muted/30">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 shrink-0 mt-0.5">
              <Layers className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs sm:text-sm font-bold text-foreground">
                Interactive Clause Ordering
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Assemble SQL clause blocks before typing code to build solid mental models for query hierarchy and command execution order.
              </p>
            </div>
          </div>

          {/* Update 5: Sandbox Reset & Persistence */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border/80 bg-muted/30">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0 mt-0.5">
              <RotateCcw className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs sm:text-sm font-bold text-foreground">
                Instant Reset &amp; Reload Persistence
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your completed checklists and queries automatically rehydrate on page refresh. Reset your database instance back to clean seed tables anytime.
              </p>
            </div>
          </div>
        </div>

        {/* Footer with Continue Button & Preference Checkbox */}
        <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded border-border text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
            />
            <span>Don&apos;t show website updates again</span>
          </label>

          <Button
            type="button"
            onClick={handleContinue}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm gap-2 h-10 px-6 shadow-md shadow-emerald-950/20"
          >
            <span>Continue to Academy</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
