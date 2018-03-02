const rp = require('request-promise');
const config = require('../config');

function validateCaptcha(captchaToken) {
	const body = {
		secret: process.env.captchaApiKey,
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

function getBalance(pubKey) {
	const body = {
		secret: process.env.captchaApiKey,
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
