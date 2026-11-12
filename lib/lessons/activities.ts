import type { Lesson, LessonProgress } from "@/types";

export interface LessonSubcategoryItem {
  id: "concept" | "intuition" | "scenario" | "drills" | "checkpoint" | "lab";
  label: string;
  iconName: "BookOpen" | "Sparkles" | "Layers" | "Zap" | "Award" | "Terminal";
  hash: string;
  done: boolean;
  total: number;
  completed: number;
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

  // 3. Scenario Blueprint Exercise(s)
  if (lesson.exercises && lesson.exercises.length > 0) {
    const totalExercises = lesson.exercises.length;
    totalActivities += totalExercises;

    let completedExCount = 0;
    lesson.exercises.forEach((ex) => {
      if (ex.type === "scenario" && p?.scenarioCompleted) {
        completedExCount += 1;
      } else if (ex.type === "drag-block" && p?.dragBlockCompleted) {
        completedExCount += 1;
      }
    });

    completedActivities += completedExCount;
    subcategories.push({
      id: "scenario",
      label: "Scenario Blueprint",
      iconName: "Layers",
      hash: "scenario-blueprint",
      done: completedExCount >= totalExercises,
      total: totalExercises,
      completed: completedExCount,
    });
  }

  // 4. Situational Syntax Drills
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

  // 5. Final Lesson Checkpoint Exam
  if (lesson.checkpointExam && lesson.checkpointExam.questions.length > 0) {
    const totalQuestions = lesson.checkpointExam.questions.length;
    totalActivities += totalQuestions;

    const passedIds = p?.checkpointPassedIds || [];
    const passedQuestionsCount = lesson.checkpointExam.questions.filter((q) =>
      passedIds.includes(q.id)
    ).length;

    completedActivities += passedQuestionsCount;
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

  // 6. Interactive Lab Tasks
  if (lesson.tasks && lesson.tasks.length > 0) {
    const totalTasks = lesson.tasks.length;
    totalActivities += totalTasks;

    const completedTaskIds = p?.completedTaskIds || [];
    const doneTasksCount = lesson.tasks.filter((t) =>
      completedTaskIds.includes(t.id)
    ).length;

    completedActivities += doneTasksCount;
    subcategories.push({
      id: "lab",
      label: "Interactive SQL Lab",
      iconName: "Terminal",
      hash: "interactive-lab",
      done: doneTasksCount >= totalTasks,
      total: totalTasks,
      completed: doneTasksCount,
    });
  }

  // If there are no activities in this lesson, default to completed
  const isCompleted =
    Boolean(p?.isCompleted) ||
    (totalActivities > 0 && completedActivities >= totalActivities);

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
