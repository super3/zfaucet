/* global window */
const io = require('socket.io-client');

const dev = window.location.href === 'http://localhost/';
module.exports = io.connect(dev ? 'http://localhost:3012' :
	'http://zfaucet.org:3012');
