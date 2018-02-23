function validateCaptcha(captchaToken) {
  if (captchaToken !== 'DS6WL3kCBmnMSPN3vsXspJEOdEIP6Era') {
    return Promise.reject(JSON.stringify({
      "success": false,
    }));
  } else {
    return Promise.resolve(JSON.stringify({
      "success": true,
    }));
  }
}

global.validateCaptcha = validateCaptcha;
