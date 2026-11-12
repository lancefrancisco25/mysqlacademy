import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";
import type { QueryResult } from "@/types";
import { translateMySQL } from "./mysql-shim";

let SQL: SqlJsStatic | null = null;
let sqlPromise: Promise<SqlJsStatic> | null = null;
let db: Database | null = null;

async function getWasmBinary(): Promise<ArrayBuffer | undefined> {
  if (typeof window === "undefined") return undefined;

  // 1. Try fetching from public/ folder on local origin
  try {
    const res = await fetch("/sql-wasm.wasm");
    if (res.ok) {
      return await res.arrayBuffer();
    }
  } catch (err) {
    console.warn("[sql-engine] Failed to fetch local wasm, attempting CDN fallback...", err);
  }

  // 2. Fallback to official CDN
  try {
    const cdnRes = await fetch("https://sql.js.org/dist/sql-wasm.wasm");
    if (cdnRes.ok) {
      return await cdnRes.arrayBuffer();
    }
  } catch (cdnErr) {
    console.warn("[sql-engine] Failed to fetch wasm from CDN:", cdnErr);
  }

  return undefined;
}

export async function getSqlJsInstance(): Promise<SqlJsStatic> {
  if (SQL) return SQL;
  if (!sqlPromise) {
    sqlPromise = (async () => {
      const wasmBinary = await getWasmBinary();
      const config = wasmBinary
        ? { wasmBinary }
        : {
            locateFile: (file: string) =>
              typeof window !== "undefined"
                ? `${window.location.origin}/${file}`
                : `https://sql.js.org/dist/${file}`,
          };

      return await initSqlJs(config);
    })();
  }
  SQL = await sqlPromise;
  return SQL;
}

/**
 * Initialize the sql.js WebAssembly runtime and create a fresh in-memory database.
 * Optionally seeds it with an initial SQL script.
 */
export async function initDatabase(seedSQL?: string): Promise<void> {
  const sqlStatic = await getSqlJsInstance();

  // Ensure any existing database instance is cleanly disposed
  if (db) {
    try {
      db.close();
    } catch {
      // ignore
    }
    db = null;
  }

  db = new sqlStatic.Database();

  if (seedSQL && seedSQL.trim().length > 0) {
    try {
      db.run(seedSQL);
    } catch (e) {
      console.error("[sql-engine] Seed SQL error:", e);
      throw e;
    }
  }
}

/**
 * Reset the database to a fresh state, optionally re-seeding it.
 */
export async function resetDatabase(seedSQL?: string): Promise<void> {
  if (db) {
    try {
      db.close();
    } catch {
      // ignore
    }
    db = null;
  }
  await initDatabase(seedSQL);
}

/**
 * Execute a raw SQL string. The MySQL shim translates MySQL-specific
 * syntax into SQLite equivalents before execution.
 *
 * Returns a QueryResult (columns + rows), or null for statements
 * that produce no result set (DDL, DML without SELECT).
 */
export function executeSQL(rawSQL: string): QueryResult | null {
  if (!db) {
    throw new Error(
      "Database engine is still initializing. Please wait a moment and try again."
    );
  }

  const translated = translateMySQL(rawSQL, db);

  // If the shim intercepted the command and produced a synthetic result, return it
  if (translated.intercepted) {
    return translated.intercepted;
  }

  const sql = translated.sql;

  // Split on semicolons to handle multi-statement input
  const results = db.exec(sql);

  if (results.length === 0) {
    // DDL / DML with no result set
    const changes = db.getRowsModified();
    if (changes > 0) {
      return {
        columns: ["affected_rows"],
        values: [[changes]],
      };
    }
    return null;
  }

  // Return the last result set (in case of multi-statement)
  const last = results[results.length - 1];
  return {
    columns: last.columns,
    values: last.values as (string | number | null)[][],
  };
}

/**
 * Get the list of user tables in the current database.
 */
export function getTableNames(): string[] {
  if (!db) return [];
  try {
    const result = db.exec(
      "SELECT name FROM sqlite_master WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%' ORDER BY name"
    );
    if (result.length === 0) return [];
    return result[0].values.map((row: any) => String(row[0]));
  } catch {
    return [];
  }
}

/**
 * Get column info for a table (via PRAGMA table_info).
 */
export function getTableInfo(tableName: string): QueryResult | null {
  if (!db) return null;
  try {
    const result = db.exec(`PRAGMA table_info("${tableName}")`);
    if (result.length === 0) return null;
    return {
      columns: result[0].columns,
      values: result[0].values as (string | number | null)[][],
    };
  } catch {
    return null;
  }
}

/**
 * Get all rows from a table.
 */
export function getTableData(tableName: string): QueryResult | null {
  if (!db) return null;
  try {
    const result = db.exec(`SELECT * FROM "${tableName}" LIMIT 200`);
    if (result.length === 0) {
      // Table exists but is empty — return column names with no rows
      const info = db.exec(`PRAGMA table_info("${tableName}")`);
      if (info.length === 0) return null;
      return {
        columns: info[0].values.map((r: any) => String(r[1])),
        values: [],
      };
    }
    return {
      columns: result[0].columns,
      values: result[0].values as (string | number | null)[][],
    };
  } catch {
    return null;
  }
}

/**
 * Get the raw Database instance (for advanced operations).
 */
export function getRawDB(): Database | null {
  return db;
}

/**
 * Safely roll back any open in-flight transaction, resetting the DB connection to autocommit mode.
 */
export function rollbackIfInTransaction(): void {
  if (!db) return;
  try {
    db.exec("ROLLBACK;");
  } catch {
    // Ignore if no transaction is active
  }
}
