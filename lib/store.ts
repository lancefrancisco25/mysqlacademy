import { create } from "zustand";
import { toast } from "sonner";
import type {
  Lesson,
  LessonProgress,
  AgentFeedback,
  QueryResult,
  TableInfo,
} from "@/types";
import {
  initDatabase,
  resetDatabase,
  executeSQL,
  getTableNames,
  getTableInfo,
  getTableData,
} from "./sql-engine/engine";
import { validateTask } from "./agents/validator";
import { getMentorHint } from "./agents/mentor";

// ── Types ──────────────────────────────────────────────────────────────────

interface LessonState {
  // Database
  dbReady: boolean;
  initDB: (seedSQL?: string) => Promise<void>;
  resetDB: (seedSQL?: string) => Promise<void>;
  executeQuery: (sql: string) => QueryResult | null;

  // Lesson
  currentLesson: Lesson | null;
  setCurrentLesson: (lesson: Lesson) => void;

  // Progress (persisted in localStorage)
  progress: Record<string, LessonProgress>;
  completeTask: (lessonSlug: string, taskId: string) => void;
  toggleTask: (lessonSlug: string, taskId: string) => void;
  verifyPendingTasks: () => void;
  isTaskCompleted: (lessonSlug: string, taskId: string) => boolean;
  getLessonProgress: (lessonSlug: string) => number; // 0-100
  getOverallStats: () => { completedLessons: number; totalTasksDone: number; masteryScore: number };

  // Agent feedback
  feedback: AgentFeedback[];
  addFeedback: (fb: AgentFeedback) => void;
  clearFeedback: () => void;

  // Schema inspector
  tables: TableInfo[];
  refreshSchema: () => void;
  getTableRows: (tableName: string) => QueryResult | null;
}

// ── Helper to load/save progress from localStorage ─────────────────────────

