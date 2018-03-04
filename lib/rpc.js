const stdrpc = require('stdrpc');
const config = require('../config');

module.exports = stdrpc('http://localhost:8232', {
	req: {
		auth: {
			username: config.rpcuser,
			password: config.rpcpass
		}
	},
	methodTransform: require('decamelize')
});
