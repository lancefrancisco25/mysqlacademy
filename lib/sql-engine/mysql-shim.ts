import type { Database } from "sql.js";
import type { QueryResult } from "@/types";

interface TranslationResult {
  sql: string;
  intercepted?: QueryResult;
}

/**
 * Translates MySQL-specific syntax into SQLite equivalents.
 * Some commands (SHOW, DESCRIBE, USE) are fully intercepted and
 * return synthetic results without hitting the SQLite engine.
 */
export function translateMySQL(
  rawSQL: string,
  db: Database
): TranslationResult {
  const trimmed = rawSQL.trim();
  const upper = trimmed.toUpperCase().replace(/\s+/g, " ");

  // ── Intercepted Commands ────────────────────────────────────────────

  // SHOW DATABASES
  if (/^SHOW\s+DATABASES\s*;?$/i.test(trimmed)) {
    return {
      sql: "",
      intercepted: {
        columns: ["Database"],
        values: [["mysql_tutorial"]],
      },
    };
  }

  // SHOW TABLES (includes base tables and views like MySQL)
  if (/^SHOW\s+TABLES\s*;?$/i.test(trimmed)) {
    const result = db.exec(
      "SELECT name FROM sqlite_master WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%' ORDER BY name"
    );
    const tables =
      result.length > 0
        ? result[0].values.map((r: any) => [r[0]] as (string | number | null)[])
        : [];
    return {
      sql: "",
      intercepted: {
        columns: ["Tables_in_mysql_tutorial"],
        values: tables,
      },
    };
  }

  // DESCRIBE / DESC / SHOW COLUMNS FROM <table>
  const descMatch = trimmed.match(
    /^(?:DESCRIBE|DESC|SHOW\s+COLUMNS\s+(?:FROM|IN))\s+`?(\w+)`?\s*;?$/i
  );
  if (descMatch) {
    const tableName = descMatch[1];
    const info = db.exec(`PRAGMA table_info("${tableName}")`);
    if (info.length === 0) {
      throw new Error(
        `Table '${tableName}' doesn't exist in database 'mysql_tutorial'`
      );
    }
    // Map PRAGMA output to MySQL DESCRIBE format:
    // Field, Type, Null, Key, Default, Extra
    const rows: (string | number | null)[][] = info[0].values.map((row: any) => {
      const name = row[1] as string;
      const type = (row[2] as string).toUpperCase() || "TEXT";
      const notNull = row[3] as number;
      const defaultVal = row[4];
      const pk = row[5] as number;

      return [
        name,
        type,
        notNull ? "NO" : "YES",
        pk ? "PRI" : "",
        defaultVal ?? "NULL",
        pk ? "auto_increment" : "",
      ];
    });

    return {
      sql: "",
      intercepted: {
        columns: ["Field", "Type", "Null", "Key", "Default", "Extra"],
        values: rows,
      },
    };
  }

  // USE <database>
  if (/^USE\s+\w+\s*;?$/i.test(trimmed)) {
    return {
      sql: "",
      intercepted: {
        columns: ["status"],
        values: [["Database changed"]],
      },
    };
  }

  // CREATE DATABASE
  if (/^CREATE\s+(DATABASE|SCHEMA)/i.test(trimmed)) {
    return {
      sql: "",
      intercepted: {
        columns: ["status"],
        values: [["Query OK, 1 row affected"]],
      },
    };
  }

  // DROP DATABASE
  if (/^DROP\s+(DATABASE|SCHEMA)/i.test(trimmed)) {
    return {
      sql: "",
      intercepted: {
        columns: ["status"],
        values: [["Query OK, 0 rows affected"]],
      },
    };
  }

  // ── Syntax Translation ──────────────────────────────────────────────
  let sql = trimmed;

  // Normalize MySQL AUTO_INCREMENT and PRIMARY KEY order for SQLite (SQLite requires: INTEGER PRIMARY KEY AUTOINCREMENT)
  sql = sql.replace(/\bAUTO_INCREMENT\s+PRIMARY\s+KEY\b/gi, "PRIMARY KEY AUTOINCREMENT");
  sql = sql.replace(/\bAUTOINCREMENT\s+PRIMARY\s+KEY\b/gi, "PRIMARY KEY AUTOINCREMENT");
  sql = sql.replace(/\bPRIMARY\s+KEY\s+AUTO_INCREMENT\b/gi, "PRIMARY KEY AUTOINCREMENT");
  sql = sql.replace(/\bAUTO_INCREMENT\b/gi, "AUTOINCREMENT");

  // Strip MySQL table storage engine and character set options
  sql = sql.replace(/\)\s*ENGINE\s*=\s*[a-zA-Z0-9_]+[^;]*/gi, ")");
  sql = sql.replace(/\)\s*DEFAULT\s+CHARSET\s*=\s*[a-zA-Z0-9_]+[^;]*/gi, ")");

  // In SQLite, ALTER TABLE ADD COLUMN cannot accept non-constant defaults (e.g. date('now') or CURRENT_TIMESTAMP)
  if (/\bALTER\s+TABLE\s+.*?\bADD\s+(?:COLUMN\s+)?/i.test(sql)) {
    sql = sql.replace(/\bDEFAULT\s+.*?(?=;|$)/gi, "");
  }

  // INT / INT(...) → INTEGER
  sql = sql.replace(/\bINT\s*\(\s*\d+\s*\)/gi, "INTEGER");
  sql = sql.replace(
    /\bINT\b(?!\s*\(|\w)/gi,
    "INTEGER"
  );

  // MySQL date/time functions
  sql = sql.replace(/\bNOW\(\)/gi, "datetime('now')");
  sql = sql.replace(/\bCURDATE\(\)/gi, "date('now')");
  sql = sql.replace(/\bCURRENT_TIMESTAMP\(\)/gi, "datetime('now')");

  // BOOLEAN → INTEGER
  sql = sql.replace(/\bBOOLEAN\b/gi, "INTEGER");

  // TINYINT → INTEGER
  sql = sql.replace(/\bTINYINT\b/gi, "INTEGER");

  // BIGINT → INTEGER
  sql = sql.replace(/\bBIGINT\b/gi, "INTEGER");

  // DOUBLE → REAL
  sql = sql.replace(/\bDOUBLE\b/gi, "REAL");

  // FLOAT → REAL
  sql = sql.replace(/\bFLOAT\b/gi, "REAL");

  // ENUM(...) → TEXT (simplified)
  sql = sql.replace(/\bENUM\s*\([^)]+\)/gi, "TEXT");

  // START TRANSACTION → BEGIN
  sql = sql.replace(/\bSTART\s+TRANSACTION\b/gi, "BEGIN");

  // ENGINE=InnoDB or similar → remove
  sql = sql.replace(/\s*ENGINE\s*=\s*\w+/gi, "");

  // DEFAULT CHARSET=... → remove
  sql = sql.replace(/\s*DEFAULT\s+CHARSET\s*=\s*\w+/gi, "");

  // UNSIGNED → remove (SQLite doesn't have this)
  sql = sql.replace(/\bUNSIGNED\b/gi, "");

  // COMMENT '...' → remove
  sql = sql.replace(/\s*COMMENT\s+'[^']*'/gi, "");

  // IF NOT EXISTS already supported in SQLite

  // Backtick identifiers are supported in SQLite

  return { sql };
}
