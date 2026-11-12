import { type Database, type SqlJsStatic } from "sql.js";
import { getSqlJsInstance } from "./engine";
import { translateMySQL } from "./mysql-shim";
import type { QueryResult } from "@/types";

export const SANDBOX_STORAGE_KEY = "mysql-academy-sandbox-db-v1";
export const SANDBOX_LAST_QUERY_KEY = "mysql-academy-sandbox-last-query";

export const DEFAULT_SANDBOX_SCHEMA = `
CREATE TABLE courses (
  course_id VARCHAR(10) PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  department VARCHAR(50) NOT NULL,
  credits INTEGER NOT NULL
);

INSERT INTO courses (course_id, title, department, credits) VALUES
  ('CS101', 'Introduction to Computer Science', 'Computer Science', 3),
  ('CS201', 'Data Structures and Algorithms', 'Computer Science', 4),
  ('DB301', 'Database Management Systems', 'Information Technology', 3),
  ('WEB205', 'Full-Stack Web Development', 'Information Technology', 3),
  ('NET102', 'Computer Networks & Security', 'Computer Science', 3);

CREATE TABLE students (
  student_id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  major VARCHAR(50) NOT NULL,
  year_level INTEGER NOT NULL,
  gpa REAL DEFAULT 0.0
);

INSERT INTO students (student_id, first_name, last_name, email, major, year_level, gpa) VALUES
  (1001, 'Alex', 'Rivera', 'a.rivera@university.edu', 'Computer Science', 2, 3.75),
  (1002, 'Samantha', 'Cruz', 's.cruz@university.edu', 'Information Technology', 3, 3.88),
  (1003, 'David', 'Kim', 'd.kim@university.edu', 'Computer Science', 1, 3.45),
  (1004, 'Maria', 'Santos', 'm.santos@university.edu', 'Information Systems', 2, 3.62),
  (1005, 'Ethan', 'Brooks', 'e.brooks@university.edu', 'Computer Science', 4, 3.91),
  (1006, 'Airus', 'Reyes', 'a.reyes@university.edu', 'Information Technology', 2, 3.50);

CREATE TABLE enrollments (
  enrollment_id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  course_id VARCHAR(10) NOT NULL,
  semester VARCHAR(20) NOT NULL,
  grade VARCHAR(5),
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  FOREIGN KEY (course_id) REFERENCES courses(course_id)
);

INSERT INTO enrollments (student_id, course_id, semester, grade) VALUES
  (1001, 'CS101', 'Fall 2024', 'A'),
  (1001, 'DB301', 'Spring 2025', 'A-'),
  (1002, 'DB301', 'Fall 2024', 'A'),
  (1002, 'WEB205', 'Spring 2025', 'B+'),
  (1003, 'CS101', 'Fall 2024', 'B'),
  (1004, 'CS101', 'Fall 2024', 'A-'),
  (1004, 'WEB205', 'Spring 2025', 'A'),
  (1005, 'CS201', 'Fall 2024', 'A'),
  (1005, 'NET102', 'Spring 2025', 'A'),
  (1006, 'DB301', 'Spring 2025', 'B+');
`;

let sandboxDb: Database | null = null;

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function saveSandboxToLocalStorage(): boolean {
  if (!sandboxDb || typeof window === "undefined") return false;
  try {
    const binary = sandboxDb.export();
    const base64 = uint8ArrayToBase64(binary);
    localStorage.setItem(SANDBOX_STORAGE_KEY, base64);
    return true;
  } catch (err) {
    console.warn("[sandbox-engine] Failed to serialize database to localStorage:", err);
    return false;
  }
}

export async function initSandboxDatabase(): Promise<Database> {
  const sqlStatic = await getSqlJsInstance();

  if (sandboxDb) {
    try {
      sandboxDb.close();
    } catch {}
    sandboxDb = null;
  }

  // Check if persisted database exists in localStorage
  if (typeof window !== "undefined") {
    try {
      const savedBase64 = localStorage.getItem(SANDBOX_STORAGE_KEY);
      if (savedBase64 && savedBase64.length > 50) {
        const bytes = base64ToUint8Array(savedBase64);
        sandboxDb = new sqlStatic.Database(bytes);
        return sandboxDb;
      }
    } catch (err) {
      console.warn("[sandbox-engine] Could not restore saved database, initializing fresh:", err);
    }
  }

  // Create new database with default schema
  sandboxDb = new sqlStatic.Database();
  sandboxDb.run(DEFAULT_SANDBOX_SCHEMA);
  saveSandboxToLocalStorage();

  return sandboxDb;
}

