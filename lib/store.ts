import { create } from "zustand";
import { toast } from "sonner";
import type {
  Lesson,
  LessonProgress,
  AgentFeedback,
  QueryResult,
  TableInfo,
  StudentUser,
  CloudSyncStatus,
} from "@/types";
import {
  initDatabase,
  resetDatabase,
  executeSQL,
  getTableNames,
  getTableInfo,
  getTableData,
} from "./sql-engine/engine";
import { getLessonBySlug } from "./lessons";
import { validateTask } from "./agents/validator";
import { getMentorHint } from "./agents/mentor";
import { analyzeSQLSafety } from "./sql-engine/safety";
import {
  getSupabaseClient,
  isSupabaseConfigured,
  mapSupabaseUser,
  fetchCloudProgress,
  saveCloudProgress,
  emailToUUID,
} from "./supabase";

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

  // Student Auth & Cloud Sync
  user: StudentUser | null;
  cloudSyncStatus: CloudSyncStatus;
  lastCloudSync: number | null;
  setUser: (user: StudentUser | null) => void;
  initAuth: () => () => void;
  syncWithCloud: () => Promise<void>;

  // Progress (persisted in localStorage and synchronized with cloud)
  progress: Record<string, LessonProgress>;
  rehydrateProgress: () => void;
  completeTask: (lessonSlug: string, taskId: string) => void;
  toggleTask: (lessonSlug: string, taskId: string) => void;
  verifyPendingTasks: () => void;
  isTaskCompleted: (lessonSlug: string, taskId: string) => boolean;
  markLessonComplete: (lessonSlug: string) => void;
  resetLessonProgress: (lessonSlug: string) => void;
  isLessonCompleted: (lessonSlug: string) => boolean;
  getLessonProgress: (lessonSlug: string) => number; // 0-100
  getOverallStats: () => { completedLessons: number; totalTasksDone: number; masteryScore: number };
  saveDrillProgress: (
    lessonSlug: string,
    passedIds: string[],
    codes: Record<string, string>
  ) => void;
  saveCheckpointProgress: (
    examId: string,
    lessonSlug: string,
    passedQuestionIds: string[],
    codes: Record<string, string>,
    completed: boolean
  ) => void;
  saveScenarioProgress: (
    exerciseId: string,
    lessonSlug: string,
    completed: boolean,
    code: string,
    completedRequirements: string[]
  ) => void;
  saveDragBlockProgress: (
    exerciseId: string,
    lessonSlug: string,
    completed: boolean
  ) => void;

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

/**
 * Rehydrate localStorage items from the canonical progress record
 */
function syncProgressToLocalStorage(progress: Record<string, LessonProgress>) {
  if (typeof window === "undefined") return;
  try {
    for (const [slug, p] of Object.entries(progress)) {
      const lesson = getLessonBySlug(slug);
      if (p.isCompleted) {
        localStorage.setItem(`mysql-academy-lesson-completed-${slug}`, "true");
      }
      if (p.completedDrillIds && p.completedDrillIds.length > 0) {
        const isAllDrillsPassed = lesson?.syntaxDrills
          ? p.completedDrillIds.length >= lesson.syntaxDrills.length
          : false;
        localStorage.setItem(
          `mysql-academy-drills-${slug}`,
          JSON.stringify({
            passedIds: p.completedDrillIds,
            codes: p.drillCodes || {},
            completed: isAllDrillsPassed,
          })
        );
      }
      if (lesson?.checkpointExam && p.checkpointPassedIds && p.checkpointPassedIds.length > 0) {
        const isExamPassed = p.checkpointPassedIds.length >= lesson.checkpointExam.questions.length;
        localStorage.setItem(
          `mysql-academy-checkpoint-${lesson.checkpointExam.id}`,
          JSON.stringify({
            passedQuestionIds: p.checkpointPassedIds,
            codes: p.checkpointCodes || {},
            completed: isExamPassed,
          })
        );
      }
      if (lesson?.exercises) {
        lesson.exercises.forEach((ex) => {
          if (
            ex.type === "scenario" &&
            (p.scenarioCompleted ||
              (p.scenarioCompletedRequirements && p.scenarioCompletedRequirements.length > 0))
          ) {
            localStorage.setItem(
              `mysql-academy-scenario-${ex.id}`,
              JSON.stringify({
                completed: p.scenarioCompleted || false,
                completedRequirements: p.scenarioCompletedRequirements || [],
                code: p.scenarioCode || "",
                completedAt: Date.now(),
              })
            );
          } else if (ex.type === "drag-block" && p.dragBlockCompleted) {
            localStorage.setItem(
              `mysql-academy-dragblock-${ex.id}`,
              JSON.stringify({ completed: true })
            );
          }
        });
      }
    }
  } catch {}
}

