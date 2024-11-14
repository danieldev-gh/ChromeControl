const socketMaps = {};
const eventListener = {};
const sendEvent = (event, client_id) => {
  eventListener.listener && eventListener.listener(event, client_id);
};

module.exports = {
  socketMaps,
  sendEvent,
  eventListener,
};
