import type { QueryResult, AgentFeedback, Lesson, Task } from "@/types";
import { validateTask } from "./validator";
import { getMentorHint } from "./mentor";
import { executeSQL, getTableNames, getTableData, getTableInfo } from "../sql-engine/engine";

export interface AgentEvent {
  query: string;
  result: QueryResult | null;
  error?: Error;
}

export type FeedbackCallback = (feedback: AgentFeedback) => void;
export type TaskCompleteCallback = (taskId: string) => void;

/**
 * The AgentRuntime orchestrates the pedagogical agents.
 * It observes terminal input/output and dispatches events to the
 * validator, mentor, and other agents.
 */
export class AgentRuntime {
  private lesson: Lesson;
  private completedTaskIds: Set<string>;
  private onFeedback: FeedbackCallback;
  private onTaskComplete: TaskCompleteCallback;

  constructor(
    lesson: Lesson,
    completedTaskIds: string[],
    onFeedback: FeedbackCallback,
    onTaskComplete: TaskCompleteCallback
  ) {
    this.lesson = lesson;
    this.completedTaskIds = new Set(completedTaskIds);
    this.onFeedback = onFeedback;
    this.onTaskComplete = onTaskComplete;
  }

  /**
   * Called when a query executes successfully.
   */
  onQuerySuccess(query: string, result: QueryResult | null): void {
    // Find the first incomplete task and check it
    for (const task of this.lesson.tasks) {
      if (this.completedTaskIds.has(task.id)) continue;

      const validation = validateTask(task, query, result);
      if (validation.passed) {
        this.completedTaskIds.add(task.id);
        this.onTaskComplete(task.id);
        this.onFeedback({
          type: "success",
          message: `✓ Task completed: ${task.title}`,
          taskId: task.id,
        });

        // Check if there's a next task to hint about
        const nextTask = this.lesson.tasks.find(
          (t) => !this.completedTaskIds.has(t.id)
        );
        if (nextTask) {
          this.onFeedback({
            type: "info",
            message: `Next: ${nextTask.title}`,
            taskId: nextTask.id,
          });
        } else {
          this.onFeedback({
            type: "success",
            message: "🎉 All tasks completed! Lesson mastered.",
          });
        }
        return;
      }
    }
  }

  /**
   * Called when a query produces an error.
   */
  onQueryError(query: string, error: Error): void {
    const hint = getMentorHint(query, error.message);
    if (hint) {
      this.onFeedback({
        type: "hint",
        message: hint,
      });
    }
  }

  /**
   * Get the current incomplete task (the "active" task).
   */
  getActiveTask(): Task | undefined {
    return this.lesson.tasks.find(
      (t) => !this.completedTaskIds.has(t.id)
    );
  }

  /**
   * Update the set of completed tasks (e.g., when loading from storage).
   */
  updateCompleted(ids: string[]): void {
    this.completedTaskIds = new Set(ids);
  }
}
