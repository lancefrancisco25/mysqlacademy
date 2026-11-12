import type { Lesson } from "@/types";
import { getSeedSQL } from "../../agents/schema-generator";

export const joinsLessons: Lesson[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 1. INNER JOIN
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "inner-join",
    title: "INNER JOIN & Relational Algebra",
    track: "joins",
    trackIndex: 0,
    description:
      "Unify normalized relational schemas across foreign keys using INNER JOIN to bridge independent entity models.",
    analogy: {
      title: "The Coat Check Claim Ticket",
      story:
        "When you check your winter coat at a Broadway theater, the attendant hands you plastic ticket #42. Your wool coat hanging in the locked closet gets a matching paper tag #42 pinned to the lapel.\n\nAn INNER JOIN is the moment you return at intermission to claim your coat. The attendant matches ticket #42 in your hand with coat tag #42 on the rack. If someone has a ticket with no coat in the closet, or if a lost coat hangs on the rack with no claim ticket, neither is handed over. Only matching pairs make it out.\n\nIn relational databases, foreign keys are the claim tickets, and primary keys are the tags on the coats.",
      takeaway:
        "INNER JOIN returns only the intersection: rows where a foreign key matches a primary key in both tables.",
    },
    mnemonic: {
      phrase: "INNER is Picky",
      breakdown: [
        { letter: "I", word: "INTERSECTION", meaning: "Only matching records survive" },
        { letter: "N", word: "NO NULLS", meaning: "Unmatched rows are dropped" },
        { letter: "N", word: "NAME ALIASES", meaning: "Use s.name, d.name for clarity" },
        { letter: "E", word: "EQUI-JOIN", meaning: "Match where s.department_id = d.id" },
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
      "Prefix projected columns with their alias (`s.name`, `d.name`) to prevent ambiguous column name errors.",
      "Join on indexed columns (like primary keys and foreign keys) for microsecond join traversal.",
    ],
    gotchas: [
      "Forgetting the ON clause creates an unintended Cartesian Product (CROSS JOIN), multiplying every row in table 1 by every row in table 2!",
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
        heading: "1. The Beauty of Normalization: Why We Separate Tables",
        body: "Beginners often ask: 'Why didn't we just put the department name directly inside the employees table?'\n\nImagine you have 10,000 employees in the 'Engineering & Platform Infrastructure' department. If that department renames itself to 'Cloud Operations', you would have to execute an UPDATE on 10,000 separate rows! If one row fails or has a typo ('Cloud Operation'), your data is corrupted.\n\nRelational theory solves this with Normalization: store departments once in their own table (`departments`), and give each employee a tiny 4-byte foreign key pointer (`department_id`). Now, when the department renames, you update exactly 1 row. But to display employee names alongside their department names on screen, we need to stitch the two tables back together. That is the job of JOIN.",
      },
      {
        heading: "2. The Equi-Join Syntax: ON Foreign Key = Primary Key",
        body: "An `INNER JOIN` matches rows where values in a common column match. The syntax specifies:\n1. The primary table: `FROM staff s`\n2. The joining table: `INNER JOIN departments d`\n3. The join condition: `ON s.department_id = d.id`\n\nNotice the aliases `s` and `d`. They act as shorthand namespaces. If both tables have a column called `name`, writing `name` triggers an 'ambiguous column name' error. Writing `s.name` and `d.name` removes all confusion.",
        code: "-- Joining staff and departments on their relational link\nSELECT \n  s.name AS staff_name,\n  d.name AS department_name,\n  s.salary\nFROM staff s\nINNER JOIN departments d ON s.department_id = d.id;",
      },
      {
        heading: "3. Filtering the Joined Relation with WHERE",
        body: "Once tables are joined, MySQL treats the combination as one unified virtual table. You can apply any `WHERE`, `ORDER BY`, or `LIMIT` clause across either table's columns seamlessly:",
        code: "-- Filter the joined dataset for Engineering staff only\nSELECT s.name, d.name, s.salary\nFROM staff s\nINNER JOIN departments d ON s.department_id = d.id\nWHERE d.name = 'Engineering';",
      },
      {
        heading: "4. Under the Hood: The Hash Join & Nested Loop Engine",
        body: "How does MySQL perform this join in milliseconds?\n\nIf the tables are small, MySQL uses a Nested Loop Join (iterating through staff and probing the department index). In modern MySQL 8.0+, if indexes are missing, the optimizer builds a Hash Join: it builds an in-memory hash table of `departments` and scans `staff` in a single pass. Understanding this is why indexing your foreign keys is a non-negotiable best practice.",
      },
    ],
    exercises: [
      {
        type: "drag-block",
        id: "ij-drag-1",
        title: "Assemble an INNER JOIN Query with Aliases",
        instructions:
          "Arrange the clauses in order to join staff with departments and project both names.",
        scenarioContext:
          "The HR directory needs to display every employee alongside their official department.",
        blocks: [
          { id: "b1", text: "SELECT s.name, d.name" },
          { id: "b2", text: "FROM staff s" },
          { id: "b3", text: "INNER JOIN departments d" },
          { id: "b4", text: "ON s.department_id = d.id;" },
        ],
        solution: ["b1", "b2", "b3", "b4"],
        hint: "Follow the sequence: SELECT columns, FROM staff s, INNER JOIN departments d, ON condition.",
        explanation:
          "Perfect! The ON clause binds the foreign key s.department_id to the primary key d.id.",
      },
      {
        type: "scenario",
        id: "ij-scenario-1",
        title: "E-Commerce Customer Order Item Invoicing",
        companyOrContext: "Global Logistics Hub",
        problemStatement:
          "You are writing the billing invoice generator for an e-commerce platform. You need to combine customer profiles with their order history to produce an itemized customer invoice statement.\n\nInvoicing requirements:\n1. Include the customer's full name, email address, and order total amount.\n2. Match records by correlating the customer's identifier with their corresponding order records.\n3. Restrict the invoice report to premium orders of $100 or greater.",
        previewTable: {
          tableName: "customers / orders",
          description: "Verified Customer Accounts & Recorded Orders",
          columns: ["full_name", "email", "total_amount", "order_date"],
          rows: [
            ["John Doe", "john@example.com", 150.0, "2025-01-15"],
            ["Sarah Connor", "sarah@resistance.org", 299.99, "2025-01-17"],
            ["Bruce Wayne", "bruce@waynecorp.com", 85.5, "2025-01-18"],
          ],
        },
        schemaSetupSQL:
          "CREATE TABLE IF NOT EXISTS customers (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  full_name VARCHAR(100) NOT NULL,\n  email VARCHAR(150) NOT NULL\n);\nCREATE TABLE IF NOT EXISTS orders (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  customer_id INTEGER,\n  total_amount REAL,\n  order_date DATE\n);\nINSERT OR IGNORE INTO customers (id, full_name, email) VALUES\n  (1, 'John Doe', 'john@example.com'),\n  (2, 'Sarah Connor', 'sarah@resistance.org'),\n  (3, 'Bruce Wayne', 'bruce@waynecorp.com');\nINSERT OR IGNORE INTO orders (id, customer_id, total_amount, order_date) VALUES\n  (1, 1, 150.00, '2025-01-15'),\n  (2, 1, 45.00, '2025-01-16'),\n  (3, 2, 299.99, '2025-01-17'),\n  (4, 3, 85.50, '2025-01-18');",
        requirements: [
          {
            id: "req-1",
            text: "Project the customer's full name, contact email, and order total amount",
            hint: "SELECT c.full_name, c.email, o.total_amount",
            syntaxPattern: /select[\s\S]*(c\.)?full_name[\s\S]*(c\.)?email[\s\S]*(o\.)?total_amount/i,
          },
          {
            id: "req-2",
            text: "Join the customers and orders tables on their matching customer ID foreign key",
            hint: "FROM customers c INNER JOIN orders o ON c.id = o.customer_id",
            syntaxPattern: /join\s+orders(\s+o)?\s+on\s+((c\.)?id\s*=\s*(o\.)?customer_id|(o\.)?customer_id\s*=\s*(c\.)?id)/i,
          },
          {
            id: "req-3",
            text: "Filter for high-value orders amounting to $100 or higher",
            hint: "WHERE o.total_amount >= 100",
            syntaxPattern: /where\s+(o\.)?total_amount\s*>=\s*100/i,
          },
        ],
        solutionSQL:
          "SELECT c.full_name, c.email, o.total_amount\nFROM customers c\nINNER JOIN orders o ON c.id = o.customer_id\nWHERE o.total_amount >= 100;",
        solutionExplanation:
          "This inner join connects purchases directly to customer identities, omitting orphaned or incomplete orders.",
      },
    ],
    checkpointExam: {
      id: "ij-exam",
      title: "Staff Departmental Equi-Join Certification",
      subtitle: "Checkpoint 4.1: INNER JOIN Verification",
      scenarioContext:
        "The university directory needs an updated staff roster. You must join staff with departments to verify all assigned personnel, and then filter specifically for Engineering department faculty.",
      passingScoreDescription: "Pass both join tasks to certify completion of Lesson 10.",
      questions: [
        {
          id: "cp-ij-1",
          title: "Perform Staff-Department Equi-Join",
          prompt:
            "Westfield's human resources department needs an authoritative employee directory mapping each staff member to their official administrative unit. Formulate an equi-join linking staff personnel with departments via their foreign key relationship, outputting the employee's name and department title.",
          hint: "Use an INNER JOIN on matching primary-foreign key keys (department_id = id) and alias table names for cleaner projection syntax.",
          solutionSQL:
            "SELECT s.name, d.name\nFROM staff s\nINNER JOIN departments d ON s.department_id = d.id;",
          validation: {
            type: "query_result",
            queryPattern: /JOIN\s+departments/i,
            query: "SELECT COUNT(*) FROM staff s INNER JOIN departments d ON s.department_id = d.id",
            expectedResult: [[7]],
          },
        },
        {
          id: "cp-ij-2",
          title: "Filter by Engineering Department",
          prompt:
            "The Dean of STEM requested an audit of all active faculty members teaching within the Engineering faculty. Build on your departmental join to project each instructor's name, department title, and salary, restricting results strictly to the Engineering branch.",
          hint: "Attach a WHERE predicate filtering by department name equality after establishing the inner join relation.",
          solutionSQL:
            "SELECT s.name, d.name, s.salary\nFROM staff s\nINNER JOIN departments d ON s.department_id = d.id\nWHERE d.name = 'Engineering';",
          validation: {
            type: "query_result",
            queryPattern: /JOIN\s+departments.*WHERE/i,
            query: "SELECT COUNT(*) FROM staff s INNER JOIN departments d ON s.department_id = d.id WHERE d.name = 'Engineering'",
            expectedResult: [[3]],
          },
        },
      ],
    },
    seedSQL: getSeedSQL("inner-join"),
    tasks: [
      {
        id: "ij-1",
        title: "Perform staff-department equi-join",
        description:
          "Join staff 's' with departments 'd' on s.department_id = d.id, selecting s.name and d.name.",
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
        description:
          "Add WHERE d.name = 'Engineering' to select only Engineering personnel.",
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

  // ─────────────────────────────────────────────────────────────────────────
  // 2. LEFT & OUTER JOINS
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "left-right-join",
    title: "LEFT & Outer Joins",
    track: "joins",
    trackIndex: 1,
    description:
      "Retain unmatched outer tuples, preserve master records, and diagnose orphaned or inactive relationships with LEFT JOIN.",
    analogy: {
      title: "The Wedding Invitation & RSVP List",
      story:
        "Imagine organizing seating for a 200-guest wedding reception.\n\n• The Bride's Master Invitation List (`customers`) is on your left hand.\n• The Returned RSVP Cards with Meal Choices (`purchases`) are on your right hand.\n\nIf you use an INNER JOIN, only guests who mailed back an RSVP get a seat at the dinner table. Any invited guest who didn't respond is deleted from the seating chart! That would cause family outrage.\n\nInstead, you use a LEFT JOIN: Every single invited person on the left list gets a printed name card at the table. If cousin Bob never sent back his RSVP card, his name card is still there, but his dinner plate is simply empty (`NULL`).",
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
      "Be careful: If you put a WHERE filter on a column from the right table, like `WHERE p.amount > 100`, you accidentally convert the LEFT JOIN back into an INNER JOIN because NULL > 100 evaluates to UNKNOWN/FALSE!",
    ],
    gotchas: [
      "Placing right-table filter conditions in the WHERE clause instead of the ON clause silently wipes out the unmatched LEFT rows.",
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
        heading: "1. The Limitation of INNER JOIN",
        body: "In the previous lesson, we learned that INNER JOIN is strict: if a row in Table A doesn't have a partner in Table B, it is erased from the result set.\n\nNow consider this real-world business question: 'Show me a list of all registered users and their purchases.'\n\nIf you use an INNER JOIN, any user who registered yesterday and hasn't bought anything yet will be completely omitted from your report! To executive leadership, it will look like those users do not exist. To solve this, we need an Outer Join.",
      },
      {
        heading: "2. Preserving the Left Table with LEFT JOIN",
        body: "A `LEFT JOIN` (or `LEFT OUTER JOIN`) is loyal to the table declared immediately after `FROM` (the left table).\n\nMySQL guarantees that every row from the left table will appear in the output at least once. If a matching row exists on the right table, MySQL joins the attributes. If NO match exists, MySQL populates every right-side column with `NULL`.",
        code: "-- Show all customers, including those with zero purchases\nSELECT \n  c.id,\n  c.name AS customer_name,\n  p.item,\n  p.amount\nFROM customers c\nLEFT JOIN purchases p ON c.id = p.customer_id;",
      },
      {
        heading: "3. The Diagnostic Superpower: Finding Inactive Records",
        body: "One of the most valuable patterns in database administration is using LEFT JOIN to find orphaned or inactive entities.\n\nHow do we find all users who registered but NEVER made a purchase? Or all courses that have ZERO enrolled students?\n\nWe perform a LEFT JOIN and add: `WHERE p.id IS NULL;`. Since only non-purchasing customers have NULL for the purchase ID, this query isolates your inactive user cohort in milliseconds!",
        code: "-- Find customers who have never bought anything\nSELECT c.id, c.name\nFROM customers c\nLEFT JOIN purchases p ON c.id = p.customer_id\nWHERE p.id IS NULL;",
      },
      {
        heading: "4. The WHERE Clause Trap on Outer Joins",
        body: "Watch out for this classic senior bug:\n\n`FROM customers c LEFT JOIN purchases p ON c.id = p.customer_id WHERE p.amount > 50;`\n\nWhy did your customers with zero purchases disappear? Because for a customer with no purchases, `p.amount` is `NULL`. And `NULL > 50` is UNKNOWN/FALSE! The `WHERE` clause threw them away, converting your LEFT JOIN back into an INNER JOIN.\n\nIf you want to filter the right table while preserving left rows, put the condition in the `ON` clause:\n`ON c.id = p.customer_id AND p.amount > 50`.",
      },
    ],
    exercises: [
      {
        type: "drag-block",
        id: "lr-drag-1",
        title: "Assemble a LEFT JOIN Customer Purchase Query",
        instructions:
          "Arrange the clauses in order to preserve all customers while projecting their purchase items.",
        scenarioContext:
          "The customer success team needs a complete customer roster with their purchased items.",
        blocks: [
          { id: "b1", text: "SELECT c.name, p.item" },
          { id: "b2", text: "FROM customers c" },
          { id: "b3", text: "LEFT JOIN purchases p" },
          { id: "b4", text: "ON c.id = p.customer_id;" },
        ],
        solution: ["b1", "b2", "b3", "b4"],
        hint: "Start with SELECT, FROM customers c, LEFT JOIN purchases p, and the ON condition.",
        explanation:
          "Outstanding! The LEFT JOIN preserves every customer record, matching purchase items when they exist and showing NULL when they don't.",
      },
      {
        type: "scenario",
        id: "lr-scenario-1",
        title: "Healthcare Clinic: Unassigned Patients Audit",
        companyOrContext: "Valley Care Outpatient Clinic",
        problemStatement:
          "You are conducting a patient safety audit at Valley Care Clinic. Every patient should ideally be assigned to a primary care doctor.\n\nAudit specifications:\n1. Identify every patient who has not yet been linked to an intake primary care physician.\n2. Preserve all patient records in the base set and match assignment records where they exist.\n3. Isolate the unassigned patients by looking for missing assignment keys.",
        previewTable: {
          tableName: "patients & doctor_assignments",
          description: "Clinic Patient Roster & Current Doctor Assignments",
          columns: ["patient_id", "patient_name", "assigned_doctor"],
          rows: [
            [1, "Marcus Brody", "Dr. House"],
            [2, "Elena Gilbert", null],
            [3, "Walter White", "Dr. Strange"],
            [4, "Jesse Pinkman", null],
          ],
        },
        schemaSetupSQL:
          "CREATE TABLE IF NOT EXISTS patients (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name VARCHAR(100) NOT NULL,\n  age INTEGER NOT NULL\n);\nCREATE TABLE IF NOT EXISTS doctor_assignments (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  patient_id INTEGER,\n  doctor_name VARCHAR(100)\n);\nINSERT OR IGNORE INTO patients (id, name, age) VALUES\n  (1, 'Marcus Brody', 45),\n  (2, 'Elena Gilbert', 29),\n  (3, 'Walter White', 52),\n  (4, 'Jesse Pinkman', 26);\nINSERT OR IGNORE INTO doctor_assignments (id, patient_id, doctor_name) VALUES\n  (1, 1, 'Dr. House'),\n  (2, 3, 'Dr. Strange');",
        requirements: [
          {
            id: "req-1",
            text: "Project the patient's ID and name",
            hint: "SELECT pt.id, pt.name",
            syntaxPattern: /select[\s\S]*(pt\.)?id[\s\S]*(pt\.)?name/i,
          },
          {
            id: "req-2",
            text: "Connect patients to doctor assignments using an outer join on matching patient ID",
            hint: "FROM patients pt LEFT JOIN doctor_assignments da ON pt.id = da.patient_id",
            syntaxPattern: /left\s+join\s+doctor_assignments(\s+da)?\s+on\s+((pt\.)?id\s*=\s*(da\.)?patient_id|(da\.)?patient_id\s*=\s*(pt\.)?id)/i,
          },
          {
            id: "req-3",
            text: "Isolate unassigned patients by filtering for absent assignment records",
            hint: "WHERE da.id IS NULL",
            syntaxPattern: /where\s+(da\.)?(id|patient_id)\s+is\s+null/i,
          },
        ],
        solutionSQL:
          "SELECT pt.id, pt.name\nFROM patients pt\nLEFT JOIN doctor_assignments da ON pt.id = da.patient_id\nWHERE da.id IS NULL;",
        solutionExplanation:
          "The LEFT JOIN retains all patients, and filtering by WHERE da.id IS NULL isolates patients who lack matching rows in the doctor assignments table.",
      },
    ],
    checkpointExam: {
      id: "lr-exam",
      title: "Customer Engagement & Outer Join Certification",
      subtitle: "Checkpoint 4.2: LEFT JOIN Verification",
      scenarioContext:
        "The marketing department is launching a reactivation campaign. You must project all customers alongside their purchase history using a LEFT JOIN to ensure no customer accounts are dropped.",
      passingScoreDescription: "Pass the outer join query task to certify completion of Lesson 11.",
      questions: [
        {
          id: "cp-lr-1",
          title: "Execute Complete Customer LEFT JOIN",
          prompt:
            "The marketing analytics team is tracking customer engagement and needs a consolidated view of buyer activity. Query every single registered customer alongside their purchased items, ensuring that inactive customers who have never placed an order are preserved in the result set rather than dropped.",
          hint: "Employ an outer LEFT JOIN with customers on the left side so non-purchasing clients appear with NULL order attributes.",
          solutionSQL:
            "SELECT c.name, p.item\nFROM customers c\nLEFT JOIN purchases p ON c.id = p.customer_id;",
          validation: {
            type: "query_result",
            queryPattern: /LEFT\s+(?:OUTER\s+)?JOIN/i,
            query: "SELECT COUNT(*) FROM customers c LEFT JOIN purchases p ON c.id = p.customer_id",
            expectedResult: [[7]],
          },
        },
      ],
    },
    seedSQL: getSeedSQL("left-right-join"),
    tasks: [
      {
        id: "lr-1",
        title: "Project all customers with purchases",
        description:
          "Perform a LEFT JOIN between customers c and purchases p on c.id = p.customer_id, selecting c.name and p.item.",
        hint: "SELECT c.name, p.item FROM customers c LEFT JOIN purchases p ON c.id = p.customer_id;",
        validation: {
          type: "query_result",
          queryPattern: /LEFT\s+(?:OUTER\s+)?JOIN/i,
          query: "SELECT COUNT(*) FROM customers c LEFT JOIN purchases p ON c.id = p.customer_id",
          expectedResult: [[7]],
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3. SUBQUERIES
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "subqueries",
    title: "Nested Expressions & Subquery Modularization",
    track: "joins",
    trackIndex: 2,
    description:
      "Compose modular queries using scalar, list-valued, and correlated subqueries to dynamically compute comparisons on the fly.",
    analogy: {
      title: "Russian Matryoshka Nesting Dolls",
      story:
        "Think of solving an algebraic equation with parentheses: `5 * (3 + 2)`. You don't try to multiply 5 by the parenthesis all at once—you open the inner parenthesis, solve `3 + 2 = 5`, and then multiply `5 * 5 = 25`.\n\nA subquery is SQL's parenthesis. It runs an inner inquiry first (e.g. 'What is the average product price in our catalog?'), computes that exact number ($289.99), and hands that scalar value directly into the outer query's comparison expression.\n\nWithout subqueries, you would have to run two separate queries in your backend code, saving a temporary variable between them.",
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
      "In modern SQL, Common Table Expressions (WITH cte AS ...) are often preferred over deep subqueries for readability.",
    ],
    gotchas: [
      "Correlated subqueries (subqueries that reference columns from the outer query) run once for EVERY row in the outer table, which can cause severe O(N^2) latency on large datasets.",
      "A subquery used with an equality operator (`=`) that accidentally returns more than 1 row will cause MySQL to throw a fatal runtime error.",
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
        heading: "1. The Need for Dynamic Thresholds",
        body: "Suppose your store manager asks: 'Show me all products priced higher than our catalog average.'\n\nHow would you write that? You cannot write `WHERE price > AVG(price)` because aggregate functions cannot appear in a WHERE clause.\n\nWithout subqueries, you would have to run `SELECT AVG(price) FROM products;`, see that the answer is $289.99, and then manually type `SELECT * FROM products WHERE price > 289.99;`. But the moment prices change tomorrow, your hardcoded number is wrong!\n\nA Subquery (or Nested Query) lets MySQL compute the average dynamically inside parentheses.",
      },
      {
        heading: "2. Scalar Subqueries in WHERE",
        body: "A Scalar Subquery is a nested query that returns exactly one row and one column (a single atomic value, like a single number or string).\n\nBecause it evaluates to a single value, it can be dropped anywhere a literal number can go:",
        code: "-- Dynamic comparison: find all above-average priced products\nSELECT name, price\nFROM products\nWHERE price > (\n  SELECT AVG(price) FROM products\n);",
      },
      {
        heading: "3. Multi-Row Subqueries with IN",
        body: "What if the inner subquery returns multiple rows? For example: 'Find all products that have actually been purchased in an order.'\n\nThe inner query `SELECT DISTINCT product_id FROM order_items` will return a list of IDs: `(1, 4, 7, 12)`.\n\nYou cannot use `=` with a list. Instead, use the `IN` operator:",
        code: "-- Find products that exist in the order_items register\nSELECT name, price\nFROM products\nWHERE id IN (\n  SELECT DISTINCT product_id \n  FROM order_items\n);",
      },
      {
        heading: "4. Subqueries in the FROM Clause (Derived Tables)",
        body: "You can also place a subquery inside the `FROM` clause! In relational theory, this is called a Derived Table.\n\n`SELECT * FROM (SELECT department, AVG(salary) AS avg_sal FROM staff GROUP BY department) AS dept_summary WHERE avg_sal > 80000;`\n\nMySQL executes the inner query, treats the result set as a temporary in-memory table named `dept_summary`, and queries it as if it were a physical table on disk.",
      },
    ],
    exercises: [
      {
        type: "drag-block",
        id: "sq-drag-1",
        title: "Assemble an Above-Average Scalar Subquery",
        instructions:
          "Arrange the clauses in order to filter products priced above the catalog average.",
        scenarioContext:
          "The pricing analyst needs a report on all premium items priced above the storewide average.",
        blocks: [
          { id: "b1", text: "SELECT name, price FROM products" },
          { id: "b2", text: "WHERE price >" },
          { id: "b3", text: "(SELECT AVG(price) FROM products);" },
        ],
        solution: ["b1", "b2", "b3"],
        hint: "Start with the outer query, then WHERE price >, followed by the parenthesized subquery.",
        explanation:
          "Great job! The inner subquery executes first to calculate the mean price, which the outer query uses as its comparison threshold.",
      },
      {
        type: "scenario",
        id: "sq-scenario-1",
        title: "VIP Loyalty Program: High-Spender Identification",
        companyOrContext: "Neptune Luxury Goods",
        problemStatement:
          "You are designing the VIP club invitation query for Neptune Luxury Goods. Management wants to invite top customers whose total lifetime spending exceeds the overall benchmark average across all patrons.\n\nVIP selection directives:\n1. Project customer names alongside their recorded lifetime expenditure.\n2. Dynamically compute the global average lifetime spend to serve as the qualification threshold.\n3. Return only patrons whose total spend strictly exceeds that calculated average benchmark.",
        previewTable: {
          tableName: "customers",
          description: "Customer Lifetime Value Ledger",
          columns: ["id", "name", "lifetime_spend"],
          rows: [
            [1, "Alexander Vance", 15400.0],
            [2, "Beatrix Kiddo", 4200.0],
            [3, "Charles Xavier", 28900.0],
            [4, "Dana Scully", 6100.0],
            [5, "Edward Nygma", 8300.0],
          ],
        },
        schemaSetupSQL:
          "CREATE TABLE IF NOT EXISTS customers (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name VARCHAR(100) NOT NULL,\n  lifetime_spend REAL NOT NULL\n);\nINSERT OR IGNORE INTO customers (id, name, lifetime_spend) VALUES\n  (1, 'Alexander Vance', 15400.00),\n  (2, 'Beatrix Kiddo', 4200.00),\n  (3, 'Charles Xavier', 28900.00),\n  (4, 'Dana Scully', 6100.00),\n  (5, 'Edward Nygma', 8300.00);",
        requirements: [
          {
            id: "req-1",
            text: "Project the customer name and lifetime expenditure columns",
            hint: "SELECT name, lifetime_spend FROM customers",
            syntaxPattern: /select[\s\S]*name[\s\S]*lifetime_spend\s+from\s+customers/i,
          },
          {
            id: "req-2",
            text: "Filter for spend exceeding the dynamic average calculated via a nested subquery",
            hint: "WHERE lifetime_spend > (SELECT AVG(lifetime_spend) FROM customers)",
            syntaxPattern: /where\s+lifetime_spend\s*>\s*\(\s*select\s+avg\s*\(\s*lifetime_spend\s*\)\s+from\s+customers\s*\)/i,
          },
        ],
        solutionSQL:
          "SELECT name, lifetime_spend\nFROM customers\nWHERE lifetime_spend > (\n  SELECT AVG(lifetime_spend) FROM customers\n);",
        solutionExplanation:
          "Using a scalar subquery ensures the benchmark adapts automatically as new customer purchases occur without hardcoded numbers.",
      },
    ],
    checkpointExam: {
      id: "sq-exam",
      title: "Catalog Premium Item Dynamic Analysis Certification",
      subtitle: "Checkpoint 4.3: Subquery Verification",
      scenarioContext:
        "The retail pricing committee requested an automated inventory report of all premium products priced above the dynamic catalog average. You must write and verify the nested query.",
      passingScoreDescription: "Pass the dynamic subquery challenge to certify completion of Track 4.",
      questions: [
        {
          id: "cp-sq-1",
          title: "Query Above-Average Priced Catalog Products",
          prompt:
            "Westfield's merchandizing division is curating a high-tier product showcase. Dynamically isolate all inventory items that command a price strictly greater than the overall catalog-wide average unit price, projecting the product's name and price without hardcoding any scalar thresholds.",
          hint: "Encapsulate an aggregate AVG() computation inside a parenthesized subquery within your WHERE price comparison.",
          solutionSQL:
            "SELECT name, price\nFROM products\nWHERE price > (SELECT AVG(price) FROM products);",
          validation: {
            type: "query_result",
            queryPattern: /WHERE\s+price\s*>\s*\(\s*SELECT\s+AVG/i,
            query: "SELECT COUNT(*) FROM products WHERE price > (SELECT AVG(price) FROM products)",
            expectedResult: [[4]],
          },
        },
      ],
    },
    seedSQL: getSeedSQL("subqueries"),
    tasks: [
      {
        id: "sq-1",
        title: "Find above-average priced products",
        description:
          "Select name and price of products where price > (SELECT AVG(price) FROM products).",
        hint: "SELECT name, price FROM products WHERE price > (SELECT AVG(price) FROM products);",
        validation: {
          type: "query_result",
          queryPattern: /WHERE\s+price\s*>\s*\(\s*SELECT\s+AVG/i,
          query: "SELECT COUNT(*) FROM products WHERE price > (SELECT AVG(price) FROM products)",
          expectedResult: [[4]],
        },
      },
    ],
    syntaxDrills: [
      {
        id: "sq-drill-1",
        title: "Relational Set Union (UNION)",
        categoryTag: "Set Operations",
        scenario: "Combine the student rosters from class_a and class_b, eliminating any duplicate student names: select stu_name using UNION.",
        instruction: "Select stu_name from class_a UNION select stu_name from class_b;",
        starterSQL: "-- Union student rosters discarding duplicate names\n",
        solutionSQL: "SELECT stu_name FROM class_a UNION SELECT stu_name FROM class_b;",
        hint: "UNION merges results and discards duplicates: SELECT stu_name FROM class_a UNION SELECT stu_name FROM class_b;",
        syntaxPattern: /SELECT\s+stu_name\s+FROM\s+class_a\s+UNION\s+SELECT\s+stu_name\s+FROM\s+class_b/i,
        validationQuery: "SELECT COUNT(*) FROM (SELECT stu_name FROM class_a UNION SELECT stu_name FROM class_b);",
        expectedResult: [[5]],
      },
      {
        id: "sq-drill-2",
        title: "Relational Multiset Union (UNION ALL)",
        categoryTag: "Set Operations",
        scenario: "Combine student rosters from class_a and class_b, preserving every entry including duplicates: select stu_name using UNION ALL.",
        instruction: "Select stu_name from class_a UNION ALL select stu_name from class_b;",
        starterSQL: "-- Union student rosters retaining all duplicates\n",
        solutionSQL: "SELECT stu_name FROM class_a UNION ALL SELECT stu_name FROM class_b;",
        hint: "Use UNION ALL: SELECT stu_name FROM class_a UNION ALL SELECT stu_name FROM class_b;",
        syntaxPattern: /SELECT\s+stu_name\s+FROM\s+class_a\s+UNION\s+ALL\s+SELECT\s+stu_name\s+FROM\s+class_b/i,
        validationQuery: "SELECT COUNT(*) FROM (SELECT stu_name FROM class_a UNION ALL SELECT stu_name FROM class_b);",
        expectedResult: [[6]],
      },
      {
        id: "sq-drill-3",
        title: "Relational Intersection (INTERSECT)",
        categoryTag: "Set Operations",
        scenario: "Identify students who are concurrently registered in BOTH class_a and class_b: select stu_name using INTERSECT.",
        instruction: "Select stu_name from class_a INTERSECT select stu_name from class_b;",
        starterSQL: "-- Find common students in both classes\n",
        solutionSQL: "SELECT stu_name FROM class_a INTERSECT SELECT stu_name FROM class_b;",
        hint: "INTERSECT finds rows common to both: SELECT stu_name FROM class_a INTERSECT SELECT stu_name FROM class_b;",
        syntaxPattern: /SELECT\s+stu_name\s+FROM\s+class_a\s+INTERSECT\s+SELECT\s+stu_name\s+FROM\s+class_b/i,
        validationQuery: "SELECT COUNT(*) FROM (SELECT stu_name FROM class_a INTERSECT SELECT stu_name FROM class_b);",
        expectedResult: [[1]],
      },
      {
        id: "sq-drill-4",
        title: "Relational Difference (EXCEPT)",
        categoryTag: "Set Operations",
        scenario: "Find students enrolled exclusively in class_a who are NOT present in class_b: select stu_name using EXCEPT.",
        instruction: "Select stu_name from class_a EXCEPT select stu_name from class_b;",
        starterSQL: "-- Find students unique to class_a\n",
        solutionSQL: "SELECT stu_name FROM class_a EXCEPT SELECT stu_name FROM class_b;",
        hint: "EXCEPT subtracts matching rows: SELECT stu_name FROM class_a EXCEPT SELECT stu_name FROM class_b;",
        syntaxPattern: /SELECT\s+stu_name\s+FROM\s+class_a\s+EXCEPT\s+SELECT\s+stu_name\s+FROM\s+class_b/i,
        validationQuery: "SELECT COUNT(*) FROM (SELECT stu_name FROM class_a EXCEPT SELECT stu_name FROM class_b);",
        expectedResult: [[2]],
      },
      {
        id: "sq-drill-5",
        title: "Cartesian Product (CROSS JOIN)",
        categoryTag: "Relational Algebra",
        scenario: "Generate all possible cross pairings between students in class_a and class_b for study buddy matches: select a.stu_name and b.stu_name using CROSS JOIN.",
        instruction: "Select a.stu_name, b.stu_name from class_a AS a CROSS JOIN class_b AS b;",
        starterSQL: "-- Compute Cartesian cross product\n",
        solutionSQL: "SELECT a.stu_name, b.stu_name FROM class_a AS a CROSS JOIN class_b AS b;",
        hint: "Use CROSS JOIN: FROM class_a AS a CROSS JOIN class_b AS b",
        syntaxPattern: /FROM\s+class_a(\s+AS)?\s+a\s+CROSS\s+JOIN\s+class_b(\s+AS)?\s+b/i,
        validationQuery: "SELECT COUNT(*) FROM class_a CROSS JOIN class_b;",
        expectedResult: [[9]],
      },
      {
        id: "sq-drill-6",
        title: "Creating a Virtual View (CREATE VIEW)",
        categoryTag: "SQL Views",
        scenario: "Create a virtual view named paramount_movies exposing only title and year for Paramount studio movies from the movies table.",
        instruction: "Create view paramount_movies as select title, year from movies where studio_name = 'Paramount';",
        starterSQL: "-- Create view for Paramount movies\n",
        setupSQL: "DROP VIEW IF EXISTS paramount_movies;",
        solutionSQL: "CREATE VIEW paramount_movies AS SELECT title, year FROM movies WHERE studio_name = 'Paramount';",
        hint: "Use: CREATE VIEW paramount_movies AS SELECT title, year FROM movies WHERE studio_name = 'Paramount';",
        syntaxPattern: /CREATE\s+VIEW\s+paramount_movies\s+AS\s+SELECT\s+title,\s*year\s+FROM\s+movies\s+WHERE\s+studio_name\s*=\s*['"]Paramount['"]/i,
        validationQuery: "SELECT COUNT(*) FROM (SELECT name FROM sqlite_master WHERE type='view' AND name='paramount_movies');",
        expectedResult: [[1]],
      },
      {
        id: "sq-drill-7",
        title: "Querying a Virtual View",
        categoryTag: "SQL Views",
        scenario: "Query the virtual view paramount_movies to retrieve all columns where year >= 1975.",
        instruction: "Select * from paramount_movies where year >= 1975;",
        starterSQL: "-- Query the created view\n",
        setupSQL: "CREATE VIEW IF NOT EXISTS paramount_movies AS SELECT title, year FROM movies WHERE studio_name = 'Paramount';",
        solutionSQL: "SELECT * FROM paramount_movies WHERE year >= 1975;",
        hint: "Query just like a table: SELECT * FROM paramount_movies WHERE year >= 1975;",
        syntaxPattern: /SELECT\s+\*\s+FROM\s+paramount_movies\s+WHERE\s+year\s*>=\s*1975/i,
        validationQuery: "SELECT COUNT(*) FROM paramount_movies WHERE year >= 1975;",
        expectedResult: [[2]],
      },
      {
        id: "sq-drill-8",
        title: "Renaming Columns in View Definition",
        categoryTag: "SQL Views",
        scenario: "Create a view classic_movies with explicitly renamed columns (movie_title, release_year) selecting title, year from the movies table.",
        instruction: "Create view classic_movies (movie_title, release_year) as select title, year from movies;",
        starterSQL: "-- Specify custom column headers in view definition\n",
        setupSQL: "DROP VIEW IF EXISTS classic_movies;",
        solutionSQL: "CREATE VIEW classic_movies (movie_title, release_year) AS SELECT title, year FROM movies;",
        hint: "Pass column names in parentheses before AS: CREATE VIEW classic_movies (movie_title, release_year) AS SELECT title, year FROM movies;",
        syntaxPattern: /CREATE\s+VIEW\s+classic_movies\s*\(\s*movie_title,\s*release_year\s*\)\s+AS\s+SELECT\s+title,\s*year\s+FROM\s+movies/i,
        validationQuery: "SELECT COUNT(*) FROM (SELECT name FROM sqlite_master WHERE type='view' AND name='classic_movies');",
        expectedResult: [[1]],
      },
      {
        id: "sq-drill-9",
        title: "Tearing Down a Virtual View (DROP VIEW)",
        categoryTag: "SQL Views",
        scenario: "Remove obsolete virtual view classic_movies when the temporary report is completed using DROP VIEW.",
        instruction: "Drop view classic_movies;",
        starterSQL: "-- Drop the view\n",
        setupSQL: "CREATE VIEW IF NOT EXISTS classic_movies AS SELECT title, year FROM movies;",
        solutionSQL: "DROP VIEW classic_movies;",
        hint: "Use: DROP VIEW classic_movies;",
        syntaxPattern: /DROP\s+VIEW\s+classic_movies/i,
        validationQuery: "SELECT COUNT(*) FROM (SELECT name FROM sqlite_master WHERE type='view' AND name='classic_movies');",
        expectedResult: [[0]],
      },
      {
        id: "sq-drill-10",
        title: "Scalar Subquery Comparison",
        categoryTag: "Nested Subqueries",
        scenario: "Westfield's merchandise team wants products priced strictly higher than the overall catalog average: select name, price from products where price > (SELECT AVG(price) FROM products).",
        instruction: "Select name, price from products where price > (select avg(price) from products);",
        starterSQL: "-- Subquery in WHERE comparison\n",
        solutionSQL: "SELECT name, price FROM products WHERE price > (SELECT AVG(price) FROM products);",
        hint: "Parenthesize the inner query: WHERE price > (SELECT AVG(price) FROM products)",
        syntaxPattern: /WHERE\s+price\s*>\s*\(\s*SELECT\s+AVG\(price\)\s+FROM\s+products\s*\)/i,
        validationQuery: "SELECT COUNT(*) FROM products WHERE price > (SELECT AVG(price) FROM products);",
        expectedResult: [[4]],
      },
      {
        id: "sq-drill-11",
        title: "Multi-Row Subquery (IN)",
        categoryTag: "Nested Subqueries",
        scenario: "Find names of all products that have been ordered in at least one line item: select name from products where id IN (SELECT product_id FROM order_items).",
        instruction: "Select name from products where id IN (select product_id from order_items);",
        starterSQL: "-- Filter using subquery with IN\n",
        solutionSQL: "SELECT name FROM products WHERE id IN (SELECT product_id FROM order_items);",
        hint: "Use WHERE id IN (SELECT product_id FROM order_items);",
        syntaxPattern: /WHERE\s+id\s+IN\s*\(\s*SELECT\s+product_id\s+FROM\s+order_items\s*\)/i,
        validationQuery: "SELECT COUNT(*) FROM products WHERE id IN (SELECT product_id FROM order_items);",
        expectedResult: [[6]],
      },
      {
        id: "sq-drill-12",
        title: "Unsold Items Negation Subquery (NOT IN)",
        categoryTag: "Nested Subqueries",
        scenario: "Find names of products that have NEVER been ordered by any customer: select name from products where id NOT IN (SELECT product_id FROM order_items).",
        instruction: "Select name from products where id NOT IN (select product_id from order_items);",
        starterSQL: "-- Filter unsold products with NOT IN\n",
        solutionSQL: "SELECT name FROM products WHERE id NOT IN (SELECT product_id FROM order_items);",
        hint: "Use WHERE id NOT IN (SELECT product_id FROM order_items);",
        syntaxPattern: /WHERE\s+id\s+NOT\s+IN\s*\(\s*SELECT\s+product_id\s+FROM\s+order_items\s*\)/i,
        validationQuery: "SELECT COUNT(*) FROM products WHERE id NOT IN (SELECT product_id FROM order_items);",
        expectedResult: [[2]],
      },
    ],
  },
];
