const Database = require("better-sqlite3");
const path = require("path");

// Create a new database connection
const db = new Database(__dirname + "/database.db");

module.exports = db;
