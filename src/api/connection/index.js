const addConnection = require("./add-connection");
const getConnection = require("./get-connection");
const getConnectionsent = require("./get-connection-sent");
const getConnectionreceived = require("./get-connection-received");
const acceptConnection = require("./accept-connection");
const withdrawConnection = require("./withdraw-connection");
const getConnected = require("./get-coonected-user");
const diclineConnection = require("./decline-connection");
const removeConnection = require("./remove-connection");

module.exports = exports = {
  addConnection,
  getConnection,
  acceptConnection,
  withdrawConnection,
  getConnected,
  diclineConnection,
  removeConnection,
  getConnectionsent,
  getConnectionreceived,
};
