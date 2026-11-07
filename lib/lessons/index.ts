import type { Lesson, TrackInfo } from "@/types";
import { getSeedSQL } from "../agents/schema-generator";

// ── Track Definitions ──────────────────────────────────────────────────────

export const TRACKS: TrackInfo[] = [
  {
    id: "foundations",
    title: "1. Foundations",
    description:
      "Relational thinking, database scoping, table architecture, strict types, and primary key identity.",
    iconName: "Blocks",
    lessonSlugs: ["create-database", "create-table", "data-types"],
    color: "emerald",
  },
  {
    id: "crud",
    title: "2. Data Manipulation (CRUD)",
    description:
      "The four core verbs of SQL: INSERT, SELECT, UPDATE, and DELETE with surgical WHERE filtering.",
    iconName: "PenLine",
    lessonSlugs: ["insert-data", "select-basics", "where-clauses", "update-delete"],
    color: "sky",
  },
  {
    id: "aggregations",
    title: "3. Aggregations & Grouping",
    description:
      "Summarizing millions of rows: COUNT, SUM, AVG, category bucketing with GROUP BY, and HAVING thresholds.",
    iconName: "BarChart3",
    lessonSlugs: ["aggregate-functions", "group-by-having"],
    color: "violet",
  },
  {
    id: "joins",
    title: "4. Relational Operations",
    description:
      "Connecting separate worlds: foreign keys, INNER vs LEFT joins, and nested subquery compositions.",
    iconName: "GitMerge",
    lessonSlugs: ["inner-join", "left-right-join", "subqueries"],
    color: "amber",
  },
  {
    id: "schema-evolution",
    title: "5. Schema Evolution & Constraints",
    description:
      "Evolving live systems with ALTER TABLE and protecting data integrity using UNIQUE, DEFAULT, and CHECK.",
    iconName: "Wrench",
    lessonSlugs: ["alter-table", "constraints"],
    color: "rose",
  },
  {
    id: "transactions",
    title: "6. Transactions & Performance",
    description:
      "ACID bank-grade guarantees with COMMIT/ROLLBACK and lightning-fast B-Tree indexing plans.",
    iconName: "Zap",
    lessonSlugs: ["transactions-basics", "indexing"],
    color: "orange",
  },
];

// ── Lesson Definitions ─────────────────────────────────────────────────────

