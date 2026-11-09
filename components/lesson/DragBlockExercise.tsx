"use client";

import React, { useState, useEffect } from "react";
import {
  GripVertical,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Lightbulb,
  Sparkles,
  ArrowRight,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLessonStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { DragBlockExercise as DragBlockExerciseType, DragBlock } from "@/types";

interface DragBlockExerciseProps {
  exercise: DragBlockExerciseType;
}

export function DragBlockExercise({ exercise }: DragBlockExerciseProps) {
  const currentLesson = useLessonStore((s) => s.currentLesson);
  const isLessonCompleted = useLessonStore((s) => s.isLessonCompleted);
  const isLessonDone = currentLesson ? isLessonCompleted(currentLesson.slug) : false;

  // Available blocks not yet placed in the assembled sequence
  const [availableBlocks, setAvailableBlocks] = useState<DragBlock[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(`mysql-academy-dragblock-${exercise.id}`);
        const cur = useLessonStore.getState().currentLesson;
        const done = (raw && JSON.parse(raw)?.completed) || (cur && useLessonStore.getState().isLessonCompleted(cur.slug));
        if (done) return [];
      } catch {}
    }
    // Shuffle available blocks initially so they are not in solution order
    return [...exercise.blocks].sort(() => 0.5 - Math.random());
  });

  // Ordered list of block IDs placed by student
  const [placedBlocks, setPlacedBlocks] = useState<DragBlock[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(`mysql-academy-dragblock-${exercise.id}`);
        const cur = useLessonStore.getState().currentLesson;
        const done = (raw && JSON.parse(raw)?.completed) || (cur && useLessonStore.getState().isLessonCompleted(cur.slug));
        if (done) {
          return exercise.solution
            .map((id) => exercise.blocks.find((b) => b.id === id))
            .filter(Boolean) as DragBlock[];
        }
      } catch {}
    }
    return [];
  });

  // Feedback state: null | "correct" | "partial" | "incorrect"
  const [status, setStatus] = useState<"correct" | "partial" | "incorrect" | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(`mysql-academy-dragblock-${exercise.id}`);
        const cur = useLessonStore.getState().currentLesson;
        const done = (raw && JSON.parse(raw)?.completed) || (cur && useLessonStore.getState().isLessonCompleted(cur.slug));
        if (done) return "correct";
      } catch {}
    }
    return null;
  });
  const [showHint, setShowHint] = useState(false);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);

  // Sync / reset when navigating to another exercise and rehydrate persisted completion
  useEffect(() => {
    let saved: any = null;
    let isExplicitlyReset = false;
    if (typeof window !== "undefined") {
      try {
        isExplicitlyReset = localStorage.getItem(`mysql-academy-dragblock-reset-${exercise.id}`) === "true";
        const raw = localStorage.getItem(`mysql-academy-dragblock-${exercise.id}`);
        if (raw) saved = JSON.parse(raw);
      } catch {}
    }

    if (!isExplicitlyReset && (saved?.completed || isLessonDone)) {
      const solved = exercise.solution
        .map((id) => exercise.blocks.find((b) => b.id === id))
        .filter(Boolean) as DragBlock[];
      setPlacedBlocks(solved);
      setAvailableBlocks([]);
      setStatus("correct");
    } else {
      setAvailableBlocks([...exercise.blocks].sort(() => 0.5 - Math.random()));
      setPlacedBlocks([]);
      setStatus(null);
    }
    setShowHint(false);
  }, [exercise.id, exercise.blocks, exercise.solution, isLessonDone]);

  // Click to place block from available into placed
  const handleAddBlock = (block: DragBlock) => {
    setAvailableBlocks((prev) => prev.filter((b) => b.id !== block.id));
    setPlacedBlocks((prev) => [...prev, block]);
    setStatus(null);
  };

  // Click to return block from placed back to available
  const handleRemoveBlock = (block: DragBlock) => {
    setPlacedBlocks((prev) => prev.filter((b) => b.id !== block.id));
    setAvailableBlocks((prev) => [...prev, block]);
    setStatus(null);
  };

  // Reset all
  const handleReset = () => {
    setAvailableBlocks([...exercise.blocks].sort(() => 0.5 - Math.random()));
    setPlacedBlocks([]);
    setStatus(null);
    setShowHint(false);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(`mysql-academy-dragblock-${exercise.id}`);
        localStorage.setItem(`mysql-academy-dragblock-reset-${exercise.id}`, "true");
      } catch {}
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, block: DragBlock, from: "available" | "placed") => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ block, from }));
    setDraggedBlockId(block.id);
  };

  const handleDropOnPlaced = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      if (data && data.block && data.from === "available") {
        handleAddBlock(data.block);
      }
    } catch {
      // Fallback
    }
    setDraggedBlockId(null);
  };

  const handleDropOnAvailable = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      if (data && data.block && data.from === "placed") {
        handleRemoveBlock(data.block);
      }
    } catch {
      // Fallback
    }
    setDraggedBlockId(null);
  };

  const [matchedCount, setMatchedCount] = useState(0);

  const handleCheck = () => {
    const currentOrder = placedBlocks.map((b) => b.id);
    const isCorrect =
      currentOrder.length === exercise.solution.length &&
      currentOrder.every((id, idx) => id === exercise.solution[idx]);

    let count = 0;
    for (let i = 0; i < currentOrder.length; i++) {
      if (currentOrder[i] === exercise.solution[i]) {
        count++;
      }
    }
    setMatchedCount(count);

    if (isCorrect) {
      setStatus("correct");
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem(`mysql-academy-dragblock-reset-${exercise.id}`);
          localStorage.setItem(
            `mysql-academy-dragblock-${exercise.id}`,
            JSON.stringify({ completed: true })
          );
        } catch {}
      }
    } else if (count > 0) {
      setStatus("partial");
    } else {
      setStatus("incorrect");
    }
  };

  // Formatted SQL preview
  const assembledQueryText = placedBlocks.map((b) => b.text).join(" ");

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Exercise Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
              Interactive Builder
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Drag or Click to Assemble
            </span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Code2 className="h-5 w-5 text-sky-500" />
            {exercise.title}
          </h3>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {exercise.hint && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHint((prev) => !prev)}
              className="gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground"
            >
              <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
              {showHint ? "Hide Hint" : "Hint"}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="gap-1 text-xs font-mono text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
      </div>

      {/* Instructions & Scenario */}
      <div className="space-y-2">
        <p className="text-sm sm:text-base text-foreground font-medium">
          {exercise.instructions}
        </p>
        {exercise.scenarioContext && (
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed italic bg-muted/40 p-3 rounded-lg border border-border/50">
            💼 <span className="font-semibold text-foreground">Scenario:</span>{" "}
            {exercise.scenarioContext}
          </p>
        )}
      </div>

      {/* Hint Alert */}
      {showHint && exercise.hint && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs sm:text-sm text-amber-800 dark:text-amber-200 flex items-start gap-3">
          <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Pedagogical Hint:</span> {exercise.hint}
          </div>
        </div>
      )}

      {/* Dropzone: Assembled SQL Line */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
          <span>Target Query Dropzone:</span>
          <span>
            {placedBlocks.length}/{exercise.solution.length} blocks placed
          </span>
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropOnPlaced}
          className={cn(
            "min-h-[90px] p-4 rounded-xl border-2 border-dashed transition-all flex flex-wrap items-center gap-2",
            status === "correct"
              ? "border-emerald-500/80 bg-emerald-500/10"
              : status === "partial"
              ? "border-amber-500/80 bg-amber-500/10"
              : status === "incorrect"
              ? "border-red-500/80 bg-red-500/10"
              : placedBlocks.length === 0
              ? "border-border/80 bg-muted/30"
              : "border-sky-500/50 bg-sky-500/5"
          )}
        >
          {placedBlocks.length === 0 ? (
            <div className="w-full text-center py-4 text-xs sm:text-sm text-muted-foreground/70 font-mono">
              👉 Click or drag SQL clause blocks from below into this sequence area
            </div>
          ) : (
            placedBlocks.map((block, idx) => (
              <div
                key={block.id}
                draggable
                onDragStart={(e) => handleDragStart(e, block, "placed")}
                onClick={() => handleRemoveBlock(block)}
                title="Click to remove"
                className={cn(
                  "cursor-pointer group select-none flex items-center gap-1.5 px-3 py-2 rounded-lg font-mono text-xs sm:text-sm font-semibold border transition-all duration-150 shadow-xs",
                  status === "correct"
                    ? "bg-emerald-600 text-white border-emerald-500"
                    : status === "partial"
                    ? "bg-amber-500/20 text-amber-900 dark:text-amber-200 border-amber-500/40"
                    : status === "incorrect"
                    ? "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/40"
                    : "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                )}
              >
                <GripVertical className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                <span>{block.text}</span>
                <span className="text-[10px] ml-1 opacity-70 group-hover:opacity-100 font-sans">
                  ✕
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SQL Live Code Preview */}
      {placedBlocks.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-[#0c0d11] p-3 font-mono text-xs text-zinc-300 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-sky-400 select-none">mysql&gt;</span>
            <span className="text-emerald-400">{assembledQueryText}</span>
          </div>
          <Badge variant="outline" className="text-[10px] text-zinc-400 border-zinc-700 shrink-0">
            Live Preview
          </Badge>
        </div>
      )}

      {/* Available Blocks Pool */}
      <div className="space-y-2">
        <div className="text-xs font-mono text-muted-foreground">
          Available Clause Blocks (Click to add):
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropOnAvailable}
          className="min-h-[60px] p-4 rounded-xl border border-border/60 bg-muted/20 flex flex-wrap gap-2.5 items-center"
        >
          {availableBlocks.length === 0 ? (
            <span className="text-xs text-muted-foreground/60 italic font-mono">
              All blocks have been placed in the query above!
            </span>
          ) : (
            availableBlocks.map((block) => (
              <button
                key={block.id}
                draggable
                onDragStart={(e) => handleDragStart(e, block, "available")}
                onClick={() => handleAddBlock(block)}
                className="select-none flex items-center gap-1.5 px-3 py-2 rounded-lg font-mono text-xs sm:text-sm font-semibold border border-border bg-card hover:bg-accent text-foreground hover:border-sky-500/50 hover:shadow-xs transition-all active:scale-95"
              >
                <GripVertical className="h-3 w-3 text-muted-foreground" />
                <span>{block.text}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Action Buttons & Feedback */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="w-full sm:w-auto">
          {status === "correct" && (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
              <CheckCircle2 className="h-5 w-5" />
              <span>Correct! All blocks are in the right order.</span>
            </div>
          )}
          {status === "partial" && (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-sm">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <span>Partially correct ({matchedCount}/{exercise.solution.length} blocks in place). Keep going until all are correct!</span>
            </div>
          )}
          {status === "incorrect" && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold text-sm">
              <XCircle className="h-5 w-5" />
              <span>Not quite right yet. Check clause order and required keywords.</span>
            </div>
          )}
        </div>

        <Button
          onClick={handleCheck}
          disabled={placedBlocks.length === 0}
          className={cn(
            "w-full sm:w-auto font-mono text-xs font-bold gap-2",
            status === "correct"
              ? "bg-emerald-600 hover:bg-emerald-500 text-white"
              : "bg-sky-600 hover:bg-sky-500 text-white"
          )}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Check Order
        </Button>
      </div>

      {/* Explanation when completed or requested */}
      {status === "correct" && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-xs sm:text-sm text-emerald-800 dark:text-emerald-200 space-y-1.5 animate-in fade-in">
          <div className="font-bold flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            Why this works:
          </div>
          <p className="leading-relaxed font-sans">{exercise.explanation}</p>
        </div>
      )}
    </div>
  );
}
