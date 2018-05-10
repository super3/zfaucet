/* global window */
const io = require('socket.io-client');

module.exports = io.connect(`http://${window.location.hostname}:3012/`);