/**
 * Merge local and cloud progress taking the union of completed tasks and items
 */
function mergeProgress(
  local: Record<string, LessonProgress>,
  cloud: Record<string, LessonProgress>
): Record<string, LessonProgress> {
  const merged: Record<string, LessonProgress> = { ...local };
  for (const [slug, cloudProg] of Object.entries(cloud)) {
    const localProg = merged[slug];
    if (!localProg) {
      merged[slug] = cloudProg;
    } else {
      const combinedTasks = Array.from(
        new Set([
          ...(localProg.completedTaskIds || []),
          ...(cloudProg.completedTaskIds || []),
        ])
      );
      const combinedDrills = Array.from(
        new Set([
          ...(localProg.completedDrillIds || []),
          ...(cloudProg.completedDrillIds || []),
        ])
      );
      const combinedCheckpoints = Array.from(
        new Set([
          ...(localProg.checkpointPassedIds || []),
          ...(cloudProg.checkpointPassedIds || []),
        ])
      );
      const combinedScenarioReqs = Array.from(
        new Set([
          ...(localProg.scenarioCompletedRequirements || []),
          ...(cloudProg.scenarioCompletedRequirements || []),
        ])
      );

      merged[slug] = {
        lessonSlug: slug,
        completedTaskIds: combinedTasks,
        completedDrillIds: combinedDrills,
        drillCodes: {
          ...(cloudProg.drillCodes || {}),
          ...(localProg.drillCodes || {}),
        },
        checkpointPassedIds: combinedCheckpoints,
        checkpointCodes: {
          ...(cloudProg.checkpointCodes || {}),
          ...(localProg.checkpointCodes || {}),
        },
        scenarioCompleted: Boolean(
          localProg.scenarioCompleted || cloudProg.scenarioCompleted
        ),
        scenarioCode: localProg.scenarioCode || cloudProg.scenarioCode,
        scenarioCompletedRequirements: combinedScenarioReqs,
        dragBlockCompleted: Boolean(
          localProg.dragBlockCompleted || cloudProg.dragBlockCompleted
        ),
        isCompleted: Boolean(localProg.isCompleted || cloudProg.isCompleted),
        lastAccessed: Math.max(
          localProg.lastAccessed || 0,
          cloudProg.lastAccessed || 0
        ),
      };
    }
  }
  return merged;
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
        syncProgressToLocalStorage(saved);
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

      // DDL & DML Safety check inspection
      const safety = analyzeSQLSafety(sql);
      safety.warnings.forEach((warn) => {
        get().addFeedback({
          type: "hint",
          message: warn,
        });
        toast.warning(warn, { duration: 6000 });
      });

      // Grader verification
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

            // Attach completed task info to result object so terminal can print it
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
      // Socratic Mentor Hint intercept
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

  // ── Student Auth & Cloud Sync ─────────────────────────────────────────

  user: null,
  cloudSyncStatus: isSupabaseConfigured() ? "offline" : "unconfigured",
  lastCloudSync: null,

  setUser: (user: StudentUser | null) => {
    if (typeof window !== "undefined") {
      try {
        if (user) {
          localStorage.setItem("mysql-academy-student-user", JSON.stringify(user));
        } else {
          localStorage.removeItem("mysql-academy-student-user");
        }
      } catch {}
    }
    set({ user });
  },

  initAuth: () => {
    if (typeof window === "undefined") return () => {};

    // Rehydrate local student user immediately
    try {
      const stored = localStorage.getItem("mysql-academy-student-user");
      if (stored) {
        const student = JSON.parse(stored);
        if (student?.id) {
          // Seamlessly upgrade legacy non-UUID id to valid RFC4122 UUID
          if (student.id.startsWith("student-") && student.email) {
            student.id = emailToUUID(student.email);
            localStorage.setItem("mysql-academy-student-user", JSON.stringify(student));
          }
          set({ user: student });
        }
      }
    } catch {}

    if (!isSupabaseConfigured()) {
      set({ cloudSyncStatus: "unconfigured" });
      return () => {};
    }

    const client = getSupabaseClient();
    if (!client) {
      set({ cloudSyncStatus: "unconfigured" });
      return () => {};
    }

    // Check existing session
    client.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const student = mapSupabaseUser(session.user);
        set({ user: student });
        get().syncWithCloud();
      } else {
        const current = get().user;
        if (current) {
          // Existing student user logged in locally, automatically sync and update DB
          get().syncWithCloud();
        } else {
          set({ user: null, cloudSyncStatus: "offline" });
        }
      }
    });

    // Subscribe to auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const student = mapSupabaseUser(session.user);
        set({ user: student });
        await get().syncWithCloud();
      } else {
        const current = get().user;
        if (current) {
          await get().syncWithCloud();
        } else {
          set({ user: null, cloudSyncStatus: "offline" });
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  },

  syncWithCloud: async () => {
    const user = get().user;
    if (!user || !isSupabaseConfigured()) return;

    set({ cloudSyncStatus: "syncing" });

    try {
      const cloudData = await fetchCloudProgress(user.id);
      const localData = get().progress;

      // Merge local and cloud progress safely
      const merged = mergeProgress(localData, cloudData || {});

      // Persist merged progress locally
      saveProgress(merged);
      syncProgressToLocalStorage(merged);
      set({ progress: merged });

      // Determine opt-in preference
      let optIn = false;
      if (typeof window !== "undefined") {
        try {
          const opt = localStorage.getItem("mysql-academy-leaderboard-opt-in");
          optIn = opt === "true";
        } catch {}
      }

      // Save back to cloud and automatically update database with student's Full Name
      const ok = await saveCloudProgress(user.id, merged, user.email, user.name, optIn);
      if (ok) {
        set({ cloudSyncStatus: "synced", lastCloudSync: Date.now() });
      } else {
        set({ cloudSyncStatus: "error" });
      }
    } catch (e) {
      console.error("[store] syncWithCloud failed:", e);
      set({ cloudSyncStatus: "error" });
    }
  },

  // ── Progress ──────────────────────────────────────────────────────────

  progress: {},

  rehydrateProgress: () => {
    if (typeof window === "undefined") return;
    const saved = loadProgress();
    if (Object.keys(saved).length > 0) {
      syncProgressToLocalStorage(saved);
      set((s) => ({ progress: { ...s.progress, ...saved } }));
    }
  },

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
    const targetLesson = getLessonBySlug(lessonSlug);
    if (targetLesson && updatedProgress[lessonSlug].completedTaskIds.length >= targetLesson.tasks.length && targetLesson.tasks.length > 0) {
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`mysql-academy-lesson-completed-${lessonSlug}`, "true");
        } catch {}
      }
    }
    set({ progress: updatedProgress });

    // Cloud push if logged in
    const user = get().user;
    if (user && isSupabaseConfigured()) {
      set({ cloudSyncStatus: "syncing" });
      saveCloudProgress(user.id, updatedProgress, user.email).then((ok) => {
        if (ok) {
          set({ cloudSyncStatus: "synced", lastCloudSync: Date.now() });
        } else {
          set({ cloudSyncStatus: "error" });
        }
      });
    }
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
    const targetLesson = getLessonBySlug(lessonSlug);
    if (targetLesson && updatedProgress[lessonSlug].completedTaskIds.length >= targetLesson.tasks.length && targetLesson.tasks.length > 0) {
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`mysql-academy-lesson-completed-${lessonSlug}`, "true");
        } catch {}
      }
    }
    set({ progress: updatedProgress });

    if (!isDone) {
      toast.success("Task marked complete");
    }

    // Cloud push if logged in
    const user = get().user;
    if (user && isSupabaseConfigured()) {
      set({ cloudSyncStatus: "syncing" });
      saveCloudProgress(user.id, updatedProgress, user.email).then((ok) => {
        if (ok) {
          set({ cloudSyncStatus: "synced", lastCloudSync: Date.now() });
        } else {
          set({ cloudSyncStatus: "error" });
        }
      });
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

  isLessonCompleted: (lessonSlug: string) => {
    const p = get().progress[lessonSlug];
    if (p?.isCompleted) {
      return true;
    }
    if (typeof window !== "undefined") {
      if (localStorage.getItem(`mysql-academy-lesson-completed-${lessonSlug}`) === "true") {
        return true;
      }
    }
    const lesson = getLessonBySlug(lessonSlug);
    if (!lesson || !p || !p.completedTaskIds || !lesson.tasks || lesson.tasks.length === 0) {
      return false;
    }
    return p.completedTaskIds.length >= lesson.tasks.length;
  },

  markLessonComplete: (lessonSlug: string) => {
    const lesson = getLessonBySlug(lessonSlug);
    if (!lesson) return;
    const allTaskIds = lesson.tasks.map((t) => t.id);
    const allDrillIds = lesson.syntaxDrills?.map((d) => d.id) || [];
    const drillCodes: Record<string, string> = {};
    lesson.syntaxDrills?.forEach((d) => {
      drillCodes[d.id] = d.solutionSQL;
    });
    const allCheckpointIds = lesson.checkpointExam?.questions.map((q) => q.id) || [];
    const checkpointCodes: Record<string, string> = {};
    lesson.checkpointExam?.questions.forEach((q) => {
      checkpointCodes[q.id] = q.solutionSQL || "";
    });
    const scenarioExercise = lesson.exercises?.find((e) => e.type === "scenario") as any;

    const currentProgress = get().progress;
    const updatedProgress = {
      ...currentProgress,
      [lessonSlug]: {
        lessonSlug,
        completedTaskIds: allTaskIds,
        completedDrillIds: allDrillIds,
        drillCodes,
        checkpointPassedIds: allCheckpointIds,
        checkpointCodes,
        scenarioCompleted: Boolean(scenarioExercise),
        scenarioCode: scenarioExercise?.solutionSQL || "",
        scenarioCompletedRequirements: scenarioExercise?.requirements?.map((r: any) => r.id) || [],
        dragBlockCompleted: Boolean(lesson.exercises?.some((e) => e.type === "drag-block")),
        isCompleted: true,
        lastAccessed: Date.now(),
      },
    };
    saveProgress(updatedProgress);
    syncProgressToLocalStorage(updatedProgress);

    if (typeof window !== "undefined" && lesson.intuitionCheck) {
      try {
        localStorage.setItem(
          `mysql-academy-intuition-${lessonSlug}`,
          JSON.stringify({ selectedOption: lesson.intuitionCheck.correctIndex })
        );
      } catch {}
    }

    set({ progress: updatedProgress });
    toast.success("Lesson marked complete! All items pre-filled.");

    // Cloud push if logged in
    const user = get().user;
    if (user && isSupabaseConfigured()) {
      set({ cloudSyncStatus: "syncing" });
      saveCloudProgress(user.id, updatedProgress, user.email).then((ok) => {
        if (ok) {
          set({ cloudSyncStatus: "synced", lastCloudSync: Date.now() });
        } else {
          set({ cloudSyncStatus: "error" });
        }
      });
    }
  },

  resetLessonProgress: (lessonSlug: string) => {
    const currentProgress = get().progress;
    const updatedProgress = {
      ...currentProgress,
      [lessonSlug]: {
        lessonSlug,
        completedTaskIds: [],
        completedDrillIds: [],
        drillCodes: {},
        checkpointPassedIds: [],
        checkpointCodes: {},
        scenarioCompleted: false,
        scenarioCode: "",
        scenarioCompletedRequirements: [],
        dragBlockCompleted: false,
        isCompleted: false,
        lastAccessed: Date.now(),
      },
    };
    saveProgress(updatedProgress);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(`mysql-academy-lesson-completed-${lessonSlug}`);
        localStorage.removeItem(`mysql-academy-intuition-${lessonSlug}`);
        const lesson = getLessonBySlug(lessonSlug);
        lesson?.exercises?.forEach((ex) => {
          localStorage.removeItem(`mysql-academy-scenario-${ex.id}`);
          localStorage.removeItem(`mysql-academy-scenario-reset-${ex.id}`);
          localStorage.removeItem(`mysql-academy-dragblock-${ex.id}`);
          localStorage.removeItem(`mysql-academy-dragblock-reset-${ex.id}`);
        });
        if (lesson?.checkpointExam) {
          localStorage.removeItem(`mysql-academy-checkpoint-${lesson.checkpointExam.id}`);
          localStorage.removeItem(`mysql-academy-checkpoint-reset-${lesson.checkpointExam.id}`);
        }
        localStorage.removeItem(`mysql-academy-drills-${lessonSlug}`);
        localStorage.removeItem(`mysql-academy-drills-reset-${lessonSlug}`);
      } catch {}
    }
    set({ progress: updatedProgress });
    toast.info("Lesson reset to initial state.");

    // Cloud push if logged in
    const user = get().user;
    if (user && isSupabaseConfigured()) {
      set({ cloudSyncStatus: "syncing" });
      saveCloudProgress(user.id, updatedProgress, user.email).then((ok) => {
        if (ok) {
          set({ cloudSyncStatus: "synced", lastCloudSync: Date.now() });
        } else {
          set({ cloudSyncStatus: "error" });
        }
      });
    }
  },

  saveDrillProgress: (lessonSlug: string, passedIds: string[], codes: Record<string, string>) => {
    const currentProgress = get().progress;
    const currentLessonProg = currentProgress[lessonSlug] || {
      lessonSlug,
      completedTaskIds: [],
      lastAccessed: Date.now(),
    };

    const targetLesson = getLessonBySlug(lessonSlug);
    const allDrillsPassed =
      targetLesson?.syntaxDrills && targetLesson.syntaxDrills.length > 0
        ? passedIds.length >= targetLesson.syntaxDrills.length
        : false;

    const updatedProgress = {
      ...currentProgress,
      [lessonSlug]: {
        ...currentLessonProg,
        completedDrillIds: passedIds,
        drillCodes: codes,
        lastAccessed: Date.now(),
      },
    };

    saveProgress(updatedProgress);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          `mysql-academy-drills-${lessonSlug}`,
          JSON.stringify({
            passedIds,
            codes,
            completed: allDrillsPassed,
          })
        );
      } catch {}
    }

    set({ progress: updatedProgress });

    // Cloud push if logged in
    const user = get().user;
    if (user && isSupabaseConfigured()) {
      set({ cloudSyncStatus: "syncing" });
      saveCloudProgress(user.id, updatedProgress, user.email).then((ok) => {
        if (ok) {
          set({ cloudSyncStatus: "synced", lastCloudSync: Date.now() });
        } else {
          set({ cloudSyncStatus: "error" });
        }
      });
    }
  },

  saveCheckpointProgress: (
    examId: string,
    lessonSlug: string,
    passedQuestionIds: string[],
    codes: Record<string, string>,
    completed: boolean
  ) => {
    const currentProgress = get().progress;
    const currentLessonProg = currentProgress[lessonSlug] || {
      lessonSlug,
      completedTaskIds: [],
      lastAccessed: Date.now(),
    };

    const updatedProgress = {
      ...currentProgress,
      [lessonSlug]: {
        ...currentLessonProg,
        checkpointPassedIds: passedQuestionIds,
        checkpointCodes: codes,
        lastAccessed: Date.now(),
      },
    };

    saveProgress(updatedProgress);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          `mysql-academy-checkpoint-${examId}`,
          JSON.stringify({
            passedQuestionIds,
            codes,
            completed,
          })
        );
      } catch {}
    }

    set({ progress: updatedProgress });

    // Cloud push if logged in
    const user = get().user;
    if (user && isSupabaseConfigured()) {
      set({ cloudSyncStatus: "syncing" });
      saveCloudProgress(user.id, updatedProgress, user.email).then((ok) => {
        if (ok) {
          set({ cloudSyncStatus: "synced", lastCloudSync: Date.now() });
        } else {
          set({ cloudSyncStatus: "error" });
        }
      });
    }
  },

  saveScenarioProgress: (
    exerciseId: string,
    lessonSlug: string,
    completed: boolean,
    code: string,
    completedRequirements: string[]
  ) => {
    const currentProgress = get().progress;
    const currentLessonProg = currentProgress[lessonSlug] || {
      lessonSlug,
      completedTaskIds: [],
      lastAccessed: Date.now(),
    };

    const updatedProgress = {
      ...currentProgress,
      [lessonSlug]: {
        ...currentLessonProg,
        scenarioCompleted: completed,
        scenarioCode: code,
        scenarioCompletedRequirements: completedRequirements,
        lastAccessed: Date.now(),
      },
    };

    saveProgress(updatedProgress);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          `mysql-academy-scenario-${exerciseId}`,
          JSON.stringify({
            completed,
            completedRequirements,
            code,
            completedAt: Date.now(),
          })
        );
      } catch {}
    }

    set({ progress: updatedProgress });

    // Cloud push if logged in
    const user = get().user;
    if (user && isSupabaseConfigured()) {
      set({ cloudSyncStatus: "syncing" });
      saveCloudProgress(user.id, updatedProgress, user.email).then((ok) => {
        if (ok) {
          set({ cloudSyncStatus: "synced", lastCloudSync: Date.now() });
        } else {
          set({ cloudSyncStatus: "error" });
        }
      });
    }
  },

  saveDragBlockProgress: (
    exerciseId: string,
    lessonSlug: string,
    completed: boolean
  ) => {
    const currentProgress = get().progress;
    const currentLessonProg = currentProgress[lessonSlug] || {
      lessonSlug,
      completedTaskIds: [],
      lastAccessed: Date.now(),
    };

    const updatedProgress = {
      ...currentProgress,
      [lessonSlug]: {
        ...currentLessonProg,
        dragBlockCompleted: completed,
        lastAccessed: Date.now(),
      },
    };

    saveProgress(updatedProgress);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          `mysql-academy-dragblock-${exerciseId}`,
          JSON.stringify({ completed })
        );
      } catch {}
    }

    set({ progress: updatedProgress });

    // Cloud push if logged in
    const user = get().user;
    if (user && isSupabaseConfigured()) {
      set({ cloudSyncStatus: "syncing" });
      saveCloudProgress(user.id, updatedProgress, user.email).then((ok) => {
        if (ok) {
          set({ cloudSyncStatus: "synced", lastCloudSync: Date.now() });
        } else {
          set({ cloudSyncStatus: "error" });
        }
      });
    }
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
