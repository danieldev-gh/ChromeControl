/**
 * @type {Map<string, Socket>}
 * A map of client IDs to their respective socket connections.
 */
const socketMaps = new Map();

module.exports = {
  socketMaps,
};
