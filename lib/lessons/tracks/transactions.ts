import type { Lesson } from "@/types";
import { getSeedSQL } from "../../agents/schema-generator";

export const transactionsLessons: Lesson[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 1. TRANSACTIONS BASICS
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "transactions-basics",
    title: "ACID Transactions (COMMIT & ROLLBACK)",
    track: "transactions",
    trackIndex: 0,
    description:
      "Guarantee atomicity, consistency, isolation, and durability with START TRANSACTION, COMMIT, and ROLLBACK for bank-grade reliability.",
    analogy: {
      title: "The ATM Cash Machine Protocol",
      story:
        "Imagine you pull up to an ATM to withdraw $100 in cash.\n\nUnder the hood, two separate steps must occur in the database:\n• Step 1: The bank account ledger debits $100 from your balance.\n• Step 2: The motorized cash roller dispenses five crisp $20 bills.\n\nNow imagine the electrical power cuts out after Step 1, before the bills come out. Without transactions, you lose $100 and receive zero dollars! The database is corrupted and you are furious.\n\nWith an ACID transaction, Step 1 is placed in a private quarantine sandbox. If Step 2 fails for any reason, the system fires `ROLLBACK;`. The $100 debit is completely wiped away as if it never happened. Either BOTH steps succeed, or NEITHER happens.",
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
        example:
          "START TRANSACTION;\nUPDATE a SET bal = bal - 100;\nUPDATE b SET bal = bal + 100;\nCOMMIT;",
      },
      {
        trigger: "An unexpected error occurred during execution?",
        solution: "ROLLBACK;",
        example: "ROLLBACK;",
      },
    ],
    proTips: [
      "Keep transactions as short as possible. While a transaction is open, modified rows are locked, forcing other concurrent queries to wait in line.",
      "Always include error-handling in backend code (e.g. try/catch in Node/Python) that calls ROLLBACK if any query throws.",
      "Transactions can wrap multiple tables: you can insert an order, insert 5 line items, and deduct inventory in a single atomic commit.",
    ],
    gotchas: [
      "In interactive sessions, forgetting to run COMMIT leaves your transaction hanging unpersisted in memory.",
      "DDL statements like CREATE TABLE or ALTER TABLE in MySQL trigger an implicit commit and cannot be rolled back!",
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
        heading: "1. The Bank Transfer Problem: Why Single Queries Aren't Enough",
        body: "Consider a banking app where Alice transfers $500 to Bob. To perform this transfer, the backend must execute two SQL statements:\n\n1. `UPDATE accounts SET balance = balance - 500 WHERE holder_name = 'Alice Johnson';`\n2. `UPDATE accounts SET balance = balance + 500 WHERE holder_name = 'Bob Smith';`\n\nIf the server crashes between statement 1 and statement 2, $500 vanished into thin air! Alice lost money, but Bob never received it. This is why financial systems require Transactions.",
      },
      {
        heading: "2. The Transaction Lifecycle: START, COMMIT, and ROLLBACK",
        body: "A transaction establishes a temporary, private workspace (an atomic boundary):\n\n• `START TRANSACTION;` (or `BEGIN;`): Opens the atomic boundary. Any changes you make from this point forward are visible only to you and are not yet permanent on disk.\n• `COMMIT;`: Saves all changes permanently to disk and releases row locks. The transfer is complete.\n• `ROLLBACK;`: Aborts the transaction and reverts the database state back to the exact moment before `START TRANSACTION` was run.",
        code: "-- Executing an atomic balance transfer\nSTART TRANSACTION;\n\nUPDATE accounts \nSET balance = balance - 500 \nWHERE holder_name = 'Alice Johnson';\n\nUPDATE accounts \nSET balance = balance + 500 \nWHERE holder_name = 'Bob Smith';\n\nCOMMIT;",
      },
      {
        heading: "3. The Rollback Safety Net",
        body: "If an unexpected error occurs—such as Bob's account being frozen or an invalid balance—the system triggers `ROLLBACK;`. Every previous UPDATE inside the block is instantly undone:",
        code: "START TRANSACTION;\n\nDELETE FROM accounts WHERE holder_name = 'Carol Williams';\n-- Oops! We targeted the wrong customer!\nROLLBACK;\n\n-- Carol's account is still completely intact!",
      },
      {
        heading: "4. The Four ACID Guarantees",
        body: "1. Atomicity: All or nothing. No partial execution.\n2. Consistency: Constraints (like CHECK balance >= 0) must hold true before and after the transaction.\n3. Isolation: If two people transfer money at the same millisecond, their transactions do not overwrite each other.\n4. Durability: Once COMMIT returns success, the data is written to the write-ahead log and will survive even an instant power loss.",
      },
    ],
    exercises: [
      {
        type: "drag-block",
        id: "tx-drag-1",
        title: "Assemble an Atomic Financial Transfer",
        instructions:
          "Arrange the clauses in proper sequence to begin a transaction, debit Alice, credit Bob, and commit.",
        scenarioContext:
          "Transfer $500 from Alice Johnson to Bob Smith within an atomic transaction boundary.",
        blocks: [
          { id: "b1", text: "START TRANSACTION;" },
          { id: "b2", text: "UPDATE accounts SET balance = balance - 500 WHERE holder_name = 'Alice Johnson';" },
          { id: "b3", text: "UPDATE accounts SET balance = balance + 500 WHERE holder_name = 'Bob Smith';" },
          { id: "b4", text: "COMMIT;" },
        ],
        solution: ["b1", "b2", "b3", "b4"],
        hint: "Start with START TRANSACTION;, then the debit, followed by the credit, and finish with COMMIT;.",
        explanation:
          "Brilliant! Wrapping the debit and credit in START TRANSACTION and COMMIT guarantees that either both balances update or neither does.",
      },
      {
        type: "scenario",
        id: "tx-scenario-1",
        title: "Hotel Reservation & Room Inventory Booking",
        companyOrContext: "Grand Plaza Hotels & Resorts",
        problemStatement:
          "You are designing the reservation engine for Grand Plaza Hotels & Resorts. When a guest reserves a hotel suite, the system must perform two critical database operations atomically:\n1. Register a confirmed reservation for guest 'David Miller' booking the 'Deluxe Suite' for 3 nights.\n2. Deduct 1 unit from the available room inventory for the 'Deluxe Suite'.\nWrap both operations in an atomic transaction boundary to eliminate race conditions and prevent overbooking.",
        previewTable: {
          tableName: "room_inventory",
          description: "Grand Plaza Live Room Availability Ledger",
          columns: ["id", "room_type", "available_rooms"],
          rows: [
            [1, "Deluxe Suite", 8],
            [2, "Standard Queen", 15],
            [3, "Executive Penthouse", 2],
          ],
        },
        schemaSetupSQL:
          "CREATE TABLE IF NOT EXISTS bookings (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  guest_name VARCHAR(100) NOT NULL,\n  room_type VARCHAR(50) NOT NULL,\n  nights INTEGER NOT NULL\n);\nCREATE TABLE IF NOT EXISTS room_inventory (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  room_type VARCHAR(50) UNIQUE NOT NULL,\n  available_rooms INTEGER NOT NULL\n);\nINSERT OR IGNORE INTO room_inventory (id, room_type, available_rooms) VALUES\n  (1, 'Deluxe Suite', 8),\n  (2, 'Standard Queen', 15),\n  (3, 'Executive Penthouse', 2);",
        requirements: [
          {
            id: "req-1",
            text: "Open an atomic transaction boundary",
            hint: "START TRANSACTION;",
            syntaxPattern: /(start\s+transaction|begin(\s+transaction)?)/i,
          },
          {
            id: "req-2",
            text: "Record the reservation for David Miller in the bookings table",
            hint: "INSERT INTO bookings (guest_name, room_type, nights) VALUES ('David Miller', 'Deluxe Suite', 3);",
            syntaxPattern: /insert\s+into\s+bookings[\s\S]*David Miller[\s\S]*Deluxe Suite[\s\S]*3/i,
          },
          {
            id: "req-3",
            text: "Decrement the available inventory count for the Deluxe Suite by 1",
            hint: "UPDATE room_inventory SET available_rooms = available_rooms - 1 WHERE room_type = 'Deluxe Suite';",
            syntaxPattern: /update\s+room_inventory\s+set\s+available_rooms\s*=\s*available_rooms\s*-\s*1[\s\S]*Deluxe Suite/i,
          },
          {
            id: "req-4",
            text: "Commit the atomic batch to persist all changes permanently",
            hint: "COMMIT;",
            syntaxPattern: /commit/i,
          },
        ],
        solutionSQL:
          "START TRANSACTION;\nINSERT INTO bookings (guest_name, room_type, nights) VALUES ('David Miller', 'Deluxe Suite', 3);\nUPDATE room_inventory SET available_rooms = available_rooms - 1 WHERE room_type = 'Deluxe Suite';\nCOMMIT;",
        solutionExplanation:
          "Using a transaction ensures that the guest booking and inventory decrement succeed or fail as a single atomic unit.",
      },
    ],
    checkpointExam: {
      id: "tx-exam",
      title: "Bank Ledger Atomic Transfer Certification",
      subtitle: "Checkpoint 6.1: ACID Transactions Verification",
      scenarioContext:
        "The Westfield Academy Bursar's Office received an authorized tuition transfer. You must execute an atomic transaction transferring 500 from Alice Johnson to Bob Smith and verify that both balances reflect the change.",
      passingScoreDescription: "Pass the atomic transfer challenge to certify completion of Lesson 15.",
      questions: [
        {
          id: "cp-tx-1",
          title: "Execute Atomic Account Transfer",
          prompt:
            "Westfield's Bursar Office has approved a $500 tuition clearance transfer from Alice Johnson to Bob Smith. Execute an atomic transaction that deducts 500 from Alice's account ledger, credits 500 to Bob's balance, and commits both mutations atomically so that no currency can be lost or created during a system failure.",
          hint: "Wrap both account UPDATE commands between START TRANSACTION and COMMIT to guarantee ACID atomicity and isolation.",
          solutionSQL:
            "START TRANSACTION;\nUPDATE accounts SET balance = balance - 500 WHERE holder_name = 'Alice Johnson';\nUPDATE accounts SET balance = balance + 500 WHERE holder_name = 'Bob Smith';\nCOMMIT;",
          validation: {
            type: "value_check",
            query: "SELECT balance FROM accounts WHERE holder_name = 'Alice Johnson'",
            expectedResult: [[4500]],
            description: "Alice's final balance should be 4500",
          },
        },
      ],
    },
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

  // ─────────────────────────────────────────────────────────────────────────
  // 2. INDEXING
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "indexing",
    title: "B-Tree Indexing & Performance Plans",
    track: "transactions",
    trackIndex: 1,
    description:
      "Replace expensive full table scans with logarithmic B-Tree lookups using single and composite indexes to supercharge query throughput.",
    analogy: {
      title: "The 1,000-Page Biology Textbook Index",
      story:
        "Imagine you need to find the definition of 'Mitochondria' in a 1,000-page medical encyclopedia.\n\n• Method A (Full Table Scan): You start at page 1 and read every single sentence on every page until you stumble across page 642. It takes 4 hours and gives you a splitting headache!\n• Method B (B-Tree Index): You flip straight to the alphabetical index at the back of the book, jump to 'M', find 'Mitochondria: p. 642', and turn directly to that page. It takes 2 seconds.\n\nWithout an index, MySQL must inspect every single row in your 10-million row table. An index creates an alphabetical B-Tree on disk that locates any record in 3 or 4 disk seeks.",
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
      "The Leftmost Prefix Rule: A composite index on `(user_id, action)` will speed up queries on `user_id` alone, but will NOT speed up queries on `action` alone!",
    ],
    gotchas: [
      "Wrapping an indexed column in a function (e.g. `WHERE LOWER(email) = '...'`) prevents MySQL from using the index and causes a full table scan!",
      "Wildcards at the beginning of a string (`LIKE '%term'`) cannot utilize a B-Tree index.",
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
        heading: "1. The Anatomy of a Full Table Scan",
        body: "When you run `SELECT * FROM users WHERE email = 'alice@u.edu';` on an unindexed table, what does MySQL do?\n\nIt opens the table data file on disk and scans every single row from row #1 to row #10,000,000. In computer science, this is an $O(N)$ linear scan. On an SSD, reading 10 million rows can take several seconds, locking CPU and causing user interfaces to freeze.\n\nAn Index is a specialized sidecar data structure that maintains pointers to rows pre-sorted in a balanced tree (B-Tree).",
      },
      {
        heading: "2. How a B-Tree Index Finds Rows in Microseconds",
        body: "A B-Tree (Balanced Tree) organizes keys hierarchically:\n\n• Root Node: Determines whether the key is in the lower half or upper half of the alphabet.\n• Branch Nodes: Direct the search to a specific 16 KB leaf page.\n• Leaf Node: Holds the key and the exact physical disk address (row pointer) of the record.\n\nEven with 100,000,000 rows, a B-Tree depth is only 3 or 4 levels! Instead of scanning 100 million rows, MySQL performs 4 index page reads. The query response drops from 8 seconds to 0.002 seconds.",
      },
      {
        heading: "3. Single vs Composite Indexes",
        body: "• Single-Column Index: Speeds up lookups on one attribute:\n  `CREATE INDEX idx_logs_user_id ON logs(user_id);`\n\n• Composite Index: Covers multiple columns queried together frequently:\n  `CREATE INDEX idx_logs_user_action ON logs(user_id, action);`\n\nComposite Index Rule (Leftmost Prefix): The composite index `(user_id, action)` will speed up:\n✓ `WHERE user_id = 5 AND action = 'login'`\n✓ `WHERE user_id = 5`\n✗ `WHERE action = 'login'` (because the tree is sorted by user_id first!)",
        code: "-- 1. Point lookup index on user_id\nCREATE INDEX idx_logs_user_id ON logs(user_id);\n\n-- 2. Composite index on user_id and action\nCREATE INDEX idx_logs_user_action ON logs(user_id, action);",
      },
      {
        heading: "4. The Indexing Trade-Off: Read Speed vs Write Penalty",
        body: "Why not index every column? Because every index has a cost:\n1. Disk Overhead: Each B-Tree duplicate keys and takes up disk storage.\n2. Write Penalty: Every time you execute `INSERT`, `UPDATE`, or `DELETE`, MySQL must write the row AND update every B-Tree index on that table! Tables with 15 indexes experience severe write latency.\n\nSenior Architecture Rule: Index foreign keys, primary keys, and high-frequency WHERE/JOIN filters. Avoid indexing rarely queried columns.",
      },
    ],
    exercises: [
      {
        type: "drag-block",
        id: "ix-drag-1",
        title: "Assemble a High-Performance Composite Index",
        instructions:
          "Arrange the clauses in order to create a composite index named idx_logs_user_action on logs covering user_id and action.",
        scenarioContext:
          "The security audit log is growing to 5 million entries. Accelerate user action queries.",
        blocks: [
          { id: "b1", text: "CREATE INDEX idx_logs_user_action" },
          { id: "b2", text: "ON logs(user_id, action);" },
        ],
        solution: ["b1", "b2"],
        hint: "Follow CREATE INDEX <name> ON <table>(<columns>);",
        explanation:
          "Spot on! Creating this composite index enables the query planner to satisfy multi-column filters via a single B-Tree range scan.",
      },
      {
        type: "scenario",
        id: "ix-scenario-1",
        title: "Video Streaming Platform: Stream Event Latency Optimization",
        companyOrContext: "StreamFlix Global CDN",
        problemStatement:
          "StreamFlix logs 50 million video playback heartbeat events per day in the `playback_events` table.\n\nDatabase Performance Alert:\nThe telemetry monitoring query filtering on user identity and device type is triggering full table scans, spiking CPU latency to 4.2 seconds. Create a high-performance composite index named `idx_playback_user_device` covering both filter attributes to enable immediate B-Tree index seek lookups.",
        previewTable: {
          tableName: "playback_events",
          description: "StreamFlix CDN Video Playback Heartbeat Telemetry",
          columns: ["id", "user_id", "device_type", "event_time"],
          rows: [
            [1, 9481, "smart_tv", "2025-01-10 14:22:00"],
            [2, 9481, "mobile", "2025-01-10 15:10:00"],
            [3, 1024, "desktop", "2025-01-10 16:05:00"],
          ],
        },
        schemaSetupSQL:
          "CREATE TABLE IF NOT EXISTS playback_events (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  user_id INTEGER NOT NULL,\n  device_type VARCHAR(50) NOT NULL,\n  event_time DATETIME\n);\nINSERT OR IGNORE INTO playback_events (id, user_id, device_type, event_time) VALUES\n  (1, 9481, 'smart_tv', '2025-01-10 14:22:00'),\n  (2, 9481, 'mobile', '2025-01-10 15:10:00'),\n  (3, 1024, 'desktop', '2025-01-10 16:05:00');",
        requirements: [
          {
            id: "req-1",
            text: "Define the composite performance index named `idx_playback_user_device`",
            hint: "CREATE INDEX idx_playback_user_device",
            syntaxPattern: /create\s+index\s+(if\s+not\s+exists\s+)?idx_playback_user_device/i,
          },
          {
            id: "req-2",
            text: "Bind the index to the `playback_events` table indexing both user ID and device type",
            hint: "ON playback_events(user_id, device_type);",
            syntaxPattern: /on\s+playback_events\s*\(\s*user_id\s*,\s*device_type\s*\)/i,
          },
        ],
        solutionSQL:
          "CREATE INDEX idx_playback_user_device\nON playback_events(user_id, device_type);",
        solutionExplanation:
          "This composite index satisfies both filter predicates directly in the B-Tree, reducing query latency from seconds to microseconds.",
      },
    ],
    checkpointExam: {
      id: "ix-exam",
      title: "Production Indexing & Performance Certification",
      subtitle: "Checkpoint 6.2: B-Tree Indexing Verification",
      scenarioContext:
        "The Westfield Academy user log service is experiencing slow query response times as logs accumulate. You are tasked with creating a point index on user_id and a composite index on user_id and action to eliminate full table scans.",
      passingScoreDescription: "Pass both indexing tasks to certify completion of Track 6 and graduate the curriculum!",
      questions: [
        {
          id: "cp-ix-1",
          title: "Create Point Index on user_id",
          prompt:
            "Westfield's security audit queries are suffering from full table scans when looking up student activity history in the 'logs' relation. Build a point B-Tree index named 'idx_logs_user_id' over the user_id foreign key column to accelerate point lookups to logarithmic O(log N) time.",
          hint: "Use CREATE INDEX referencing the target table and the specific column enclosed in parentheses.",
          solutionSQL: "CREATE INDEX idx_logs_user_id ON logs(user_id);",
          validation: {
            type: "query_result",
            query: "SELECT name FROM sqlite_master WHERE type='index' AND name='idx_logs_user_id'",
            expectedResult: [["idx_logs_user_id"]],
          },
        },
        {
          id: "cp-ix-2",
          title: "Create Composite Index on user_id and action",
          prompt:
            "Dashboard metrics frequently filter logs by user identity while simultaneously grouping by action type. Deploy a composite multi-column index named 'idx_logs_user_action' covering user_id followed by action to enable index-only covering scans.",
          hint: "Specify both column identifiers separated by a comma within the parenthesized index definition.",
          solutionSQL: "CREATE INDEX idx_logs_user_action ON logs(user_id, action);",
          validation: {
            type: "query_result",
            query: "SELECT name FROM sqlite_master WHERE type='index' AND name='idx_logs_user_action'",
            expectedResult: [["idx_logs_user_action"]],
          },
        },
      ],
    },
    seedSQL: getSeedSQL("indexing"),
    tasks: [
      {
        id: "ix-1",
        title: "Create point index on user_id",
        description:
          "Create an index named 'idx_logs_user_id' on the logs table covering the user_id column.",
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
        description:
          "Create a composite index named 'idx_logs_user_action' covering both user_id and action.",
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
