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
}

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
