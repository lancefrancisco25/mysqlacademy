import type { Task, QueryResult, ValidationRule } from "@/types";
import {
  getTableNames,
  getTableInfo,
  getTableData,
  executeSQL,
} from "../sql-engine/engine";

interface ValidationResult {
  passed: boolean;
  reason?: string;
}

/**
 * Validates whether a task's objective has been met by inspecting
 * the current database state (not just the query text).
 */
export function validateTask(
  task: Task,
  query: string,
  result: QueryResult | null
): ValidationResult {
  const rule = task.validation;

  // 1. Verify student query pattern if specified (handles multi-line queries gracefully)
  if (rule.queryPattern) {
    const pattern =
      typeof rule.queryPattern === "string"
        ? new RegExp(rule.queryPattern, "i")
        : new RegExp(rule.queryPattern.source, rule.queryPattern.flags.replace(/g/g, ""));
    const raw = query || "";
    const normalized = raw.replace(/\s+/g, " ").trim();
    if (!pattern.test(raw) && !pattern.test(normalized)) {
      return {
        passed: false,
        reason:
          rule.description ||
          "Executed query does not match required syntax criteria.",
      };
    }
  }

  // 2. Verify returned columns if specified
  if (rule.expectedColumns && rule.expectedColumns.length > 0) {
    if (!result || !result.columns || result.columns.length === 0) {
      return { passed: false, reason: "Query returned no columns." };
    }
    const lowerCols = result.columns.map((c) => c.toLowerCase());
    const hasAll = rule.expectedColumns.every((c) =>
      lowerCols.includes(c.toLowerCase())
    );
    if (!hasAll) {
      return {
        passed: false,
        reason: `Output must project columns: ${rule.expectedColumns.join(", ")}.`,
      };
    }
  }

  // 3. Verify minimum returned rows if specified
  if (rule.minReturnedRows !== undefined) {
    const count = result?.values ? result.values.length : 0;
    if (count < rule.minReturnedRows) {
      return {
        passed: false,
        reason: `Expected query to return at least ${rule.minReturnedRows} rows, got ${count}.`,
      };
    }
  }

  switch (rule.type) {
    case "table_exists":
      return validateTableExists(rule);
    case "table_not_exists":
      return validateTableNotExists(rule);
    case "column_exists":
      return validateColumnExists(rule);
    case "row_count":
      return validateRowCount(rule);
    case "row_count_gte":
      return validateRowCountGte(rule);
    case "value_check":
      return validateValueCheck(rule);
    case "query_result":
      return validateQueryResult(rule, result);
    case "custom":
      return { passed: false, reason: "Custom validation not implemented" };
    default:
      return { passed: false, reason: "Unknown validation type" };
  }
}

function validateTableExists(rule: ValidationRule): ValidationResult {
  if (!rule.table) return { passed: false, reason: "No table specified" };
  const tables = getTableNames();
  const lowerTarget = rule.table.toLowerCase();
  if (tables.some((t) => t.toLowerCase() === lowerTarget)) {
    return { passed: true };
  }
  return {
    passed: false,
    reason: `Table '${rule.table}' does not exist yet.`,
  };
}

function validateTableNotExists(rule: ValidationRule): ValidationResult {
  if (!rule.table) return { passed: false, reason: "No table specified" };
  const tables = getTableNames();
  const lowerTarget = rule.table.toLowerCase();
  if (!tables.some((t) => t.toLowerCase() === lowerTarget)) {
    return { passed: true };
  }
  return {
    passed: false,
    reason: `Table '${rule.table}' still exists.`,
  };
}

function validateColumnExists(rule: ValidationRule): ValidationResult {
  if (!rule.table || !rule.column)
    return { passed: false, reason: "No table/column specified" };
  const tables = getTableNames();
  const matchedTable = tables.find((t) => t.toLowerCase() === rule.table!.toLowerCase()) || rule.table;
  const info = getTableInfo(matchedTable);
  if (!info) return { passed: false, reason: `Table '${rule.table}' not found` };
  const colNames = info.values.map((r) => String(r[1]).toLowerCase());
  if (colNames.includes(rule.column.toLowerCase())) {
    return { passed: true };
  }
  return {
    passed: false,
    reason: `Column '${rule.column}' not found in table '${rule.table}'.`,
  };
}