export async function resetSandboxDatabase(): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(SANDBOX_STORAGE_KEY);
    } catch {}
  }

  const sqlStatic = await getSqlJsInstance();
  if (sandboxDb) {
    try {
      sandboxDb.close();
    } catch {}
    sandboxDb = null;
  }

  sandboxDb = new sqlStatic.Database();
  sandboxDb.run(DEFAULT_SANDBOX_SCHEMA);
  saveSandboxToLocalStorage();
}

export interface SandboxExecutionResponse {
  result: QueryResult | null;
  executionTimeMs: number;
  rowsAffected?: number;
  error?: string;
  translatedSQL?: string;
}

export function executeSandboxSQL(rawSQL: string): SandboxExecutionResponse {
  if (!sandboxDb) {
    throw new Error("Sandbox database is not initialized. Please wait for the engine to load.");
  }

  const startTime = performance.now();
  const translated = translateMySQL(rawSQL, sandboxDb);

  // If intercepted (like SHOW DATABASES / USE database)
  if (translated.intercepted) {
    const elapsed = Math.round((performance.now() - startTime) * 100) / 100;
    return {
      result: translated.intercepted,
      executionTimeMs: Math.max(elapsed, 0.1),
      translatedSQL: translated.sql,
    };
  }

  const sql = translated.sql;
  const results = sandboxDb.exec(sql);
  const elapsed = Math.round((performance.now() - startTime) * 100) / 100;

  // Persist modifications immediately to localStorage
  saveSandboxToLocalStorage();

  if (results.length === 0) {
    const changes = sandboxDb.getRowsModified();
    return {
      result: changes > 0 ? { columns: ["affected_rows"], values: [[changes]] } : null,
      rowsAffected: changes,
      executionTimeMs: Math.max(elapsed, 0.1),
      translatedSQL: sql,
    };
  }

  const last = results[results.length - 1];
  return {
    result: {
      columns: last.columns,
      values: last.values as (string | number | null)[][],
    },
    executionTimeMs: Math.max(elapsed, 0.1),
    translatedSQL: sql,
  };
}

export interface SandboxColumnInfo {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: string | null;
  pk: number;
}

export interface SandboxTableDetails {
  name: string;
  type: "table" | "view";
  rowCount: number;
  columns: SandboxColumnInfo[];
}

export function getSandboxSchemaDetails(): SandboxTableDetails[] {
  if (!sandboxDb) return [];

  try {
    const master = sandboxDb.exec(
      "SELECT name, type FROM sqlite_master WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%' ORDER BY name"
    );

    if (master.length === 0) return [];

    const tables: SandboxTableDetails[] = [];
    const rows = master[0].values;

    for (const row of rows) {
      const name = String(row[0]);
      const type = (row[1] === "view" ? "view" : "table") as "table" | "view";

      let rowCount = 0;
      try {
        const countRes = sandboxDb.exec(`SELECT COUNT(*) FROM "${name}"`);
        if (countRes.length > 0 && countRes[0].values.length > 0) {
          rowCount = Number(countRes[0].values[0][0]) || 0;
        }
      } catch {}

      const columns: SandboxColumnInfo[] = [];
      try {
        const colRes = sandboxDb.exec(`PRAGMA table_info("${name}")`);
        if (colRes.length > 0) {
          for (const c of colRes[0].values) {
            columns.push({
              cid: Number(c[0]),
              name: String(c[1]),
              type: String(c[2] || "TEXT"),
              notnull: Number(c[3]),
              dflt_value: c[4] !== null ? String(c[4]) : null,
              pk: Number(c[5]),
            });
          }
        }
      } catch {}

      tables.push({
        name,
        type,
        rowCount,
        columns,
      });
    }

    return tables;
  } catch (err) {
    console.warn("[sandbox-engine] Failed to inspect schema:", err);
    return [];
  }
}
