"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Terminal,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  Brain,
  Search,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Eye,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SQLPipelineDiagram,
  JoinVisualDiagram,
  RelationalModelDiagram,
  BTreeDiagram,
  TransactionFlowDiagram,
} from "./Diagrams";
import type { Lesson, TrackInfo } from "@/types";
import { cn } from "@/lib/utils";

interface ConceptPrimerProps {
  lesson: Lesson;
  track?: TrackInfo;
  onStartLab: () => void;
  prevLesson?: Lesson;
  nextLesson?: Lesson;
}

export function ConceptPrimer({
  lesson,
  track,
  onStartLab,
  prevLesson,
  nextLesson,
}: ConceptPrimerProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleCopy = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const renderDiagram = () => {
    switch (lesson.diagramType) {
      case "pipeline":
        return <SQLPipelineDiagram />;
      case "join":
        return <JoinVisualDiagram />;
      case "relations":
        return <RelationalModelDiagram />;
      case "btree":
        return <BTreeDiagram />;
      case "transactions":
        return <TransactionFlowDiagram />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-full bg-background text-foreground pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-12">
        {/* ── Top Breadcrumbs & Track Metadata ──────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <Link href="/learn" className="hover:text-foreground transition-colors">
                Curriculum
              </Link>
              <span>/</span>
              <span className="text-emerald-400 font-semibold">{track?.title}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {lesson.title}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed pt-1">
              {lesson.description}
            </p>
          </div>

          <Button
            onClick={onStartLab}
            className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 font-medium shrink-0 self-start sm:self-center shadow-lg shadow-emerald-950/20"
          >
            <Terminal className="h-4 w-4" />
            Open Interactive Lab
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* ── 1. Real-World Analogy (The Mental Model) ───────────────── */}
        {lesson.analogy && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-gradient-to-br dark:from-emerald-500/10 dark:via-emerald-500/5 dark:to-transparent p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
                💡
              </div>
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Real-Life Analogy
                </span>
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  {lesson.analogy.title}
                </h3>
              </div>
            </div>

            <p className="text-sm sm:text-base text-foreground/85 dark:text-zinc-300 leading-relaxed font-sans whitespace-pre-line">
              {lesson.analogy.story}
            </p>

            <div className="pt-2 border-t border-emerald-500/20 flex items-start gap-2 text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 font-medium font-sans">
              <span className="font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Core Takeaway:
              </span>
              <span>{lesson.analogy.takeaway}</span>
            </div>
          </div>
        )}

        {/* ── 2. Visual Architecture Diagram ─────────────────────────── */}
        {lesson.diagramType && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              <Eye className="h-3.5 w-3.5 text-sky-400" />
              <span>Interactive Mental Model Diagram</span>
            </div>
            {renderDiagram()}
          </div>
        )}

        {/* ── 3. Concept Sections with Copyable Syntax ───────────────── */}
        <div className="space-y-8">
          {lesson.content.map((section, idx) => (
            <div key={idx} className="space-y-3">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {section.heading}
              </h2>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                {section.body}
              </p>

              {section.code && (
                <div className="rounded-xl border border-zinc-800 bg-[#0c0d11] overflow-hidden shadow-xs mt-3">
                  <div className="flex items-center justify-between px-4 py-2 bg-[#13141a] border-b border-zinc-800/80 text-xs font-mono text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="h-3.5 w-3.5 text-sky-400" />
                      SQL Syntax Blueprint
                    </span>
                    <button
                      onClick={() => handleCopy(section.code!, idx)}
                      className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400 font-sans">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span className="font-sans">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 font-mono text-xs sm:text-sm text-zinc-200 overflow-x-auto leading-relaxed">
                    <code>{section.code}</code>
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── 4. Memorization Booster & Mnemonics ────────────────────── */}
        {lesson.mnemonic && (
          <div className="rounded-2xl border border-violet-500/30 bg-violet-500/5 dark:bg-gradient-to-br dark:from-violet-500/10 dark:via-violet-500/5 dark:to-transparent p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2.5">
              <Brain className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              <h3 className="text-lg font-bold tracking-tight text-foreground">
                Memorization Trick &amp; Mental Anchor
              </h3>
            </div>

            <div className="p-4 rounded-xl border border-violet-500/30 bg-violet-100/70 dark:bg-violet-950/40 font-mono text-sm sm:text-base text-violet-900 dark:text-violet-200 font-bold text-center">
              &ldquo;{lesson.mnemonic.phrase}&rdquo;
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {lesson.mnemonic.breakdown.map((b, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg border border-violet-500/20 bg-card dark:bg-zinc-950/60 text-center space-y-1 shadow-xs"
                >
                  <div className="text-base font-extrabold text-violet-600 dark:text-violet-400 font-mono">
                    {b.letter}
                  </div>
                  <div className="text-xs font-semibold text-foreground dark:text-zinc-300 font-mono">
                    {b.word}
                  </div>
                  <div className="text-[10px] text-muted-foreground leading-tight">
                    {b.meaning}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground font-sans leading-relaxed pt-1">
              🧠 <strong className="text-foreground">Why this matters</strong>: {lesson.mnemonic.whyItMatters}
            </p>
          </div>
        )}

        {/* ── 5. Pattern Recognition Framework ───────────────────────── */}
        {lesson.patterns && lesson.patterns.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-sky-500 dark:text-sky-400" />
              <h3 className="text-lg font-bold tracking-tight text-foreground">
                Pattern Recognition: What to Reach For
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
              {lesson.patterns.map((p, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-card p-4 space-y-2 shadow-xs"
                >
                  <div className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    When you hear: &ldquo;{p.trigger}&rdquo;
                  </div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                    <ArrowRight className="h-3 w-3 shrink-0" />
                    Pattern: {p.solution}
                  </div>
                  <div className="text-muted-foreground text-[11px] bg-muted/50 p-2 rounded border border-border/50">
                    Example: {p.example}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 6. Pro-Tips & Gotcha Traps ──────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lesson.proTips && lesson.proTips.length > 0 && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Senior Engineer Pro-Tips
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-foreground/85 dark:text-zinc-300">
                {lesson.proTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {lesson.gotchas && lesson.gotchas.length > 0 && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5 space-y-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Common Pitfalls &amp; Gotchas
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-foreground/85 dark:text-zinc-300">
                {lesson.gotchas.map((trap, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✗</span>
                    <span>{trap}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ── 7. Quick Intuition Checkpoint ──────────────────────────── */}
        {lesson.intuitionCheck && (
          <div className="rounded-2xl border border-sky-500/30 bg-sky-500/5 dark:bg-gradient-to-br dark:from-sky-500/10 dark:via-sky-500/5 dark:to-transparent p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-sky-500 dark:text-sky-400" />
              <h3 className="text-lg font-bold tracking-tight text-foreground">
                Quick Intuition Check
              </h3>
            </div>

            <p className="text-sm sm:text-base font-semibold text-foreground">
              {lesson.intuitionCheck.question}
            </p>

            <div className="space-y-2 pt-1 font-mono text-xs sm:text-sm">
              {lesson.intuitionCheck.options.map((opt, i) => {
                const isSelected = selectedOption === i;
                const isCorrect = i === lesson.intuitionCheck?.correctIndex;

                let stateClass = "border-border bg-card hover:bg-accent text-foreground";
                if (hasAnswered) {
                  if (isCorrect) {
                    stateClass = "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold";
                  } else if (isSelected) {
                    stateClass = "border-red-500 bg-red-500/15 text-red-700 dark:text-red-300";
                  }
                } else if (isSelected) {
                  stateClass = "border-sky-500 bg-sky-500/10 text-foreground";
                }

                return (
                  <button
                    key={i}
                    disabled={hasAnswered}
                    onClick={() => {
                      setSelectedOption(i);
                      setHasAnswered(true);
                    }}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between shadow-xs",
                      stateClass
                    )}
                  >
                    <span>{opt}</span>
                    {hasAnswered && isCorrect && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0 ml-2" />
                    )}
                    {hasAnswered && isSelected && !isCorrect && (
                      <XCircle className="h-4 w-4 text-red-500 dark:text-red-400 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {hasAnswered && (
              <div className="p-4 rounded-xl border border-sky-500/30 bg-sky-100/70 dark:bg-sky-950/40 text-xs sm:text-sm text-sky-900 dark:text-sky-200 leading-relaxed font-sans animate-fade-in">
                💡 <strong className="text-sky-950 dark:text-sky-100">Explanation</strong>: {lesson.intuitionCheck.explanation}
              </div>
            )}
          </div>
        )}

        {/* ── 8. Call to Action: Launch Lab ──────────────────────────── */}
        <div className="rounded-2xl border border-emerald-500/40 bg-card p-8 text-center space-y-4 shadow-xl">
          <h3 className="text-2xl font-bold tracking-tight">
            Ready to Build Muscle Memory?
          </h3>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            You&apos;ve got the intuition down. Now jump into the interactive CLI sandbox to write the queries and let the autonomous AI grader verify your results!
          </p>
          <div className="pt-2">
            <Button
              size="lg"
              onClick={onStartLab}
              className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 font-medium px-8 text-base shadow-lg shadow-emerald-950/30"
            >
              <Terminal className="h-5 w-5" />
              Launch MySQL Terminal Lab
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* ── Lesson Navigation Footer ───────────────────────────────── */}
        <div className="flex items-center justify-between pt-6 border-t border-border/60">
          {prevLesson ? (
            <Link href={`/learn/${prevLesson.slug}`}>
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground hover:text-foreground">
                <ChevronLeft className="h-4 w-4" />
                Previous: {prevLesson.title}
              </Button>
            </Link>
          ) : (
            <div />
          )}

          {nextLesson && (
            <Link href={`/learn/${nextLesson.slug}`}>
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground hover:text-foreground">
                Next: {nextLesson.title}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
