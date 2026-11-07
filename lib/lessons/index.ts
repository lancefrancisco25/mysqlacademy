import type { Lesson, TrackInfo } from "@/types";
import { foundationsLessons } from "./tracks/foundations";
import { crudLessons } from "./tracks/crud";
import { aggregationsLessons } from "./tracks/aggregations";
import { joinsLessons } from "./tracks/joins";
import { schemaEvolutionLessons } from "./tracks/schema-evolution";
import { transactionsLessons } from "./tracks/transactions";

// ── Track Definitions ──────────────────────────────────────────────────────

export const TRACKS: TrackInfo[] = [
  {
    id: "foundations",
    title: "1. Foundations",
    description:
      "Relational thinking, database scoping, table architecture, strict types, and primary key identity.",
    iconName: "Blocks",
    lessonSlugs: ["create-database", "create-table", "data-types"],
    color: "emerald",
  },
  {
    id: "crud",
    title: "2. Data Manipulation (CRUD)",
    description:
      "The four core verbs of SQL: INSERT, SELECT, UPDATE, and DELETE with surgical WHERE filtering.",
    iconName: "PenLine",
    lessonSlugs: ["insert-data", "select-basics", "where-clauses", "update-delete"],
    color: "sky",
  },
  {
    id: "aggregations",
    title: "3. Aggregations & Grouping",
    description:
      "Summarizing millions of rows: COUNT, SUM, AVG, category bucketing with GROUP BY, and HAVING thresholds.",
    iconName: "BarChart3",
    lessonSlugs: ["aggregate-functions", "group-by-having"],
    color: "violet",
  },
  {
    id: "joins",
    title: "4. Relational Operations",
    description:
      "Connecting separate worlds: foreign keys, INNER vs LEFT joins, and nested subquery compositions.",
    iconName: "GitMerge",
    lessonSlugs: ["inner-join", "left-right-join", "subqueries"],
    color: "amber",
  },
  {
    id: "schema-evolution",
    title: "5. Schema Evolution & Constraints",
    description:
      "Evolving live systems with ALTER TABLE and protecting data integrity using UNIQUE, DEFAULT, and CHECK.",
    iconName: "Wrench",
    lessonSlugs: ["alter-table", "constraints"],
    color: "rose",
  },
  {
    id: "transactions",
    title: "6. Transactions & Performance",
    description:
      "ACID bank-grade guarantees with COMMIT/ROLLBACK and lightning-fast B-Tree indexing plans.",
    iconName: "Zap",
    lessonSlugs: ["transactions-basics", "indexing"],
    color: "orange",
  },
];

// ── Complete Curriculum Lessons Assembly ───────────────────────────────────

export const LESSONS: Lesson[] = [
  ...foundationsLessons,
  ...crudLessons,
  ...aggregationsLessons,
  ...joinsLessons,
  ...schemaEvolutionLessons,
  ...transactionsLessons,
];

// ── Helper Lookup Functions ────────────────────────────────────────────────

export function getLessonBySlug(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug);
}

export function getLessonsForTrack(trackId: string): Lesson[] {
  return LESSONS.filter((l) => l.track === trackId).sort(
    (a, b) => a.trackIndex - b.trackIndex
  );
}

export function getTrackForLesson(slug: string): TrackInfo | undefined {
  const lesson = getLessonBySlug(slug);
  if (!lesson) return undefined;
  return TRACKS.find((t) => t.id === lesson.track);
}

export function getNextLesson(currentSlug: string): Lesson | undefined {
  const idx = LESSONS.findIndex((l) => l.slug === currentSlug);
  return idx >= 0 && idx < LESSONS.length - 1 ? LESSONS[idx + 1] : undefined;
}

export function getPrevLesson(currentSlug: string): Lesson | undefined {
  const idx = LESSONS.findIndex((l) => l.slug === currentSlug);
  return idx > 0 ? LESSONS[idx - 1] : undefined;
}
