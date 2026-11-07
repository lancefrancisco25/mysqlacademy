# MySQL Academy 🚀
> Interactive, in-browser educational platform for learning MySQL, modeled after Cisco NetAcad packet-tracer labs.

Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, **sql.js (WebAssembly)**, and an autonomous **Pedagogical AI Agent Framework**.

---

## 🌟 Key Architecture & Features

### 1. In-Browser Zero-Latency Database Engine
- **Client-Side WebAssembly Engine (`sql.js`)**: Executes queries 100% inside the student's browser with zero network latency, zero remote server dependency, and complete privacy.
- **MySQL Compatibility Shim (`lib/sql-engine/mysql-shim.ts`)**: Emulates native MySQL commands (`SHOW DATABASES;`, `SHOW TABLES;`, `DESCRIBE <table>;`, `USE <db>;`) and translates MySQL dialect keywords (`AUTO_INCREMENT`, `TINYINT`, `START TRANSACTION`, etc.) into SQLite WebAssembly operations.
- **ASCII Table Formatter (`lib/sql-engine/formatter.ts`)**: Renders classic MySQL command-line ASCII tables with dynamic column padding, alignment, and row summaries (`3 rows in set (0.001 sec)`).

### 2. Autonomous Pedagogical AI Agent Framework
- **Grader / Validator Agent (`lib/agents/validator.ts`)**: Evaluates database state invariants (not brittle regex pattern matching on query text). Verifies column existence, table creation, row counts, and value checks, automatically unlocking tasks upon success with toast notifications.
- **Socratic Mentor Agent (`lib/agents/mentor.ts`)**: Intercepts syntax and runtime errors (e.g. invalid `GROUP BY`, aggregate in `WHERE`, missing commas, ambiguous columns) and provides guided hints without spoiling answers.
- **Schema Generator Agent (`lib/agents/schema-generator.ts`)**: Seeds deterministic datasets per lesson and enables clean state isolation (one-click **Reset DB** rolls back the database).

### 3. Core Pages
- **Landing Page (`/`)**: Minimalist Linear/Vercel engineering aesthetic with dark/light themes, interactive "Try a Query Instantly" live demo terminal, 4-stage visual syllabus tree, and features grid.
- **Learning Dashboard (`/learn`)**: 6 categorized tracks, completed task counters, mastery scores, and progress tracking saved to `localStorage`.
- **Interactive Workspace (`/learn/[slug]`)**:
  - **Left Pane**: Curriculum concepts, real-world scenarios, interactive checkboxes for objectives, and collapsible "Explain Syntax" breakdowns.
  - **Right Pane**: Tab 1 with interactive `mysql>` terminal (Up/Down history, tab autocomplete, multiline buffers); Tab 2 with live auto-refreshing table schema & data inspector; docked Agent Feedback panel.

---

## 📚 Curriculum Tracks

1. **Foundations**: Relational models, `CREATE DATABASE`, `USE`, `CREATE TABLE`, types (`INT`, `VARCHAR`, `DATE`), primary keys, and nullability.
2. **Data Manipulation (CRUD)**: `INSERT INTO`, batch inserts, `SELECT` projections, `WHERE` clauses (`AND`, `OR`, `LIKE`, `BETWEEN`, `IN`), `UPDATE`, and `DELETE`.
3. **Aggregations & Grouping**: `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`, `GROUP BY`, and `HAVING` vs `WHERE`.
4. **Relational Operations**: Foreign keys, `INNER JOIN`, `LEFT JOIN`, `RIGHT JOIN`, nested subqueries, and table aliasing.
5. **Schema Evolution & Constraints**: `ALTER TABLE` (`ADD`, `DROP`), `UNIQUE`, `DEFAULT`, `CHECK`, and `AUTO_INCREMENT`.
6. **Transactions & Performance**: `START TRANSACTION`, `COMMIT`, `ROLLBACK`, and B-Tree indexing strategies (`CREATE INDEX`).

---

## 🛠️ Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
