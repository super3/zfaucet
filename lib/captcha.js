const config  = require('../config.js');
var rp        = require('request-promise');

function validateCaptcha(captchaToken) {

  const body =  {
    'secret': process.env.captchaApiKey,
    'token': captchaToken,
    'hashes': config.hashes,
  };

  const options = {
    method: 'POST',
    uri: 'https://api.coinhive.com/token/verify',
    form: body,
  };

  return rp(options);
}

global.validateCaptcha = validateCaptcha;
