"use client";

import { useState } from "react";
import type { LessonSection } from "@/types";
import { BookOpen, Copy, Check, ChevronDown, ChevronRight, Sparkles, Terminal } from "lucide-react";

interface LessonContentProps {
  title: string;
  description: string;
  sections: LessonSection[];
}

export function LessonContent({
  title,
  description,
  sections,
}: LessonContentProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [expandedSyntax, setExpandedSyntax] = useState<Record<number, boolean>>({});

  const handleCopy = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const toggleSyntax = (idx: number) => {
    setExpandedSyntax((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-6">
      {/* Title & Overview */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-emerald-500 shrink-0" />
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      {/* Concept Breakdown Sections */}
      {sections.map((section, idx) => (
        <div key={idx} className="space-y-3 pt-2">
          <h3 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {section.heading}
          </h3>

          <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {section.body}
          </div>

          {section.code && (
            <div className="rounded-lg border border-border dark:border-zinc-800 bg-[#0d0e12] overflow-hidden shadow-xs">
              {/* Syntax Header */}
              <div className="flex items-center justify-between px-3 py-1.5 bg-[#14151a] border-b border-zinc-800/80 text-[11px] font-mono text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Terminal className="h-3 w-3 text-sky-400" />
                  SQL Reference
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleSyntax(idx)}
                    className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors"
                  >
                    {expandedSyntax[idx] ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                    {expandedSyntax[idx] ? "Hide Breakdown" : "Explain Syntax"}
                  </button>
                  <button
                    onClick={() => handleCopy(section.code!, idx)}
                    className="text-zinc-400 hover:text-zinc-200 transition-colors p-1"
                    title="Copy snippet"
                  >
                    {copiedIdx === idx ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
              </div>

              {/* Code Box */}
              <pre className="p-3 font-mono text-xs text-zinc-200 overflow-x-auto whitespace-pre leading-5">
                <code>{section.code}</code>
              </pre>

              {/* Collapsible Syntax Breakdown */}
              {expandedSyntax[idx] && (
                <div className="p-3 bg-zinc-950/80 border-t border-zinc-800 text-xs space-y-1.5 text-zinc-300 font-mono">
                  <p className="text-[11px] text-emerald-400 font-sans font-semibold mb-1 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Clause Analysis
                  </p>
                  {section.code
                    .split("\n")
                    .filter((line) => line.trim().length > 0 && !line.trim().startsWith("--"))
                    .map((line, lIdx) => (
                      <div key={lIdx} className="text-[11px] leading-relaxed">
                        <span className="text-sky-300 font-bold">{line.trim().split(" ")[0]}</span>
                        <span className="text-zinc-400"> — {getClauseExplanation(line.trim().split(" ")[0])}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function getClauseExplanation(keyword: string): string {
  const upper = keyword.toUpperCase();
  switch (upper) {
    case "SELECT":
      return "Specifies projection expressions or attributes retrieved from candidate rows.";
    case "FROM":
      return "Designates the base relation, view, or joined table stream to query.";
    case "WHERE":
      return "Applies row-level boolean filters prior to grouping or scalar aggregation.";
    case "INSERT":
      return "Appends one or more structured tuples into the declared target relation.";
    case "UPDATE":
      return "Mutates attribute values in existing tuples satisfying filter predicates.";
    case "DELETE":
      return "Purges tuples meeting the filter criteria from physical storage.";
    case "CREATE":
      return "Defines a new entity schema, data types, nullability, and primary constraints.";
    case "ALTER":
      return "Executes online DDL modifications to evolve existing table structures.";
    case "JOIN":
    case "INNER":
      return "Evaluates relational equi-join predicates connecting foreign keys to parent records.";
    case "GROUP":
      return "Buckets rows into distinct partitions sharing equal grouping keys for aggregation.";
    case "HAVING":
      return "Filters aggregated groups based on summary metric thresholds.";
    case "ORDER":
      return "Applies deterministic sorting over the projected result set.";
    case "START":
    case "BEGIN":
      return "Initiates an atomic transaction boundary protecting ACID consistency.";
    case "COMMIT":
      return "Persists all pending transactional write operations permanently to the database.";
    case "ROLLBACK":
      return "Reverts all transactional operations executed since the transaction boundary.";
    default:
      return "Core SQL statement directive.";
  }
}
