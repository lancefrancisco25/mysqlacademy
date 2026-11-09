import type { Lesson } from "@/types";
import { getSeedSQL } from "../../agents/schema-generator";

export const aggregationsLessons: Lesson[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 1. AGGREGATE FUNCTIONS
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "aggregate-functions",
    title: "Vector Aggregations (COUNT, SUM, AVG)",
    track: "aggregations",
    trackIndex: 0,
    description:
      "Use COUNT, SUM, AVG, MIN, and MAX to vectorize thousands of rows into actionable business metrics and KPI reports.",
    analogy: {
      title: "The Store Cash Register EOD Tape",
      story:
        "At 9:00 PM when a flagship retail store closes for the night, the store manager doesn't sit down to read 8,000 individual customer receipts one by one. That would take all night and provide zero strategic insight!\n\nInstead, they hit 'Print End-of-Day Report' on the cash register:\n• How many transactions were rung up? (`COUNT(*)` -> 8,412)\n• What was the total gross revenue? (`SUM(amount)` -> $142,500.00)\n• What was the average basket checkout size? (`AVG(amount)` -> $16.94)\n• What was the single biggest sale? (`MAX(amount)` -> $2,400.00)\n\nThousands of individual row events instantly collapse into four executive metrics that drive business decisions.",
      takeaway:
        "Aggregate functions vectorize multiple rows into a single scalar summary value.",
    },
    mnemonic: {
      phrase: "C-S-A-M-M: Can Some Accountants Make Money?",
      breakdown: [
        { letter: "C", word: "COUNT", meaning: "How many rows?" },
        { letter: "S", word: "SUM", meaning: "What is the total sum?" },
        { letter: "A", word: "AVG", meaning: "What is the mathematical mean?" },
        { letter: "M", word: "MIN", meaning: "Smallest boundary" },
        { letter: "M", word: "MAX", meaning: "Largest boundary" },
      ],
      whyItMatters:
        "These five functions form the backbone of all business intelligence and reporting dashboards.",
    },
    patterns: [
      {
        trigger: "Count total rows including NULLs?",
        solution: "SELECT COUNT(*) FROM table;",
        example: "SELECT COUNT(*) FROM sales;",
      },
      {
        trigger: "Calculate sum of numbers?",
        solution: "SELECT SUM(col) FROM table;",
        example: "SELECT SUM(amount) FROM sales;",
      },
      {
        trigger: "Find average and round to 2 decimals?",
        solution: "SELECT ROUND(AVG(col), 2) FROM table;",
        example: "SELECT ROUND(AVG(amount), 2) FROM sales;",
      },
    ],
    proTips: [
      "COUNT(*) counts all physical rows. COUNT(column_name) counts only rows where that specific column is NOT NULL.",
      "Give aggregate calculations clear aliases using AS (e.g. `COUNT(*) AS total_sales`) so frontend code receives clean JSON keys.",
      "Combine aggregates with WHERE to calculate metrics for a specific subset: `SELECT SUM(amount) FROM sales WHERE region = 'North';`",
    ],
    gotchas: [
      "You cannot use aggregate functions directly in a WHERE clause (e.g. `WHERE amount > AVG(amount)` is invalid). Use subqueries or HAVING instead.",
      "AVG() ignores NULL values completely—it does not treat them as 0. If you want NULL to count as 0, use COALESCE(col, 0).",
    ],
    diagramType: "pipeline",
    intuitionCheck: {
      question: "What is the difference between `COUNT(*)` and `COUNT(email)` if 2 out of 10 users have NULL emails?",
      options: [
        "`COUNT(*)` returns 10; `COUNT(email)` returns 8 because it ignores NULLs.",
        "Both return 10.",
        "`COUNT(email)` throws a syntax error.",
        "`COUNT(*)` only counts primary keys.",
      ],
      correctIndex: 0,
      explanation:
        "`COUNT(*)` counts physical rows; `COUNT(column)` only counts non-NULL values.",
    },
    content: [
      {
        heading: "1. The Concept of Vector Aggregation",
        body: "Until now, our SQL queries returned rows 1-to-1: if the table had 10 rows matching our filter, we got 10 rows back. But in real-world executive reporting, humans cannot digest 100,000 individual transactions.\n\nAn Aggregate Function takes an entire column vector (a list of numbers across multiple rows) and mathematical compresses it into a single scalar value. This is the foundation of all data analytics, warehousing, and KPI dashboards.",
      },
      {
        heading: "2. The Big Five Aggregate Functions",
        body: "MySQL provides five fundamental mathematical aggregators:\n\n1. `COUNT(*)`: Returns the total number of rows scanned.\n2. `SUM(column)`: Calculates the mathematical sum of all numeric values.\n3. `AVG(column)`: Computes the arithmetic mean.\n4. `MIN(column)`: Identifies the smallest value (works on numbers, dates, and alphabetical strings!).\n5. `MAX(column)`: Identifies the largest value.",
        code: "-- Calculating a complete executive summary of sales\nSELECT \n  COUNT(*) AS total_transactions,\n  SUM(amount) AS total_revenue,\n  ROUND(AVG(amount), 2) AS average_order_value,\n  MIN(amount) AS lowest_sale,\n  MAX(amount) AS highest_sale\nFROM sales;",
      },
      {
        heading: "3. The Subtle Nuance: COUNT(*) vs COUNT(column)",
        body: "A classic senior interview question is: 'What is the difference between COUNT(*) and COUNT(col)?'\n\n• `COUNT(*)` counts the row if it physically exists on disk, regardless of whether columns contain NULL.\n• `COUNT(col)` only increments the counter if that specific column is NOT NULL!\n\nFor example, if you have 100 users, but only 70 have entered a `phone_number`, `COUNT(*)` will return `100`, while `COUNT(phone_number)` will return `70`. This provides an easy way to check data completeness.",
      },
      {
        heading: "4. Vectorizing Filtered Subsets with WHERE",
        body: "The true superpower of SQL aggregates comes when paired with `WHERE`. The `WHERE` clause runs first, filtering out rows that don't match your criteria, and then the aggregate collapses only the remaining subset into a summary:",
        code: "-- Total revenue generated specifically in the North region\nSELECT SUM(amount) AS north_revenue\nFROM sales\nWHERE region = 'North';",
      },
    ],
    exercises: [
      {
        type: "drag-block",
        id: "af-drag-1",
        title: "Build an Executive Revenue Summary Query",
        instructions:
          "Arrange the SQL clauses in order to calculate the count and total revenue from sales.",
        scenarioContext:
          "The Chief Financial Officer requested the overall sales transaction count and revenue sum.",
        blocks: [
          { id: "b1", text: "SELECT" },
          { id: "b2", text: "COUNT(*) AS total_count," },
          { id: "b3", text: "SUM(amount) AS total_amount" },
          { id: "b4", text: "FROM sales;" },
        ],
        solution: ["b1", "b2", "b3", "b4"],
        hint: "Start with SELECT, then the aggregate functions with commas, followed by FROM sales.",
        explanation:
          "Spot on! In a single round trip, MySQL computes both the total row count and total sum directly in memory.",
      },
      {
        type: "scenario",
        id: "af-scenario-1",
        title: "FinTech Transaction Volume & Exposure Analysis",
        companyOrContext: "ApexPay Clearinghouse",
        problemStatement:
          "You are the quantitative risk analyst at ApexPay. The executive risk committee needs an aggregate exposure report on all approved international transactions.\n\nTable: `transfers (id, amount, status, country)`.\nWrite a query calculating:\n1. Total count of transfers as `total_transfers`\n2. Total value as `total_exposure`\n3. Average transfer size as `avg_transfer`\nOnly include rows where `status = 'approved'` and `country != 'US'`.",
        schemaSetupSQL:
          "CREATE TABLE IF NOT EXISTS transfers (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  amount REAL NOT NULL,\n  status VARCHAR(20) NOT NULL,\n  country VARCHAR(10) NOT NULL\n);\nINSERT OR IGNORE INTO transfers (id, amount, status, country) VALUES\n  (1, 1500, 'approved', 'UK'),\n  (2, 2300, 'approved', 'DE'),\n  (3, 4100, 'pending', 'FR'),\n  (4, 800, 'approved', 'US'),\n  (5, 3400, 'approved', 'JP'),\n  (6, 1200, 'declined', 'UK');",
        requirements: [
          {
            id: "req-1",
            text: "Calculate COUNT(*) as total_transfers",
            hint: "COUNT(*) AS total_transfers",
            syntaxPattern: /count\s*\(\s*\*?\s*\)\s+(as\s+)?total_transfers/i,
          },
          {
            id: "req-2",
            text: "Calculate SUM(amount) as total_exposure",
            hint: "SUM(amount) AS total_exposure",
            syntaxPattern: /sum\s*\(\s*amount\s*\)\s+(as\s+)?total_exposure/i,
          },
          {
            id: "req-3",
            text: "Calculate AVG(amount) as avg_transfer",
            hint: "AVG(amount) AS avg_transfer",
            syntaxPattern: /avg\s*\(\s*amount\s*\)\s+(as\s+)?avg_transfer/i,
          },
          {
            id: "req-4",
            text: "Filter WHERE status = 'approved' AND country != 'US'",
            hint: "WHERE status = 'approved' AND country != 'US'",
            syntaxPattern: /where[\s\S]*status\s*=\s*['"]approved['"][\s\S]*country\s*(!=|<>)\s*['"]US['"]/i,
          },
        ],
        solutionSQL:
          "SELECT \n  COUNT(*) AS total_transfers,\n  SUM(amount) AS total_exposure,\n  AVG(amount) AS avg_transfer\nFROM transfers\nWHERE status = 'approved' AND country != 'US';",
        solutionExplanation:
          "The WHERE clause acts as an in-flight filter, feeding only approved international rows into the vector aggregators.",
      },
    ],
    checkpointExam: {
      id: "af-exam",
      title: "Quarterly Revenue Reconciliation Certification",
      subtitle: "Checkpoint 3.1: Vector Aggregations Verification",
      scenarioContext:
        "You are tasked with closing the quarterly books for the sales division. You must execute an aggregate query that calculates the total transaction count and gross revenue across the sales ledger.",
      passingScoreDescription: "Pass the aggregation challenge to certify completion of Lesson 8.",
      questions: [
        {
          id: "cp-af-1",
          title: "Calculate Total Volume & Gross Revenue",
          prompt:
            "Run a query calculating `COUNT(*)` as `total_count` and `SUM(amount)` as `total_amount` from the `sales` table.",
          hint: "SELECT COUNT(*), SUM(amount) FROM sales;",
          solutionSQL: "SELECT COUNT(*), SUM(amount) FROM sales;",
          validation: {
            type: "query_result",
            queryPattern: /SELECT.*(COUNT|SUM).*FROM\s+sales/i,
            query: "SELECT COUNT(*), SUM(amount) FROM sales",
            expectedResult: [[12, 15500]],
          },
        },
      ],
    },
    seedSQL: getSeedSQL("aggregate-functions"),
    tasks: [
      {
        id: "af-1",
        title: "Calculate total volume & revenue",
        description:
          "Run a query calculating COUNT(*) as total_count and SUM(amount) as total_amount from sales.",
        hint: "SELECT COUNT(*), SUM(amount) FROM sales;",
        validation: {
          type: "query_result",
          queryPattern: /SELECT.*(COUNT|SUM).*FROM\s+sales/i,
          query: "SELECT COUNT(*), SUM(amount) FROM sales",
          expectedResult: [[12, 15500]],
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2. GROUP BY & HAVING
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "group-by-having",
    title: "Bucketing & Post-Aggregation Filters",
    track: "aggregations",
    trackIndex: 1,
    description:
      "Partition datasets into categorical buckets with GROUP BY and apply threshold filters using HAVING.",
    analogy: {
      title: "Sorting Laundry into Color Baskets",
      story:
        "Imagine doing laundry for a huge family.\n\n1. First, you throw away gum wrappers and receipts found in pockets (`WHERE`—filtered out before sorting).\n2. Next, you sort the remaining clothes into three separate laundry baskets: Whites, Darks, and Delicates (`GROUP BY color`).\n3. You count how many shirts are inside each basket (`COUNT(*)`).\n4. Finally, you only run the washing machine for baskets that have at least 5 garments (`HAVING COUNT(*) >= 5`). Baskets with only 1 item wait until next week.\n\nNotice the sequence: `WHERE` happens before clothes touch the baskets; `HAVING` happens only after baskets are sorted and counted.",
      takeaway:
        "WHERE filters individual rows before sorting into baskets. HAVING filters entire baskets after they've been calculated.",
    },
    mnemonic: {
      phrase: "Frogs Will Get Hungry Sipping Orange Lemonade",
      breakdown: [
        { letter: "F", word: "FROM", meaning: "Step 1: Pick the table" },
        { letter: "W", word: "WHERE", meaning: "Step 2: Filter raw rows" },
        { letter: "G", word: "GROUP BY", meaning: "Step 3: Cluster into baskets" },
        { letter: "H", word: "HAVING", meaning: "Step 4: Filter the baskets" },
        { letter: "S", word: "SELECT", meaning: "Step 5: Project & alias columns" },
        { letter: "O", word: "ORDER BY", meaning: "Step 6: Sort results" },
        { letter: "L", word: "LIMIT", meaning: "Step 7: Cap the count" },
      ],
      whyItMatters:
        "This execution order explains why HAVING exists and why WHERE cannot touch aggregate functions.",
    },
    patterns: [
      {
        trigger: "Whenever a question says 'per X' or 'for each Y'?",
        solution: "GROUP BY <column>",
        example: "GROUP BY category",
      },
      {
        trigger: "Whenever you need to filter AFTER an aggregate calculation?",
        solution: "HAVING <aggregate> <condition>",
        example: "HAVING SUM(amount) > 500",
      },
    ],
    proTips: [
      "The Golden Rule: Every non-aggregated column in your SELECT clause MUST appear in your GROUP BY clause.",
      "Use WHERE to eliminate irrelevant rows early—it dramatically reduces the memory footprint of the GROUP BY hash table.",
      "You can group by multiple columns: `GROUP BY department, job_title`.",
    ],
    gotchas: [
      "Never put an aggregate function in a WHERE clause: `WHERE SUM(amount) > 500` is an instant syntax error. Change WHERE to HAVING.",
      "HAVING can only evaluate grouped attributes and aggregate calculations, not arbitrary row-level columns.",
    ],
    diagramType: "pipeline",
    intuitionCheck: {
      question: "Why does `SELECT category FROM tx WHERE SUM(amount) > 500 GROUP BY category;` trigger a syntax error?",
      options: [
        "Because WHERE runs before GROUP BY, so sums don't exist yet! You must use HAVING.",
        "Because category must be capitalized.",
        "Transactions cannot have amounts over 500.",
        "GROUP BY can only be used on primary keys.",
      ],
      correctIndex: 0,
      explanation:
        "Following 'Frogs Will Get Hungry...', WHERE is Step 2; grouping and SUM calculations happen in Step 3/4. HAVING is specifically designed for Step 4.",
    },
    content: [
      {
        heading: "1. The 'For Each' Magic: GROUP BY",
        body: "What happens when your boss asks: 'What is our revenue per department?' or 'How many tickets did each customer open?'\n\nYou cannot use a single `SUM()` because you don't want one giant number; you want a breakdown.\n\nThis is where `GROUP BY` enters. It tells MySQL to partition the table into separate categorical buckets. MySQL sweeps through the table, groups rows that share the same key (e.g. `'Electronics'`, `'Clothing'`), and evaluates the aggregate functions independently for each bucket.",
        code: "-- Revenue and transaction volume grouped by category\nSELECT \n  category,\n  COUNT(*) AS total_orders,\n  SUM(amount) AS total_revenue\nFROM transactions\nGROUP BY category;",
      },
      {
        heading: "2. The Golden Rule of GROUP BY Columns",
        body: "Look closely at the query above:\n`SELECT category, COUNT(*), SUM(amount) ... GROUP BY category;`\n\nNotice that `category` is in both `SELECT` and `GROUP BY`. This is a non-negotiable law of relational algebra:\n\nIf a column in `SELECT` is not wrapped inside an aggregate function (like `SUM` or `COUNT`), it MUST appear in the `GROUP BY` clause. Why? Because if you have 50 rows for 'Electronics', MySQL needs to know which single value to display on that row!",
      },
      {
        heading: "3. Filtering Groups with HAVING",
        body: "Now for the million-dollar question: what if you only want to see categories that brought in more than $500 in total revenue?\n\nBeginners reflexively write: `WHERE SUM(amount) > 500`. And MySQL immediately throws an error: `Invalid use of group function`.\n\nWhy? Look at the query execution order: `WHERE` runs in Step 2, before rows are sorted into groups in Step 3! In Step 2, `SUM(amount)` does not exist yet.\n\nTo solve this, SQL provides `HAVING`. The `HAVING` clause runs in Step 4, after groups have been formed and calculated. It allows you to filter entire buckets:",
        code: "-- Only display categories whose aggregate sales exceed $500\nSELECT \n  category,\n  SUM(amount) AS total_spent\nFROM transactions\nGROUP BY category\nHAVING SUM(amount) > 500\nORDER BY total_spent DESC;",
      },
      {
        heading: "4. Summary of Execution Order: F-W-G-H-S-O-L",
        body: "Always recite the mnemonic 'Frogs Will Get Hungry Sipping Orange Lemonade':\n\n1. FROM: Which table is being read?\n2. WHERE: Which individual rows qualify?\n3. GROUP BY: How are rows bucketed?\n4. HAVING: Which aggregate buckets qualify?\n5. SELECT: Which columns and calculations are projected?\n6. ORDER BY: How should the final output be sorted?\n7. LIMIT: How many rows should be returned?\n\nKeep this sequence in your mind, and you will never make a syntax error again.",
      },
    ],
    exercises: [
      {
        type: "drag-block",
        id: "gh-drag-1",
        title: "Assemble a Grouped Aggregation with HAVING",
        instructions:
          "Arrange the clauses in proper execution order to group transactions by category and filter for totals over 500.",
        scenarioContext:
          "Management wants to review high-volume categories with more than $500 in total customer spend.",
        blocks: [
          { id: "b1", text: "SELECT category, SUM(amount)" },
          { id: "b2", text: "FROM transactions" },
          { id: "b3", text: "GROUP BY category" },
          { id: "b4", text: "HAVING SUM(amount) > 500;" },
        ],
        solution: ["b1", "b2", "b3", "b4"],
        hint: "Remember the order: SELECT ..., FROM ..., GROUP BY ..., HAVING ...;",
        explanation:
          "Brilliant! The GROUP BY buckets transactions by category, and HAVING applies the threshold filter to the calculated sum.",
      },
      {
        type: "scenario",
        id: "gh-scenario-1",
        title: "University Department GPA & Enrollment Audit",
        companyOrContext: "Academic Analytics Bureau",
        problemStatement:
          "The university provost is conducting an academic audit. You need to identify departments that have high student volume.\n\nTable: `students (id, name, department, gpa)`.\nWrite a query that displays:\n1. Column `department`\n2. Average GPA as `avg_gpa` rounded to 2 decimal places\n3. Total student count as `student_count`\nGroup by `department` and only include departments that have at least 3 students.",
        schemaSetupSQL:
          "CREATE TABLE IF NOT EXISTS students (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name VARCHAR(100) NOT NULL,\n  department VARCHAR(100) NOT NULL,\n  gpa REAL NOT NULL\n);\nINSERT OR IGNORE INTO students (id, name, department, gpa) VALUES\n  (1, 'Alice Chen', 'Computer Science', 3.85),\n  (2, 'Bob Smith', 'Computer Science', 3.60),\n  (3, 'Charlie Brown', 'Computer Science', 3.90),\n  (4, 'Diana Prince', 'Mathematics', 3.75),\n  (5, 'Evan Wright', 'Mathematics', 3.40),\n  (6, 'Fiona Gallagher', 'Physics', 3.95),\n  (7, 'George Clark', 'Physics', 3.80),\n  (8, 'Hannah Abbott', 'Physics', 3.65);",
        requirements: [
          {
            id: "req-1",
            text: "Select department, ROUND(AVG(gpa), 2) as avg_gpa, COUNT(*) as student_count",
            hint: "SELECT department, ROUND(AVG(gpa), 2) AS avg_gpa, COUNT(*) AS student_count",
            syntaxPattern: /select[\s\S]*department[\s\S]*(round\s*\(\s*)?avg\s*\(\s*gpa\s*\)[\s\S]*count\s*\(\s*\*?\s*\)/i,
          },
          {
            id: "req-2",
            text: "Group by department",
            hint: "GROUP BY department",
            syntaxPattern: /group\s+by\s+department/i,
          },
          {
            id: "req-3",
            text: "Filter with HAVING COUNT(*) >= 3",
            hint: "HAVING COUNT(*) >= 3",
            syntaxPattern: /having\s+count\s*\(\s*\*?\s*\)\s*>=\s*3/i,
          },
        ],
        solutionSQL:
          "SELECT \n  department,\n  ROUND(AVG(gpa), 2) AS avg_gpa,\n  COUNT(*) AS student_count\nFROM students\nGROUP BY department\nHAVING COUNT(*) >= 3;",
        solutionExplanation:
          "Using GROUP BY department collapses individual students into major cohorts, while HAVING COUNT(*) >= 3 discards tiny sample sizes.",
      },
    ],
    checkpointExam: {
      id: "gh-exam",
      title: "Commercial Category Spend Threshold Certification",
      subtitle: "Checkpoint 3.2: GROUP BY & HAVING Verification",
      scenarioContext:
        "The retail finance division needs to identify key commercial business lines. You must group all transactions by category, calculate revenue totals, and filter for high-earning categories surpassing $500.",
      passingScoreDescription: "Pass both grouping and threshold objectives to certify completion of Track 3.",
      questions: [
        {
          id: "cp-gh-1",
          title: "Group Transactions by Category with Sums",
          prompt:
            "Select `category` and `SUM(amount)` from the `transactions` table grouped by `category`.",
          hint: "SELECT category, SUM(amount) FROM transactions GROUP BY category;",
          solutionSQL: "SELECT category, SUM(amount) FROM transactions GROUP BY category;",
          validation: {
            type: "query_result",
            queryPattern: /GROUP\s+BY\s+category/i,
            query: "SELECT COUNT(DISTINCT category) FROM transactions",
            expectedResult: [[3]],
          },
        },
        {
          id: "cp-gh-2",
          title: "Apply Post-Aggregation Threshold with HAVING",
          prompt:
            "Write a query grouping by `category` that shows `category` and `SUM(amount)` where `SUM(amount) > 500`.",
          hint: "SELECT category, SUM(amount) FROM transactions GROUP BY category HAVING SUM(amount) > 500;",
          solutionSQL:
            "SELECT category, SUM(amount) FROM transactions GROUP BY category HAVING SUM(amount) > 500;",
          validation: {
            type: "query_result",
            queryPattern: /HAVING.*(?:SUM|amount|>)/i,
            query: "SELECT category FROM transactions GROUP BY category HAVING SUM(amount) > 500",
          },
        },
      ],
    },
    seedSQL: getSeedSQL("group-by-having"),
    tasks: [
      {
        id: "gh-1",
        title: "Group by category with totals",
        description: "Select category and SUM(amount) from transactions grouped by category.",
        hint: "SELECT category, SUM(amount) FROM transactions GROUP BY category;",
        validation: {
          type: "query_result",
          queryPattern: /GROUP\s+BY\s+category/i,
          query: "SELECT COUNT(DISTINCT category) FROM transactions",
          expectedResult: [[3]],
        },
      },
      {
        id: "gh-2",
        title: "Filter categories exceeding 500 in sales",
        description: "Add a HAVING clause to show only categories where SUM(amount) > 500.",
        hint: "SELECT category, SUM(amount) FROM transactions GROUP BY category HAVING SUM(amount) > 500;",
        validation: {
          type: "query_result",
          queryPattern: /HAVING.*(?:SUM|amount|>)/i,
          query: "SELECT category FROM transactions GROUP BY category HAVING SUM(amount) > 500",
        },
      },
    ],
  },
];
