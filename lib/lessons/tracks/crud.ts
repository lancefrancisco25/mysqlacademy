import type { Lesson } from "@/types";
import { getSeedSQL } from "../../agents/schema-generator";

export const crudLessons: Lesson[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 1. INSERT DATA
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "insert-data",
    title: "INSERT INTO & Batch Ingestion",
    track: "crud",
    trackIndex: 0,
    description:
      "Populate relational entities using single-row and atomic multi-row batch inserts to maximize disk throughput.",
    analogy: {
      title: "The Restaurant Kitchen Order Carousel",
      story:
        "Imagine a bustling Italian restaurant. When a waiter takes orders from a table of six guests, they don't sprint to the kitchen with one ticket, sprint back to the table, take the second order, sprint back to the kitchen, and repeat this six times.\n\nThat would exhaust the waiter and clog the kitchen door. Instead, the waiter writes all six dishes on a single order ticket and clips it to the chef's carousel in one motion. In SQL, running individual single-row INSERT statements causes repetitive network round trips and transaction log flushes. Grouping records into a batch insert is up to 100x faster.",
      takeaway:
        "Batch inserts minimize transaction log commits and lock contention by grouping records into one atomic write.",
    },
    mnemonic: {
      phrase: "I-S-U-D: I See U Dancing",
      breakdown: [
        { letter: "I", word: "INSERT", meaning: "Create new rows" },
        { letter: "S", word: "SELECT", meaning: "Read & inspect rows" },
        { letter: "U", word: "UPDATE", meaning: "Modify existing rows" },
        { letter: "D", word: "DELETE", meaning: "Remove dead rows" },
      ],
      whyItMatters:
        "CRUD represents the four fundamental operations behind almost every web app and API in existence.",
    },
    patterns: [
      {
        trigger: "Adding a single new record?",
        solution: "INSERT INTO <table> (cols) VALUES (vals);",
        example: "INSERT INTO students (first_name, email) VALUES ('Alice', 'a@u.edu');",
      },
      {
        trigger: "Adding multiple records efficiently in one query?",
        solution: "INSERT INTO <table> (cols) VALUES (...), (...), (...);",
        example: "VALUES ('Alice', 'a@u.edu'), ('Bob', 'b@u.edu');",
      },
    ],
    proTips: [
      "Always specify column names explicitly in your INSERT statement. If someone adds a new column to the table later, queries without explicit column lists will break immediately.",
      "Wrap text strings in single quotes: 'Alice', not double quotes.",
      "If a column has AUTO_INCREMENT or DEFAULT, simply omit it from your column list—MySQL handles it automatically.",
    ],
    gotchas: [
      "The order of values in VALUES(...) must match the order of columns listed in INSERT INTO table(col1, col2) exactly.",
      "Inserting a string into a numeric column without quotes will work if MySQL can cast it, but inserting letters into an integer column throws a type mismatch error.",
    ],
    diagramType: "pipeline",
    intuitionCheck: {
      question: "Why is batch inserting 1,000 rows in a single INSERT statement faster than running 1,000 separate INSERT statements?",
      options: [
        "Because batch inserts bypass all database constraints.",
        "Because a single batch runs in one transaction, saving 999 disk-sync operations and network round trips.",
        "SQL can only run once per day.",
        "It isn't faster; both are identical in performance.",
      ],
      correctIndex: 1,
      explanation:
        "Each standalone statement incurs network handshake, parsing, and write-ahead log flush overhead. Batching groups it into one operation.",
    },
    content: [
      {
        heading: "1. Breathing Life into Empty Tables: The INSERT Command",
        body: "So far, we have built blueprints (tables), but our tables are like empty warehouses with no inventory. Now comes the moment to populate them with real data.\n\nThe SQL verb for creating new records is `INSERT INTO`. When you speak to MySQL, you specify three things:\n1. The target table: `INSERT INTO students`\n2. The specific columns you are filling: `(first_name, last_name, email)`\n3. The data values corresponding to those columns: `VALUES ('Alice', 'Johnson', 'alice@university.edu')`\n\nNotice that we completely omitted the `id` column! Because `id` was defined with `AUTO_INCREMENT`, MySQL automatically generates `1` for Alice behind the scenes.",
        code: "-- Inserting a single student record\nINSERT INTO students (first_name, last_name, email)\nVALUES ('Alice', 'Johnson', 'alice@university.edu');\n\n-- Inspect the row to see the auto-generated id\nSELECT * FROM students;",
      },
      {
        heading: "2. The Golden Rule: Always Declare Explicit Column Names",
        body: "Technically, SQL allows you to write: `INSERT INTO students VALUES (1, 'Alice', 'Johnson', 'alice@u.edu');` without naming columns. However, senior engineers consider this a severe anti-pattern.\n\nWhy? Imagine your coworker alters the table six months from now to add a `middle_name` column between `first_name` and `last_name`. Any legacy INSERT query written without explicit column names will instantly crash or accidentally put Johnson into the middle name column! By listing `(first_name, last_name, email)`, your query remains resilient forever.",
      },
      {
        heading: "3. High-Performance Multi-Row Batching",
        body: "What happens when you need to ingest 500 incoming students from a CSV file? If you send 500 individual `INSERT INTO` statements across the network, MySQL must parse 500 statements, open 500 transactions, and flush the write-ahead log to disk 500 times. This creates tremendous disk I/O bottleneck.\n\nInstead, SQL lets you chain multiple tuples of values separated by commas in a single query. The entire batch is processed in one transaction, reducing write latency by up to 98%!",
        code: "-- Inserting an entire cohort in one atomic operation\nINSERT INTO students (first_name, last_name, email)\nVALUES \n  ('Bob', 'Smith', 'bob@university.edu'),\n  ('Carol', 'Williams', 'carol@university.edu'),\n  ('Dave', 'Miller', 'dave@university.edu'),\n  ('Eve', 'Taylor', 'eve@university.edu');",
      },
      {
        heading: "4. Under the Hood: The Write-Ahead Log (WAL)",
        body: "When you run an INSERT, does MySQL immediately search the disk to find empty space in the data file? No—that would be too slow.\n\nInstead, MySQL writes the new record sequentially into an in-memory buffer pool and writes a lightning-fast sequential record to the Write-Ahead Log (WAL / redo log). This ensures durability: even if the power cord is yanked out a microsecond later, MySQL replays the log upon reboot and recovers the row.",
      },
      {
        heading: "5. DML Safety Protocols: Preventing Silent Ingestion Failures",
        body: "Because DML commands manipulate active application records, real-world database administrators adhere to three safety rules:\n\n1. Explicit Column Mapping: Always specify `(first_name, last_name, email)`. Omitting column lists causes queries to corrupt data when future schema migrations reorder columns.\n2. Integrity Constraint Safety: If any row in a batch violates a `UNIQUE` or `NOT NULL` constraint, MySQL aborts the entire statement and inserts zero rows, protecting table consistency.\n3. Safe Mutation Mode: For mutations (`UPDATE`, `DELETE`), MySQL supports `SQL_SAFE_UPDATES = 1`, which refuses to run any update or delete statement that lacks a `WHERE` clause containing a key column.",
        code: "-- Production-safe DML: explicit columns and constraint compliance\nINSERT INTO students (first_name, last_name, email)\nVALUES ('Sophia', 'Martinez', 'sophia@university.edu');",
      },
    ],
    exercises: [
      {
        type: "drag-block",
        id: "id-drag-1",
        title: "Construct a Multi-Row Batch INSERT Statement",
        instructions:
          "Assemble the SQL clause blocks in order to insert two students in a single batch statement.",
        scenarioContext:
          "Two transfer students just arrived at the admissions office. Ingest both in one query.",
        blocks: [
          { id: "b1", text: "INSERT INTO students" },
          { id: "b2", text: "(first_name, last_name, email)" },
          { id: "b3", text: "VALUES" },
          { id: "b4", text: "('Marcus', 'Vance', 'm@u.edu')," },
          { id: "b5", text: "('Elena', 'Rostova', 'e@u.edu');" },
        ],
        solution: ["b1", "b2", "b3", "b4", "b5"],
        hint: "Follow the sequence: INSERT INTO <table>, (columns), VALUES, row 1 with comma, row 2 with semicolon.",
        explanation:
          "Spot on! Notice how each row is wrapped in parentheses, separated by a comma, and the final tuple ends with a semicolon.",
      },
      {
        type: "scenario",
        id: "id-scenario-1",
        title: "Customer Support Ticket Ingestion Pipeline",
        companyOrContext: "Zendesk/Intercom Clone (HelpDesk Inc)",
        problemStatement:
          "You are building the ingestion webhook for HelpDesk Inc. A customer submits two urgent support tickets. You need to write an INSERT statement to add both tickets to the `tickets` table in one batch operation.\n\nIncoming Ticket Queue:\n1. Subject: 'Login authentication failure' from 'ceo@acme.com' with 'urgent' priority\n2. Subject: 'Invoice PDF download broken' from 'billing@globex.org' with 'high' priority",
        previewTable: {
          tableName: "tickets",
          description: "Support Desk Ingestion Queue Target",
          columns: ["id", "subject", "customer_email", "priority"],
          rows: [
            [1, "Login authentication failure", "ceo@acme.com", "urgent"],
            [2, "Invoice PDF download broken", "billing@globex.org", "high"],
          ],
        },
        schemaSetupSQL:
          "CREATE TABLE IF NOT EXISTS tickets (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  subject VARCHAR(200) NOT NULL,\n  customer_email VARCHAR(150) NOT NULL,\n  priority VARCHAR(20) NOT NULL\n);",
        requirements: [
          {
            id: "req-1",
            text: "Batch-ingest the urgent authentication issue submitted by ceo@acme.com",
            hint: "VALUES ('Login authentication failure', 'ceo@acme.com', 'urgent')",
            syntaxPattern: /ceo@acme\.com/i,
            validationRule: {
              type: "query_result",
              query: "SELECT * FROM tickets WHERE customer_email = 'ceo@acme.com'",
            },
          },
          {
            id: "req-2",
            text: "Batch-ingest the high priority invoice issue submitted by billing@globex.org in the same statement",
            hint: "('Invoice PDF download broken', 'billing@globex.org', 'high')",
            syntaxPattern: /billing@globex\.org/i,
            validationRule: {
              type: "query_result",
              query: "SELECT * FROM tickets WHERE customer_email = 'billing@globex.org'",
            },
          },
        ],
        solutionSQL:
          "INSERT INTO tickets (subject, customer_email, priority)\nVALUES\n  ('Login authentication failure', 'ceo@acme.com', 'urgent'),\n  ('Invoice PDF download broken', 'billing@globex.org', 'high');",
        solutionExplanation:
          "Using a single multi-row INSERT ensures both tickets are queued atomically without triggering two round-trips to the database.",
      },
    ],
    checkpointExam: {
      id: "id-exam",
      title: "Admissions Cohort Ingestion Certification",
      subtitle: "Checkpoint 2.1: Data Ingestion Verification",
      scenarioContext:
        "The Fall semester enrollment deadline has arrived. You must ingest the primary honors student record and then batch-ingest the rest of the incoming student cohort to ensure Westfield Academy's database contains at least 5 active students.",
      passingScoreDescription: "Pass both ingestion tasks to certify completion of Lesson 4.",
      questions: [
        {
          id: "cp-id-1",
          title: "Insert Primary Student Record",
          prompt:
            "Westfield's admissions office needs to record their first admitted honors student into the 'students' registry. Register Alice Johnson into the database, specifying her first name, last name, and contact address as alice@university.edu.",
          hint: "Use an INSERT INTO statement matching column names in parentheses with corresponding string literals in the VALUES clause.",
          solutionSQL:
            "INSERT INTO students (first_name, last_name, email)\nVALUES ('Alice', 'Johnson', 'alice@university.edu');",
          validation: {
            type: "row_count_gte",
            table: "students",
            expectedCount: 1,
          },
        },
        {
          id: "cp-id-2",
          title: "Batch Ingest Remaining Cohort",
          prompt:
            "The admissions portal has finalized intake for the rest of the freshman orientation group. Write a single multi-row ingestion query that adds at least 4 additional student records (including their first names, last names, and university email addresses) so the directory scales to at least 5 registered members.",
          hint: "Chain multiple comma-separated value tuples after the VALUES keyword to execute an atomic multi-row batch insert.",
          solutionSQL:
            "INSERT INTO students (first_name, last_name, email)\nVALUES \n  ('Bob', 'Smith', 'bob@u.edu'),\n  ('Carol', 'Williams', 'carol@u.edu'),\n  ('Dave', 'Miller', 'dave@u.edu'),\n  ('Eve', 'Taylor', 'eve@u.edu');",
          validation: {
            type: "row_count_gte",
            table: "students",
            expectedCount: 5,
          },
        },
      ],
    },
    seedSQL: getSeedSQL("insert-data"),
    tasks: [
      {
        id: "id-1",
        title: "Insert primary student",
        description:
          "Insert a student record with first_name='Alice', last_name='Johnson', email='alice@university.edu'.",
        hint: "INSERT INTO students (first_name, last_name, email) VALUES ('Alice', 'Johnson', 'alice@university.edu');",
        validation: {
          type: "row_count_gte",
          table: "students",
          expectedCount: 1,
        },
      },
      {
        id: "id-2",
        title: "Batch insert remaining cohort",
        description:
          "Insert at least 4 additional students so the table contains 5 or more total records.",
        hint: "INSERT INTO students (first_name, last_name, email) VALUES ('Bob', 'S', 'b@u.edu'), ('Carol', 'W', 'c@u.edu'), ('Dave', 'M', 'd@u.edu'), ('Eve', 'T', 'e@u.edu');",
        validation: {
          type: "row_count_gte",
          table: "students",
          expectedCount: 5,
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2. SELECT BASICS
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "select-basics",
    title: "Projection, Ordering & Pagination",
    track: "crud",
    trackIndex: 1,
    description:
      "Master query projection, sorting semantics with ORDER BY, and result pagination with LIMIT to build responsive data APIs.",
    analogy: {
      title: "The Drive-Thru Barista",
      story:
        "When you pull up to a coffee shop drive-thru, you don't ask the barista for 'everything behind the counter' (`SELECT *`). If you did, they would dump espresso beans, milk cartons, syrups, and napkins through your car window, burying you in clutter!\n\nInstead, you order specifically: 'I want an Iced Caramel Macchiato' (`SELECT beverage, syrup`). The barista looks at the line of cars, sorts orders by arrival time (`ORDER BY timestamp ASC`), and only serves the next single car at the window (`LIMIT 1`). In database systems, requesting only the columns and rows you actually need keeps your app blazing fast.",
      takeaway:
        "Only project the specific attributes your UI needs. It saves CPU, RAM, and network bandwidth.",
    },
    mnemonic: {
      phrase: "S-F-O-L: Some Frogs Order Lemonade",
      breakdown: [
        { letter: "S", word: "SELECT", meaning: "Which columns do you want to see?" },
        { letter: "F", word: "FROM", meaning: "Which table holds them?" },
        { letter: "O", word: "ORDER BY", meaning: "How should the rows be sorted?" },
        { letter: "L", word: "LIMIT", meaning: "How many rows should come back?" },
      ],
      whyItMatters:
        "Remembering S-F-O-L gives you the basic skeleton of every standard query.",
    },
    patterns: [
      {
        trigger: "Select specific columns rather than everything?",
        solution: "SELECT col1, col2 FROM <table>;",
        example: "SELECT first_name, salary FROM employees;",
      },
      {
        trigger: "Sort highest to lowest (descending)?",
        solution: "ORDER BY <col> DESC",
        example: "ORDER BY salary DESC",
      },
      {
        trigger: "Limit output to the top N results?",
        solution: "LIMIT <number>",
        example: "LIMIT 3",
      },
    ],
    proTips: [
      "Avoid 'SELECT *' in production code. If a table has 50 columns with profile pictures, SELECT * pulls megabytes of useless data across your database network pipe.",
      "ORDER BY defaults to ASC (ascending, A-Z, 1-9) if omitted.",
      "You can sort by multiple columns: `ORDER BY department ASC, salary DESC`. This sorts by department first, and within each department, sorts by highest salary.",
    ],
    gotchas: [
      "LIMIT always belongs at the very end of your query. Putting LIMIT before ORDER BY causes a syntax error.",
      "Without an explicit ORDER BY, relational databases do not guarantee row order. Never rely on insertion order!",
    ],
    diagramType: "pipeline",
    intuitionCheck: {
      question: "What is the primary danger of using `SELECT *` in production web services?",
      options: [
        "It corrupts data on disk.",
        "It retrieves unneeded columns, wasting database memory and slowing down network transfer times.",
        "MySQL does not support the asterisk symbol.",
        "It deletes columns not in the query.",
      ],
      correctIndex: 1,
      explanation:
        "Projecting only needed columns (e.g. name, email) enables index-only scans and minimizes memory consumption.",
    },
    content: [
      {
        heading: "1. The Art of Projection: Choosing What to See",
        body: "Now that data is inside the database, how do we retrieve it? In SQL, we use the `SELECT` statement.\n\nDatabase engineers distinguish between two concepts:\n• Projection: Which columns (attributes) you want to see.\n• Selection: Which rows (records) you want to include.\n\nWhen you write `SELECT first_name, department, salary FROM employees;`, the database engine reads each row from disk, strips away the unused columns (like internal IDs, phone numbers, and addresses), and projects only the requested columns back to your terminal.",
        code: "-- Projecting only 3 specific columns\nSELECT first_name, department, salary\nFROM employees;",
      },
      {
        heading: "2. The Curse of SELECT *",
        body: "In beginner tutorials, you often see `SELECT * FROM table;`. The asterisk `*` means 'return every single column'. While convenient for quick terminal debugging, it is dangerous in production code:\n\n1. Network Bloat: If your table includes profile pictures or JSON payloads, `SELECT *` transmits megabytes of unnecessary payload across the database network pipe.\n2. In-Memory Sorting Penalty: If MySQL needs to sort the rows in memory, wide rows cause the buffer pool to overflow to temporary disk files, turning a 2-millisecond query into a 2-second crawl.\n3. Breaking API Contracts: If a developer adds a private `password_hash` column to the table, `SELECT *` will accidentally leak that column into your frontend API response!\n\nAlways name your projected columns explicitly.",
      },
      {
        heading: "3. Sorting Results with ORDER BY",
        body: "A fundamental mathematical property of relational databases is that tables are unordered sets. MySQL makes zero guarantees about what order rows will appear unless you explicitly state an `ORDER BY` clause.\n\n• `ASC` (Ascending): Lowest to highest (1, 2, 3...) or alphabetical (A to Z). This is the default.\n• `DESC` (Descending): Highest to lowest (100, 99, 98...) or reverse alphabetical (Z to A).",
        code: "-- Sort employees from highest earner to lowest earner\nSELECT first_name, salary\nFROM employees\nORDER BY salary DESC;",
      },
      {
        heading: "4. Pagination with LIMIT",
        body: "When you browse Amazon or Google, you never see 10,000 search results on a single screen. You see page 1: the top 10 or 20 items. In SQL, this is achieved with `LIMIT`.\n\n`LIMIT N` tells MySQL to stop scanning and return immediately after gathering `N` matching rows. This saves massive amounts of compute time.",
        code: "-- Return only the top 3 highest-paid employees\nSELECT first_name, salary\nFROM employees\nORDER BY salary DESC\nLIMIT 3;",
      },
    ],
    exercises: [
      {
        type: "drag-block",
        id: "sb-drag-1",
        title: "Assemble a Top-N Executive Salary Query",
        instructions:
          "Arrange the SQL clauses in proper lexical order to select the top 3 highest-earning employees.",
        scenarioContext:
          "The executive compensation board requested a report of the top 3 highest salaries in the company.",
        blocks: [
          { id: "b1", text: "SELECT first_name, salary" },
          { id: "b2", text: "FROM employees" },
          { id: "b3", text: "ORDER BY salary DESC" },
          { id: "b4", text: "LIMIT 3;" },
        ],
        solution: ["b1", "b2", "b3", "b4"],
        hint: "Remember the mnemonic S-F-O-L: SELECT columns, FROM table, ORDER BY sort, LIMIT count.",
        explanation:
          "Excellent work! SQL requires clauses in strict lexical sequence: SELECT comes first, followed by FROM, ORDER BY, and finally LIMIT.",
      },
      {
        type: "scenario",
        id: "sb-scenario-1",
        title: "Music Streaming Leaderboard: Top 5 Viral Tracks",
        companyOrContext: "SoundWave Global (Streaming Platform)",
        problemStatement:
          "You are the data engineer powering the homepage leaderboard for SoundWave. The mobile app needs to display the top 5 most-played songs.\n\nLeaderboard criteria:\n1. Select the track's title, artist, and play count.\n2. Rank songs from highest total streams to lowest.\n3. Restrict the result set to the top 5 tracks for the mobile screen card.",
        previewTable: {
          tableName: "songs",
          description: "SoundWave Global Streaming Catalog",
          columns: ["id", "title", "artist", "play_count", "genre"],
          rows: [
            [1, "Blinding Lights", "The Weeknd", 3500000, "Pop"],
            [2, "Shape of You", "Ed Sheeran", 3100000, "Pop"],
            [3, "Someone You Loved", "Lewis Capaldi", 2800000, "Pop"],
            [4, "Sunflower", "Post Malone", 2750000, "Hip Hop"],
            [5, "Starboy", "The Weeknd", 2600000, "R&B"],
          ],
        },
        schemaSetupSQL:
          "CREATE TABLE IF NOT EXISTS songs (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  title VARCHAR(120) NOT NULL,\n  artist VARCHAR(120) NOT NULL,\n  play_count INTEGER NOT NULL,\n  genre VARCHAR(50)\n);\nINSERT OR IGNORE INTO songs (id, title, artist, play_count, genre) VALUES\n  (1, 'Blinding Lights', 'The Weeknd', 3500000, 'Pop'),\n  (2, 'Shape of You', 'Ed Sheeran', 3100000, 'Pop'),\n  (3, 'Someone You Loved', 'Lewis Capaldi', 2800000, 'Pop'),\n  (4, 'Sunflower', 'Post Malone', 2750000, 'Hip Hop'),\n  (5, 'Starboy', 'The Weeknd', 2600000, 'R&B'),\n  (6, 'One Dance', 'Drake', 2500000, 'Afrobeats'),\n  (7, 'Closer', 'The Chainsmokers', 2400000, 'EDM');",
        requirements: [
          {
            id: "req-1",
            text: "Select track title, artist, and play count columns",
            hint: "SELECT title, artist, play_count",
            syntaxPattern: /select\s+(?=.*\btitle\b)(?=.*\bartist\b)(?=.*\bplay_count\b)/i,
          },
          {
            id: "req-2",
            text: "Query from the `songs` catalog table",
            hint: "FROM songs",
            syntaxPattern: /from\s+songs/i,
          },
          {
            id: "req-3",
            text: "Rank records in descending order of play count",
            hint: "ORDER BY play_count DESC",
            syntaxPattern: /order\s+by\s+play_count\s+desc/i,
          },
          {
            id: "req-4",
            text: "Cap the output to the top 5 tracks",
            hint: "LIMIT 5;",
            syntaxPattern: /limit\s+5/i,
          },
        ],
        solutionSQL:
          "SELECT title, artist, play_count\nFROM songs\nORDER BY play_count DESC\nLIMIT 5;",
        solutionExplanation:
          "This query avoids scanning all track data, orders by popularity, and retrieves just enough data to populate the 5-item mobile leaderboard card.",
      },
    ],
    checkpointExam: {
      id: "sb-exam",
      title: "Executive Compensation Reporting Exam",
      subtitle: "Checkpoint 2.2: Projection & Pagination Verification",
      scenarioContext:
        "The Chief Human Resources Officer needs a report on employee compensation. You are tasked with generating two clean SQL queries: one projecting department salaries, and one isolating the top 3 highest-earning leaders.",
      passingScoreDescription: "Pass both query tasks to certify completion of Lesson 5.",
      questions: [
        {
          id: "cp-sb-1",
          title: "Project Departmental Staff Salaries",
          prompt:
            "The compensation audit committee needs an explicit column projection of Westfield's staff records. Retrieve each employee's first name, departmental assignment, and annual compensation from the employee directory without pulling unnecessary metadata.",
          hint: "Specify the explicit column list in your SELECT projection targeting the employees relation.",
          solutionSQL: "SELECT first_name, department, salary FROM employees;",
          validation: {
            type: "row_count_gte",
            table: "employees",
            expectedCount: 10,
            queryPattern: /SELECT.*FROM\s+employees/i,
            expectedColumns: ["first_name", "department", "salary"],
          },
        },
        {
          id: "cp-sb-2",
          title: "Isolate Top 3 Highest Earners",
          prompt:
            "The executive board needs to identify the organization's highest compensated talent for annual bonus planning. Query the employee roster to display their first name and salary, sorting the results from greatest compensation downward, and restrict the output to isolate only the top 3 earners.",
          hint: "Combine ORDER BY on the compensation column with the DESC qualifier and cap output volume using LIMIT.",
          solutionSQL: "SELECT first_name, salary FROM employees ORDER BY salary DESC LIMIT 3;",
          validation: {
            type: "query_result",
            queryPattern: /ORDER\s+BY.*salary.*DESC.*LIMIT\s+3/i,
            query: "SELECT salary FROM employees ORDER BY salary DESC LIMIT 1",
            expectedResult: [[112000]],
          },
        },
      ],
    },
    seedSQL: getSeedSQL("select-basics"),
    tasks: [
      {
        id: "sb-1",
        title: "Select explicit employee columns",
        description: "Query first_name, department, and salary from the employees table.",
        hint: "SELECT first_name, department, salary FROM employees;",
        validation: {
          type: "row_count_gte",
          table: "employees",
          expectedCount: 10,
          queryPattern: /SELECT.*FROM\s+employees/i,
          expectedColumns: ["first_name", "department", "salary"],
        },
      },
      {
        id: "sb-2",
        title: "Sort highest salaries with pagination",
        description:
          "Select first_name and salary ordered by salary DESC, limited to the top 3 employees.",
        hint: "SELECT first_name, salary FROM employees ORDER BY salary DESC LIMIT 3;",
        validation: {
          type: "query_result",
          queryPattern: /ORDER\s+BY.*salary.*DESC.*LIMIT\s+3/i,
          query: "SELECT salary FROM employees ORDER BY salary DESC LIMIT 1",
          expectedResult: [[112000]],
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3. WHERE CLAUSES
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "where-clauses",
    title: "Predicate Filtering & Logical Operators",
    track: "crud",
    trackIndex: 2,
    description:
      "Filter result sets with precision using WHERE clauses, compound boolean operators, LIKE pattern matching, and BETWEEN range boundaries.",
    analogy: {
      title: "The VIP Nightclub Bouncer",
      story:
        "Think of the WHERE clause as the velvet-rope bouncer standing at the entrance of an exclusive nightclub.\n\n• Guests aged 21 or older enter (`WHERE age >= 21`).\n• Guests on the celebrity VIP list enter (`WHERE status IN ('vip', 'artist')`).\n• Guests whose name begins with 'A' get free admission (`WHERE name LIKE 'A%'`).\n\nThe bouncer inspects each candidate at the door. If a person fails the condition, they are stopped immediately and never step foot on the dance floor. In SQL, the WHERE clause inspects candidate rows as they are pulled from disk, discarding non-matching rows before they reach memory.",
      takeaway:
        "WHERE filters individual rows during the initial disk scan before any grouping or calculations take place.",
    },
    mnemonic: {
      phrase: "B-I-L-O: Between, In, Like, Operators",
      breakdown: [
        { letter: "B", word: "BETWEEN", meaning: "Range check (BETWEEN 50 AND 100)" },
        { letter: "I", word: "IN", meaning: "List membership (IN ('pending', 'shipped'))" },
        { letter: "L", word: "LIKE", meaning: "Pattern match with % wildcards" },
        { letter: "O", word: "OPERATORS", meaning: "=, !=, >, <, >=, <=, AND, OR" },
      ],
      whyItMatters:
        "B-I-L-O covers all the tools you'll ever need to filter candidate rows with precision.",
    },
    patterns: [
      {
        trigger: "Filtering by an exact match?",
        solution: "WHERE status = 'completed'",
        example: "WHERE status = 'completed'",
      },
      {
        trigger: "Filtering within a numerical or date range?",
        solution: "WHERE price BETWEEN low AND high",
        example: "WHERE price BETWEEN 100 AND 500",
      },
      {
        trigger: "Matching against a list of accepted values?",
        solution: "WHERE status IN ('a', 'b', 'c')",
        example: "WHERE status IN ('pending', 'shipped')",
      },
      {
        trigger: "Searching for text starting with a prefix?",
        solution: "WHERE name LIKE 'Prefix%'",
        example: "WHERE customer_name LIKE 'A%'",
      },
    ],
    proTips: [
      "Combine conditions using parentheses when mixing AND and OR: `(status = 'paid' OR status = 'pending') AND amount > 100`. Parentheses prevent operator precedence surprises!",
      "In SQL, NULL means 'unknown'. Never write `col = NULL`. Always write `col IS NULL` or `col IS NOT NULL`.",
      "The `=` sign in SQL is for equality comparison, not assignment.",
    ],
    gotchas: [
      "LIKE '%word%' with a leading wildcard cannot use B-Tree indexes and will trigger a full table scan on huge tables.",
      "BETWEEN is inclusive on both ends: `BETWEEN 10 AND 20` includes both 10 and 20.",
    ],
    diagramType: "pipeline",
    intuitionCheck: {
      question: "Why does `SELECT * FROM users WHERE email = NULL;` fail to return rows where the email is empty?",
      options: [
        "Because NULL in SQL represents an unknown state; comparing anything to NULL with '=' evaluates to UNKNOWN. You must write `IS NULL`.",
        "Because email cannot be null in any database.",
        "Because '=' is only used for numbers in SQL.",
        "It doesn't fail; it returns all rows.",
      ],
      correctIndex: 0,
      explanation:
        "In SQL ternary logic (TRUE, FALSE, UNKNOWN), NULL is not equal to anything, not even itself! Always use `IS NULL` or `IS NOT NULL`.",
    },
    content: [
      {
        heading: "1. The Power of Predicates: The WHERE Filter Lifecycle",
        body: "Without filtering, every query returns the entire table. If your table has 50 million records, your query will crash your server! The `WHERE` clause is how we filter rows based on logical conditions (called predicates).\n\nWhen MySQL reads a row, it evaluates the predicate expression:\n• If TRUE: The row continues down the pipeline to be projected.\n• If FALSE or NULL (UNKNOWN): The row is instantly dropped from memory.\n\nLet's filter for all orders with a status of 'completed':",
        code: "SELECT * FROM orders\nWHERE status = 'completed';",
      },
      {
        heading: "2. Compound Logic: AND, OR, and Parentheses",
        body: "Real-world queries often require multiple conditions simultaneously:\n\n• `AND`: Both conditions must be TRUE. If either is FALSE, the row is rejected.\n• `OR`: At least one condition must be TRUE.\n\nCrucial Rule of Precedence: In SQL, `AND` has higher precedence than `OR` (just like multiplication before addition in math). Look at this common trap:\n\n`WHERE status = 'vip' OR status = 'staff' AND spend > 500;`\n\nMySQL interprets this as: `status = 'vip'` OR `(status = 'staff' AND spend > 500)`. Every single VIP will be included, even if they spent zero dollars! To fix this, always wrap your OR conditions in parentheses:\n\n`WHERE (status = 'vip' OR status = 'staff') AND spend > 500;`",
      },
      {
        heading: "3. Surgical Operators: BETWEEN, IN, and LIKE",
        body: "SQL provides specialized operators that make your queries readable and elegant:\n\n1. `BETWEEN low AND high`: Checks if a number or date falls within a range (inclusive):\n   `WHERE price BETWEEN 100 AND 500`\n\n2. `IN (v1, v2, v3)`: Replaces a chain of messy `OR` clauses:\n   `WHERE status IN ('completed', 'shipped', 'delivered')`\n\n3. `LIKE`: Pattern matching with wildcard characters:\n   • `%` represents zero or more characters. `'A%'` matches 'Alice', 'Apple', and 'A'.\n   • `_` represents exactly one character. `'T_m'` matches 'Tom' and 'Tim'.",
        code: "-- Combining LIKE and numerical comparison\nSELECT id, customer_name, price, quantity\nFROM orders\nWHERE customer_name LIKE 'A%'\n  AND price >= 300\n  AND quantity >= 1;",
      },
      {
        heading: "4. The Three-Valued Logic of NULL",
        body: "One of the greatest surprises for developers new to SQL is Three-Valued Logic: a boolean expression in SQL can evaluate to `TRUE`, `FALSE`, or `UNKNOWN`.\n\nBecause `NULL` signifies missing information, the database does not know what it is. Is unknown equal to 5? Nobody knows—so `NULL = 5` evaluates to UNKNOWN! Because UNKNOWN is not TRUE, the row is rejected.\n\nTherefore, never use `=` or `!=` with NULL. Always write `IS NULL` or `IS NOT NULL`.",
      },
    ],
    exercises: [
      {
        type: "drag-block",
        id: "wc-drag-1",
        title: "Assemble a Compound Filter Query",
        instructions:
          "Assemble the SQL clauses to query completed orders with a price of at least 300.",
        scenarioContext:
          "The finance controller needs to review high-value fulfilled orders for invoice auditing.",
        blocks: [
          { id: "b1", text: "SELECT * FROM orders" },
          { id: "b2", text: "WHERE status = 'completed'" },
          { id: "b3", text: "AND price >= 300" },
          { id: "b4", text: "AND quantity >= 1;" },
        ],
        solution: ["b1", "b2", "b3", "b4"],
        hint: "Start with SELECT * FROM orders, followed by WHERE status, and chained AND conditions.",
        explanation:
          "Flawless! Chaining conditions with AND narrows the search down so only rows satisfying every predicate survive.",
      },
      {
        type: "scenario",
        id: "wc-scenario-1",
        title: "E-Commerce Fraud Detection: Flagged Transactions",
        companyOrContext: "SecurePay Gateway",
        problemStatement:
          "The risk engineering team at SecurePay needs to identify suspicious transactions for audit inspection.\n\nRisk assessment rules:\n1. Isolate transactions with monetary amounts between $500 and $5,000 inclusive.\n2. Filter for transactions flagged by risk assessment as either 'review' or 'flagged'.\n3. Exclude domestic United States transactions ('US') to analyze cross-border anomalies.",
        previewTable: {
          tableName: "transactions",
          description: "SecurePay Live Transaction Audit Log",
          columns: ["id", "amount", "risk_status", "country"],
          rows: [
            [1, 1200.0, "review", "DE"],
            [2, 450.0, "review", "GB"],
            [3, 3200.0, "flagged", "BR"],
            [4, 7500.0, "flagged", "CA"],
            [5, 1800.0, "approved", "FR"],
            [6, 2100.0, "review", "US"],
          ],
        },
        schemaSetupSQL:
          "CREATE TABLE IF NOT EXISTS transactions (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  amount REAL NOT NULL,\n  risk_status VARCHAR(20) NOT NULL,\n  country VARCHAR(10) NOT NULL\n);\nINSERT OR IGNORE INTO transactions (id, amount, risk_status, country) VALUES\n  (1, 1200, 'review', 'DE'),\n  (2, 450, 'review', 'GB'),\n  (3, 3200, 'flagged', 'BR'),\n  (4, 7500, 'flagged', 'CA'),\n  (5, 1800, 'approved', 'FR'),\n  (6, 2100, 'review', 'US'),\n  (7, 850, 'flagged', 'JP');",
        requirements: [
          {
            id: "req-1",
            text: "Select transaction charges with amounts between $500 and $5,000 inclusive",
            hint: "amount BETWEEN 500 AND 5000",
            syntaxPattern: /(amount\s+between\s+500\s+and\s+5000|amount\s*>=\s*500\s+and\s+amount\s*<=\s*5000)/i,
          },
          {
            id: "req-2",
            text: "Target charges marked under risk assessment as either review or flagged",
            hint: "risk_status IN ('review', 'flagged')",
            syntaxPattern: /(risk_status\s+in\s*\(\s*['"]review['"]\s*,\s*['"]flagged['"]\s*\)|risk_status\s*=\s*['"]review['"]\s+or\s+risk_status\s*=\s*['"]flagged['"])/i,
          },
          {
            id: "req-3",
            text: "Exclude domestic transactions originating from the United States ('US')",
            hint: "country != 'US'",
            syntaxPattern: /country\s*(!=|<>)\s*['"]US['"]/i,
          },
        ],
        solutionSQL:
          "SELECT *\nFROM transactions\nWHERE amount BETWEEN 500 AND 5000\n  AND risk_status IN ('review', 'flagged')\n  AND country != 'US';",
        solutionExplanation:
          "Using BETWEEN and IN keeps the logic clean and allows the database engine to utilize range indexes efficiently.",
      },
    ],
    checkpointExam: {
      id: "wc-exam",
      title: "Warehouse Fulfillment Audit Exam",
      subtitle: "Checkpoint 2.3: Predicate Filtering Verification",
      scenarioContext:
        "You are auditing the warehouse fulfillment database. You must isolate completed customer orders, and then filter high-value inventory shipments with surgical precision.",
      passingScoreDescription: "Pass both filter tasks to certify completion of Lesson 6.",
      questions: [
        {
          id: "cp-wc-1",
          title: "Isolate All Completed Orders",
          prompt:
            "Westfield Fulfillment operations requires an audit of all shipments that successfully reached destination. Filter the orders ledger to pull full record details exclusively for orders marked with a completed fulfillment status.",
          hint: "Use a WHERE equality predicate matching the literal string 'completed' against the order status field.",
          solutionSQL: "SELECT * FROM orders WHERE status = 'completed';",
          validation: {
            type: "query_result",
            queryPattern: /WHERE.*status\s*=\s*['"]completed['"]/i,
            query: "SELECT COUNT(*) FROM orders WHERE status = 'completed'",
            expectedResult: [[5]],
          },
        },
        {
          id: "cp-wc-2",
          title: "Filter High-Value Hardware Orders",
          prompt:
            "The logistics team is reviewing insurance claims on premium shipments. Query the orders ledger to extract all shipments where unit value reaches or exceeds 300 while ensuring at least 1 unit was dispatched.",
          hint: "Connect two numeric comparison predicates using the logical AND conjunction in your WHERE clause.",
          solutionSQL: "SELECT * FROM orders WHERE price >= 300 AND quantity >= 1;",
          validation: {
            type: "query_result",
            queryPattern: /WHERE.*price\s*>=?\s*300/i,
            query: "SELECT COUNT(*) FROM orders WHERE price >= 300 AND quantity >= 1",
            expectedResult: [[4]],
          },
        },
      ],
    },
    seedSQL: getSeedSQL("where-clauses"),
    tasks: [
      {
        id: "wc-1",
        title: "Filter completed orders",
        description: "Select all columns from orders where status is 'completed'.",
        hint: "SELECT * FROM orders WHERE status = 'completed';",
        validation: {
          type: "query_result",
          queryPattern: /WHERE.*status\s*=\s*['"]completed['"]/i,
          query: "SELECT COUNT(*) FROM orders WHERE status = 'completed'",
          expectedResult: [[5]],
        },
      },
      {
        id: "wc-2",
        title: "Filter high-value hardware",
        description: "Select orders where price >= 300 AND quantity >= 1.",
        hint: "SELECT * FROM orders WHERE price >= 300 AND quantity >= 1;",
        validation: {
          type: "query_result",
          queryPattern: /WHERE.*price\s*>=?\s*300/i,
          query: "SELECT COUNT(*) FROM orders WHERE price >= 300 AND quantity >= 1",
          expectedResult: [[4]],
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4. UPDATE & DELETE
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "update-delete",
    title: "Targeted Updates & Safe Deletion",
    track: "crud",
    trackIndex: 3,
    description:
      "Mutate state safely using UPDATE SET and DELETE FROM with precise WHERE constraints to avoid catastrophic data loss.",
    analogy: {
      title: "The Surgeon's Scalpel vs The Sledgehammer",
      story:
        "Imagine an oral surgeon extracting an impacted wisdom tooth. They carefully inspect tooth #32, numb that exact spot, and extract it with surgical precision.\n\nIf the surgeon walked into the room blindfolded and swung a sledgehammer, every tooth in the patient's mouth would be smashed out. In SQL, running `DELETE FROM inventory;` without a `WHERE` clause is swinging the sledgehammer. It wipes every single record in the table in milliseconds with zero confirmation prompt.\n\nAlways use the surgeon's scalpel: pinpoint the exact primary key with WHERE before you mutate.",
      takeaway:
        "Every UPDATE and DELETE must be accompanied by a precise WHERE clause targeting only the intended rows.",
    },
    mnemonic: {
      phrase: "S-B-M: SELECT Before Mutate!",
      breakdown: [
        { letter: "S", word: "SELECT", meaning: "Run a SELECT query with your WHERE clause first" },
        { letter: "B", word: "BEFORE", meaning: "Inspect the returned rows with your own eyes" },
        { letter: "M", word: "MUTATE", meaning: "Replace SELECT with UPDATE or DELETE safely" },
      ],
      whyItMatters:
        "This single habit has saved thousands of developers from career-ending production data loss incidents.",
    },
    patterns: [
      {
        trigger: "Modifying values in existing rows?",
        solution: "UPDATE <table> SET col = val WHERE <condition>;",
        example: "UPDATE inventory SET quantity = 100 WHERE product_name = 'Widget B';",
      },
      {
        trigger: "Removing rows that are obsolete or out-of-stock?",
        solution: "DELETE FROM <table> WHERE <condition>;",
        example: "DELETE FROM inventory WHERE quantity = 0;",
      },
    ],
    proTips: [
      "Always write: `SELECT * FROM inventory WHERE product_name = 'Widget B';` first! Confirm it returns exactly 1 row, then change `SELECT * FROM` to `UPDATE ... SET`.",
      "Most production databases enable 'safe update mode', which blocks any UPDATE or DELETE statement that lacks a WHERE clause containing a key column.",
      "In modern applications, consider 'Soft Deletion': instead of DELETE, set `deleted_at = NOW()`. That way, accidentally deleted records can be restored instantly.",
    ],
    gotchas: [
      "In SQL, forgetting the WHERE clause updates or deletes EVERY row in the entire table with zero confirmation prompt!",
      "UPDATE and DELETE operations cannot be undone unless you are inside an explicit transaction (`BEGIN ... ROLLBACK`).",
    ],
    diagramType: "pipeline",
    intuitionCheck: {
      question: "What happens if you run `DELETE FROM inventory;` without adding a WHERE clause?",
      options: [
        "MySQL asks for confirmation: 'Are you sure you want to delete all rows?'",
        "It deletes only the first row in the table.",
        "It instantly deletes every single row in the inventory table.",
        "It throws a syntax error because WHERE is mandatory.",
      ],
      correctIndex: 2,
      explanation:
        "Standard SQL treats an unbounded DELETE as an instruction to wipe all rows in the relation.",
    },
    content: [
      {
        heading: "1. The Gravity of Data Mutation",
        body: "So far, our queries have been read-only or additive. But in real-world systems, states change constantly: customers update their shipping addresses, flight seats get booked, and cancelled orders must be cleaned up.\n\nThis brings us to the two mutation verbs:\n• `UPDATE`: Alters values in existing rows.\n• `DELETE`: Permanently removes rows from disk.\n\nBecause these operations alter or destroy data, they demand the utmost discipline. A single missing `WHERE` clause can overwrite your company's entire pricing database in a split second.",
      },
      {
        heading: "2. The Anatomy of an UPDATE Statement",
        body: "An `UPDATE` statement follows a clean, logical structure:\n1. Specify the table: `UPDATE inventory`\n2. Specify the modification: `SET quantity = 150`\n3. Pinpoint the target rows: `WHERE product_name = 'Widget B'`\n\nYou can update multiple columns at the same time by separating assignments with commas:",
        code: "-- Updating stock quantity and restocking date\nUPDATE inventory\nSET quantity = 150\nWHERE product_name = 'Widget B';",
      },
      {
        heading: "3. Safe Deletion: The DELETE FROM Command",
        body: "When an inventory item is discontinued or out of stock, we remove it with `DELETE FROM`.\n\nNotice the phrasing: in SQL you do not delete columns; you delete whole rows. Therefore, there is no column list between `DELETE` and `FROM`.\n\n`DELETE FROM inventory WHERE quantity = 0;`\n\nMySQL scans the table, checks the WHERE condition for each row, and marks matching rows as deleted in the storage engine page.",
        code: "-- Removing out of stock items safely\nDELETE FROM inventory\nWHERE quantity = 0;",
      },
      {
        heading: "4. The Senior Engineer's Golden Rule: SELECT Before Mutate (S-B-M)",
        body: "How do production engineers guarantee they never accidentally update or delete the wrong customer?\n\nThey follow the S-B-M protocol:\n\nStep 1: Write a read query first:\n`SELECT * FROM inventory WHERE product_name = 'Widget B';`\n\nStep 2: Inspect the output with your own eyes. Does it return exactly the 1 row you intended to touch?\n\nStep 3: Only when you are 100% confident, replace `SELECT * FROM` with `UPDATE ... SET` or `DELETE FROM`.\n\nThis simple habit will protect your career throughout your engineering life.",
      },
    ],
    exercises: [
      {
        type: "drag-block",
        id: "ud-drag-1",
        title: "Assemble a Safe Targeted UPDATE Query",
        instructions:
          "Arrange the SQL clauses in order to update the quantity of 'Widget B' to 150.",
        scenarioContext:
          "A shipment of 150 units of Widget B just arrived at the loading dock.",
        blocks: [
          { id: "b1", text: "UPDATE inventory" },
          { id: "b2", text: "SET quantity = 150" },
          { id: "b3", text: "WHERE product_name = 'Widget B';" },
        ],
        solution: ["b1", "b2", "b3"],
        hint: "Follow the sequence: UPDATE table, SET col = value, WHERE condition.",
        explanation:
          "Great job! The UPDATE clause declares the table, SET defines the new values, and WHERE restricts the modification to Widget B.",
      },
      {
        type: "scenario",
        id: "ud-scenario-1",
        title: "Subscription Renewal & Account Pruning",
        companyOrContext: "CloudStream SaaS Media",
        problemStatement:
          "You are the database engineer maintaining subscriber accounts at CloudStream. Two maintenance operations must be performed on the subscriber accounts:\n1. Upgrade subscriber 'alice@cloud.com' to professional status ('pro') with an updated monthly fee of $29.99.\n2. Clean up churned records by deleting cancelled subscriptions that have been inactive for more than 90 days.",
        previewTable: {
          tableName: "subscribers",
          description: "CloudStream Subscriber Accounts",
          columns: ["id", "email", "tier", "monthly_fee", "status", "days_inactive"],
          rows: [
            [1, "alice@cloud.com", "basic", 9.99, "active", 2],
            [2, "bob@cloud.com", "basic", 9.99, "cancelled", 120],
            [3, "carol@cloud.com", "pro", 29.99, "active", 0],
            [4, "dave@cloud.com", "enterprise", 99.99, "cancelled", 45],
          ],
        },
        schemaSetupSQL:
          "CREATE TABLE IF NOT EXISTS subscribers (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  email VARCHAR(150) NOT NULL UNIQUE,\n  tier VARCHAR(20) NOT NULL,\n  monthly_fee REAL NOT NULL,\n  status VARCHAR(20) NOT NULL,\n  days_inactive INTEGER NOT NULL\n);\nINSERT OR IGNORE INTO subscribers (id, email, tier, monthly_fee, status, days_inactive) VALUES\n  (1, 'alice@cloud.com', 'basic', 9.99, 'active', 2),\n  (2, 'bob@cloud.com', 'basic', 9.99, 'cancelled', 120),\n  (3, 'carol@cloud.com', 'pro', 29.99, 'active', 0),\n  (4, 'dave@cloud.com', 'enterprise', 99.99, 'cancelled', 45);",
        requirements: [
          {
            id: "req-1",
            text: "Promote subscriber alice@cloud.com to tier 'pro' and update monthly fee to 29.99",
            hint: "UPDATE subscribers SET tier = 'pro', monthly_fee = 29.99 WHERE email = 'alice@cloud.com'",
            syntaxPattern: /update\s+subscribers\s+set[\s\S]*tier\s*=\s*['"]pro['"][\s\S]*where[\s\S]*alice@cloud\.com/i,
          },
          {
            id: "req-2",
            text: "Purge inactive cancelled subscriptions exceeding the 90-day threshold",
            hint: "DELETE FROM subscribers WHERE status = 'cancelled' AND days_inactive > 90",
            syntaxPattern: /delete\s+from\s+subscribers\s+where[\s\S]*cancelled[\s\S]*days_inactive\s*>\s*90/i,
          },
        ],
        solutionSQL:
          "UPDATE subscribers\nSET tier = 'pro', monthly_fee = 29.99\nWHERE email = 'alice@cloud.com';\n\nDELETE FROM subscribers\nWHERE status = 'cancelled' AND days_inactive > 90;",
        solutionExplanation:
          "Both statements use surgical WHERE filters to ensure only the target customer is updated and only truly dead accounts are purged.",
      },
    ],
    checkpointExam: {
      id: "ud-exam",
      title: "Inventory Stock Maintenance Certification",
      subtitle: "Checkpoint 2.4: Data Mutation Verification",
      scenarioContext:
        "The inventory warehouse manager reported new restock counts and requested purging sold-out SKUs. You must execute an UPDATE to restock Widget B and execute a DELETE to remove zero-quantity items.",
      passingScoreDescription: "Pass both mutation tasks to certify completion of Track 2: CRUD.",
      questions: [
        {
          id: "cp-ud-1",
          title: "Restock Widget B to 150 Units",
          prompt:
            "A supplier delivery has arrived at Westfield's distribution center replenishing product stock. Modify the inventory record for 'Widget B' so that its on-hand stock count reflects exactly 150 available units.",
          hint: "Use an UPDATE statement with SET targeting the quantity attribute, restricted by a WHERE clause on product name to prevent unintentional mass overwrites.",
          solutionSQL: "UPDATE inventory SET quantity = 150 WHERE product_name = 'Widget B';",
          validation: {
            type: "value_check",
            query: "SELECT quantity FROM inventory WHERE product_name = 'Widget B'",
            expectedResult: [[150]],
          },
        },
        {
          id: "cp-ud-2",
          title: "Purge Depleted Zero-Quantity Inventory",
          prompt:
            "Westfield's warehouse catalog needs periodic pruning to remove discontinued and depleted inventory. Permanently purge all catalog items that have zero units remaining in stock.",
          hint: "Use a DELETE FROM command paired with a strict WHERE condition evaluating zero quantity.",
          solutionSQL: "DELETE FROM inventory WHERE quantity = 0;",
          validation: {
            type: "query_result",
            query: "SELECT COUNT(*) FROM inventory WHERE quantity = 0",
            expectedResult: [[0]],
          },
        },
      ],
    },
    seedSQL: getSeedSQL("update-delete"),
    tasks: [
      {
        id: "ud-1",
        title: "Update inventory quantity",
        description:
          "Update the inventory table so quantity=150 where product_name='Widget B'.",
        hint: "UPDATE inventory SET quantity = 150 WHERE product_name = 'Widget B';",
        validation: {
          type: "value_check",
          query: "SELECT quantity FROM inventory WHERE product_name = 'Widget B'",
          expectedResult: [[150]],
        },
      },
      {
        id: "ud-2",
        title: "Delete zero-quantity items",
        description: "Delete all items from inventory where quantity is 0.",
        hint: "DELETE FROM inventory WHERE quantity = 0;",
        validation: {
          type: "query_result",
          query: "SELECT COUNT(*) FROM inventory WHERE quantity = 0",
          expectedResult: [[0]],
        },
      },
    ],
  },
];
