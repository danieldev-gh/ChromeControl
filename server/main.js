const express = require("express");
const http = require("http");
const initializeClientApi = require("./clientApi");
const initializeWebUiApi = require("./webUiApi");

const appWebUI = express();
const appClients = express();

const serverClients = http.createServer(appClients);
const serverWebUI = http.createServer(appWebUI);

initializeClientApi(appClients, serverClients);
initializeWebUiApi(appWebUI);

const PORT_CLIENTS = process.env.PORT_CLIENTS || 3000;
const PORT_WEBUI = process.env.PORT_WEBUI || 3001;

serverClients.listen(PORT_CLIENTS, () => {
  console.log(`Client API server is running on port ${PORT_CLIENTS}`);
});

serverWebUI.listen(PORT_WEBUI, () => {
  console.log(`Web UI API server is running on port ${PORT_WEBUI}`);
});
