require('dotenv').config();

/* istanbul ignore next */
module.exports = {
  connectionConfig: { host: 'localhost', port: 28015 },
  sendingAmount: 0.000001,
  sendingFee: 0.000001,
  hashes: process.env.HASHES || 256,
  port: process.env.PORT || 80,
  rpcuser: process.env.rpcuser,
  rpcpass: process.env.rpcpass,
};
