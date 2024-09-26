const express = require("express");
const path = require("path");
const db = require("./db"); // Adjust the path as necessary
const { socketMaps } = require("./sharedData");

// add jsdoc
/**
 *
 * @param {express.Express} appWebUI
 */
module.exports = function initializeWebUiApi(appWebUI) {
  appWebUI.use(express.json());
  appWebUI.use(express.urlencoded({ extended: true }));
  appWebUI.use(express.static(path.join(__dirname, "../webui/dist")));

  appWebUI.get("/clients", (req, res) => {
    const onlineClients = Array.from(socketMaps.keys());
    const stmt = db.prepare(
      `
      SELECT * FROM clients WHERE client_id IN (${onlineClients
        .map(() => "?")
        .join(",")})
      `
    );
    const clients = stmt.all(...onlineClients);
    res.json(clients);
  });
  appWebUI.post("/alert", (req, res) => {
    const { client_id, message } = req.body;
    /**
     * @type {Socket}
     */
    const ws = socketMaps.get(client_id);
    if (ws) {
      ws.send(JSON.stringify(["alert", message]));
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: "Client not found" });
    }
  });
  appWebUI.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "../webui/dist", "index.html"));
  });
};
