import type { Lesson } from "@/types";
import { getSeedSQL } from "../../agents/schema-generator";

export const schemaEvolutionLessons: Lesson[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 1. ALTER TABLE
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "alter-table",
    title: "ALTER TABLE Schema Migrations",
    track: "schema-evolution",
    trackIndex: 0,
    description:
      "Perform online DDL schema changes by adding, renaming, and modifying table columns in-place without data loss.",
    analogy: {
      title: "Remodeling a House While Living Inside",
      story:
        "Imagine you buy a cozy two-bedroom house. Three years later, your family grows and you need a third bedroom. You don't bulldoze the house down to the foundation, evicting your family for six months!\n\nInstead, you hire a licensed contractor to build a new master bedroom wing onto the side of the house (`ALTER TABLE ... ADD COLUMN`). Your living room furniture, kitchen, and family members remain completely undisturbed throughout the renovation.\n\nIn software engineering, `ALTER TABLE` is how production systems evolve live databases with zero downtime.",
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
      "In high-traffic production databases, running heavy ALTER TABLE statements can lock tables. Tools like gh-ost or pt-online-schema-change are often used for massive tables.",
    ],
    gotchas: [
      "Dropping a column is irreversible. The data in that column is deleted permanently from the storage engine pages.",
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
        "New columns without an explicit DEFAULT rule default to NULL for all pre-existing rows.",
    },
    content: [
      {
        heading: "1. The Reality of Software: Schemas Never Stay Static",
        body: "No database schema is ever 'finished'. As companies grow, new product features demand new attributes: marketing needs a user's phone number for two-factor authentication, security needs a `last_login_at` timestamp, and compliance needs a `gdpr_consent` boolean flag.\n\nIn early development, inexperienced programmers might think about dropping the table and recreating it: `DROP TABLE users; CREATE TABLE users (...);`. But in production, you have 2 million active paying users! Dropping the table would instantly destroy your business.\n\n`ALTER TABLE` allows you to mutate the schema definition in place without disturbing existing data.",
      },
      {
        heading: "2. Adding Columns with ADD COLUMN",
        body: "To attach a new column, use `ALTER TABLE table_name ADD COLUMN column_name data_type [constraints]`:\n\n• Adding a nullable phone column: `ALTER TABLE users ADD COLUMN phone VARCHAR(20);`\n• Adding a timestamp column with an automatic default: `ALTER TABLE users ADD COLUMN created_at TEXT DEFAULT (date('now'));`\n\nWhen MySQL executes this, it updates its internal catalog metadata and sets the new column to its default value (or NULL) for all pre-existing rows.",
        code: "-- 1. Add phone number attribute\nALTER TABLE users ADD COLUMN phone VARCHAR(20);\n\n-- 2. Add temporal creation timestamp with default\nALTER TABLE users ADD COLUMN created_at TEXT DEFAULT (date('now'));",
      },
      {
        heading: "3. The NOT NULL Migration Trap",
        body: "Here is a classic production migration incident: An engineer attempts to run:\n`ALTER TABLE users ADD COLUMN status VARCHAR(20) NOT NULL;` on a table with 50,000 existing users.\n\nMySQL will instantly throw an error and abort! Why? Because for all 50,000 existing rows, this new column has no value (it is NULL), which immediately violates the `NOT NULL` constraint!\n\nTo safely add a NOT NULL column to an existing table, you must always provide a fallback default:\n`ALTER TABLE users ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active';`.",
      },
      {
        heading: "4. Verifying the Evolved Schema with DESCRIBE",
        body: "Always verify that your migration succeeded by inspecting the schema blueprint:",
        code: "-- Verify that phone and created_at columns are registered\nDESCRIBE users;",
      },
    ],
    exercises: [
      {
        type: "drag-block",
        id: "at-drag-1",
        title: "Assemble an ALTER TABLE ADD COLUMN Migration",
        instructions:
          "Arrange the clauses in order to add a phone column to the users table.",
        scenarioContext:
          "The security team requires collecting user phone numbers for SMS verification.",
        blocks: [
          { id: "b1", text: "ALTER TABLE users" },
          { id: "b2", text: "ADD COLUMN phone" },
          { id: "b3", text: "VARCHAR(20);" },
        ],
        solution: ["b1", "b2", "b3"],
        hint: "Follow the sequence: ALTER TABLE users, ADD COLUMN phone, VARCHAR(20);",
        explanation:
          "Spot on! ALTER TABLE names the entity, ADD COLUMN identifies the attribute, and VARCHAR(20) sets the storage type.",
      },
      {
        type: "scenario",
        id: "at-scenario-1",
        title: "FinTech Compliance: Account KYC Verification Column",
        companyOrContext: "ApexPay Regulatory Compliance",
        problemStatement:
          "Due to new banking regulations, all accounts in the `accounts` table must track KYC (Know Your Customer) compliance status.\n\nWrite an ALTER TABLE statement to add a new column named `kyc_status` (VARCHAR 30) with a DEFAULT value of 'pending' and NOT NULL to the `accounts` table.",
        requirements: [
          {
            id: "req-1",
            text: "Target table accounts with ALTER TABLE",
            hint: "ALTER TABLE accounts",
          },
          {
            id: "req-2",
            text: "Add column kyc_status VARCHAR(30)",
            hint: "ADD COLUMN kyc_status VARCHAR(30)",
          },
          {
            id: "req-3",
            text: "Include NOT NULL DEFAULT 'pending'",
            hint: "NOT NULL DEFAULT 'pending'",
          },
        ],
        starterSQL:
          "-- Alter accounts table to add kyc_status\nALTER TABLE accounts\n  -- Add column here\n;",
        solutionSQL:
          "ALTER TABLE accounts\nADD COLUMN kyc_status VARCHAR(30) NOT NULL DEFAULT 'pending';",
        solutionExplanation:
          "Providing DEFAULT 'pending' ensures existing account holders don't fail the NOT NULL check during the online migration.",
      },
    ],
    checkpointExam: {
      id: "at-exam",
      title: "Online Schema Migration Certification",
      subtitle: "Checkpoint 5.1: ALTER TABLE Verification",
      scenarioContext:
        "The security and audit team at Westfield Academy requires two new attributes on the user table: a contact phone number and an audit creation timestamp. You must execute both online migrations.",
      passingScoreDescription: "Pass both schema evolution tasks to certify completion of Lesson 13.",
      questions: [
        {
          id: "cp-at-1",
          title: "Add Contact Phone Attribute",
          prompt: "Alter the `users` table by adding column `phone` (VARCHAR(20)).",
          hint: "ALTER TABLE users ADD COLUMN phone VARCHAR(20);",
          starterSQL: "ALTER TABLE users ADD COLUMN phone VARCHAR(20);",
          solutionSQL: "ALTER TABLE users ADD COLUMN phone VARCHAR(20);",
          validation: { type: "column_exists", table: "users", column: "phone" },
        },
        {
          id: "cp-at-2",
          title: "Add Temporal Audit Timestamp with Default",
          prompt:
            "Alter the `users` table by adding column `created_at` with DEFAULT `(date('now'))`.",
          hint: "ALTER TABLE users ADD COLUMN created_at TEXT DEFAULT (date('now'));",
          starterSQL: "ALTER TABLE users ADD COLUMN created_at TEXT DEFAULT (date('now'));",
          solutionSQL: "ALTER TABLE users ADD COLUMN created_at TEXT DEFAULT (date('now'));",
          validation: { type: "column_exists", table: "users", column: "created_at" },
        },
      ],
    },
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
        description:
          "Alter users table by adding column 'created_at' with DEFAULT (date('now')).",
        hint: "ALTER TABLE users ADD COLUMN created_at TEXT DEFAULT (date('now'));",
        validation: { type: "column_exists", table: "users", column: "created_at" },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2. CONSTRAINTS
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "constraints",
    title: "Domain Constraints & Foreign Keys",
    track: "schema-evolution",
    trackIndex: 1,
    description:
      "Enforce domain invariants and referential integrity through UNIQUE, CHECK, NOT NULL, and REFERENCES foreign keys.",
    analogy: {
      title: "Bank Vault Checkpoint Rules",
      story:
        "Think of a high-security commercial bank vault. The bank doesn't simply rely on customers being polite; it enforces physical laws:\n\n• Every safety deposit box must have a strictly unique key (`UNIQUE`).\n• The cash intake machine physically refuses to accept negative dollar bills (`CHECK (balance >= 0)`).\n• A safety deposit box can only be assigned to a verified customer registered in the national ID system (`FOREIGN KEY REFERENCES customers(id)`).\n\nIf someone tries to deposit -$50 or allocate a box to a non-existent customer, the vault locks down immediately.",
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
      "Foreign keys prevent orphaned records: if a parent row is deleted, foreign keys can automatically CASCADE delete child rows or block the deletion.",
      "A table can have multiple UNIQUE columns, but only one PRIMARY KEY.",
    ],
    gotchas: [
      "Inserting a child row that references a non-existent foreign key throws a foreign key constraint violation.",
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
        heading: "1. The Invariant Principle: Defending Truth at the Disk Layer",
        body: "In software engineering, an Invariant is a rule that must NEVER be broken under any circumstances. Examples:\n• No two products can share the same barcode SKU.\n• An item price cannot be negative.\n• An order cannot belong to a customer that doesn't exist.\n\nIf you only validate these rules in application code (e.g. Python, Node.js), a bug in a background worker or an admin typing directly into the database can permanently corrupt your records. By declaring constraints in SQL, the database engine enforces business invariants at the hardware storage layer.",
      },
      {
        heading: "2. The Four Domain Guards (U-N-C-F)",
        body: "1. `UNIQUE`: Ensures no two rows ever contain identical values in this column (e.g. email, username, SKU, license plate).\n2. `NOT NULL`: Prevents missing or unknown values.\n3. `CHECK (condition)`: Validates that data conforms to a boolean rule (e.g. `CHECK (price >= 0)` or `CHECK (age >= 18)`).\n4. `REFERENCES (Foreign Key)`: Guarantees referential integrity. A `category_id` in `products` must point to an actual `id` in the `categories` table.",
        code: "-- Building a production-grade constrained products table\nCREATE TABLE products (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name VARCHAR(100) NOT NULL,\n  sku VARCHAR(20) UNIQUE,\n  price REAL CHECK(price >= 0),\n  category_id INTEGER REFERENCES categories(id)\n);",
      },
      {
        heading: "3. What Happens on Violation?",
        body: "When an application tries to insert data that violates a constraint, MySQL halts the statement, raises an error code (such as `1062 Duplicate entry`), and leaves the database completely untouched. No partial corruption occurs.",
      },
    ],
    exercises: [
      {
        type: "drag-block",
        id: "cn-drag-1",
        title: "Assemble a Strongly Constrained Table",
        instructions:
          "Arrange the clauses in order to create the products table with NOT NULL, UNIQUE, and CHECK constraints.",
        scenarioContext:
          "The e-commerce platform needs a new product catalog with strict domain rules.",
        blocks: [
          { id: "b1", text: "CREATE TABLE products (" },
          { id: "b2", text: "id INTEGER PRIMARY KEY AUTOINCREMENT," },
          { id: "b3", text: "name VARCHAR(100) NOT NULL," },
          { id: "b4", text: "sku VARCHAR(20) UNIQUE," },
          { id: "b5", text: "price REAL" },
          { id: "b6", text: ");" },
        ],
        solution: ["b1", "b2", "b3", "b4", "b5", "b6"],
        hint: "Start with CREATE TABLE products (, followed by id, name, sku unique, price, and closing parenthesis.",
        explanation:
          "Flawless! Each column receives its appropriate constraint, creating a rock-solid schema.",
      },
      {
        type: "scenario",
        id: "cn-scenario-1",
        title: "FinTech Crypto Wallet: Account Balances & Address Rules",
        companyOrContext: "BlockLedger Vaults",
        problemStatement:
          "You are creating the wallet ledger table for BlockLedger. You need to create a table named `wallets` with strict domain constraints.\n\nRules:\n1. `id`: Integer primary key with auto-increment\n2. `wallet_address`: VARCHAR(64) strictly UNIQUE and NOT NULL\n3. `balance`: REAL with a CHECK constraint guaranteeing balance >= 0\n4. `created_date`: DATE",
        requirements: [
          {
            id: "req-1",
            text: "Create table wallets",
            hint: "CREATE TABLE wallets (...)",
            validationRule: { type: "table_exists", table: "wallets" },
          },
          {
            id: "req-2",
            text: "Column wallet_address VARCHAR(64) UNIQUE NOT NULL",
            hint: "wallet_address VARCHAR(64) UNIQUE NOT NULL",
            validationRule: { type: "column_exists", table: "wallets", column: "wallet_address" },
          },
          {
            id: "req-3",
            text: "Column balance REAL CHECK(balance >= 0)",
            hint: "balance REAL CHECK(balance >= 0)",
            validationRule: { type: "column_exists", table: "wallets", column: "balance" },
          },
        ],
        starterSQL:
          "-- Create wallets table with domain constraints\nCREATE TABLE wallets (\n  -- Columns here\n);",
        solutionSQL:
          "CREATE TABLE wallets (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  wallet_address VARCHAR(64) UNIQUE NOT NULL,\n  balance REAL CHECK(balance >= 0),\n  created_date DATE\n);",
        solutionExplanation:
          "Enforcing UNIQUE prevents wallet collisions, and CHECK(balance >= 0) physically eliminates negative balance bugs.",
      },
    ],
    checkpointExam: {
      id: "cn-exam",
      title: "Product Catalog Integrity Certification",
      subtitle: "Checkpoint 5.2: Domain Constraints Verification",
      scenarioContext:
        "The retail enterprise is deploying a new constrained products table. You must construct the table ensuring unique SKUs, non-null names, and referential category links.",
      passingScoreDescription: "Pass the constraint creation challenge to certify completion of Track 5.",
      questions: [
        {
          id: "cp-cn-1",
          title: "Deploy Constrained Products Table",
          prompt:
            "Create table `products` with: `id` (PK AUTOINCREMENT), `name` (NOT NULL), `sku` (UNIQUE), `price` (REAL), and `category_id` (INTEGER).",
          hint: "CREATE TABLE products (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(100) NOT NULL, sku VARCHAR(20) UNIQUE, price REAL, category_id INTEGER);",
          starterSQL:
            "CREATE TABLE products (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name VARCHAR(100) NOT NULL,\n  sku VARCHAR(20) UNIQUE,\n  price REAL,\n  category_id INTEGER\n);",
          solutionSQL:
            "CREATE TABLE products (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name VARCHAR(100) NOT NULL,\n  sku VARCHAR(20) UNIQUE,\n  price REAL,\n  category_id INTEGER\n);",
          validation: { type: "table_exists", table: "products" },
        },
      ],
    },
    seedSQL: getSeedSQL("constraints"),
    tasks: [
      {
        id: "cn-1",
        title: "Create constrained products table",
        description:
          "Create table 'products' with: id (PK), name (NOT NULL), sku (UNIQUE), price (REAL), category_id (INTEGER).",
        hint: "CREATE TABLE products (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(100) NOT NULL, sku VARCHAR(20) UNIQUE, price REAL, category_id INTEGER);",
        validation: { type: "table_exists", table: "products" },
      },
    ],
  },
];
