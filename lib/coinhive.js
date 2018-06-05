const axios = require('axios');
const config = require('../config');

/* istanbul ignore next */
async function getBalance(name) {
	const {data} = await axios.get('https://api.coinhive.com/user/balance', {
		params: {
			secret: config.coinhivePrivKey,
			name
		}
	});

	return data;
}

module.exports.getBalance = getBalance;

/* istanbul ignore next */
async function withdraw(pubKey, amount) {
	const {data} = await axios.post('https://api.coinhive.com/user/withdraw', {
		secret: config.coinhivePrivKey,
		name: pubKey,
		amount
	});

	return data;
}

module.exports.withdraw = withdraw;
