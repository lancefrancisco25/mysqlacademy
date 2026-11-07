"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Lightbulb,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useLessonStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface TaskListProps {
  tasks: Task[];
  lessonSlug: string;
}

export function TaskList({ tasks, lessonSlug }: TaskListProps) {
  // Directly subscribe to progress for this specific lesson
  const progress = useLessonStore((s) => s.progress);
  const verifyPendingTasks = useLessonStore((s) => s.verifyPendingTasks);
  const toggleTask = useLessonStore((s) => s.toggleTask);

  const lessonProgress = progress[lessonSlug];
  const completedTaskIds = lessonProgress?.completedTaskIds || [];
  const completedCount = tasks.filter((t) => completedTaskIds.includes(t.id)).length;
  const percent = Math.round((completedCount / Math.max(tasks.length, 1)) * 100);

  return (
    <div className="space-y-4">
      {/* Header with Live Progress Counter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">
              Lab Objectives
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">
              {completedCount}/{tasks.length}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={verifyPendingTasks}
            className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground font-mono gap-1"
            title="Re-check current database state against all objectives"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Check State</span>
          </Button>
        </div>

        <Progress value={percent} className="h-1.5" />
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {tasks.map((task, idx) => {
          const isDone = completedTaskIds.includes(task.id);
          return (
            <TaskItem
              key={task.id}
              task={task}
              index={idx}
              completed={isDone}
              onToggle={() => toggleTask(lessonSlug, task.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

function TaskItem({
  task,
  index,
  completed,
  onToggle,
}: {
  task: Task;
  index: number;
  completed: boolean;
  onToggle: () => void;
}) {
  const [showHint, setShowHint] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyHint = () => {
    if (!task.hint) return;
    navigator.clipboard.writeText(task.hint);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className={cn(
        "rounded-xl border p-3.5 transition-all shadow-xs",
        completed
          ? "border-emerald-500/40 bg-emerald-500/[0.06] dark:bg-emerald-500/10"
          : "border-border bg-card hover:border-border/80"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Clickable check button */}
        <button
          onClick={onToggle}
          className="mt-0.5 shrink-0 transition-transform hover:scale-110 active:scale-95"
          title={completed ? "Mark pending" : "Mark completed"}
          aria-label={completed ? "Mark objective pending" : "Mark objective complete"}
        >
          {completed ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400 fill-emerald-500/10" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground/60 hover:text-emerald-500 transition-colors" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p
              className={cn(
                "text-xs sm:text-sm font-semibold tracking-tight transition-colors",
                completed
                  ? "line-through text-muted-foreground"
                  : "text-foreground"
              )}
            >
              {index + 1}. {task.title}
            </p>

            {completed && (
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded shrink-0">
                ✓ Passed
              </span>
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {task.description}
          </p>

          {/* Hint controls */}
          {task.hint && !completed && (
            <div className="mt-2.5 flex items-center gap-3">
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:underline transition-colors"
              >
                <Lightbulb className="h-3 w-3" />
                <span>{showHint ? "Hide hint" : "Need a hint?"}</span>
              </button>

              {showHint && (
                <button
                  onClick={handleCopyHint}
                  className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors"
                  title="Copy SQL hint to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-500" />
                      <span className="text-emerald-500">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy SQL</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {showHint && task.hint && !completed && (
            <div className="mt-2 text-xs text-amber-800 dark:text-amber-300 bg-amber-500/10 border border-amber-500/25 rounded-lg p-2.5 font-mono select-all break-all leading-relaxed">
              <code>{task.hint}</code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