export const LESSONS: Lesson[] = [
  // ═══════════════════════════════════════════════════════════════════════
  //  1. FOUNDATIONS
  // ═══════════════════════════════════════════════════════════════════════
  {
    slug: "create-database",
    title: "Relational Architecture & Your First Database",
    track: "foundations",
    trackIndex: 0,
    description:
      "Understand why relational databases exist, set up your workspace namespace, and build your very first table.",
    analogy: {
      title: "The IKEA Warehouse Aisle System",
      story:
        "Imagine walking into an IKEA store with 50,000 items. If everything were dumped onto one giant, messy spreadsheet, a single typo in a chair name would corrupt your entire inventory.\n\nInstead, IKEA divides the warehouse into labeled aisles (Databases), arranges items on designated shelves (Tables), and gives every flat-pack box a unique barcode number (Primary Key). That way, no two items ever get mixed up, and finding an exact bolt takes two seconds.",
      takeaway:
        "A database is an isolated room; tables are the organized shelves inside; records are the individual boxes with unique IDs.",
    },
    mnemonic: {
      phrase: "C-U-S: Create, Use, Show!",
      breakdown: [
        { letter: "C", word: "CREATE DATABASE", meaning: "Build the room" },
        { letter: "U", word: "USE", meaning: "Step inside the room" },
        { letter: "S", word: "SHOW TABLES", meaning: "See what shelves are built" },
      ],
      whyItMatters:
        "Before creating tables, MySQL needs to know which room you're building in. Running CREATE without USE leaves MySQL asking where to put your data.",
    },
    patterns: [
      {
        trigger: "Need a new sandbox container for a project?",
        solution: "CREATE DATABASE <name>;",
        example: "CREATE DATABASE university_db;",
      },
      {
        trigger: "Need to activate that database for upcoming queries?",
        solution: "USE <name>;",
        example: "USE university_db;",
      },
      {
        trigger: "Need to check which tables already exist?",
        solution: "SHOW TABLES;",
        example: "SHOW TABLES;",
      },
    ],
    proTips: [
      "Always end every SQL statement with a semicolon (;). It signals to MySQL that your thought is complete.",
      "Name tables in plural lowercase snake_case (e.g. students, order_items) for industry consistency.",
    ],
    gotchas: [
      "Forgetting to run USE <database>; is the #1 beginner mistake when starting a fresh session.",
      "Never put spaces in database or table names. Use underscores instead of spaces.",
    ],
    diagramType: "relations",
    intuitionCheck: {
      question: "Why do we use separate relational tables instead of putting everything into one massive spreadsheet?",
      options: [
        "Because spreadsheets cannot hold more than 100 rows of data.",
        "To prevent duplicate data, avoid typos, and ensure every item has a unique ID.",
        "Because SQL only allows 3 columns per table.",
        "Spreadsheets are illegal in production software architectures.",
      ],
      correctIndex: 1,
      explanation:
        "Relational tables normalize data so each fact is stored exactly once, linked by unique keys without messy copy-paste duplicates.",
    },
    content: [
      {
        heading: "1. The Relational Mental Model",
        body: "A Relational Database Management System (RDBMS) organizes information into structured tables consisting of rows (records) and columns (attributes).\n\nIn MySQL, a database acts as an isolated container for your project's tables.",
        code: "-- 1. Create a fresh database container\nCREATE DATABASE school;\n\n-- 2. Step inside to make it active\nUSE school;\n\n-- 3. Check existing tables (currently empty)\nSHOW TABLES;",
      },
      {
        heading: "2. Creating an Entity Table",
        body: "Tables bind structural rules to incoming data. Every entity table must have a Primary Key so individual rows can be identified without ambiguity:",
        code: "CREATE TABLE students (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name VARCHAR(100) NOT NULL,\n  age INTEGER,\n  email VARCHAR(150)\n);",
      },
      {
        heading: "3. Inspecting the Schema Blueprint",
        body: "Once created, verify that MySQL understands your column types and nullability constraints using DESCRIBE:",
        code: "DESCRIBE students;",
      },
    ],
    seedSQL: getSeedSQL("create-database"),
    tasks: [
      {
        id: "cd-1",
        title: "Create the students table",
        description:
          "Define a table named 'students' with: id (INTEGER PRIMARY KEY AUTOINCREMENT), name (VARCHAR(100) NOT NULL), age (INTEGER), and email (VARCHAR(150)).",
        hint: "CREATE TABLE students (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(100) NOT NULL, age INTEGER, email VARCHAR(150));",
        validation: {
          type: "table_exists",
          table: "students",
        },
      },
      {
        id: "cd-2",
        title: "Verify Table Existence",
        description: "Run SHOW TABLES; to inspect registered schemas in the active database.",
        hint: "Run: SHOW TABLES;",
        validation: {
          type: "query_result",
          queryPattern: /^SHOW\s+TABLES\s*;?$/i,
          query: "SELECT name FROM sqlite_master WHERE type='table' AND name='students'",
          expectedResult: [["students"]],
        },
      },
      {
        id: "cd-3",
        title: "Inspect Column Schema",
        description: "Run DESCRIBE students; to verify column types, nullability, and primary key status.",
        hint: "Type: DESCRIBE students;",
        validation: {
          type: "column_exists",
          queryPattern: /^(?:DESCRIBE|DESC)\s+students\s*;?$/i,
          table: "students",
          column: "email",
        },
      },
    ],
  },

  {
    slug: "create-table",
    title: "Table Design & Integrity Constraints",
    track: "foundations",
    trackIndex: 1,
    description:
      "Design normalized schemas with integrity constraints: NOT NULL, DEFAULT, and AUTO_INCREMENT.",
    analogy: {
      title: "The Official Passport Application Form",
      story:
        "Think of table constraints like the validation rules on an airport passport form.\n\n• Your National ID number is printed at the top—no two citizens on Earth can have the same number (PRIMARY KEY).\n• The 'Full Name' blank cannot be left empty (NOT NULL).\n• If you leave 'Country of Issue' blank, the system automatically prints your home country (DEFAULT 'USA').\n\nIf you hand an incomplete form to the officer, it is rejected on the spot before it enters the government database.",
      takeaway:
        "Constraints act as the storage engine's security guard, rejecting dirty data before it can touch the disk.",
    },
    mnemonic: {
      phrase: "P-N-D-A: Primary, Not null, Default, Auto-increment",
      breakdown: [
        { letter: "P", word: "PRIMARY KEY", meaning: "Unique row fingerprint" },
        { letter: "N", word: "NOT NULL", meaning: "Mandatory, cannot be empty" },
        { letter: "D", word: "DEFAULT", meaning: "Automatic fallback value" },
        { letter: "A", word: "AUTO_INCREMENT", meaning: "1, 2, 3... generated for you" },
      ],
      whyItMatters:
        "Remembering P-N-D-A helps you architect tables that protect data integrity automatically without messy application-level check code.",
    },
    patterns: [
      {
        trigger: "Every row must have an auto-generated unique ID?",
        solution: "id INTEGER PRIMARY KEY AUTOINCREMENT",
        example: "id INTEGER PRIMARY KEY AUTOINCREMENT",
      },
      {
        trigger: "A column must never be allowed to be empty?",
        solution: "col_name <TYPE> NOT NULL",
        example: "title VARCHAR(200) NOT NULL",
      },
      {
        trigger: "Provide a sensible default if the user omits a value?",
        solution: "col_name <TYPE> DEFAULT <value>",
        example: "credits INTEGER DEFAULT 3",
      },
    ],
    proTips: [
      "Let the database generate IDs via AUTO_INCREMENT rather than creating random numbers in your code—it guarantees strict chronological ordering and zero collisions.",
      "Always put NOT NULL on columns that are fundamentally required (like email, title, price).",
    ],
    gotchas: [
      "In SQLite/WASM, AUTOINCREMENT is only valid on INTEGER PRIMARY KEY columns.",
      "Don't put a comma after the last column definition before the closing parenthesis.",
    ],
    diagramType: "relations",
    intuitionCheck: {
      question: "What happens if someone tries to insert a row without a 'title' into a column defined as `title VARCHAR(200) NOT NULL`?",
      options: [
        "MySQL silently replaces the title with the word 'NULL'.",
        "The database rejects the insert immediately and throws a NOT NULL constraint violation error.",
        "The computer crashes and shuts down.",
        "The title is assigned a random string.",
      ],
      correctIndex: 1,
      explanation:
        "Constraints are hard boundaries: MySQL rejects the invalid insert and leaves existing data untouched.",
    },
    content: [
      {
        heading: "1. The Power of Declarative Constraints",
        body: "Instead of writing dozens of `if (!value)` checks in your backend code, declare constraints directly in the table schema. MySQL enforces them universally across all connections.",
        code: "CREATE TABLE courses (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  title VARCHAR(200) NOT NULL,\n  credits INTEGER DEFAULT 3,\n  department VARCHAR(50)\n);",
      },
      {
        heading: "2. Junction Tables for Relationships",
        body: "When students enroll in courses, create an enrollments junction table that pairs `student_id` with `course_id`:",
        code: "CREATE TABLE enrollments (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  student_id INTEGER,\n  course_id INTEGER,\n  enrolled_date TEXT\n);",
      },
    ],
    seedSQL: getSeedSQL("create-table"),
    tasks: [
      {
        id: "ct-1",
        title: "Create courses table",
        description:
          "Construct the 'courses' table with: id (INTEGER PRIMARY KEY AUTOINCREMENT), title (VARCHAR(200) NOT NULL), credits (INTEGER DEFAULT 3), and department (VARCHAR(50)).",
        hint: "CREATE TABLE courses (id INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR(200) NOT NULL, credits INTEGER DEFAULT 3, department VARCHAR(50));",
        validation: { type: "table_exists", table: "courses" },
      },
      {
        id: "ct-2",
        title: "Create enrollments junction table",
        description:
          "Create 'enrollments' with: id (INTEGER PRIMARY KEY AUTOINCREMENT), student_id (INTEGER), course_id (INTEGER), and enrolled_date (TEXT).",
        hint: "CREATE TABLE enrollments (id INTEGER PRIMARY KEY AUTOINCREMENT, student_id INTEGER, course_id INTEGER, enrolled_date TEXT);",
        validation: { type: "table_exists", table: "enrollments" },
      },
    ],
  },

  {
    slug: "data-types",
    title: "Data Types & Type Boundaries",
    track: "foundations",
    trackIndex: 2,
    description:
      "Understand physical storage representations: INTEGER, VARCHAR, REAL, and temporal DATE values.",
    analogy: {
      title: "Packing the Right Size Suitcase",
      story:
        "Think of data types like selecting luggage for a trip.\n\n• You don't bring a 50-gallon industrial shipping container to carry a toothbrush (don't use `BIGINT` or `TEXT` for a simple age number).\n• You don't try to cram a bicycle into a small purse (don't use `VARCHAR(5)` for someone's home address).\n\nMatching the right type preserves RAM in the buffer pool, keeps query cache sizes lean, and prevents weird math bugs.",
      takeaway:
        "Pick the tightest, most accurate data type that safely accommodates your data's real-world domain.",
    },
    mnemonic: {
      phrase: "I-V-D-R: Integer, Varchar, Date, Real",
      breakdown: [
        { letter: "I", word: "INTEGER", meaning: "Whole counting numbers (1, 42, 999)" },
        { letter: "V", word: "VARCHAR(n)", meaning: "Text strings up to N letters" },
        { letter: "D", word: "DATE / TEXT", meaning: "Calendar dates ('YYYY-MM-DD')" },
        { letter: "R", word: "REAL / DECIMAL", meaning: "Fractional math & prices (19.99)" },
      ],
      whyItMatters:
        "These four fundamental types cover 90% of business database applications.",
    },
    patterns: [
      {
        trigger: "Storing names, emails, or short descriptions?",
        solution: "VARCHAR(n)",
        example: "name VARCHAR(100)",
      },
      {
        trigger: "Storing monetary amounts or decimal precision?",
        solution: "REAL or DECIMAL(10,2)",
        example: "price REAL NOT NULL",
      },
      {
        trigger: "Storing flags like active, completed, or in_stock?",
        solution: "INTEGER DEFAULT 1 (0 or 1 boolean convention)",
        example: "in_stock INTEGER DEFAULT 1",
      },
    ],
    proTips: [
      "Store dates in ISO 8601 format: 'YYYY-MM-DD'. It sorts chronologically naturally as text strings!",
      "Never store phone numbers or zip codes as INTEGER—you will lose leading zeros (e.g. '01234' becomes '1234'). Store them as VARCHAR.",
    ],
    gotchas: [
      "In SQL, text and date values must always be enclosed in single quotes ('2024-01-15'). Numbers must not have quotes.",
    ],
    diagramType: "relations",
    intuitionCheck: {
      question: "Why should a US ZIP code like '07030' be stored as a VARCHAR instead of an INTEGER?",
      options: [
        "Because integers take up too much memory.",
        "Because an integer will drop the leading zero, storing it incorrectly as 7030.",
        "SQL does not allow numbers in addresses.",
        "ZIP codes change every month.",
      ],
      correctIndex: 1,
      explanation:
        "Mathematical integers do not have leading zeros (07030 = 7030). If you never plan to do arithmetic (+, -) on a number, store it as text!",
    },
    content: [
      {
        heading: "1. Core SQL Types at a Glance",
        body: "• INTEGER: Whole numbers without fractions\n• VARCHAR(n): Variable-length text capped at N characters\n• REAL / DOUBLE: Floating-point numbers for scientific/monetary values\n• TEXT: Long paragraphs or ISO formatted dates ('YYYY-MM-DD')",
        code: "CREATE TABLE products (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name VARCHAR(100) NOT NULL,\n  price REAL NOT NULL,\n  in_stock INTEGER DEFAULT 1,\n  created_at TEXT DEFAULT (date('now'))\n);",
      },
      {
        heading: "2. Verifying Physical Column Constraints",
        body: "Use DESCRIBE to check how the storage engine mapped your types:",
        code: "DESCRIBE products;",
      },
    ],
    seedSQL: getSeedSQL("data-types"),
    tasks: [
      {
        id: "dt-1",
        title: "Inspect products table data types",
        description: "Run DESCRIBE products; to verify column types: id, name, price, in_stock, created_at.",
        hint: "DESCRIBE products;",
        validation: { type: "column_exists", table: "products", column: "created_at" },
      },
      {
        id: "dt-2",
        title: "Insert a product with precise types",
        description: "Insert a product: name='Ergonomic Keyboard', price=89.50, in_stock=1.",
        hint: "INSERT INTO products (name, price, in_stock) VALUES ('Ergonomic Keyboard', 89.50, 1);",
        validation: {
          type: "row_count_gte",
          table: "products",
          expectedCount: 1,
        },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  //  2. DATA MANIPULATION (CRUD)
  // ═══════════════════════════════════════════════════════════════════════
  {
    slug: "insert-data",
    title: "INSERT INTO & Batch Ingestion",
    track: "crud",
    trackIndex: 0,
    description:
      "Populate relational entities using single-row and atomic multi-row batch inserts.",
    analogy: {
      title: "The Restaurant Kitchen Order Carousel",
      story:
        "Imagine a busy diner. When a waiter takes orders from a table of four, they don't sprint to the chef with one ticket, sprint back, take the second order, and sprint back again.\n\nThey write all four orders onto the ticket pad and pin them to the wheel in one go. In SQL, single-row inserts create repetitive disk transaction overhead. Batch inserting rows together is up to 100x faster.",
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
      "Wrap strings in single quotes: 'Alice', not double quotes.",
    ],
    gotchas: [
      "The order of values in VALUES(...) must match the order of columns listed in INSERT INTO table(col1, col2) exactly.",
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
        heading: "1. The Anatomy of an INSERT Statement",
        body: "You tell MySQL where to put the data (`INSERT INTO table`), which columns are receiving data, and the values to store (`VALUES`):",
        code: "INSERT INTO students (first_name, last_name, email, enrollment_date, gpa)\nVALUES ('Alice', 'Johnson', 'alice@university.edu', '2024-01-15', 3.8);",
      },
      {
        heading: "2. High-Performance Multi-Row Batching",
        body: "Separate value tuples with commas to insert a cohort in one atomic command:",
        code: "INSERT INTO students (first_name, last_name, email)\nVALUES \n  ('Bob', 'Smith', 'bob@u.edu'),\n  ('Carol', 'Williams', 'carol@u.edu'),\n  ('Dave', 'Miller', 'dave@u.edu'),\n  ('Eve', 'Taylor', 'eve@u.edu');",
      },
    ],
    seedSQL: getSeedSQL("insert-data"),
    tasks: [
      {
        id: "id-1",
        title: "Insert primary student",
        description: "Insert a student record with first_name='Alice', last_name='Johnson', email='alice@university.edu'.",
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
        description: "Insert at least 4 additional students so the table contains 5 or more total records.",
        hint: "INSERT INTO students (first_name, last_name, email) VALUES ('Bob', 'S', 'b@u.edu'), ('Carol', 'W', 'c@u.edu'), ('Dave', 'M', 'd@u.edu'), ('Eve', 'T', 'e@u.edu');",
        validation: {
          type: "row_count_gte",
          table: "students",
          expectedCount: 5,
        },
      },
    ],
  },

  {
    slug: "select-basics",
    title: "Projection, Ordering & Pagination",
    track: "crud",
    trackIndex: 1,
    description:
      "Master query projection, sorting semantics with ORDER BY, and result pagination with LIMIT.",
    analogy: {
      title: "The Drive-Thru Barista",
      story:
        "When you pull up to Starbucks, you don't ask for 'everything behind the counter' (`SELECT *`). You ask for an Iced Caramel Macchiato with Oat Milk (`SELECT beverage, milk`).\n\nThe barista looks at the line of cars, sorts orders by arrival time (`ORDER BY timestamp ASC`), and only serves the next car at the window (`LIMIT 1`).",
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
    ],
    gotchas: [
      "LIMIT always belongs at the very end of your query. Putting LIMIT before ORDER BY causes a syntax error.",
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
        heading: "1. Explicit Projection vs SELECT *",
        body: "Always name the exact columns you want to display:",
        code: "SELECT first_name, department, salary\nFROM employees;",
      },
      {
        heading: "2. Sorting & Pagination",
        body: "Use ORDER BY to sort and LIMIT to page through results:",
        code: "SELECT first_name, salary\nFROM employees\nORDER BY salary DESC\nLIMIT 3;",
      },
    ],
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
        description: "Select first_name and salary ordered by salary DESC, limited to the top 3 employees.",
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

  {
    slug: "where-clauses",
    title: "Predicate Filtering & Logical Operators",
    track: "crud",
    trackIndex: 2,
    description:
      "Filter result sets using WHERE clauses, compound boolean operators, LIKE, BETWEEN, and IN.",
    analogy: {
      title: "The VIP Nightclub Bouncer",
      story:
        "Think of the WHERE clause as the bouncer standing at the club entrance with a clipboard.\n\n• Guests aged 21 or older enter (`WHERE age >= 21`).\n• Guests on the VIP guest list enter (`WHERE status IN ('vip', 'artist')`).\n• Guests whose name starts with 'A' get free admission (`WHERE name LIKE 'A%'`).\n\nThe bouncer checks every person before they step foot on the dance floor. If they don't meet the conditions, they never get in.",
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
      "Combine conditions using parentheses when mixing AND and OR: (status = 'paid' OR status = 'pending') AND amount > 100. Parentheses prevent precedence surprises!",
      "In SQL, NULL means 'unknown'. Never write `col = NULL`. Always write `col IS NULL` or `col IS NOT NULL`.",
    ],
    gotchas: [
      "LIKE '%word%' with a leading wildcard cannot use B-Tree indexes and will trigger a full table scan on huge tables.",
    ],
    diagramType: "pipeline",
    intuitionCheck: {
      question: "Why does `SELECT * FROM users WHERE email = NULL;` fail to return rows where the email is empty?",
      options: [
        "Because NULL in SQL represents unknown state; comparing anything to NULL with '=' evaluates to unknown. You must write `IS NULL`.",
        "Because email cannot be null in any database.",
        "Because '=' is only used for numbers in SQL.",
        "It doesn't fail; it returns all rows.",
      ],
      correctIndex: 0,
      explanation:
        "In SQL ternary logic, NULL is not equal to anything, not even itself! Always use `IS NULL` or `IS NOT NULL`.",
    },
    content: [
      {
        heading: "1. The WHERE Filter Lifecycle",
        body: "The WHERE clause acts on rows as they are read from disk. If a row satisfies the boolean condition, it is passed down the pipeline:",
        code: "SELECT * FROM orders\nWHERE status = 'completed'\n  AND price >= 300\n  AND quantity >= 1;",
      },
      {
        heading: "2. Pattern Matching & Range Queries",
        body: "Use LIKE with `%` (any characters) and BETWEEN for clean range bounds:",
        code: "-- Customer name starting with 'A'\nSELECT * FROM orders\nWHERE customer_name LIKE 'A%'\n  AND price BETWEEN 50 AND 1000;",
      },
    ],
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

  {
    slug: "update-delete",
    title: "Targeted Updates & Safe Deletion",
    track: "crud",
    trackIndex: 3,
    description: "Mutate state safely using UPDATE SET and DELETE FROM with precise WHERE constraints.",
    analogy: {
      title: "The Surgeon's Scalpel vs The Sledgehammer",
      story:
        "Imagine an oral surgeon removing a wisdom tooth. They carefully inspect tooth #32, numb that exact spot, and extract it.\n\nIf the surgeon swings a sledgehammer without looking, every tooth in the patient's mouth is knocked out. In SQL, running `DELETE FROM inventory` without a `WHERE` clause is swinging the sledgehammer. It deletes all records in milliseconds.",
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
    ],
    gotchas: [
      "In SQL, forgetting the WHERE clause updates or deletes EVERY row in the entire table with zero confirmation prompt!",
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
        heading: "1. The UPDATE SET Statement",
        body: "Update alters specific columns in rows that match your filter condition:",
        code: "-- Update stock count and timestamp for Widget B\nUPDATE inventory\nSET quantity = 100, last_restocked = '2024-03-15'\nWHERE product_name = 'Widget B';",
      },
      {
        heading: "2. The DELETE FROM Statement",
        body: "Delete permanently wipes rows matching your filter:",
        code: "-- Purge all zero-stock discontinued items\nDELETE FROM inventory\nWHERE quantity = 0;",
      },
    ],
    seedSQL: getSeedSQL("update-delete"),
    tasks: [
      {
        id: "ud-1",
        title: "Restock depleted inventory",
        description: "Update 'Widget B' setting quantity to 100 in the inventory table.",
        hint: "UPDATE inventory SET quantity = 100 WHERE product_name = 'Widget B';",
        validation: {
          type: "value_check",
          query: "SELECT quantity FROM inventory WHERE product_name = 'Widget B'",
          expectedResult: [[100]],
        },
      },
      {
        id: "ud-2",
        title: "Purge zero-stock items",
        description: "Delete all products from inventory where quantity is 0.",
        hint: "DELETE FROM inventory WHERE quantity = 0;",
        validation: {
          type: "query_result",
          query: "SELECT COUNT(*) FROM inventory WHERE quantity = 0",
          expectedResult: [[0]],
        },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  //  3. AGGREGATIONS & GROUPING
  // ═══════════════════════════════════════════════════════════════════════
  {
    slug: "aggregate-functions",
    title: "Vector Aggregations (COUNT, SUM, AVG)",
    track: "aggregations",
    trackIndex: 0,
    description: "Use COUNT, SUM, AVG, MIN, and MAX to summarize large datasets into actionable metrics.",
    analogy: {
      title: "The Store Cash Register EOD Tape",
      story:
        "At 9:00 PM when a store closes, the store manager doesn't read through 8,000 individual receipts one by one.\n\nThey print the End-of-Day register tape:\n• How many customers paid? (`COUNT(*)`)\n• Total revenue collected? (`SUM(amount)`)\n• What was the average checkout ticket? (`AVG(amount)`)\n• What was the single biggest purchase? (`MAX(amount)`)\n\nThousands of individual rows collapse into four powerful summary numbers.",
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
      "COUNT(*) counts all rows. COUNT(column_name) counts only rows where that specific column is NOT NULL.",
      "Give aggregate calculations clear aliases using AS (e.g. `COUNT(*) AS total_sales`) so frontend code receives clean JSON keys.",
    ],
    gotchas: [
      "You cannot use aggregate functions directly in a WHERE clause (e.g. `WHERE amount > AVG(amount)` is invalid). Use subqueries or HAVING instead.",
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
        heading: "1. Collapsing Rows into Scalars",
        body: "Aggregate functions compute a single summary value across all matching rows:",
        code: "SELECT \n  COUNT(*) AS total_sales,\n  SUM(amount) AS total_revenue,\n  ROUND(AVG(amount), 2) AS avg_sale,\n  MAX(amount) AS highest_sale\nFROM sales;",
      },
      {
        heading: "2. Vectorizing Filtered Subsets",
        body: "Combine with WHERE to aggregate a specific sub-population:",
        code: "SELECT SUM(amount) AS north_revenue\nFROM sales\nWHERE region = 'North';",
      },
    ],
    seedSQL: getSeedSQL("aggregate-functions"),
    tasks: [
      {
        id: "af-1",
        title: "Calculate total volume & revenue",
        description: "Run a query calculating COUNT(*) as total_count and SUM(amount) as total_amount from sales.",
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

  {
    slug: "group-by-having",
    title: "Bucketing & Post-Aggregation Filters",
    track: "aggregations",
    trackIndex: 1,
    description: "Partition row datasets with GROUP BY and filter aggregated partitions using HAVING.",
    analogy: {
      title: "Sorting Laundry into Color Baskets",
      story:
        "Imagine doing laundry for a huge family.\n\n1. First, you throw away trash found in pockets (`WHERE`—thrown out before sorting).\n2. Next, you sort clothes into three separate laundry baskets: Whites, Darks, Delicates (`GROUP BY color`).\n3. You count how many shirts are in each basket (`COUNT(*)`).\n4. Finally, you only run the washing machine for baskets that have at least 5 items (`HAVING COUNT(*) >= 5`). Baskets with only 1 item wait until next week.",
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
      "Rule of Thumb: Every non-aggregated column in your SELECT clause MUST appear in the GROUP BY clause.",
      "Use WHERE to filter out unwanted rows first—it reduces the amount of data GROUP BY has to process in memory.",
    ],
    gotchas: [
      "Never put an aggregate function in a WHERE clause: `WHERE SUM(amount) > 500` is an instant syntax error. Change WHERE to HAVING.",
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
        heading: "1. Category Bucketing with GROUP BY",
        body: "Cluster rows sharing identical values into distinct summary groups:",
        code: "SELECT category, COUNT(*) AS txn_count, SUM(amount) AS total_spent\nFROM transactions\nGROUP BY category;",
      },
      {
        heading: "2. Filtering Aggregated Groups with HAVING",
        body: "HAVING discards entire groups that don't satisfy aggregate thresholds:",
        code: "SELECT category, SUM(amount) AS total_spent\nFROM transactions\nGROUP BY category\nHAVING SUM(amount) > 500\nORDER BY total_spent DESC;",
      },
    ],
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

  // ═══════════════════════════════════════════════════════════════════════
  //  4. RELATIONAL OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════
  {
    slug: "inner-join",
    title: "INNER JOIN & Relational Algebra",
    track: "joins",
    trackIndex: 0,
    description: "Unify normalized relational schemas across foreign keys using INNER JOIN.",
    analogy: {
      title: "The Coat Check Claim Ticket",
      story:
        "When you check your coat at a theater, the attendant hands you ticket #42. Your jacket in the closet has a matching tag #42.\n\nAn INNER JOIN matches tickets with coats. If you have ticket #42, you get your exact jacket. If a rogue ticket has no matching coat in the closet, or a stray coat has no owner, neither is handed over. Only matching pairs make it out.",
      takeaway:
        "INNER JOIN returns only the intersection: rows where a foreign key matches a primary key in both tables.",
    },
    mnemonic: {
      phrase: "INNER is Picky",
      breakdown: [
        { letter: "I", word: "INTERSECTION", meaning: "Only matching records survive" },
        { letter: "N", word: "NO NULLS", meaning: "Unmatched rows are dropped" },
        { letter: "N", word: "NAME ALIASES", meaning: "Use s.name, d.name for clarity" },
        { letter: "E", word: "EQUI-JOIN", meaning: "Match where s.dept_id = d.id" },
        { letter: "R", word: "RELATIONAL", meaning: "Links child records to parent" },
      ],
      whyItMatters:
        "INNER JOIN is the most frequently used join in software development, pairing parents and children cleanly.",
    },
    patterns: [
      {
        trigger: "Connecting two tables by an ID link?",
        solution: "FROM table1 t1 INNER JOIN table2 t2 ON t1.fk = t2.pk",
        example: "FROM staff s INNER JOIN departments d ON s.department_id = d.id",
      },
    ],
    proTips: [
      "Always give short aliases to joined tables (e.g. `staff s`, `departments d`) to make queries readable and avoid typing long table names.",
      "Prefix projected columns with their alias (`s.name`, `d.title`) to prevent 'ambiguous column name' errors.",
    ],
    gotchas: [
      "Forgetting the ON clause creates an unintended Cartesian product (multiplying every row by every row in the other table!).",
    ],
    diagramType: "join",
    intuitionCheck: {
      question: "If the 'staff' table has an employee with department_id = NULL, will they appear in an INNER JOIN with 'departments'?",
      options: [
        "Yes, with department set to NULL.",
        "No, because NULL does not match any department ID; INNER JOIN drops unmatched rows.",
        "Yes, placed into a random department.",
        "The query crashes.",
      ],
      correctIndex: 1,
      explanation:
        "INNER JOIN requires an exact match on both sides. Employees without a department are excluded from the result set.",
    },
    content: [
      {
        heading: "1. Equi-Join Mechanics",
        body: "Use ON to specify the relational bridge connecting foreign key to primary key:",
        code: "SELECT \n  s.name AS staff_name,\n  d.name AS department_name,\n  s.salary\nFROM staff s\nINNER JOIN departments d ON s.department_id = d.id;",
      },
      {
        heading: "2. Combining JOIN with WHERE Predicates",
        body: "Filter the joined relation just like a normal table:",
        code: "SELECT s.name, d.name, s.salary\nFROM staff s\nINNER JOIN departments d ON s.department_id = d.id\nWHERE d.name = 'Engineering';",
      },
    ],
    seedSQL: getSeedSQL("inner-join"),
    tasks: [
      {
        id: "ij-1",
        title: "Perform staff-department equi-join",
        description: "Join staff 's' with departments 'd' on s.department_id = d.id, selecting s.name and d.name.",
        hint: "SELECT s.name, d.name FROM staff s INNER JOIN departments d ON s.department_id = d.id;",
        validation: {
          type: "query_result",
          queryPattern: /JOIN\s+departments/i,
          query: "SELECT COUNT(*) FROM staff s INNER JOIN departments d ON s.department_id = d.id",
          expectedResult: [[7]],
        },
      },
      {
        id: "ij-2",
        title: "Filter by Engineering department",
        description: "Add WHERE d.name = 'Engineering' to select only Engineering personnel.",
        hint: "SELECT s.name, d.name, s.salary FROM staff s INNER JOIN departments d ON s.department_id = d.id WHERE d.name = 'Engineering';",
        validation: {
          type: "query_result",
          queryPattern: /JOIN\s+departments.*WHERE/i,
          query: "SELECT COUNT(*) FROM staff s INNER JOIN departments d ON s.department_id = d.id WHERE d.name = 'Engineering'",
          expectedResult: [[3]],
        },
      },
    ],
  },

  {
    slug: "left-right-join",
    title: "LEFT & Outer Joins",
    track: "joins",
    trackIndex: 1,
    description: "Retain unmatched outer tuples and diagnose orphaned relationships with LEFT JOIN.",
    analogy: {
      title: "The Wedding Invitation & RSVP List",
      story:
        "Imagine organizing wedding seating.\n\n• The Bride's Invitation List (`customers`) is on the left.\n• Returned RSVP Cards (`purchases`) are on the right.\n\nIf you run an INNER JOIN, only guests who RSVP'd get a chair. But with a LEFT JOIN, every invited guest gets a place card at the table. If cousin Bob never sent his RSVP card back, his name card is still at the table, with an empty plate (`NULL`).",
      takeaway:
        "LEFT JOIN keeps 100% of rows from the left table, filling missing right-side values with NULL.",
    },
    mnemonic: {
      phrase: "LEFT is Loyal",
      breakdown: [
        { letter: "L", word: "LOYAL", meaning: "Keeps every single row from the left table" },
        { letter: "E", word: "EMPTY", meaning: "Missing right-side matches become NULL" },
        { letter: "F", word: "FIND ORPHANS", meaning: "WHERE right.id IS NULL finds inactive items" },
        { letter: "T", word: "TOTALITY", meaning: "Guarantees no primary records are lost" },
      ],
      whyItMatters:
        "LEFT JOIN is essential whenever you want to generate reports like 'Show all users and their purchases, even if they've bought nothing yet.'",
    },
    patterns: [
      {
        trigger: "Keep all records from the primary table even if no child exists?",
        solution: "FROM parent p LEFT JOIN child c ON p.id = c.parent_id",
        example: "FROM customers c LEFT JOIN purchases p ON c.id = p.customer_id",
      },
      {
        trigger: "Find records that have NEVER had any activity?",
        solution: "LEFT JOIN ... WHERE child.id IS NULL",
        example: "WHERE p.id IS NULL",
      },
    ],
    proTips: [
      "99% of outer joins in real software are LEFT JOINs. RIGHT JOIN is just a LEFT JOIN with table positions swapped.",
      "Check `WHERE child.id IS NULL` to identify inactive users, unsold inventory, or empty classrooms in seconds.",
    ],
    gotchas: [
      "If you put a WHERE condition on a right-table column (e.g. `WHERE p.amount > 100`), you will accidentally turn your LEFT JOIN back into an INNER JOIN because NULL > 100 is false!",
    ],
    diagramType: "join",
    intuitionCheck: {
      question: "How do you find all customers who have NEVER made a single purchase?",
      options: [
        "`SELECT * FROM customers INNER JOIN purchases ON ...`",
        "`SELECT * FROM customers c LEFT JOIN purchases p ON c.id = p.customer_id WHERE p.id IS NULL;`",
        "`DELETE FROM customers;`",
        "It is impossible in SQL.",
      ],
      correctIndex: 1,
      explanation:
        "A LEFT JOIN preserves all customers, and unmatched purchases show up as NULL. Filtering by `WHERE p.id IS NULL` isolates the zero-purchase cohort.",
    },
    content: [
      {
        heading: "1. Preserving the Left Table",
        body: "Even if a customer has zero purchases, a LEFT JOIN preserves their row and populates purchase columns with NULL:",
        code: "SELECT c.id, c.name, p.item, p.amount\nFROM customers c\nLEFT JOIN purchases p ON c.id = p.customer_id;",
      },
      {
        heading: "2. Finding Inactive Records",
        body: "Use `WHERE child.id IS NULL` to isolate customers who have not ordered:",
        code: "SELECT c.name\nFROM customers c\nLEFT JOIN purchases p ON c.id = p.customer_id\nWHERE p.id IS NULL;",
      },
    ],
    seedSQL: getSeedSQL("left-right-join"),
    tasks: [
      {
        id: "lr-1",
        title: "Project all customers with purchases",
        description: "Perform a LEFT JOIN between customers c and purchases p on c.id = p.customer_id, selecting c.name and p.item.",
        hint: "SELECT c.name, p.item FROM customers c LEFT JOIN purchases p ON c.id = p.customer_id;",
        validation: {
          type: "query_result",
          queryPattern: /LEFT\s+(?:OUTER\s+)?JOIN/i,
          query: "SELECT COUNT(*) FROM customers c LEFT JOIN purchases p ON c.id = p.customer_id",
          expectedResult: [[6]],
        },
      },
    ],
  },

  {
    slug: "subqueries",
    title: "Nested Expressions & Subquery Modularization",
    track: "joins",
    trackIndex: 2,
    description: "Compose modular SQL logic using scalar, list-valued, and nested subqueries.",
    analogy: {
      title: "Russian Matryoshka Nesting Dolls",
      story:
        "Think of solving a math expression with parentheses: `5 * (3 + 2)`. You don't try to multiply 5 by the parenthesis all at once—you open the inner parenthesis, solve `3 + 2 = 5`, and then multiply `5 * 5 = 25`.\n\nA subquery is SQL's parenthesis. It runs an inner inquiry first (e.g. 'What is the average product price?'), takes that answer ($45.00), and hands it to the outer query.",
      takeaway:
        "Subqueries let you dynamically calculate comparison values on the fly without hardcoding static numbers.",
    },
    mnemonic: {
      phrase: "Inside Out!",
      breakdown: [
        { letter: "I", word: "INNER FIRST", meaning: "The query inside (parentheses) executes first" },
        { letter: "O", word: "OUTER LAST", meaning: "The outer query consumes the inner result" },
      ],
      whyItMatters:
        "Understanding that SQL evaluates subqueries inside-out makes reading complex nested SQL straightforward.",
    },
    patterns: [
      {
        trigger: "Comparing against an unknown average or maximum?",
        solution: "WHERE col > (SELECT AVG(col) FROM table)",
        example: "WHERE price > (SELECT AVG(price) FROM products)",
      },
      {
        trigger: "Matching against a dynamic list of keys?",
        solution: "WHERE id IN (SELECT foreign_id FROM table)",
        example: "WHERE id IN (SELECT DISTINCT product_id FROM order_items)",
      },
    ],
    proTips: [
      "Always write and test your inner subquery first by itself in the terminal to verify what it returns before wrapping it in the outer query.",
      "If your subquery uses `=`, it MUST return exactly 1 row. If it might return multiple rows, use `IN`.",
    ],
    gotchas: [
      "Correlated subqueries (subqueries that reference columns from the outer query) run once for EVERY row in the outer table, which can cause severe performance lag on big datasets.",
    ],
    diagramType: "pipeline",
    intuitionCheck: {
      question: "What happens if a subquery inside `WHERE price = (SELECT price FROM products)` returns 3 prices?",
      options: [
        "MySQL compares against all three automatically.",
        "MySQL throws a runtime error: 'Subquery returns more than 1 row'. You must use `IN` instead of `=`.",
        "It picks the lowest price.",
        "It deletes the products.",
      ],
      correctIndex: 1,
      explanation:
        "Scalar comparison operators (=, >, <) can only compare against a single value. When multiple values can return, use `IN`.",
    },
    content: [
      {
        heading: "1. Scalar Subqueries in WHERE",
        body: "The inner query computes catalog average ($289.99), then filters products above it:",
        code: "SELECT name, price\nFROM products\nWHERE price > (SELECT AVG(price) FROM products);",
      },
      {
        heading: "2. List Subqueries with IN",
        body: "Find products that have actually been purchased in order items:",
        code: "SELECT name, price\nFROM products\nWHERE id IN (\n  SELECT DISTINCT product_id FROM order_items\n);",
      },
    ],
    seedSQL: getSeedSQL("subqueries"),
    tasks: [
      {
        id: "sq-1",
        title: "Find above-average priced products",
        description: "Select name and price of products where price > (SELECT AVG(price) FROM products).",
        hint: "SELECT name, price FROM products WHERE price > (SELECT AVG(price) FROM products);",
        validation: {
          type: "query_result",
          queryPattern: /WHERE\s+price\s*>\s*\(\s*SELECT\s+AVG/i,
          query: "SELECT COUNT(*) FROM products WHERE price > (SELECT AVG(price) FROM products)",
          expectedResult: [[3]],
        },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  //  5. SCHEMA EVOLUTION
  // ═══════════════════════════════════════════════════════════════════════
  {
    slug: "alter-table",
    title: "ALTER TABLE Schema Migrations",
    track: "schema-evolution",
    trackIndex: 0,
    description: "Perform online DDL schema changes by adding, renaming, and modifying table columns in-place.",
    analogy: {
      title: "Remodeling a House While Living Inside",
      story:
        "Imagine you buy a two-bedroom house. Two years later, you have a baby. You don't demolish the house to the ground and rebuild it from scratch—you call a contractor to build an extra bedroom wing (`ALTER TABLE ... ADD COLUMN`).\n\nExisting furniture and family members remain completely undisturbed while the new room is added.",
      takeaway:
        "ALTER TABLE evolves table structures online without wiping existing customer rows.",
    },
    mnemonic: {
      phrase: "A-A-D: Alter, Add, Drop",
      breakdown: [
        { letter: "A", word: "ALTER TABLE", meaning: "Target the table to modify" },
        { letter: "A", word: "ADD COLUMN", meaning: "Attach a new attribute" },
        { letter: "D", word: "DROP COLUMN", meaning: "Permanently decommission an attribute" },
      ],
      whyItMatters:
        "Modern applications push database migrations weekly using these exact commands.",
    },
    patterns: [
      {
        trigger: "Need to add a phone or timestamp column to an existing table?",
        solution: "ALTER TABLE <table> ADD COLUMN <name> <type>;",
        example: "ALTER TABLE users ADD COLUMN phone VARCHAR(20);",
      },
      {
        trigger: "Need to remove an obsolete column?",
        solution: "ALTER TABLE <table> DROP COLUMN <name>;",
        example: "ALTER TABLE users DROP COLUMN phone;",
      },
    ],
    proTips: [
      "When adding a NOT NULL column to an existing table with rows, always specify a DEFAULT value. Otherwise existing rows will have invalid NULL states and the migration will fail.",
    ],
    gotchas: [
      "Dropping a column is irreversible. The data in that column is deleted permanently from the storage engine.",
    ],
    diagramType: "relations",
    intuitionCheck: {
      question: "If you add a column to an active table with 10,000 existing users, what value do those 10,000 users get if no DEFAULT is specified?",
      options: [
        "They get NULL.",
        "They get random numbers.",
        "The query crashes.",
        "All 10,000 users are deleted.",
      ],
      correctIndex: 0,
      explanation:
        "New columns without a DEFAULT rule default to NULL for all pre-existing rows.",
    },
    content: [
      {
        heading: "1. Non-Destructive Schema Evolution",
        body: "Add new columns without impacting active users:",
        code: "ALTER TABLE users ADD COLUMN phone VARCHAR(20);\nALTER TABLE users ADD COLUMN created_at TEXT DEFAULT (date('now'));",
      },
      {
        heading: "2. Verifying Updated Structure",
        body: "Run DESCRIBE to see the newly added fields:",
        code: "DESCRIBE users;",
      },
    ],
    seedSQL: getSeedSQL("alter-table"),
    tasks: [
      {
        id: "at-1",
        title: "Add phone column",
        description: "Alter users table by adding column 'phone' (VARCHAR(20)).",
        hint: "ALTER TABLE users ADD COLUMN phone VARCHAR(20);",
        validation: { type: "column_exists", table: "users", column: "phone" },
      },
      {
        id: "at-2",
        title: "Add created_at temporal column",
        description: "Alter users table by adding column 'created_at' with DEFAULT (date('now')).",
        hint: "ALTER TABLE users ADD COLUMN created_at TEXT DEFAULT (date('now'));",
        validation: { type: "column_exists", table: "users", column: "created_at" },
      },
    ],
  },

  {
    slug: "constraints",
    title: "Domain Constraints & Foreign Keys",
    track: "schema-evolution",
    trackIndex: 1,
    description: "Enforce domain integrity through UNIQUE, CHECK, NOT NULL, and REFERENCES foreign keys.",
    analogy: {
      title: "Bank Vault Checkpoint Rules",
      story:
        "A bank has rules enforced by hardware:\n\n• Every safety deposit box must have a unique key (`UNIQUE`).\n• You cannot deposit negative cash (`CHECK (balance >= 0)`).\n• A deposit must be owned by an existing registered customer (`FOREIGN KEY REFERENCES customers(id)`).\n\nIf someone tries to deposit -$50 or create an account for a ghost, the security checkpoint trips immediately.",
      takeaway:
        "Database constraints guarantee business invariants at the hardware storage layer.",
    },
    mnemonic: {
      phrase: "U-N-C-F: Unique, Not Null, Check, Foreign Key",
      breakdown: [
        { letter: "U", word: "UNIQUE", meaning: "No duplicates allowed in this column" },
        { letter: "N", word: "NOT NULL", meaning: "Field must be populated" },
        { letter: "C", word: "CHECK", meaning: "Custom math predicate (e.g. price >= 0)" },
        { letter: "F", word: "FOREIGN KEY", meaning: "Must exist in parent table" },
      ],
      whyItMatters:
        "Letting the database enforce integrity is 1,000x safer than relying solely on JavaScript or Python validation.",
    },
    patterns: [
      {
        trigger: "Ensure email or SKU is never duplicated?",
        solution: "col_name VARCHAR(100) UNIQUE",
        example: "sku VARCHAR(20) UNIQUE",
      },
      {
        trigger: "Ensure positive numbers?",
        solution: "CHECK(col >= 0)",
        example: "price REAL CHECK(price >= 0)",
      },
    ],
    proTips: [
      "Foreign keys prevent orphaned records: if a customer is deleted, foreign keys can automatically CASCADE delete their orders or prevent the deletion.",
    ],
    gotchas: [
      "Inserting a row that references a non-existent foreign key throws a FOREIGN KEY constraint failure.",
    ],
    diagramType: "relations",
    intuitionCheck: {
      question: "What happens if a user submits a registration form with an email that already exists in a column marked `UNIQUE`?",
      options: [
        "The old user's password is overwritten.",
        "The database throws a UNIQUE constraint violation error and rejects the insert.",
        "Both users share the same account.",
        "The email is given a suffix like email_1.",
      ],
      correctIndex: 1,
      explanation:
        "UNIQUE constraints strictly forbid duplicate keys across rows.",
    },
    content: [
      {
        heading: "1. Declarative Domain Invariants",
        body: "Define business logic directly in the schema definition:",
        code: "CREATE TABLE products (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name VARCHAR(100) NOT NULL,\n  sku VARCHAR(20) UNIQUE,\n  price REAL CHECK(price >= 0),\n  category_id INTEGER REFERENCES categories(id)\n);",
      },
    ],
    seedSQL: getSeedSQL("constraints"),
    tasks: [
      {
        id: "cn-1",
        title: "Create constrained products table",
        description: "Create table 'products' with: id (PK), name (NOT NULL), sku (UNIQUE), price (REAL), category_id (INTEGER).",
        hint: "CREATE TABLE products (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(100) NOT NULL, sku VARCHAR(20) UNIQUE, price REAL, category_id INTEGER);",
        validation: { type: "table_exists", table: "products" },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  //  6. TRANSACTIONS & PERFORMANCE
  // ═══════════════════════════════════════════════════════════════════════
  {
    slug: "transactions-basics",
    title: "ACID Transactions (COMMIT & ROLLBACK)",
    track: "transactions",
    trackIndex: 0,
    description: "Guarantee atomicity, consistency, isolation, and durability with START TRANSACTION, COMMIT, and ROLLBACK.",
    analogy: {
      title: "The ATM Cash Machine Protocol",
      story:
        "Imagine withdrawing $100 from an ATM.\n\nTwo things must happen:\n• Step 1: Your bank balance is debited by $100.\n• Step 2: The ATM rolls out five $20 bills.\n\nWhat happens if the power cuts out after Step 1, before the cash dispenser opens? Without transactions, you lose $100 and get no money!\n\nWith an ACID transaction, Step 1 is placed in a sandbox. If Step 2 fails, the system executes ROLLBACK. The $100 debit is erased as if it never happened. Either BOTH happen, or NEITHER happens.",
      takeaway:
        "Transactions bundle multiple operations into a single atomic all-or-nothing unit.",
    },
    mnemonic: {
      phrase: "ACID: All or Nothing!",
      breakdown: [
        { letter: "A", word: "ATOMICITY", meaning: "All statements succeed, or all fail together" },
        { letter: "C", word: "CONSISTENCY", meaning: "Invariants and constraints are preserved" },
        { letter: "I", word: "ISOLATION", meaning: "Concurrent transactions don't interfere" },
        { letter: "D", word: "DURABILITY", meaning: "Committed data survives system crashes" },
      ],
      whyItMatters:
        "ACID guarantees make relational databases the global choice for banking, healthcare, and e-commerce.",
    },
    patterns: [
      {
        trigger: "Executing a multi-step financial or balance transfer?",
        solution: "START TRANSACTION; ... COMMIT;",
        example: "START TRANSACTION;\nUPDATE a SET bal = bal - 100;\nUPDATE b SET bal = bal + 100;\nCOMMIT;",
      },
      {
        trigger: "An unexpected error occurred during execution?",
        solution: "ROLLBACK;",
        example: "ROLLBACK;",
      },
    ],
    proTips: [
      "Keep transactions as short as possible. While a transaction is open, modified rows are locked, forcing other users to wait in line.",
    ],
    gotchas: [
      "In interactive sessions, forgetting to run COMMIT leaves your transaction hanging unpersisted.",
    ],
    diagramType: "transactions",
    intuitionCheck: {
      question: "What does the 'A' (Atomicity) in ACID mean?",
      options: [
        "Data is stored at the molecular atomic level.",
        "A series of SQL statements execute as an all-or-nothing unit: if one fails, all prior changes are rolled back.",
        "Transactions run automatically once per minute.",
        "All tables must have atomic single-letter names.",
      ],
      correctIndex: 1,
      explanation:
        "Atomicity guarantees that multi-step operations (like fund transfers) never leave the database in a half-finished broken state.",
    },
    content: [
      {
        heading: "1. Atomic Fund Transfers",
        body: "Group debit and credit operations inside an atomic transaction boundary:",
        code: "START TRANSACTION;\n\nUPDATE accounts SET balance = balance - 500 WHERE holder_name = 'Alice Johnson';\nUPDATE accounts SET balance = balance + 500 WHERE holder_name = 'Bob Smith';\n\nCOMMIT;",
      },
      {
        heading: "2. The ROLLBACK Safety Net",
        body: "If any step fails, undo all uncommitted changes immediately:",
        code: "START TRANSACTION;\nDELETE FROM accounts WHERE holder_name = 'Carol Williams';\n-- Mistake noticed!\nROLLBACK;",
      },
    ],
    seedSQL: getSeedSQL("transactions-basics"),
    tasks: [
      {
        id: "tx-1",
        title: "Execute atomic account transfer",
        description:
          "Transfer 500 from Alice Johnson to Bob Smith within a transaction. Alice's new balance must be 4500 and Bob's 12500.",
        hint: "START TRANSACTION; UPDATE accounts SET balance = balance - 500 WHERE holder_name = 'Alice Johnson'; UPDATE accounts SET balance = balance + 500 WHERE holder_name = 'Bob Smith'; COMMIT;",
        validation: {
          type: "value_check",
          query: "SELECT balance FROM accounts WHERE holder_name = 'Alice Johnson'",
          expectedResult: [[4500]],
          description: "Alice's final balance should be 4500",
        },
      },
    ],
  },

  {
    slug: "indexing",
    title: "B-Tree Indexing & Performance Plans",
    track: "transactions",
    trackIndex: 1,
    description: "Replace full table scans with logarithmic B-Tree lookups using single and composite indexes.",
    analogy: {
      title: "The 1,000-Page Biology Textbook Index",
      story:
        "Imagine finding the definition of 'Mitochondria' in a 1,000-page medical encyclopedia.\n\n• Method A (Full Table Scan): You start at page 1 and read every single sentence until page 642. It takes 4 hours.\n• Method B (B-Tree Index): You flip straight to the back index, look under 'M', see 'page 642', and jump directly there. It takes 2 seconds.\n\nWithout an index, MySQL must inspect every row in your 10-million row table. An index creates an alphabetical B-Tree that finds rows in 3 disk hops.",
      takeaway:
        "Indexes convert expensive O(N) full-table scans into lightning-fast O(log N) tree lookups.",
    },
    mnemonic: {
      phrase: "Index the Where & Join!",
      breakdown: [
        { letter: "W", word: "WHERE", meaning: "Index columns you filter on frequently" },
        { letter: "J", word: "JOIN", meaning: "Index foreign keys you join on" },
        { letter: "O", word: "ORDER BY", meaning: "Index columns you sort on" },
      ],
      whyItMatters:
        "Indexing the right columns is the #1 optimization that makes apps feel instant.",
    },
    patterns: [
      {
        trigger: "Speeding up point lookups on a foreign key or email?",
        solution: "CREATE INDEX idx_name ON table(col);",
        example: "CREATE INDEX idx_logs_user_id ON logs(user_id);",
      },
      {
        trigger: "Filtering by two columns together frequently?",
        solution: "CREATE INDEX idx_name ON table(col1, col2);",
        example: "CREATE INDEX idx_logs_user_action ON logs(user_id, action);",
      },
    ],
    proTips: [
      "Indexes speed up reads (SELECT), but slow down writes (INSERT, UPDATE, DELETE) because the database must update the B-Tree on every modification. Index thoughtfully!",
      "Never put indexes on tiny tables (under 100 rows)—scanning memory is faster than tree traversal for tiny tables.",
    ],
    gotchas: [
      "Wrapping an indexed column in a function (e.g. `WHERE LOWER(email) = '...'`) prevents MySQL from using the index and causes a full table scan!",
    ],
    diagramType: "btree",
    intuitionCheck: {
      question: "Why shouldn't you add an index to every single column in your database tables?",
      options: [
        "Because SQL only allows 1 index per database.",
        "Because every index consumes extra disk space and slows down every INSERT, UPDATE, and DELETE operation.",
        "Indexes delete random data.",
        "Indexes only work on Tuesdays.",
      ],
      correctIndex: 1,
      explanation:
        "Every write to a table must also rebalance all associated B-Trees. Too many indexes degrades write throughput.",
    },
    content: [
      {
        heading: "1. B-Tree Lookups vs Table Scans",
        body: "Creating an index gives MySQL a pre-sorted lookup tree:",
        code: "CREATE INDEX idx_logs_user_id ON logs(user_id);\nCREATE INDEX idx_logs_user_action ON logs(user_id, action);",
      },
      {
        heading: "2. Inspecting Indexes",
        body: "Verify that your index exists in the system schema:",
        code: "SELECT name, tbl_name FROM sqlite_master WHERE type = 'index';",
      },
    ],
    seedSQL: getSeedSQL("indexing"),
    tasks: [
      {
        id: "ix-1",
        title: "Create point index on user_id",
        description: "Create an index named 'idx_logs_user_id' on the logs table covering the user_id column.",
        hint: "CREATE INDEX idx_logs_user_id ON logs(user_id);",
        validation: {
          type: "query_result",
          query: "SELECT name FROM sqlite_master WHERE type='index' AND name='idx_logs_user_id'",
          expectedResult: [["idx_logs_user_id"]],
        },
      },
      {
        id: "ix-2",
        title: "Create composite index",
        description: "Create a composite index named 'idx_logs_user_action' covering both user_id and action.",
        hint: "CREATE INDEX idx_logs_user_action ON logs(user_id, action);",
        validation: {
          type: "query_result",
          query: "SELECT name FROM sqlite_master WHERE type='index' AND name='idx_logs_user_action'",
          expectedResult: [["idx_logs_user_action"]],
        },
      },
    ],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

export function getLessonBySlug(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug);
}

export function getLessonsForTrack(trackId: string): Lesson[] {
  return LESSONS.filter((l) => l.track === trackId).sort(
    (a, b) => a.trackIndex - b.trackIndex
  );
}

export function getTrackForLesson(slug: string): TrackInfo | undefined {
  const lesson = getLessonBySlug(slug);
  if (!lesson) return undefined;
  return TRACKS.find((t) => t.id === lesson.track);
}

export function getNextLesson(currentSlug: string): Lesson | undefined {
  const idx = LESSONS.findIndex((l) => l.slug === currentSlug);
  return idx >= 0 && idx < LESSONS.length - 1 ? LESSONS[idx + 1] : undefined;
}

export function getPrevLesson(currentSlug: string): Lesson | undefined {
  const idx = LESSONS.findIndex((l) => l.slug === currentSlug);
  return idx > 0 ? LESSONS[idx - 1] : undefined;
}
