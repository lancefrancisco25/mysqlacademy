import type { QueryResult } from "@/types";

/**
 * Formats a QueryResult into a MySQL-style ASCII table string.
 *
 * Example output:
 * +----+-------+-----+
 * | id | name  | age |
 * +----+-------+-----+
 * |  1 | Alice |  25 |
 * |  2 | Bob   |  30 |
 * +----+-------+-----+
 */
export function formatASCIITable(result: QueryResult): string {
  const { columns, values } = result;

  if (columns.length === 0) return "";

  // Calculate column widths
  const widths = columns.map((col, i) => {
    let max = col.length;
    for (const row of values) {
      const cellLen = formatCell(row[i]).length;
      if (cellLen > max) max = cellLen;
    }
    return max;
  });

  // Build separator line
  const separator =
    "+" + widths.map((w) => "-".repeat(w + 2)).join("+") + "+";

  // Build header
  const header =
    "|" +
    columns.map((col, i) => ` ${col.padEnd(widths[i])} `).join("|") +
    "|";

  // Build rows
  const rows = values.map(
    (row) =>
      "|" +
      row
        .map((cell, i) => {
          const formatted = formatCell(cell);
          // Right-align numbers
          if (typeof cell === "number") {
            return ` ${formatted.padStart(widths[i])} `;
          }
          return ` ${formatted.padEnd(widths[i])} `;
        })
        .join("|") +
      "|"
  );

  return [separator, header, separator, ...rows, separator].join("\n");
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  return String(value);
}

/**
 * Formats the row count footer for a result set.
 */
export function formatRowCount(count: number): string {
  if (count === 0) return "Empty set";
  if (count === 1) return "1 row in set";
  return `${count} rows in set`;
}
