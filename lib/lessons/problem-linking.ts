/**
 * Shared mapping and canonical deduplication between Checkpoint Exam questions
 * and Interactive Terminal Lab tasks.
 *
 * When the problem in the Final Checkpoint Exam and the Interactive Lab Task
 * is the same problem, they share the same canonical problem identity so they are
 * counted as one pointing (35 pts per unique problem) rather than double-awarded.
 */

export const CHECKPOINT_TO_TASK_MAP: Record<string, string> = {
  // Foundations
  "cp-cd-1": "cd-1",
  "cp-cd-2": "cd-2",
  "cp-ct-1": "ct-1",
  "cp-ct-2": "ct-3", // cp-ct-2 is DESCRIBE courses; -> ct-3 is DESCRIBE courses;
  "cp-dt-1": "dt-1",
  "cp-dt-2": "dt-3", // cp-dt-2 is DESCRIBE professors; -> dt-3 is DESCRIBE professors;

  // CRUD
  "cp-id-1": "id-1",
  "cp-id-2": "id-2",
  "cp-sb-1": "sb-1",
  "cp-sb-2": "sb-2",
  "cp-wc-1": "wc-1",
  "cp-wc-2": "wc-2",
  "cp-ud-1": "ud-1",
  "cp-ud-2": "ud-2",

  // Aggregations
  "cp-af-1": "af-1",
  "cp-gh-1": "gh-1",
  "cp-gh-2": "gh-2",

  // Joins
  "cp-ij-1": "ij-1",
  "cp-ij-2": "ij-2",
  "cp-lr-1": "lr-1",
  "cp-sq-1": "sq-1",

  // Schema Evolution
  "cp-at-1": "at-1",
  "cp-at-2": "at-2",
  "cp-cn-1": "cn-1",

  // Transactions
  "cp-tx-1": "tx-1",
  "cp-ix-1": "ix-1",
  "cp-ix-2": "ix-2",
};

export const TASK_TO_CHECKPOINT_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(CHECKPOINT_TO_TASK_MAP).map(([cpId, taskId]) => [taskId, cpId])
);

/**
 * Returns the canonical problem identifier for a task or checkpoint question ID.
 * Example: 'cp-cd-1' -> 'cd-1', 'cd-1' -> 'cd-1', 'cp-ct-2' -> 'ct-3'.
 */
export function getCanonicalProblemId(id: string): string {
  if (CHECKPOINT_TO_TASK_MAP[id]) {
    return CHECKPOINT_TO_TASK_MAP[id];
  }
  if (id.startsWith("cp-")) {
    return id.replace(/^cp-/, "");
  }
  return id;
}

/**
 * Returns whether a checkpoint question and a lab task represent the same SQL problem.
 */
export function areProblemsEquivalent(id1: string, id2: string): boolean {
  return getCanonicalProblemId(id1) === getCanonicalProblemId(id2);
}
