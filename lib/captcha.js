const rp = require('request-promise');
const config = require('../config.js');

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