function loadProgress(): Record<string, LessonProgress> {
  if (typeof window === "undefined") return {};
  try {
    const data = localStorage.getItem("mysql-academy-progress");
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveProgress(progress: Record<string, LessonProgress>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("mysql-academy-progress", JSON.stringify(progress));
  } catch {
    // localStorage unavailable
  }
}

// ── Store ──────────────────────────────────────────────────────────────────

export const useLessonStore = create<LessonState>((set, get) => ({
  // ── Database ──────────────────────────────────────────────────────────

  dbReady: false,

  initDB: async (seedSQL?: string) => {
    set({ dbReady: false });
    // Rehydrate progress from localStorage on client
    if (typeof window !== "undefined") {
      const saved = loadProgress();
      if (Object.keys(saved).length > 0) {
        set({ progress: saved });
      }
    }
    try {
      await initDatabase(seedSQL);
      set({ dbReady: true });
      get().refreshSchema();
    } catch (err: any) {
      set({ dbReady: false });
      console.error("[store] initDB failed:", err);
      toast.error(`Database engine initialization error: ${err.message}`);
      throw err;
    }
  },

  resetDB: async (seedSQL?: string) => {
    set({ dbReady: false });
    try {
      await resetDatabase(seedSQL);
      set({ dbReady: true });
      get().refreshSchema();
      get().addFeedback({
        type: "info",
        message: "Database state restored to initial lesson baseline.",
      });
      toast.info("Database reset to lesson initial state");
    } catch (err: any) {
      set({ dbReady: false });
      console.error("[store] resetDB failed:", err);
      toast.error(`Database reset failed: ${err.message}`);
      throw err;
    }
  },

  executeQuery: (sql: string) => {
    try {
      let result = executeSQL(sql);
      // Refresh schema after query execution
      get().refreshSchema();

      // Autonomous Pedagogical Grader Agent verification
      const lesson = get().currentLesson;
      if (lesson && lesson.tasks) {
        for (const task of lesson.tasks) {
          if (get().isTaskCompleted(lesson.slug, task.id)) continue;

          const validation = validateTask(task, sql, result);
          if (validation.passed) {
            get().completeTask(lesson.slug, task.id);
            const feedbackMsg = `✓ Task Completed: ${task.title}`;
            get().addFeedback({
              type: "success",
              message: feedbackMsg,
              taskId: task.id,
            });
            toast.success(feedbackMsg);

            // Announce next task if available
            const updatedProg = get().progress[lesson.slug]?.completedTaskIds || [];
            const nextTask = lesson.tasks.find((t) => !updatedProg.includes(t.id));

            // Attach completed task info to result object so the terminal can print it
            if (!result) {
              result = {
                columns: ["status"],
                values: [["Query OK"]],
              };
            }
            (result as any).newlyCompletedTask = task;
            if (nextTask) {
              (result as any).nextTask = nextTask;
              get().addFeedback({
                type: "info",
                message: `Next Objective: ${nextTask.title}`,
                taskId: nextTask.id,
              });
            } else {
              get().addFeedback({
                type: "success",
                message: `🏆 All tasks completed for ${lesson.title}! Ready for next challenge.`,
              });
              toast.success("Lesson mastered! Great job!");
            }
            break;
          }
        }
      }

      return result;
    } catch (err: any) {
      // Autonomous Socratic Mentor Agent intercept
      const hint = getMentorHint(sql, err.message || "Unknown error");
      if (hint) {
        get().addFeedback({
          type: "hint",
          message: hint,
        });
      }
      throw err;
    }
  },

  // ── Lesson ────────────────────────────────────────────────────────────

  currentLesson: null,

  setCurrentLesson: (lesson: Lesson) => {
    set({ currentLesson: lesson });
  },

  // ── Progress ──────────────────────────────────────────────────────────

  progress: loadProgress(),

  completeTask: (lessonSlug: string, taskId: string) => {
    const currentProgress = get().progress;
    const currentLessonProg = currentProgress[lessonSlug] || {
      lessonSlug,
      completedTaskIds: [],
      lastAccessed: Date.now(),
    };

    if (currentLessonProg.completedTaskIds.includes(taskId)) {
      return;
    }

    const updatedProgress = {
      ...currentProgress,
      [lessonSlug]: {
        ...currentLessonProg,
        completedTaskIds: [...currentLessonProg.completedTaskIds, taskId],
        lastAccessed: Date.now(),
      },
    };

    saveProgress(updatedProgress);
    set({ progress: updatedProgress });
  },

  toggleTask: (lessonSlug: string, taskId: string) => {
    const currentProgress = get().progress;
    const currentLessonProg = currentProgress[lessonSlug] || {
      lessonSlug,
      completedTaskIds: [],
      lastAccessed: Date.now(),
    };

    const isDone = currentLessonProg.completedTaskIds.includes(taskId);
    const updatedTaskIds = isDone
      ? currentLessonProg.completedTaskIds.filter((id) => id !== taskId)
      : [...currentLessonProg.completedTaskIds, taskId];

    const updatedProgress = {
      ...currentProgress,
      [lessonSlug]: {
        ...currentLessonProg,
        completedTaskIds: updatedTaskIds,
        lastAccessed: Date.now(),
      },
    };

    saveProgress(updatedProgress);
    set({ progress: updatedProgress });

    if (!isDone) {
      toast.success("Task marked complete");
    }
  },

  verifyPendingTasks: () => {
    const lesson = get().currentLesson;
    if (!lesson || !lesson.tasks) return;

    let newlyDone = 0;
    for (const task of lesson.tasks) {
      if (get().isTaskCompleted(lesson.slug, task.id)) continue;
      const validation = validateTask(task, "", null);
      if (validation.passed) {
        get().completeTask(lesson.slug, task.id);
        newlyDone++;
        toast.success(`✓ Task Verified: ${task.title}`);
      }
    }
    if (newlyDone === 0) {
      toast.info("Database state checked. No pending tasks met verification criteria yet.");
    }
  },

  isTaskCompleted: (lessonSlug: string, taskId: string) => {
    const p = get().progress[lessonSlug];
    return p ? p.completedTaskIds.includes(taskId) : false;
  },

  getLessonProgress: (lessonSlug: string) => {
    const lesson = get().currentLesson;
    const p = get().progress[lessonSlug];
    if (!lesson || !p || !lesson.tasks || lesson.tasks.length === 0) return 0;
    return Math.round((p.completedTaskIds.length / lesson.tasks.length) * 100);
  },

  getOverallStats: () => {
    const progress = get().progress;
    const slugs = Object.keys(progress);
    let totalTasksDone = 0;
    let completedLessons = 0;

    slugs.forEach((slug) => {
      const p = progress[slug];
      if (p && p.completedTaskIds) {
        totalTasksDone += p.completedTaskIds.length;
        if (p.completedTaskIds.length >= 2) {
          completedLessons += 1;
        }
      }
    });

    const masteryScore = Math.min(100, Math.round(totalTasksDone * 5.5));
    return { completedLessons, totalTasksDone, masteryScore };
  },

  // ── Agent Feedback ────────────────────────────────────────────────────

  feedback: [],

  addFeedback: (fb: AgentFeedback) => {
    set((s) => ({ feedback: [...s.feedback, fb] }));
  },

  clearFeedback: () => set({ feedback: [] }),

  // ── Schema ────────────────────────────────────────────────────────────

  tables: [],

  refreshSchema: () => {
    try {
      const names = getTableNames();
      const tables: TableInfo[] = names.map((name) => {
        const info = getTableInfo(name);
        const data = getTableData(name);
        return {
          name,
          columns: info
            ? info.values.map((row) => ({
                cid: row[0] as number,
                name: row[1] as string,
                type: (row[2] as string) || "TEXT",
                notnull: row[3] as number,
                dflt_value: row[4] as string | null,
                pk: row[5] as number,
              }))
            : [],
          rowCount: data ? data.values.length : 0,
        };
      });
      set({ tables });
    } catch (e) {
      // Ignored if db not yet ready
    }
  },

  getTableRows: (tableName: string) => {
    return getTableData(tableName);
  },
}));
