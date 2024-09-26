const express = require("express");
const WebSocket = require("ws");
const db = require("./db"); // Adjust the path as necessary
const { socketMaps } = require("./sharedData");

function handleAlive(ws, data) {
  const { client_id, os, username } = data;
  if (!client_id || !os || !username) {
    return;
  }
  const existingClient = db
    .prepare("SELECT client_id FROM clients WHERE client_id = ?")
    .get(client_id);
  if (existingClient) {
    const stmt = db.prepare(
      `
          UPDATE clients
          SET os = ?, username = ?, ip_address = ?, last_seen = datetime('now')
          WHERE client_id = ?
        `
    );
    stmt.run(os, username, ws._socket.remoteAddress, existingClient.client_id);
  } else {
    const stmt = db.prepare(
      `
          INSERT INTO clients (client_id, os, username, ip_address, last_seen)
          VALUES (?, ?, ?, ?, datetime('now'))
        `
    );
    stmt.run(client_id, os, username, ws._socket.remoteAddress);
  }
  socketMaps.set(client_id, ws);
}

module.exports = function initializeClientApi(appClients, server) {
  appClients.use(express.json());
  appClients.use(express.urlencoded({ extended: true }));

  const wss = new WebSocket.Server({ server });
  wss.on("connection", (ws) => {
    console.log("Client connected");
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message);
        switch (data[0]) {
          case "alive":
            handleAlive(ws, data[1]);
            break;
        }
      } catch (err) {
        console.error(err);
      }
    });
  });
};
