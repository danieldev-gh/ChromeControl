const fs = require("fs");
const ini = require("ini");
const socketMaps = {};
const eventListener = {};
const sendEvent = (event, client_id) => {
  eventListener.listener && eventListener.listener(event, client_id);
};
const config = ini.parse(
  fs.readFileSync(__dirname + "/../config.ini", "utf-8")
);
module.exports = {
  socketMaps,
  sendEvent,
  eventListener,
  config,
};
