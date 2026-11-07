"use client";

import { CheckCircle2, Circle, Lightbulb } from "lucide-react";
import { useLessonStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";
import { useState } from "react";

interface TaskListProps {
  tasks: Task[];
  lessonSlug: string;
}

export function TaskList({ tasks, lessonSlug }: TaskListProps) {
  const isTaskCompleted = useLessonStore((s) => s.isTaskCompleted);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Tasks
      </h3>
      <div className="space-y-2">
        {tasks.map((task, idx) => (
          <TaskItem
            key={task.id}
            task={task}
            index={idx}
            completed={isTaskCompleted(lessonSlug, task.id)}
          />
        ))}
      </div>
    </div>
  );
}

function TaskItem({
  task,
  index,
  completed,
}: {
  task: Task;
  index: number;
  completed: boolean;
}) {
  const [showHint, setShowHint] = useState(false);

  return (
    <div
      className={cn(
        "rounded-lg border p-3 transition-all",
        completed
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-border bg-card"
      )}
    >
      <div className="flex items-start gap-2.5">
        {completed ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
        )}
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-sm font-medium",
              completed && "line-through text-muted-foreground"
            )}
          >
            {index + 1}. {task.title}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {task.description}
          </p>

          {task.hint && !completed && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-1 mt-2 text-xs text-amber-500 hover:text-amber-400 transition-colors"
            >
              <Lightbulb className="h-3 w-3" />
              {showHint ? "Hide hint" : "Show hint"}
            </button>
          )}

          {showHint && task.hint && (
            <div className="mt-2 text-xs text-amber-400/80 bg-amber-500/10 border border-amber-500/20 rounded p-2 font-mono">
              💡 {task.hint}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
