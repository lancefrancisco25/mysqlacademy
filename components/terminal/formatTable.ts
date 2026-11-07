/**
 * Formats query results as MySQL-style ASCII tables.
 *
 * Example:
 * +----+-------+-----+
 * | id | name  | age |
 * +----+-------+-----+
 * |  1 | Alice |  25 |
 * |  2 | Bob   |  30 |
 * +----+-------+-----+
 */
export function formatTable(
  columns: string[],
  values: (string | number | null)[][]
): string {
  if (columns.length === 0) return "";

  // Calculate max width per column
  const widths = columns.map((col, i) => {
    let max = col.length;
    for (const row of values) {
      const len = cellStr(row[i]).length;
      if (len > max) max = len;
    }
    return Math.min(max, 40); // cap at 40 chars
  });

  const sep =
    "+" + widths.map((w) => "-".repeat(w + 2)).join("+") + "+";

  const header =
    "|" +
    columns.map((c, i) => ` ${c.padEnd(widths[i])} `).join("|") +
    "|";

  const rows = values.map(
    (row) =>
      "|" +
      row
        .map((cell, i) => {
          const s = cellStr(cell);
          if (typeof cell === "number") {
            return ` ${s.padStart(widths[i])} `;
          }
          return ` ${s.padEnd(widths[i])} `;
        })
        .join("|") +
      "|"
  );

  return [sep, header, sep, ...rows, sep].join("\n");
}

function cellStr(v: unknown): string {
  if (v === null || v === undefined) return "NULL";
  const s = String(v);
  return s.length > 40 ? s.slice(0, 37) + "..." : s;
}
