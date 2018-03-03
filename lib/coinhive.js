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
function getBalance(pubKey) {
	const body = {
		secret: config.coinhivePrivKey,
		name: pubKey
	};

	const options = {
		method: 'GET',
		uri: 'https://api.coinhive.com/user/balance',
		form: body
	};

	return rp(options);
}

module.exports.getBalance = getBalance;
