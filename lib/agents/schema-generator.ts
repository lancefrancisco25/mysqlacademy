/**
 * Schema Generator Agent
 *
 * Provides seed SQL scripts for each lesson, creating pre-configured
 * databases with realistic sample data.
 */

const SEEDS: Record<string, string> = {
  // ── Foundations ──────────────────────────────────────────────────────
  "create-database": "",
  "create-table": "",
  "data-types": `
    CREATE TABLE products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL,
      price REAL NOT NULL,
      in_stock INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (date('now'))
    );
  `,

  // ── CRUD ────────────────────────────────────────────────────────────
  "insert-data": `
    CREATE TABLE students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name VARCHAR(50) NOT NULL,
      last_name VARCHAR(50) NOT NULL,
      email VARCHAR(100) UNIQUE,
      enrollment_date TEXT,
      gpa REAL DEFAULT 0.0
    );
  `,

  "select-basics": `
    CREATE TABLE employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name VARCHAR(50) NOT NULL,
      last_name VARCHAR(50) NOT NULL,
      department VARCHAR(50),
      salary REAL,
      hire_date TEXT,
      is_active INTEGER DEFAULT 1
    );
    INSERT INTO employees (first_name, last_name, department, salary, hire_date, is_active) VALUES
      ('Alice', 'Johnson', 'Engineering', 95000, '2020-03-15', 1),
      ('Bob', 'Smith', 'Marketing', 65000, '2019-07-22', 1),
      ('Carol', 'Williams', 'Engineering', 105000, '2018-01-10', 1),
      ('David', 'Brown', 'Sales', 55000, '2021-11-01', 1),
      ('Eve', 'Davis', 'Marketing', 72000, '2020-06-30', 0),
      ('Frank', 'Miller', 'Engineering', 88000, '2022-02-14', 1),
      ('Grace', 'Wilson', 'Sales', 62000, '2019-09-05', 1),
      ('Henry', 'Moore', 'HR', 70000, '2021-04-18', 1),
      ('Ivy', 'Taylor', 'Engineering', 112000, '2017-08-22', 1),
      ('Jack', 'Anderson', 'HR', 58000, '2023-01-09', 1);
  `,

  "where-clauses": `
    CREATE TABLE orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name VARCHAR(100) NOT NULL,
      product VARCHAR(100) NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      order_date TEXT NOT NULL,
      status VARCHAR(20) DEFAULT 'pending'
    );
    INSERT INTO orders (customer_name, product, quantity, price, order_date, status) VALUES
      ('Alice Johnson', 'Laptop', 1, 999.99, '2024-01-15', 'completed'),
      ('Bob Smith', 'Mouse', 3, 29.99, '2024-01-16', 'completed'),
      ('Alice Johnson', 'Keyboard', 1, 79.99, '2024-01-17', 'shipped'),
      ('Carol Williams', 'Monitor', 2, 349.99, '2024-02-01', 'pending'),
      ('David Brown', 'Laptop', 1, 1299.99, '2024-02-05', 'completed'),
      ('Eve Davis', 'Headphones', 2, 149.99, '2024-02-10', 'cancelled'),
      ('Bob Smith', 'Webcam', 1, 89.99, '2024-02-14', 'shipped'),
      ('Frank Miller', 'Tablet', 1, 499.99, '2024-03-01', 'pending'),
      ('Grace Wilson', 'Phone Case', 5, 19.99, '2024-03-05', 'completed'),
      ('Henry Moore', 'USB Cable', 10, 9.99, '2024-03-10', 'completed');
  `,

  "update-delete": `
    CREATE TABLE inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_name VARCHAR(100) NOT NULL,
      category VARCHAR(50),
      quantity INTEGER NOT NULL DEFAULT 0,
      unit_price REAL NOT NULL,
      supplier VARCHAR(100),
      last_restocked TEXT
    );
    INSERT INTO inventory (product_name, category, quantity, unit_price, supplier, last_restocked) VALUES
      ('Widget A', 'Electronics', 150, 24.99, 'TechCorp', '2024-01-10'),
      ('Widget B', 'Electronics', 0, 39.99, 'TechCorp', '2023-11-20'),
      ('Gadget X', 'Accessories', 75, 14.99, 'GadgetWorld', '2024-02-01'),
      ('Gadget Y', 'Accessories', 200, 9.99, 'GadgetWorld', '2024-01-25'),
      ('Device Z', 'Hardware', 30, 149.99, 'HardwareInc', '2023-12-15'),
      ('Part Alpha', 'Components', 500, 2.99, 'PartsRUs', '2024-02-10'),
      ('Part Beta', 'Components', 0, 5.49, 'PartsRUs', '2023-10-05');
  `,

  // ── Aggregations ────────────────────────────────────────────────────
  "aggregate-functions": `
    CREATE TABLE sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      salesperson VARCHAR(50) NOT NULL,
      region VARCHAR(30) NOT NULL,
      product VARCHAR(50) NOT NULL,
      amount REAL NOT NULL,
      sale_date TEXT NOT NULL
    );
    INSERT INTO sales (salesperson, region, product, amount, sale_date) VALUES
      ('Alice', 'North', 'Widget', 1200.00, '2024-01-05'),
      ('Alice', 'North', 'Gadget', 800.00, '2024-01-12'),
      ('Bob', 'South', 'Widget', 950.00, '2024-01-08'),
      ('Bob', 'South', 'Widget', 1100.00, '2024-01-20'),
      ('Carol', 'East', 'Gadget', 1500.00, '2024-02-01'),
      ('Carol', 'East', 'Device', 2200.00, '2024-02-15'),
      ('Alice', 'North', 'Device', 1800.00, '2024-02-20'),
      ('Bob', 'South', 'Gadget', 650.00, '2024-03-01'),
      ('David', 'West', 'Widget', 1350.00, '2024-03-05'),
      ('David', 'West', 'Gadget', 900.00, '2024-03-10'),
      ('Carol', 'East', 'Widget', 1050.00, '2024-03-15'),
      ('David', 'West', 'Device', 1950.00, '2024-03-20');
  `,

  "group-by-having": `
    CREATE TABLE transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      category VARCHAR(30) NOT NULL,
      amount REAL NOT NULL,
      transaction_date TEXT NOT NULL
    );
    INSERT INTO transactions (customer_id, category, amount, transaction_date) VALUES
      (1, 'Electronics', 299.99, '2024-01-05'),
      (1, 'Books', 45.50, '2024-01-10'),
      (2, 'Electronics', 899.99, '2024-01-12'),
      (2, 'Electronics', 149.99, '2024-01-15'),
      (3, 'Clothing', 89.99, '2024-01-20'),
      (3, 'Books', 32.99, '2024-02-01'),
      (1, 'Electronics', 499.99, '2024-02-05'),
      (4, 'Clothing', 199.99, '2024-02-10'),
      (4, 'Clothing', 79.99, '2024-02-15'),
      (2, 'Books', 24.99, '2024-02-20'),
      (5, 'Electronics', 1299.99, '2024-03-01'),
      (5, 'Electronics', 59.99, '2024-03-05'),
      (3, 'Clothing', 149.99, '2024-03-10'),
      (1, 'Clothing', 65.00, '2024-03-15');
  `,

  // ── Joins ───────────────────────────────────────────────────────────
  "inner-join": `
    CREATE TABLE departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(50) NOT NULL,
      location VARCHAR(50)
    );
    CREATE TABLE staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL,
      department_id INTEGER,
      role VARCHAR(50),
      salary REAL,
      FOREIGN KEY (department_id) REFERENCES departments(id)
    );
    INSERT INTO departments (name, location) VALUES
      ('Engineering', 'Building A'),
      ('Marketing', 'Building B'),
      ('Sales', 'Building C'),
      ('HR', 'Building A');
    INSERT INTO staff (name, department_id, role, salary) VALUES
      ('Alice Chen', 1, 'Senior Engineer', 120000),
      ('Bob Park', 1, 'Junior Engineer', 75000),
      ('Carol Reed', 2, 'Marketing Lead', 85000),
      ('David Kim', 3, 'Sales Rep', 60000),
      ('Eve Santos', NULL, 'Contractor', 90000),
      ('Frank Liu', 1, 'Tech Lead', 135000),
      ('Grace Obi', 4, 'HR Manager', 80000),
      ('Henry Patel', 2, 'Content Writer', 55000);
  `,

  "left-right-join": `
    CREATE TABLE customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100),
      city VARCHAR(50)
    );
    CREATE TABLE purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER,
      item VARCHAR(100) NOT NULL,
      amount REAL NOT NULL,
      purchase_date TEXT,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );
    INSERT INTO customers (name, email, city) VALUES
      ('Alice', 'alice@example.com', 'New York'),
      ('Bob', 'bob@example.com', 'Chicago'),
      ('Carol', 'carol@example.com', 'San Francisco'),
      ('David', 'david@example.com', 'Austin'),
      ('Eve', 'eve@example.com', 'Seattle');
    INSERT INTO purchases (customer_id, item, amount, purchase_date) VALUES
      (1, 'Laptop', 1200.00, '2024-01-15'),
      (1, 'Mouse', 25.00, '2024-01-15'),
      (2, 'Keyboard', 75.00, '2024-02-10'),
      (3, 'Monitor', 350.00, '2024-02-20'),
      (3, 'Webcam', 90.00, '2024-03-01'),
      (NULL, 'Gift Card', 50.00, '2024-03-10');
  `,

  "subqueries": `
    CREATE TABLE products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL,
      category VARCHAR(50),
      price REAL NOT NULL
    );
    CREATE TABLE order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      quantity INTEGER NOT NULL,
      total REAL NOT NULL,
      order_date TEXT,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
    INSERT INTO products (name, category, price) VALUES
      ('Laptop Pro', 'Electronics', 1299.99),
      ('Wireless Mouse', 'Accessories', 29.99),
      ('Mechanical Keyboard', 'Accessories', 89.99),
      ('4K Monitor', 'Electronics', 449.99),
      ('USB-C Hub', 'Accessories', 49.99),
      ('Standing Desk', 'Furniture', 599.99),
      ('Office Chair', 'Furniture', 399.99),
      ('Desk Lamp', 'Furniture', 39.99);
    INSERT INTO order_items (product_id, quantity, total, order_date) VALUES
      (1, 2, 2599.98, '2024-01-10'),
      (2, 10, 299.90, '2024-01-12'),
      (3, 5, 449.95, '2024-01-15'),
      (4, 1, 449.99, '2024-02-01'),
      (1, 1, 1299.99, '2024-02-10'),
      (5, 8, 399.92, '2024-02-15'),
      (6, 2, 1199.98, '2024-03-01'),
      (2, 15, 449.85, '2024-03-05');
  `,

  // ── Schema Evolution ────────────────────────────────────────────────
  "alter-table": `
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(50) NOT NULL,
      email VARCHAR(100)
    );
    INSERT INTO users (username, email) VALUES
      ('alice', 'alice@example.com'),
      ('bob', 'bob@example.com'),
      ('carol', 'carol@example.com');
  `,

  "constraints": `
    CREATE TABLE categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(50) NOT NULL UNIQUE
    );
    INSERT INTO categories (name) VALUES ('Electronics'), ('Books'), ('Clothing');
  `,

  // ── Transactions ────────────────────────────────────────────────────
  "transactions-basics": `
    CREATE TABLE accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      holder_name VARCHAR(100) NOT NULL,
      balance REAL NOT NULL DEFAULT 0,
      account_type VARCHAR(20) DEFAULT 'checking'
    );
    INSERT INTO accounts (holder_name, balance, account_type) VALUES
      ('Alice Johnson', 5000.00, 'checking'),
      ('Bob Smith', 12000.00, 'savings'),
      ('Carol Williams', 3500.00, 'checking'),
      ('David Brown', 8000.00, 'savings');
  `,

  "indexing": `
    CREATE TABLE logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      action VARCHAR(50) NOT NULL,
      ip_address VARCHAR(45),
      created_at TEXT DEFAULT (datetime('now')),
      details TEXT
    );
    INSERT INTO logs (user_id, action, ip_address, details) VALUES
      (1, 'login', '192.168.1.1', 'Successful login'),
      (2, 'login', '192.168.1.2', 'Successful login'),
      (1, 'update_profile', '192.168.1.1', 'Changed email'),
      (3, 'login', '10.0.0.1', 'Successful login'),
      (1, 'logout', '192.168.1.1', NULL),
      (2, 'purchase', '192.168.1.2', 'Order #1234'),
      (3, 'login', '10.0.0.1', 'Failed - wrong password'),
      (2, 'logout', '192.168.1.2', NULL);
  `,
};

/**
 * Returns the seed SQL for a given lesson slug.
 * Returns empty string if no seed is needed (student creates from scratch).
 */
export function getSeedSQL(slug: string): string {
  return SEEDS[slug] ?? "";
}