function validateRowCount(rule: ValidationRule): ValidationResult {
  if (!rule.table)
    return { passed: false, reason: "No table specified" };
  if (rule.expectedCount === undefined)
    return { passed: false, reason: "No expectedCount specified" };

  const tables = getTableNames();
  const matchedTable = tables.find((t) => t.toLowerCase() === rule.table!.toLowerCase()) || rule.table;
  const data = getTableData(matchedTable);
  const actual = data ? data.values.length : 0;
  if (actual === rule.expectedCount) {
    return { passed: true };
  }
  return {
    passed: false,
    reason: `Expected ${rule.expectedCount} rows in '${rule.table}', found ${actual}.`,
  };
}

function validateRowCountGte(rule: ValidationRule): ValidationResult {
  if (!rule.table)
    return { passed: false, reason: "No table specified" };
  if (rule.expectedCount === undefined)
    return { passed: false, reason: "No expectedCount specified" };

  const tables = getTableNames();
  const matchedTable = tables.find((t) => t.toLowerCase() === rule.table!.toLowerCase()) || rule.table;
  const data = getTableData(matchedTable);
  const actual = data ? data.values.length : 0;
  if (actual >= rule.expectedCount) {
    return { passed: true };
  }
  return {
    passed: false,
    reason: `Expected at least ${rule.expectedCount} rows in '${rule.table}', found ${actual}.`,
  };
}

function validateValueCheck(rule: ValidationRule): ValidationResult {
  if (!rule.query || !rule.expectedResult)
    return { passed: false, reason: "No query/expectedResult specified" };

  try {
    const result = executeSQL(rule.query);
    if (!result) return { passed: false, reason: "Query returned no result" };

    const actual = result.values;
    const expected = rule.expectedResult;

    if (actual.length !== expected.length) {
      return {
        passed: false,
        reason: rule.description || `Expected ${expected.length} rows, got ${actual.length}.`,
      };
    }

    for (let i = 0; i < expected.length; i++) {
      for (let j = 0; j < expected[i].length; j++) {
        const aVal = String(actual[i]?.[j] ?? "").trim().toLowerCase();
        const eVal = String(expected[i]?.[j] ?? "").trim().toLowerCase();
        if (aVal !== eVal) {
          return {
            passed: false,
            reason: rule.description || `Row ${i + 1} does not match expected values.`,
          };
        }
      }
    }

    return { passed: true };
  } catch (e: any) {
    return { passed: false, reason: `Validation query error: ${e.message}` };
  }
}

function validateQueryResult(
  rule: ValidationRule,
  studentResult?: QueryResult | null
): ValidationResult {
  // If a specific verification query is defined, run and check it
  if (rule.query) {
    try {
      const result = executeSQL(rule.query);
      if (!result || result.values.length === 0) {
        return { passed: false, reason: rule.description || "Verification query returned empty." };
      }

      // If expectedResult is provided, compare
      if (rule.expectedResult) {
        return validateValueCheck(rule);
      }

      // Otherwise just check that the query returns at least one row
      return { passed: true };
    } catch (e: any) {
      return { passed: false, reason: `Verification failed: ${e.message}` };
    }
  }

  // Fallback: evaluate the student's executed query result
  if (studentResult) {
    if (rule.expectedResult) {
      const actual = studentResult.values;
      const expected = rule.expectedResult;
      if (actual.length !== expected.length) {
        return {
          passed: false,
          reason: rule.description || `Expected ${expected.length} rows, got ${actual.length}.`,
        };
      }
      for (let i = 0; i < expected.length; i++) {
        for (let j = 0; j < expected[i].length; j++) {
          const aVal = String(actual[i]?.[j] ?? "").trim().toLowerCase();
          const eVal = String(expected[i]?.[j] ?? "").trim().toLowerCase();
          if (aVal !== eVal) {
            return {
              passed: false,
              reason: rule.description || `Row ${i + 1} does not match expected values.`,
            };
          }
        }
      }
      return { passed: true };
    }

    if (rule.minReturnedRows !== undefined) {
      if (studentResult.values.length >= rule.minReturnedRows) {
        return { passed: true };
      }
      return {
        passed: false,
        reason: `Expected at least ${rule.minReturnedRows} rows, got ${studentResult.values.length}.`,
      };
    }

    if (studentResult.values.length > 0) {
      return { passed: true };
    }
  }

  return { passed: false, reason: "No verification query or result available." };
}
