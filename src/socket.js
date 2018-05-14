/* global window */
const io = require('socket.io-client');

module.exports = io.connect(window.location.origin);
