import type { Lesson } from "@/types";
import { getSeedSQL } from "../../agents/schema-generator";

export const foundationsLessons: Lesson[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 1. RELATIONAL ARCHITECTURE & YOUR FIRST DATABASE
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "create-database",
    title: "Relational Architecture & Your First Database",
    track: "foundations",
    trackIndex: 0,
    description:
      "Understand why relational databases exist, transition from messy spreadsheets to structured schemas, and build your very first table.",
    analogy: {
      title: "The IKEA Warehouse Aisle System",
      story:
        "Imagine walking into an IKEA store with 50,000 flat-pack furniture items. If everything were dumped onto one gigantic, unorganized warehouse floor, finding a single wooden chair bolt would take days. Even worse, if an employee typed 'Poang Chiar' instead of 'Poang Chair', your inventory count would instantly become corrupt.\n\nInstead, IKEA divides the warehouse into labeled aisles (Databases), arranges items onto designated shelves (Tables), and stamps every box with an unambiguous, scannable barcode number (Primary Key). No two items ever share a barcode, and looking up an item takes two seconds.",
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
        "Before creating tables, MySQL needs to know which room you are building in. Running CREATE TABLE without selecting a database with USE leaves MySQL asking where to put your data.",
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
      "In MySQL, schema and database are synonyms. CREATE SCHEMA and CREATE DATABASE do the exact same thing.",
    ],
    gotchas: [
      "Forgetting to run USE <database>; is the #1 beginner mistake when starting a fresh session.",
      "Never put spaces in database or table names. Use underscores instead of spaces.",
      "In SQL, single quotes are for string literals ('John'), while backticks (`students`) are for table/column names.",
    ],
    diagramType: "relations",
    intuitionCheck: {
      question: "Why do we use separate relational tables instead of putting everything into one massive spreadsheet?",
      options: [
        "Because spreadsheets cannot hold more than 100 rows of data.",
        "To prevent duplicate data, avoid typos, and ensure every item has an unambiguous unique ID.",
        "Because SQL only allows 3 columns per table.",
        "Spreadsheets are illegal in production software architectures.",
      ],
      correctIndex: 1,
      explanation:
        "Relational tables normalize data so each fact is stored exactly once, linked by unique keys without messy copy-paste duplicates or spelling inconsistencies.",
    },
    content: [
      {
        heading: "1. Welcome: Why Relational Databases Rule the Software World",
        body: "Hello and welcome to your journey into SQL! Before we write any code, let's address the elephant in the room: why do software engineers use relational databases like MySQL instead of just saving everything to a shared Google Sheet or JSON file?\n\nImagine you run a fast-growing university. If student records, course names, tuition payments, and dorm assignments are all crammed into one spreadsheet, three fatal problems occur immediately:\n\n1. Typos Destroy Truth: If one clerk types 'Computer Science' and another types 'Comp Sci', your system now thinks there are two separate majors.\n2. Concurrency Crashes: What happens when 1,000 students try to register for the last seat in Chemistry at the exact same millisecond? A spreadsheet corrupts or gives the seat to everyone.\n3. Lack of Identity: If two students share the same name ('Alex Smith'), how does the registrar ensure Alex A doesn't get Alex B's failing grade?\n\nA Relational Database Management System (RDBMS) solves this by enforcing mathematical guarantees called ACID (Atomicity, Consistency, Isolation, Durability). It guarantees that data conforms to strict types, every record has an immutable ID, and concurrent transactions never collide.",
      },
      {
        heading: "2. The Hierarchy: Servers, Databases, and Tables",
        body: "Think of MySQL as a giant office building.\n\n• The Database Server (MySQL Engine) is the entire building. It manages memory, listens on port 3306, and processes queries.\n• A Database (or Schema) is a private, locked office on the 4th floor. Your university has one office (`university_db`), and an unrelated accounting project has another (`accounting_db`). They cannot see or contaminate each other's data.\n• A Table is a filing cabinet inside that office. Each drawer represents a single entity, like `students`, `courses`, or `instructors`.\n• A Row (Record) is a single physical folder inside the drawer representing one person or item.\n• A Column (Attribute) is a specific blank field printed on the folder label, like `first_name`, `email`, or `gpa`.\n\nHere is how we tell MySQL to construct our office and step inside:",
        code: "-- 1. Create a brand new database container for our school\nCREATE DATABASE university_db;\n\n-- 2. Tell MySQL to focus on this container for all upcoming work\nUSE university_db;\n\n-- 3. Ask MySQL what filing cabinets (tables) exist right now\nSHOW TABLES;\n-- Result: Empty set (we haven't built any tables yet!)",
      },
      {
        heading: "3. Blueprinting an Entity: The Anatomy of CREATE TABLE",
        body: "Now that we are inside our database, let's build our first table: `students`. In relational architecture, every table must represent one single concept (an entity). You never mix students and classes in the same table.\n\nWhen creating a table, we provide a blueprint:\n1. The table name (plural noun in lowercase snake_case: `students`).\n2. The column names and their strict data types.\n3. A PRIMARY KEY—the sacred barcode that uniquely identifies each row.\n\nLet's examine the SQL statement below line by line:",
        code: "CREATE TABLE students (\n  -- The unique identity barcode: auto-increments 1, 2, 3...\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  \n  -- The student's full name: variable-length text up to 100 characters\n  -- NOT NULL means this field can never be left empty!\n  name VARCHAR(100) NOT NULL,\n  \n  -- Age stored as a whole number\n  age INTEGER,\n  \n  -- Email address stored as text up to 150 characters\n  email VARCHAR(150)\n);",
      },
      {
        heading: "4. DDL vs DML: Command Taxonomy & Production Safety",
        body: "In SQL, commands belong to two primary families:\n\n• DDL (Data Definition Language): Commands that define and modify schema structures (`CREATE`, `ALTER`, `DROP`, `TRUNCATE`). DDL commands manage the filing cabinets, not the papers inside.\n  ⚠️ DDL Safety Rule: In MySQL, DDL commands trigger an immediate implicit COMMIT on disk. You cannot undo a `DROP TABLE` with `ROLLBACK`! In deployment scripts, always use `CREATE TABLE IF NOT EXISTS` to ensure idempotent migrations.\n\n• DML (Data Manipulation Language): Commands that manage the data records inside the tables (`INSERT`, `UPDATE`, `DELETE`, `SELECT`).\n  ⚠️ DML Safety Rule: When mutating rows with `UPDATE` or `DELETE`, forgetting the `WHERE` clause mutates EVERY record in the table. Always practice the SELECT-Before-Mutate (S-B-M) rule.",
        code: "-- DDL Example: Defining table structure (auto-committed)\nCREATE TABLE IF NOT EXISTS campuses (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  city VARCHAR(80) NOT NULL\n);\n\n-- DML Example: Inserting records into the defined structure\nINSERT INTO campuses (city) VALUES ('Boston'), ('San Francisco');",
      },
      {
        heading: "5. Under the Hood: What MySQL Does When You Hit Run",
        body: "When you execute `CREATE TABLE`, the database engine does something fascinating behind the scenes:\n\n1. Parser Check: MySQL parses your query into an abstract syntax tree to verify you didn't miss a parenthesis or misspell a keyword.\n2. Data Dictionary Registration: MySQL creates an entry in its internal catalog recording the table name, column types, and constraints.\n3. Storage Engine Allocation: The storage engine (such as InnoDB) allocates physical disk pages (usually 16 KB blocks) ready to hold incoming rows.\n4. Index Initialization: Because you designated `id` as `PRIMARY KEY`, MySQL automatically builds a high-speed B-Tree index on disk so lookups by ID will take microseconds even when the table reaches 10 million rows.",
      },
      {
        heading: "6. Introspecting Your Work: DESCRIBE and SHOW TABLES",
        body: "Professional engineers never assume code worked—they inspect the state of the database immediately.\n\nMySQL gives you two indispensable inspection tools:\n• `SHOW TABLES;` — Lists every table registered in the current active database.\n• `DESCRIBE <table_name>;` (or `DESC <table_name>;`) — Displays the full schema blueprint: column names, data types, whether NULL is permitted, default values, and primary key status.",
        code: "-- Check that 'students' is now registered in our database\nSHOW TABLES;\n\n-- Inspect the detailed column specifications of 'students'\nDESCRIBE students;\n\n-- Output will show columns: Field, Type, Null, Key, Default, Extra",
      },
    ],
    exercises: [
      {
        type: "drag-block",
        id: "cd-drag-1",
        title: "Assemble a Production Table Definition",
        instructions:
          "Drag or click the SQL clause blocks in the correct chronological order to create the `students` table.",
        scenarioContext:
          "Westfield University needs to register incoming freshmen. Assemble the statement that builds their storage schema.",
        blocks: [
          { id: "b1", text: "CREATE TABLE students (" },
          { id: "b2", text: "id INTEGER PRIMARY KEY AUTOINCREMENT," },
          { id: "b3", text: "name VARCHAR(100) NOT NULL," },
          { id: "b4", text: "age INTEGER," },
          { id: "b5", text: "email VARCHAR(150)" },
          { id: "b6", text: ");" },
        ],
        solution: ["b1", "b2", "b3", "b4", "b5", "b6"],
        hint: "Start with CREATE TABLE, define the primary key first, followed by column attributes, and finish with the closing parenthesis and semicolon.",
        explanation:
          "Great job! A well-formed CREATE TABLE starts with the table identifier, opens parentheses for column definitions separated by commas, and terminates with a closing parenthesis and semicolon.",
      },
      {
        type: "scenario",
        id: "cd-scenario-1",
        title: "FinTech Digital Wallet: Customer Account Ledger",
        companyOrContext: "ApexPay Technologies (FinTech)",
        problemStatement:
          "You have been hired as the Lead Backend Engineer at ApexPay. The engineering team is launching a digital wallet product and needs a database table to store verified user accounts.\n\nThe regulatory and compliance department requires a dedicated ledger to track registered account holders:\n1. Each customer is assigned a unique, auto-incrementing sequential identifier to anchor account transactions.\n2. Every record must capture the user's legal full name, and this field can never be left empty.\n3. The account ledger must store an optional contact email address for security alerts and transaction receipts.\n4. Design and execute the DDL blueprint to register the `customers` table in the active database.",
        previewTable: {
          tableName: "customers",
          description: "Target Customer Ledger Records",
          columns: ["id", "full_name", "email"],
          rows: [
            [1, "Elena Rostova", "elena.r@apexpay.io"],
            [2, "Marcus Vance", "marcus.v@fintechcorp.com"],
            [3, "Amina Al-Mansoor", "amina.m@globalnet.org"],
          ],
        },
        requirements: [
          {
            id: "req-1",
            text: "Create the customer registry table named `customers`",
            hint: "CREATE TABLE customers (...)",
            validationRule: { type: "table_exists", table: "customers" },
            syntaxPattern: /create\s+table\s+(if\s+not\s+exists\s+)?customers/i,
          },
          {
            id: "req-2",
            text: "Configure the `id` column as an auto-incrementing integer primary key",
            hint: "id INTEGER PRIMARY KEY AUTOINCREMENT",
            validationRule: { type: "column_exists", table: "customers", column: "id" },
            syntaxPattern: /id\s+(integer|int)\s+primary\s+key/i,
          },
          {
            id: "req-3",
            text: "Enforce `full_name` as a mandatory text field up to 120 characters",
            hint: "full_name VARCHAR(120) NOT NULL",
            validationRule: { type: "column_exists", table: "customers", column: "full_name" },
            syntaxPattern: /full_name\s+varchar(\s*\(\s*120\s*\))?\s+not\s+null/i,
          },
          {
            id: "req-4",
            text: "Support an optional `email` address field allowing up to 180 characters",
            hint: "email VARCHAR(180)",
            validationRule: { type: "column_exists", table: "customers", column: "email" },
            syntaxPattern: /email\s+varchar(\s*\(\s*180\s*\))?/i,
          },
        ],
        solutionSQL:
          "CREATE TABLE customers (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  full_name VARCHAR(120) NOT NULL,\n  email VARCHAR(180)\n);",
        solutionExplanation:
          "This schema guarantees that every wallet user has a non-colliding numeric ID, prevents blank names with NOT NULL, and allocates sufficient character space for global email addresses.",
      },
    ],
    checkpointExam: {
      id: "cd-exam",
      title: "Westfield Academy Production Readiness Exam",
      subtitle: "Checkpoint 1.1: Database Schema Deployment",
      scenarioContext:
        "You are sitting at your desk on Day 1 at Westfield Academy. The Lead Database Architect has asked you to deploy the official student enrollment table and verify that the database engine recognizes its structural contract before data migration begins tonight.",
      passingScoreDescription: "Pass all 2 testing objectives to certify completion of Lesson 1.",
      questions: [
        {
          id: "cp-cd-1",
          title: "Deploy the Students Table Schema",
          prompt:
            "Westfield Academy requires a centralized entity relation named 'students' to manage the incoming academic cohort. The architecture requires an integer surrogate primary key that automatically increments for new admissions, a non-nullable student full name allowing up to 100 characters, a numeric age field, and an optional contact email address accommodating up to 150 characters. Write the DDL statement to instantiate this table.",
          hint: "Use CREATE TABLE with primary key auto-increment syntax, ensure the name column rejects null values, and allocate appropriate variable character length limits.",
          solutionSQL:
            "CREATE TABLE students (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name VARCHAR(100) NOT NULL,\n  age INTEGER,\n  email VARCHAR(150)\n);",
          validation: {
            type: "table_exists",
            table: "students",
          },
        },
        {
          id: "cp-cd-2",
          title: "Introspect and Verify Table Registration",
          prompt:
            "Before opening ingestion pipelines, perform an engine metadata introspection to verify that the active database catalog successfully registered your new table relation alongside existing tables.",
          hint: "Recall the standard MySQL utility statement used to display all existing relations within the active schema catalog.",
          solutionSQL: "SHOW TABLES;",
          validation: {
            type: "query_result",
            queryPattern: /^SHOW\s+TABLES\s*;?$/i,
            query: "SELECT name FROM sqlite_master WHERE type='table' AND name='students'",
            expectedResult: [["students"]],
          },
        },
      ],
    },
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

  // ─────────────────────────────────────────────────────────────────────────
  // 2. TABLE DESIGN & INTEGRITY CONSTRAINTS
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "create-table",
    title: "Table Design & Integrity Constraints",
    track: "foundations",
    trackIndex: 1,
    description:
      "Design normalized schemas with integrity constraints: NOT NULL, DEFAULT, and AUTO_INCREMENT to enforce data quality at the disk level.",
    analogy: {
      title: "The Official Passport Application Form",
      story:
        "Think of table constraints like the strict validation checkpoints on an airport passport renewal form.\n\n• Your National Passport ID is printed across the top—no two citizens on Earth can share the exact same number (PRIMARY KEY).\n• The 'Full Legal Name' box cannot be handed in blank (NOT NULL). If someone leaves it empty, the passport officer rejects the application instantly.\n• If you leave 'Issuing Country' blank, the computer automatically stamps 'United States' for you (DEFAULT 'USA').\n• Every time a new citizen applies, the machine increments the serial counter by 1 (AUTO_INCREMENT).\n\nBecause the government enforces these constraints at the desk, dirty or broken records never make it into the border patrol computer.",
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
      "Use DEFAULT values to prevent mysterious NULLs in boolean or numerical counter columns.",
    ],
    gotchas: [
      "In SQLite/WASM, AUTOINCREMENT is only valid on INTEGER PRIMARY KEY columns.",
      "Don't put a trailing comma after the last column definition before the closing parenthesis.",
      "A column with a DEFAULT value can still hold NULL if someone explicitly inserts NULL! If you want to forbid NULL completely, combine both: `credits INTEGER NOT NULL DEFAULT 3`.",
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
        heading: "1. The True Cost of Dirty Data",
        body: "Let me share a true story from the software trenches: A junior engineer at a fast-growing startup designed a `users` table without setting `email VARCHAR(255) NOT NULL`. A buggy frontend form accidentally submitted 14,000 user registrations where the email field was empty (`NULL`).\n\nWhen the marketing team ran their automated welcome campaign, the script crashed with a null-pointer exception, and billing could not invoice 14,000 paying customers! Repairing that database took two senior engineers an entire weekend.\n\nThe moral is profound: Never rely solely on application code (React, Node.js, Python) to validate your data. Frontend checks can be bypassed by malicious users or buggy API clients. The database is your last line of defense. By adding constraints, MySQL physically rejects invalid data before it touches disk.",
      },
      {
        heading: "2. The Four Pillars of Table Constraints (P-N-D-A)",
        body: "Whenever you write a `CREATE TABLE` statement, walk through the P-N-D-A checklist for every single column:\n\n1. PRIMARY KEY: Every table must have a unique identifier. This guarantees that row #42 can be distinguished from row #43, even if every other attribute is identical.\n2. NOT NULL: Forbids the column from holding empty/null values. Use this for required fields like names, usernames, passwords, and timestamps.\n3. DEFAULT <value>: Supplies a fallback if the inserting query omits this column. For example, when a user signs up, their `status` can default to `'active'`, or a newly created course can default to `3` credits.\n4. AUTO_INCREMENT: Tells MySQL to maintain an internal sequence counter on disk. When you insert a new record, you can completely ignore the ID column; MySQL automatically issues `1`, then `2`, then `3`.",
      },
      {
        heading: "3. Crafting the Courses Schema Step by Step",
        body: "Let's put this into practice by designing the `courses` catalog for our university. Consider the business rules:\n\n• Every course needs a unique system ID.\n• Every course must have an official title (e.g., 'Database Systems 101'). It cannot be blank!\n• Most university courses are worth 3 credits. If the registrar does not specify credits, it should automatically be set to 3.\n\nHere is how that translates directly into elegant SQL:",
        code: "CREATE TABLE courses (\n  -- Primary key with automatic counter\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  \n  -- Mandatory course title: cannot be null\n  title VARCHAR(150) NOT NULL,\n  \n  -- Credits: defaults to 3 if omitted\n  credits INTEGER DEFAULT 3\n);",
      },
      {
        heading: "4. The Nullability Trap: NULL vs Zero vs Empty String",
        body: "Beginners frequently confuse three distinct states:\n\n• `0` (Zero): A mathematical quantity. A customer with a balance of `0` has zero dollars.\n• `''` (Empty String): A text value with length zero. Someone typed a word with zero letters.\n• `NULL`: The complete absence of a value. It means 'Unknown', 'Unrecorded', or 'Not Applicable'.\n\nIf you mark a column `NOT NULL`, MySQL will reject `NULL`, but it will happily accept `0` or `''`. Understanding this distinction will save you from hundreds of subtle reporting bugs down the road.",
      },
      {
        heading: "5. Verifying Your Constraints with DESCRIBE",
        body: "Once your table is created, run `DESCRIBE courses;` to verify how MySQL interpreted your constraints.\n\nLook closely at the output columns:\n• `Null`: Will show 'NO' for `title` and `id`, but 'YES' for unconstrained columns.\n• `Default`: Will show '3' for `credits`.\n• `Key`: Will show 'PRI' for `id`.",
        code: "-- Inspect the newly created table\nDESCRIBE courses;\n\n-- You should see:\n-- id      INTEGER   NO   PRI   NULL   auto_increment\n-- title   VARCHAR   NO        NULL   \n-- credits INTEGER   YES       3      ",
      },
    ],
    exercises: [
      {
        type: "drag-block",
        id: "ct-drag-1",
        title: "Construct the Courses Table with Constraints",
        instructions:
          "Assemble the SQL statement to create the `courses` table with NOT NULL and DEFAULT constraints.",
        scenarioContext:
          "The university curriculum committee approved new guidelines: all courses must have titles and default to 3 credits.",
        blocks: [
          { id: "b1", text: "CREATE TABLE courses (" },
          { id: "b2", text: "id INTEGER PRIMARY KEY AUTOINCREMENT," },
          { id: "b3", text: "title VARCHAR(150) NOT NULL," },
          { id: "b4", text: "credits INTEGER DEFAULT 3" },
          { id: "b5", text: ");" },
        ],
        solution: ["b1", "b2", "b3", "b4", "b5"],
        hint: "Start with CREATE TABLE courses (, add the id primary key, title with NOT NULL, credits with DEFAULT 3, and finish with );",
        explanation:
          "Masterfully assembled! Notice how `NOT NULL` directly follows the data type `VARCHAR(150)`, and `DEFAULT 3` follows `INTEGER`.",
      },
      {
        type: "scenario",
        id: "ct-scenario-1",
        title: "E-Commerce Catalog: The Products Inventory Table",
        companyOrContext: "ShopStream Retail (E-Commerce)",
        problemStatement:
          "You are designing the catalog database for ShopStream, a global retail marketplace. You need to create an inventory table named `products` to track merchandise.\n\nProduct management rules:\n1. Every catalog entry requires a unique sequential numeric identifier as its primary key.\n2. Products must have a designated title up to 150 characters and cannot be left blank.\n3. The item price must be stored as whole integers (measuring cents) and is strictly mandatory.\n4. Available stock quantity should automatically default to zero when a new supplier listing is initiated without specified inventory.",
        previewTable: {
          tableName: "products",
          description: "Sample Merchandise Catalog Records",
          columns: ["id", "name", "price", "stock_quantity"],
          rows: [
            [1, "Ergonomic Mechanical Keyboard", 12900, 45],
            [2, "Ultra-Wide Gaming Monitor 34-inch", 49900, 12],
            [3, "Braided USB-C Fast Charger Cable", 1500, 0],
          ],
        },
        requirements: [
          {
            id: "req-1",
            text: "Establish the inventory catalog table named `products`",
            hint: "CREATE TABLE products (...)",
            validationRule: { type: "table_exists", table: "products" },
            syntaxPattern: /create\s+table\s+(if\s+not\s+exists\s+)?products/i,
          },
          {
            id: "req-2",
            text: "Configure `id` as an auto-incrementing integer primary key",
            hint: "id INTEGER PRIMARY KEY AUTOINCREMENT",
            validationRule: { type: "column_exists", table: "products", column: "id" },
            syntaxPattern: /id\s+(integer|int)\s+primary\s+key/i,
          },
          {
            id: "req-3",
            text: "Enforce a mandatory product `name` text field up to 150 characters",
            hint: "name VARCHAR(150) NOT NULL",
            validationRule: { type: "column_exists", table: "products", column: "name" },
            syntaxPattern: /name\s+varchar(\s*\(\s*150\s*\))?\s+not\s+null/i,
          },
          {
            id: "req-4",
            text: "Default the on-shelf `stock_quantity` to 0 if unspecified",
            hint: "stock_quantity INTEGER DEFAULT 0",
            validationRule: { type: "column_exists", table: "products", column: "stock_quantity" },
            syntaxPattern: /stock_quantity\s+(integer|int)?\s+default\s+0/i,
          },
        ],
        solutionSQL:
          "CREATE TABLE products (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name VARCHAR(150) NOT NULL,\n  price INTEGER NOT NULL,\n  stock_quantity INTEGER DEFAULT 0\n);",
        solutionExplanation:
          "Setting `stock_quantity INTEGER DEFAULT 0` prevents unstocked products from displaying as NULL or causing cart checkout calculation crashes.",
      },
    ],
    checkpointExam: {
      id: "ct-exam",
      title: "University Curriculum Architecture Exam",
      subtitle: "Checkpoint 1.2: Schema Constraints Verification",
      scenarioContext:
        "The Dean of Westfield Academy has authorized the launch of the winter course catalog. You are tasked with creating the official `courses` table with strict data integrity rules, followed by a schema inspection to verify that the constraints are active.",
      passingScoreDescription: "Pass all 2 testing objectives to certify completion of Lesson 2.",
      questions: [
        {
          id: "cp-ct-1",
          title: "Build the Courses Table with NOT NULL and DEFAULT",
          prompt:
            "Westfield's academic registrar requires a relational entity named 'courses' to structure the semester curriculum. The entity must assign an auto-incrementing integer as its unique primary key, enforce that every course has a mandatory title up to 150 characters, and automatically default academic workload to 3 credits whenever credit units are not explicitly provided. Compose the DDL statement enforcing these integrity constraints.",
          hint: "Pair NOT NULL on the title attribute with the DEFAULT clause on credits to automatically handle omitted credit values.",
          solutionSQL:
            "CREATE TABLE courses (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  title VARCHAR(150) NOT NULL,\n  credits INTEGER DEFAULT 3\n);",
          validation: {
            type: "table_exists",
            table: "courses",
          },
        },
        {
          id: "cp-ct-2",
          title: "Inspect Schema Details for Courses",
          prompt:
            "Perform a structural column audit on your newly deployed 'courses' entity to verify that the credit default clause and nullability restrictions are registered as designed.",
          hint: "Use the MySQL schema introspection command that outputs column names, data types, nullability rules, and default assignments.",
          solutionSQL: "DESCRIBE courses;",
          validation: {
            type: "column_exists",
            queryPattern: /^(?:DESCRIBE|DESC)\s+courses\s*;?$/i,
            table: "courses",
            column: "credits",
          },
        },
      ],
    },
    seedSQL: getSeedSQL("create-table"),
    tasks: [
      {
        id: "ct-1",
        title: "Create courses table with constraints",
        description:
          "Create a table named 'courses' with: id (INTEGER PRIMARY KEY AUTOINCREMENT), title (VARCHAR(150) NOT NULL), and credits (INTEGER DEFAULT 3).",
        hint: "CREATE TABLE courses (id INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR(150) NOT NULL, credits INTEGER DEFAULT 3);",
        validation: {
          type: "table_exists",
          table: "courses",
        },
      },
      {
        id: "ct-2",
        title: "Verify Table Existence",
        description: "Run SHOW TABLES; to verify that the courses table was created.",
        hint: "SHOW TABLES;",
        validation: {
          type: "query_result",
          queryPattern: /^SHOW\s+TABLES\s*;?$/i,
          query: "SELECT name FROM sqlite_master WHERE type='table' AND name='courses'",
          expectedResult: [["courses"]],
        },
      },
      {
        id: "ct-3",
        title: "Inspect Courses Schema",
        description: "Run DESCRIBE courses; to inspect column constraints.",
        hint: "DESCRIBE courses;",
        validation: {
          type: "column_exists",
          queryPattern: /^(?:DESCRIBE|DESC)\s+courses\s*;?$/i,
          table: "courses",
          column: "credits",
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3. STRICT DATA TYPES & STORAGE EFFICIENCY
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "data-types",
    title: "Strict Data Types & Storage Efficiency",
    track: "foundations",
    trackIndex: 2,
    description:
      "Master MySQL's strict data type system: INTEGER, VARCHAR, REAL, and DATE to maximize storage performance and mathematical accuracy.",
    analogy: {
      title: "The Carpenter's Custom Toolboxes",
      story:
        "Imagine hiring a master carpenter who carries four distinct toolboxes:\n\n• The Bolt Box (INTEGER): Solid metal compartments for whole items. You can put 5 bolts or 6 bolts in it, but you cannot put half a bolt.\n• The Accordion Bag (VARCHAR): Stretchy leather compartments for tape and rulers. If you store a 4-inch pencil, it shrinks to 4 inches; if you store a 10-inch wrench, it expands to 10 inches without wasting empty space.\n• The Precision Caliper (REAL / DECIMAL): Used for fractions of a millimeter where decimals are critical.\n• The Calendar Stamp (DATE): Stamped in the universal standard YYYY-MM-DD so dates across time zones never get inverted.\n\nIf the carpenter threw a fragile glass thermometer into the heavy bolt box, it would shatter. Choosing the right container protects your data.",
      takeaway:
        "Data types define not just what you can store, but how efficiently the disk organizes bytes and what mathematical operations are legal.",
    },
    mnemonic: {
      phrase: "I-V-R-D: Integer, Varchar, Real, Date",
      breakdown: [
        { letter: "I", word: "INTEGER", meaning: "Whole numbers (-2B to +2B)" },
        { letter: "V", word: "VARCHAR(N)", meaning: "Variable text up to N characters" },
        { letter: "R", word: "REAL / DECIMAL", meaning: "Floating point or exact currency" },
        { letter: "D", word: "DATE", meaning: "Calendar day: 'YYYY-MM-DD'" },
      ],
      whyItMatters:
        "Choosing the wrong data type causes silent bugs—like storing ZIP codes as integers, which strips leading zeroes ('07030' becomes '7030')!",
    },
    patterns: [
      {
        trigger: "Storing whole counting numbers (quantities, counts, ages)?",
        solution: "INTEGER",
        example: "age INTEGER",
      },
      {
        trigger: "Storing names, emails, titles, or descriptions?",
        solution: "VARCHAR(max_length)",
        example: "name VARCHAR(100)",
      },
      {
        trigger: "Storing prices, percentages, or measurements?",
        solution: "REAL (or DECIMAL(10,2))",
        example: "gpa REAL",
      },
      {
        trigger: "Storing birthdays, graduation days, or event dates?",
        solution: "DATE",
        example: "birth_date DATE",
      },
    ],
    proTips: [
      "Never store phone numbers or postal ZIP codes as INTEGER! Leading zeroes will disappear (e.g. 01234 becomes 1234). Use VARCHAR(20) instead.",
      "Always store dates in ISO 8601 format: 'YYYY-MM-DD'. This guarantees that alphabetical sorting matches chronological sorting.",
      "Pick realistic VARCHAR lengths. VARCHAR(100) for names, VARCHAR(255) for emails, and VARCHAR(500) for bios.",
    ],
    gotchas: [
      "Floating-point numbers (FLOAT/REAL) have tiny rounding imprecisions (0.1 + 0.2 = 0.30000000000000004). In production financial systems, use DECIMAL(10,2) or store integer cents.",
      "Date strings must be enclosed in single quotes: '2025-09-01'.",
    ],
    diagramType: "relations",
    intuitionCheck: {
      question: "Why should a customer's postal ZIP code (e.g., '07430') be stored as VARCHAR instead of INTEGER?",
      options: [
        "Because INTEGER takes up too much memory on the disk.",
        "Because INTEGER mathematically drops leading zeros, corrupting '07430' into '7430'.",
        "Because SQL does not allow numbers higher than 999.",
        "Because postal codes are encrypted by the database engine.",
      ],
      correctIndex: 1,
      explanation:
        "Since mathematical operations like addition (+, -) are never performed on ZIP codes, storing them as VARCHAR preserves leading zeroes and international alphanumeric postal codes (e.g. 'SW1A 1AA').",
    },
    content: [
      {
        heading: "1. Why SQL is Statically Typed (And Why You'll Love It)",
        body: "If you come from Python or JavaScript, you are used to dynamic typing: a variable can hold a number one second and a string the next. While flexible, this is hazardous for persistent storage.\n\nImagine a bank database where a column meant for account balances accidentally allows the string 'five hundred dollars'. What happens when the interest calculation script runs? The whole bank ledger halts!\n\nIn MySQL, every single column has an unshakeable contract. If a column is defined as `INTEGER`, attempting to insert `'hello'` causes MySQL to reject the query immediately. This strictness is what makes relational databases reliable enough to manage global financial systems and medical registries.",
      },
      {
        heading: "2. The Big Four Data Type Families",
        body: "While MySQL offers dozens of specialized types, 95% of real-world backend engineering revolves around four fundamental families:\n\n1. Whole Numbers (INTEGER):\n   • Perfect for IDs, student counts, ages, inventory stocks.\n   • Occupies 4 bytes of storage. Range: -2,147,483,648 to +2,147,483,647.\n\n2. Variable-Length Text (VARCHAR(N)):\n   • The workhorse of text data: names, emails, street addresses, passwords.\n   • The `(N)` represents the maximum permitted character length. Unlike fixed `CHAR`, `VARCHAR` only uses the bytes actually needed plus 1 byte for length.\n\n3. Decimals & Floats (REAL / DECIMAL):\n   • Used for fractional values: GPAs (3.85), weights (72.4), temperatures.\n   • Note: In SQLite/WASM, `REAL` stores IEEE 8-byte floating point values.\n\n4. Calendar Dates (DATE):\n   • Stores calendar days formatted strictly as `'YYYY-MM-DD'` (e.g. `'2025-08-25'`).\n   • Avoid storing dates as plain text or numbers—using `DATE` lets MySQL perform calendar math (e.g. calculating age from birthday).",
      },
      {
        heading: "3. Blueprinting the Faculty Registry",
        body: "Let's apply all four type families by designing the `professors` table for our university.\n\nNotice how each business requirement maps to its optimal data type:\n• `id`: Automatic integer counter (`INTEGER PRIMARY KEY AUTOINCREMENT`)\n• `name`: Faculty member name up to 100 characters (`VARCHAR(100) NOT NULL`)\n• `department`: Academic department name (`VARCHAR(100)`)\n• `salary`: Base annual compensation with cents (`REAL NOT NULL`)\n• `hire_date`: The official start date (`DATE NOT NULL`)",
        code: "CREATE TABLE professors (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name VARCHAR(100) NOT NULL,\n  department VARCHAR(100),\n  salary REAL NOT NULL,\n  hire_date DATE NOT NULL\n);",
      },
      {
        heading: "4. The Golden Rule of Schema Sizing",
        body: "Why not just make every column `VARCHAR(5000)` just in case? Senior database architects call this 'Schema Bloat'.\n\nWhen MySQL executes complex queries involving sorting (`ORDER BY`) or joins, it allocates in-memory buffers based on the declared column size. If your table has ten columns declared as `VARCHAR(2000)`, MySQL reserves memory as if each row might take 20 KB. This fills the buffer pool quickly, forcing the engine to spill sorting operations to temporary disk files, slowing queries down by a factor of 100x!\n\nPro-Tip: Be generous enough for international names (100 characters), but disciplined enough to keep rows compact.",
      },
      {
        heading: "5. Verifying Type Definitions with DESCRIBE",
        body: "Let's check the schema to verify that our data types were accepted by the storage engine:",
        code: "DESCRIBE professors;\n\n-- Look at the 'Type' column:\n-- id         -> INTEGER\n-- name       -> VARCHAR(100)\n-- department -> VARCHAR(100)\n-- salary     -> REAL\n-- hire_date  -> DATE",
      },
    ],
    exercises: [
      {
        type: "drag-block",
        id: "dt-drag-1",
        title: "Build the Faculty Schema with Mixed Types",
        instructions:
          "Assemble the SQL statement to create the `professors` table with INTEGER, VARCHAR, REAL, and DATE types.",
        scenarioContext:
          "The university payroll department needs a new table to track faculty appointments with salary and hire date.",
        blocks: [
          { id: "b1", text: "CREATE TABLE professors (" },
          { id: "b2", text: "id INTEGER PRIMARY KEY AUTOINCREMENT," },
          { id: "b3", text: "name VARCHAR(100) NOT NULL," },
          { id: "b4", text: "salary REAL NOT NULL," },
          { id: "b5", text: "hire_date DATE NOT NULL" },
          { id: "b6", text: ");" },
        ],
        solution: ["b1", "b2", "b3", "b4", "b5", "b6"],
        hint: "Follow standard DDL: CREATE TABLE, primary key id, name varchar, salary real, hire_date date, and closing semicolon.",
        explanation:
          "Outstanding! You've combined all four fundamental data type families into a normalized, type-safe schema.",
      },
      {
        type: "scenario",
        id: "dt-scenario-1",
        title: "Hospital ER Patient Vital Signs Registry",
        companyOrContext: "Metro Health Medical Center",
        problemStatement:
          "You are the Lead Database Architect for Metro Health Emergency Room. You need to create a table named `vitals` to record patient vital sign measurements at triage check-in.\n\nClinical data requirements:\n1. Triage records must have an auto-incrementing sequential identifier.\n2. The patient's legal name is mandatory and holds up to 120 characters.\n3. Patient body temperature must support decimal readings in Celsius (such as 38.6).\n4. The intake examination date must record standard calendar dates for clinical charting.",
        previewTable: {
          tableName: "vitals",
          description: "Triage Intake Patient Measurements",
          columns: ["id", "patient_name", "body_temp", "recorded_date"],
          rows: [
            [1, "David Miller", 37.2, "2025-02-10"],
            [2, "Sophia Rodriguez", 38.6, "2025-02-10"],
            [3, "Liam Gallagher", 36.8, "2025-02-11"],
          ],
        },
        requirements: [
          {
            id: "req-1",
            text: "Establish the triage registry table named `vitals`",
            hint: "CREATE TABLE vitals (...)",
            validationRule: { type: "table_exists", table: "vitals" },
            syntaxPattern: /create\s+table\s+(if\s+not\s+exists\s+)?vitals/i,
          },
          {
            id: "req-2",
            text: "Record the patient name as a mandatory text field up to 120 characters",
            hint: "patient_name VARCHAR(120) NOT NULL",
            validationRule: { type: "column_exists", table: "vitals", column: "patient_name" },
            syntaxPattern: /patient_name\s+varchar(\s*\(\s*120\s*\))?\s+not\s+null/i,
          },
          {
            id: "req-3",
            text: "Store body temperature using floating-point decimal precision",
            hint: "body_temp REAL",
            validationRule: { type: "column_exists", table: "vitals", column: "body_temp" },
            syntaxPattern: /body_temp\s+(real|float|double)/i,
          },
          {
            id: "req-4",
            text: "Store the triage date using a standard calendar date type",
            hint: "recorded_date DATE",
            validationRule: { type: "column_exists", table: "vitals", column: "recorded_date" },
            syntaxPattern: /recorded_date\s+date/i,
          },
        ],
        solutionSQL:
          "CREATE TABLE vitals (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  patient_name VARCHAR(120) NOT NULL,\n  body_temp REAL,\n  recorded_date DATE\n);",
        solutionExplanation:
          "Using REAL for `body_temp` accommodates decimal measurements like 37.8, while DATE enforces standard calendar sorting.",
      },
    ],
    checkpointExam: {
      id: "dt-exam",
      title: "Faculty & Payroll Database Deployment Exam",
      subtitle: "Checkpoint 1.3: Data Type Verification",
      scenarioContext:
        "The Westfield Academy Human Resources team is onboarding new tenured professors tomorrow. You must create the `professors` table with correct strict data types and verify that the schema is registered and active.",
      passingScoreDescription: "Pass all 2 testing objectives to certify completion of Track 1: Foundations.",
      questions: [
        {
          id: "cp-dt-1",
          title: "Deploy the Professors Table with Strict Types",
          prompt:
            "Westfield Human Resources needs a strict payroll relation named 'professors' to onboard faculty members. The schema requires an auto-incrementing integer primary key identifier, a required faculty name up to 100 characters, an optional department name up to 100 characters, a mandatory floating-point decimal salary (REAL) that cannot be left blank, and a non-null calendar onboarding date (DATE). Construct the table definition ensuring all types and constraints align with HR compliance.",
          hint: "Use appropriate data types: REAL for decimal compensation figures, DATE for calendar stamps, and attach NOT NULL to all non-negotiable fields.",
          solutionSQL:
            "CREATE TABLE professors (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name VARCHAR(100) NOT NULL,\n  department VARCHAR(100),\n  salary REAL NOT NULL,\n  hire_date DATE NOT NULL\n);",
          validation: {
            type: "table_exists",
            table: "professors",
          },
        },
        {
          id: "cp-dt-2",
          title: "Inspect Column Type Blueprint",
          prompt:
            "Audit the structural blueprint of the 'professors' table to confirm that the hire date and salary attributes correctly enforce their respective data types and non-null guarantees.",
          hint: "Run the schema descriptor statement targeting the faculty relation to inspect its columns and data types.",
          solutionSQL: "DESCRIBE professors;",
          validation: {
            type: "column_exists",
            queryPattern: /^(?:DESCRIBE|DESC)\s+professors\s*;?$/i,
            table: "professors",
            column: "hire_date",
          },
        },
      ],
    },
    seedSQL: getSeedSQL("data-types"),
    tasks: [
      {
        id: "dt-1",
        title: "Create professors table with rich types",
        description:
          "Create a table named 'professors' with: id (INTEGER PRIMARY KEY AUTOINCREMENT), name (VARCHAR(100) NOT NULL), department (VARCHAR(100)), salary (REAL NOT NULL), and hire_date (DATE NOT NULL).",
        hint: "CREATE TABLE professors (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(100) NOT NULL, department VARCHAR(100), salary REAL NOT NULL, hire_date DATE NOT NULL);",
        validation: {
          type: "table_exists",
          table: "professors",
        },
      },
      {
        id: "dt-2",
        title: "Verify Table Existence",
        description: "Run SHOW TABLES; to verify that the professors table was created.",
        hint: "SHOW TABLES;",
        validation: {
          type: "query_result",
          queryPattern: /^SHOW\s+TABLES\s*;?$/i,
          query: "SELECT name FROM sqlite_master WHERE type='table' AND name='professors'",
          expectedResult: [["professors"]],
        },
      },
      {
        id: "dt-3",
        title: "Inspect Professors Schema",
        description: "Run DESCRIBE professors; to inspect the column types.",
        hint: "DESCRIBE professors;",
        validation: {
          type: "column_exists",
          queryPattern: /^(?:DESCRIBE|DESC)\s+professors\s*;?$/i,
          table: "professors",
          column: "hire_date",
        },
      },
    ],
  },
];
