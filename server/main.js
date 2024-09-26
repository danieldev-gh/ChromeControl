const express = require("express");
const Database = require("better-sqlite3");

const app = express();
const port = 3000;

// Connect to the SQLite database
const db = new Database("database.db", { verbose: console.log });

// Define your routes here
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
