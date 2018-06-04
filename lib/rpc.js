const stdrpc = require('stdrpc');
const config = require('../config');

module.exports = stdrpc({
	url: 'http://localhost:8232',
	username: config.rpcuser,
	password: config.rpcpass,
	methodTransform: require('decamelize')
});
