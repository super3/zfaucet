const querystring = require('querystring');
const rp = require('request-promise');
const config = require('../config');

/* istanbul ignore next */
function validateCaptcha(captchaToken) {
	const body = {
		secret: config.coinhivePrivKey,
		token: captchaToken,
		hashes: config.hashes
	};

	const options = {
		method: 'POST',
		uri: 'https://api.coinhive.com/token/verify',
		form: body
	};

	return rp(options);
}

module.exports.validateCaptcha = validateCaptcha;

/* istanbul ignore next */
async function getBalance(pubKey) {
	const options = {
		method: 'GET',
		uri: 'https://api.coinhive.com/user/balance?' + querystring.stringify({
			secret: config.coinhivePrivKey,
			name: pubKey
		})
	};

	const response = await rp(options);
	return JSON.parse(response);
}

module.exports.getBalance = getBalance;

/* istanbul ignore next */
async function withdraw(pubKey, amount) {
	const body = {
		secret: config.coinhivePrivKey,
		name: pubKey,
		amount
	};

	const options = {
		method: 'POST',
		uri: 'https://api.coinhive.com/user/withdraw',
		form: body
	};

	const response = await rp(options);
	return JSON.parse(response);
}

module.exports.withdraw = withdraw;
