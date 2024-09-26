const express = require("express");
const io = require("socket.io");
const db = require("./db"); // Adjust the path as necessary
const { socketMaps } = require("./sharedData");

module.exports = function initializeClientApi(appClients, server) {
  appClients.use(express.json());
  appClients.use(express.urlencoded({ extended: true }));

  const ioInstance = io(server);
  ioInstance.on("connection", (socket) => {
    socket.on("alive", (data) => {
      const { client_id, os, username } = data;
      const stmt = db.prepare(
        `
          INSERT OR REPLACE INTO clients (client_id, os, username, ip_address, last_seen)
          VALUES (?, ?, ?, ?, datetime('now'))
        `
      );
      stmt.run(client_id, os, username, socket.handshake.address);
      socketMaps.set(client_id, socket);
      socket.emit("response", "OK");
    });
  });
};
