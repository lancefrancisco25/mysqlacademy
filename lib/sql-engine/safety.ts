/**
 * SQL Safety & Command Categorization Engine
 *
 * Inspects incoming SQL statements to categorize DDL vs DML commands
 * and generates real-time pedagogical safety notices for dangerous operations
 * (e.g. unbounded UPDATE/DELETE without WHERE, irreversible DDL drops).
 */

export interface SQLSafetyReport {
  category: "DDL" | "DML" | "TCL" | "DQL" | "OTHER";
  warnings: string[];
  tips: string[];
}

export function analyzeSQLSafety(rawSQL: string): SQLSafetyReport {
  const sql = rawSQL.trim();
  const normalized = sql.replace(/\s+/g, " ");
  const warnings: string[] = [];
  const tips: string[] = [];

  // Determine category
  let category: "DDL" | "DML" | "TCL" | "DQL" | "OTHER" = "OTHER";

  // DDL: Data Definition Language
  if (/^\s*(CREATE|ALTER|DROP|TRUNCATE|RENAME)\b/i.test(normalized)) {
    category = "DDL";

    // Destructive DDL checks
    if (/^\s*DROP\s+(TABLE|DATABASE|SCHEMA)\b/i.test(normalized)) {
      warnings.push(
        "⚠️ [DDL Safety Alert]: Dropping tables permanently deletes all underlying data and triggers an implicit auto-commit. In production, always verify backups before executing DROP."
      );
    } else if (/^\s*TRUNCATE\s+TABLE\b/i.test(normalized)) {
      warnings.push(
        "⚠️ [DDL Safety Alert]: TRUNCATE deallocates all pages immediately without logging individual row deletes and cannot be rolled back in MySQL."
      );
    } else if (/^\s*CREATE\s+TABLE\b/i.test(normalized) && !/\bIF\s+NOT\s+EXISTS\b/i.test(normalized)) {
      tips.push(
        "💡 [DDL Best Practice]: In production migration scripts, prefer 'CREATE TABLE IF NOT EXISTS' so your deployments are safe and idempotent."
      );
    }
  }
  // DML: Data Manipulation Language
  else if (/^\s*(INSERT|UPDATE|DELETE)\b/i.test(normalized)) {
    category = "DML";

    // Unbounded UPDATE without WHERE
    if (/^\s*UPDATE\b/i.test(normalized) && !/\bWHERE\b/i.test(normalized)) {
      warnings.push(
        "⚠️ [DML Safety Check]: Executed UPDATE without a WHERE clause! This alters every single row in the table. In production, always filter with WHERE or enable safe update mode (SQL_SAFE_UPDATES = 1)."
      );
    }

    // Unbounded DELETE without WHERE
    if (/^\s*DELETE\s+FROM\b/i.test(normalized) && !/\bWHERE\b/i.test(normalized)) {
      warnings.push(
        "⚠️ [DML Safety Check]: Executed DELETE without a WHERE clause! All rows in this table were deleted. Follow the S-B-M (SELECT Before Mutate) rule in production!"
      );
    }
  }
  // DQL: Data Query Language
  else if (/^\s*SELECT\b/i.test(normalized)) {
    category = "DQL";
  }
  // TCL: Transaction Control Language
  else if (/^\s*(START\s+TRANSACTION|BEGIN|COMMIT|ROLLBACK|SAVEPOINT)\b/i.test(normalized)) {
    category = "TCL";
  }

  return { category, warnings, tips };
}
