import type { Lesson, LessonProgress } from "@/types";
import {
  CHECKPOINT_TO_TASK_MAP,
  TASK_TO_CHECKPOINT_MAP,
  getCanonicalProblemId,
} from "./problem-linking";

export interface LessonSubcategoryItem {
  id: "concept" | "intuition" | "builder" | "scenario" | "drills" | "checkpoint" | "lab";
  label: string;
  iconName: "BookOpen" | "Sparkles" | "Code2" | "Building2" | "Zap" | "Award" | "Terminal";
  hash: string;
  done: boolean;
  total: number;
  completed: number;
  isUnderCheckpoint?: boolean;
}

export interface LessonActivityStats {
  totalActivities: number;
  completedActivities: number;
  percent: number;
  isCompleted: boolean;
  subcategories: LessonSubcategoryItem[];
}

/**
 * Checks whether an intuition check was answered either in the progress store or local storage.
 */
export function isIntuitionCheckDone(
  lessonSlug: string,
  progressRecord?: LessonProgress
): boolean {
  if (progressRecord?.intuitionCompleted) {
    return true;
  }
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(`mysql-academy-intuition-${lessonSlug}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed.selectedOption === "number") {
          return true;
        }
      }
    } catch {}
  }
  return false;
}

/**
 * Computes all subcategories and required activity completion stats for a lesson.
 * All activities in the module are required to achieve 100% completion.
 */
export function getLessonActivityStats(
  lesson: Lesson,
  progressRecord?: LessonProgress
): LessonActivityStats {
  const p = progressRecord;
  const subcategories: LessonSubcategoryItem[] = [];

  let totalActivities = 0;
  let completedActivities = 0;

  // 1. Concept Primer (Always present)
  subcategories.push({
    id: "concept",
    label: "Concept Primer",
    iconName: "BookOpen",
    hash: "concept-primer",
    done: true,
    total: 1,
    completed: 1,
  });

  // 2. Quick Intuition Check
  if (lesson.intuitionCheck) {
    totalActivities += 1;
    const intuitionDone = isIntuitionCheckDone(lesson.slug, p);
    if (intuitionDone) {
      completedActivities += 1;
    }
    subcategories.push({
      id: "intuition",
      label: "Quick Intuition",
      iconName: "Sparkles",
      hash: "intuition-check",
      done: intuitionDone,
      total: 1,
      completed: intuitionDone ? 1 : 0,
    });
  }

  // 3. Interactive Builder (Drag-and-Drop clause assembler)
  const dragExercises = lesson.exercises?.filter((ex) => ex.type === "drag-block") || [];
  if (dragExercises.length > 0) {
    totalActivities += dragExercises.length;
    const isDone = Boolean(p?.dragBlockCompleted);
    if (isDone) {
      completedActivities += dragExercises.length;
    }
    subcategories.push({
      id: "builder",
      label: "Interactive Builder",
      iconName: "Code2",
      hash: "interactive-builder",
      done: isDone,
      total: dragExercises.length,
      completed: isDone ? dragExercises.length : 0,
    });
  }

  // 4. Scenario Blueprint (Real-world schema challenge)
  const scenarioExercises = lesson.exercises?.filter((ex) => ex.type === "scenario") || [];
  if (scenarioExercises.length > 0) {
    totalActivities += scenarioExercises.length;
    const isDone = Boolean(p?.scenarioCompleted);
    if (isDone) {
      completedActivities += scenarioExercises.length;
    }
    subcategories.push({
      id: "scenario",
      label: "Scenario Blueprint",
      iconName: "Building2",
      hash: "scenario-blueprint",
      done: isDone,
      total: scenarioExercises.length,
      completed: isDone ? scenarioExercises.length : 0,
    });
  }

  // 5. Situational Syntax Drills
  if (lesson.syntaxDrills && lesson.syntaxDrills.length > 0) {
    const totalDrills = lesson.syntaxDrills.length;
    totalActivities += totalDrills;

    const completedDrillIds = p?.completedDrillIds || [];
    const passedDrillsCount = lesson.syntaxDrills.filter((d) =>
      completedDrillIds.includes(d.id)
    ).length;

    completedActivities += passedDrillsCount;
    subcategories.push({
      id: "drills",
      label: "Syntax Speed Drills",
      iconName: "Zap",
      hash: "syntax-speed-drills",
      done: passedDrillsCount >= totalDrills,
      total: totalDrills,
      completed: passedDrillsCount,
    });
  }

  // 6 & 7. Final Lesson Checkpoint Exam & Interactive Lab Tasks
  // When a problem in the Final Checkpoint and Interactive Lab activity is the same,
  // deduplicate them and count them as one canonical problem in total/completed activities.
  const uniqueSQLProblems = new Set<string>();
  const completedSQLProblems = new Set<string>();

  const passedCheckpointIds = p?.checkpointPassedIds || [];
  const completedTaskIds = p?.completedTaskIds || [];

  if (lesson.checkpointExam && lesson.checkpointExam.questions.length > 0) {
    for (const q of lesson.checkpointExam.questions) {
      const canonical = getCanonicalProblemId(q.id);
      uniqueSQLProblems.add(canonical);
      const isPassed =
        passedCheckpointIds.includes(q.id) ||
        (CHECKPOINT_TO_TASK_MAP[q.id] && completedTaskIds.includes(CHECKPOINT_TO_TASK_MAP[q.id]));
      if (isPassed) {
        completedSQLProblems.add(canonical);
      }
    }
  }

  if (lesson.tasks && lesson.tasks.length > 0) {
    for (const t of lesson.tasks) {
      const canonical = getCanonicalProblemId(t.id);
      uniqueSQLProblems.add(canonical);
      const isDone =
        completedTaskIds.includes(t.id) ||
        (TASK_TO_CHECKPOINT_MAP[t.id] && passedCheckpointIds.includes(TASK_TO_CHECKPOINT_MAP[t.id]));
      if (isDone) {
        completedSQLProblems.add(canonical);
      }
    }
  }

  // Count unique SQL problems in module total/completed activities
  totalActivities += uniqueSQLProblems.size;
  completedActivities += completedSQLProblems.size;

  // Subcategories in sidebar:
  // 6. Final Lesson Checkpoint Exam
  if (lesson.checkpointExam && lesson.checkpointExam.questions.length > 0) {
    const totalQuestions = lesson.checkpointExam.questions.length;
    const passedQuestionsCount = lesson.checkpointExam.questions.filter((q) =>
      passedCheckpointIds.includes(q.id) ||
      (CHECKPOINT_TO_TASK_MAP[q.id] && completedTaskIds.includes(CHECKPOINT_TO_TASK_MAP[q.id]))
    ).length;

    subcategories.push({
      id: "checkpoint",
      label: "Final Checkpoint",
      iconName: "Award",
      hash: "final-lesson-checkpoint",
      done: passedQuestionsCount >= totalQuestions,
      total: totalQuestions,
      completed: passedQuestionsCount,
    });
  }

  // 7. Interactive SQL Lab (nested under Final Checkpoint in sidebar)
  if (lesson.tasks && lesson.tasks.length > 0) {
    const totalTasks = lesson.tasks.length;
    const doneTasksCount = lesson.tasks.filter((t) =>
      completedTaskIds.includes(t.id) ||
      (TASK_TO_CHECKPOINT_MAP[t.id] && passedCheckpointIds.includes(TASK_TO_CHECKPOINT_MAP[t.id]))
    ).length;

    subcategories.push({
      id: "lab",
      label: "Interactive SQL Lab",
      iconName: "Terminal",
      hash: "interactive-lab",
      done: doneTasksCount >= totalTasks,
      total: totalTasks,
      completed: doneTasksCount,
      isUnderCheckpoint: true,
    });
  }

  // A lesson is strictly completed ONLY when all activities in the module are 100% completed
  const isCompleted =
    totalActivities > 0 ? completedActivities >= totalActivities : true;

  const percent =
    totalActivities > 0
      ? Math.min(100, Math.round((completedActivities / totalActivities) * 100))
      : 100;

  return {
    totalActivities,
    completedActivities,
    percent,
    isCompleted,
    subcategories,
  };
}
