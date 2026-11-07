/**
 * Socratic Mentor Agent
 *
 * Analyses SQL errors and the student's query to provide contextual,
 * pedagogical hints that guide the student toward the answer without
 * simply revealing it.
 */

interface HintRule {
  /** Regex to test against the error message */
  errorPattern: RegExp;
  /** Regex to optionally test against the query itself */
  queryPattern?: RegExp;
  /** Hint message template */
  hint: string;
}

const HINT_RULES: HintRule[] = [
  // ── Syntax Errors ─────────────────────────────────────────────────
  {
    errorPattern: /near "([^"]+)": syntax error/i,
    hint: 'There\'s a syntax error near "$1". Double-check your SQL keywords, commas, and parentheses around that area.',
  },
  {
    errorPattern: /incomplete input/i,
    hint: "Your SQL statement looks incomplete. Did you forget a closing parenthesis or a semicolon?",
  },

  // ── Table/Column Issues ───────────────────────────────────────────
  {
    errorPattern: /no such table:\s*(\w+)/i,
    hint: 'The table "$1" doesn\'t exist yet. Have you created it? Use SHOW TABLES; to see what tables are available.',
  },
  {
    errorPattern: /no such column:\s*(\w+)/i,
    hint: 'Column "$1" was not found. Use DESCRIBE <table> to see available columns. Watch for typos!',
  },
  {
    errorPattern: /table\s+(\w+)\s+already exists/i,
    hint: 'Table "$1" already exists. If you want to modify it, use ALTER TABLE. To recreate it, DROP it first.',
  },
  {
    errorPattern: /ambiguous column name/i,
    hint: "When joining tables, prefix ambiguous column names with the table name or alias (e.g., t.column_name).",
  },

  // ── GROUP BY / Aggregate Issues ───────────────────────────────────
  {
    errorPattern: /not an aggregate/i,
    hint: "Every column in your SELECT that isn't inside an aggregate function (COUNT, SUM, etc.) must appear in the GROUP BY clause.",
  },
  {
    errorPattern: /misuse of aggregate/i,
    hint: "Aggregate functions like COUNT() or SUM() can't be used in a WHERE clause. Did you mean to use HAVING instead?",
  },

  // ── Data Type Issues ──────────────────────────────────────────────
  {
    errorPattern: /datatype mismatch/i,
    hint: "There's a data type mismatch. Make sure you're comparing similar types — strings need quotes, numbers don't.",
  },

  // ── Constraint Violations ─────────────────────────────────────────
  {
    errorPattern: /UNIQUE constraint failed/i,
    hint: "A UNIQUE constraint was violated — you're trying to insert a duplicate value in a column that requires uniqueness.",
  },
  {
    errorPattern: /NOT NULL constraint failed:\s*(\w+)\.(\w+)/i,
    hint: 'The column "$2" in table "$1" cannot be NULL. Make sure you provide a value for it in your INSERT statement.',
  },
  {
    errorPattern: /FOREIGN KEY constraint failed/i,
    hint: "A foreign key constraint failed. The value you're referencing doesn't exist in the parent table. Insert the parent record first.",
  },
  {
    errorPattern: /PRIMARY KEY constraint/i,
    hint: "The primary key must be unique for each row. You're trying to insert a duplicate primary key value.",
  },

  // ── General Fallbacks ─────────────────────────────────────────────
  {
    errorPattern: /unrecognized token/i,
    hint: "There's an unrecognized character in your query. Check for stray symbols or unclosed string quotes.",
  },
];

/**
 * Returns a contextual hint for a SQL error, or null if no specific hint matches.
 */
export function getMentorHint(
  query: string,
  errorMessage: string
): string | null {
  for (const rule of HINT_RULES) {
    const errorMatch = rule.errorPattern.exec(errorMessage);
    if (errorMatch) {
      if (rule.queryPattern && !rule.queryPattern.test(query)) continue;

      // Replace $1, $2, ... with capture groups from the error match
      let hint = rule.hint;
      for (let i = 1; i < errorMatch.length; i++) {
        hint = hint.replace(`$${i}`, errorMatch[i] || "");
      }
      return `💡 Hint: ${hint}`;
    }
  }

  // Generic fallback
  return `💡 Hint: Check your syntax carefully. Break the query into smaller pieces and test each part. Use HELP for available commands.`;
}

/**
 * Provides a proactive hint for the current active task.
 */
export function getTaskHint(
  taskDescription: string,
  hint?: string
): string {
  if (hint) return `💡 ${hint}`;
  return `💡 Try reading the task description carefully: "${taskDescription}"`;
}
