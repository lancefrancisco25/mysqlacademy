"use client";

import { useLessonStore } from "@/lib/store";
import { AlertTriangle, CheckCircle2, Info, Lightbulb, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

export function HintPanel() {
  const feedback = useLessonStore((s) => s.feedback);
  const clearFeedback = useLessonStore((s) => s.clearFeedback);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [feedback]);

  if (feedback.length === 0) return null;

  return (
    <div className="border-t border-border bg-card">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Agent Feedback
        </span>
        <button
          onClick={clearFeedback}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div
        ref={scrollRef}
        className="max-h-32 overflow-y-auto terminal-scrollbar p-2 space-y-1.5"
      >
        {feedback.map((fb, i) => (
          <div
            key={i}
            className={cn(
              "flex items-start gap-2 text-xs p-2 rounded-md border animate-fade-in",
              fb.type === "success" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
              fb.type === "error" && "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
              fb.type === "hint" && "bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-500/20",
              fb.type === "info" && "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20"
            )}
          >
            {fb.type === "success" && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />}
            {fb.type === "error" && <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />}
            {fb.type === "hint" && <Lightbulb className="h-3.5 w-3.5 shrink-0 mt-0.5" />}
            {fb.type === "info" && <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />}
            <span>{fb.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
