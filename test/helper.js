function validateCaptcha(captchaToken) {
	if (captchaToken !== 'DS6WL3kCBmnMSPN3vsXspJEOdEIP6Era') {
		return Promise.resolve(JSON.stringify({
			success: false
		}));
	}
	return Promise.resolve(JSON.stringify({
		success: true
	}));
}

module.exports.validateCaptcha = validateCaptcha;