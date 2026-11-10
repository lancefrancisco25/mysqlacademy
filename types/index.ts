// ─── Shared TypeScript Types ───────────────────────────────────────────────

export type Track =
  | "foundations"
  | "crud"
  | "aggregations"
  | "joins"
  | "schema-evolution"
  | "transactions";

// ─── Lesson ────────────────────────────────────────────────────────────────

export interface LessonSection {
  heading: string;
  body: string;
  code?: string;
}

export interface ValidationRule {
  type:
    | "table_exists"
    | "column_exists"
    | "row_count"
    | "row_count_gte"
    | "value_check"
    | "query_result"
    | "table_not_exists"
    | "custom";
  /** Table to inspect */
  table?: string;
  /** Column name to check for existence */
  column?: string;
  /** Exact expected row count */
  expectedCount?: number;
  /** SQL query to run for verification */
  query?: string;
  /** Expected rows from the verification query */
  expectedResult?: (string | number | null)[][];
  /** Description of what this validation checks (shown on failure) */
  description?: string;
  /** Regex pattern the student's executed query must match */
  queryPattern?: string | RegExp;
  /** Required column names in the query result */
  expectedColumns?: string[];
  /** Minimum returned rows from student query */
  minReturnedRows?: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  hint?: string;
  validation: ValidationRule;
}

export interface RealWorldAnalogy {
  title: string;
  story: string;
  takeaway: string;
  icon?: string;
}

export interface Mnemonic {
  phrase: string;
  breakdown: { letter: string; word: string; meaning: string }[];
  whyItMatters: string;
}

export interface PatternRule {
  trigger: string;
  solution: string;
  example: string;
}

export interface IntuitionCheck {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// ─── Interactive Exercises ────────────────────────────────────────────────

export interface DragBlock {
  id: string;
  text: string;
}

export interface DragBlockExercise {
  type: "drag-block";
  id: string;
  title: string;
  instructions: string;
  scenarioContext?: string;
  blocks: DragBlock[];
  solution: string[];
  hint?: string;
  explanation: string;
}

export interface ScenarioRequirement {
  id: string;
  text: string;
  hint?: string;
  validationRule?: ValidationRule;
  syntaxPattern?: string | RegExp;
}

export interface ScenarioExercise {
  type: "scenario";
  id: string;
  title: string;
  companyOrContext: string;
  problemStatement: string;
  previewTable?: {
    tableName?: string;
    description?: string;
    columns: string[];
    rows: (string | number | null)[][];
  };
  requirements: ScenarioRequirement[];
  schemaSetupSQL?: string;
  starterSQL?: string;
  solutionSQL: string;
  solutionExplanation: string;
}

export type LessonExercise = DragBlockExercise | ScenarioExercise;

// ─── Situational Syntax Drills ────────────────────────────────────────────

export interface SyntaxDrillItem {
  id: string;
  title: string;
  scenario: string; // short situational context
  instruction: string; // concise syntax task
  starterSQL?: string;
  solutionSQL: string;
  hint: string;
  syntaxPattern?: RegExp | string;
  validationQuery?: string;
  expectedResult?: (string | number | null)[][];
  categoryTag?: string; // e.g. "Special Operators", "Wildcards", "Aliases", "Views", "Set Operations"
}

// ─── Checkpoint Exam ──────────────────────────────────────────────────────

export interface CheckpointQuestion {
  id: string;
  title: string;
  prompt: string;
  hint?: string;
  starterSQL?: string;
  solutionSQL?: string;
  validation: ValidationRule;
}

export interface CheckpointExam {
  id: string;
  title: string;
  subtitle?: string;
  scenarioContext: string;
  passingScoreDescription?: string;
  questions: CheckpointQuestion[];
}

export interface Lesson {
  slug: string;
  title: string;
  track: Track;
  trackIndex: number;
  description: string;
  content: LessonSection[];
  seedSQL: string;
  tasks: Task[];
  analogy?: RealWorldAnalogy;
  mnemonic?: Mnemonic;
  patterns?: PatternRule[];
  proTips?: string[];
  gotchas?: string[];
  diagramType?: "pipeline" | "join" | "relations" | "btree" | "transactions";
  intuitionCheck?: IntuitionCheck;
  exercises?: LessonExercise[];
  syntaxDrills?: SyntaxDrillItem[];
  checkpointExam?: CheckpointExam;
  finalObjective?: {
    title: string;
    description: string;
    expectedOutput?: string;
    expectedColumns?: string[];
    expectedResult?: (string | number | null)[][];
  };
}

// ─── Terminal ──────────────────────────────────────────────────────────────

export type TerminalEntryType =
  | "input"
  | "output"
  | "error"
  | "system"
  | "success"
  | "hint";

export interface TerminalHistoryEntry {
  type: TerminalEntryType;
  content: string;
}

// ─── Query Results ─────────────────────────────────────────────────────────

export interface QueryResult {
  columns: string[];
  values: (string | number | null)[][];
}

// ─── Agent Feedback ────────────────────────────────────────────────────────

export interface AgentFeedback {
  type: "success" | "error" | "hint" | "info";
  message: string;
  taskId?: string;
}

// ─── Progress ──────────────────────────────────────────────────────────────

export interface LessonProgress {
  lessonSlug: string;
  completedTaskIds: string[];
  lastAccessed: number;
  /** Overall lesson completion flag */
  isCompleted?: boolean;
  /** IDs of passed situational syntax drills */
  completedDrillIds?: string[];
  /** Saved user code per syntax drill ID */
  drillCodes?: Record<string, string>;
  /** IDs of passed checkpoint exam questions */
  checkpointPassedIds?: string[];
  /** Saved user code per checkpoint question ID */
  checkpointCodes?: Record<string, string>;
  /** Whether the scenario exercise was completed */
  scenarioCompleted?: boolean;
  /** Saved user code for the scenario exercise */
  scenarioCode?: string;
  /** IDs of satisfied scenario requirements */
  scenarioCompletedRequirements?: string[];
  /** Whether the drag block exercise was completed */
  dragBlockCompleted?: boolean;
}

// ─── Student Authentication & Cloud Sync ───────────────────────────────────

export interface StudentUser {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
}

export type CloudSyncStatus =
  | "unconfigured"
  | "offline"
  | "syncing"
  | "synced"
  | "error";

// ─── Track Metadata ────────────────────────────────────────────────────────

export interface TrackInfo {
  id: Track;
  title: string;
  description: string;
  iconName: string;
  lessonSlugs: string[];
  color: string;
}

// ─── Schema Introspection ──────────────────────────────────────────────────

export interface TableColumn {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: string | null;
  pk: number;
}

export interface TableInfo {
  name: string;
  columns: TableColumn[];
  rowCount: number;
}
