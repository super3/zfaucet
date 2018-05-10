const bitcoin = require('bitcoinjs-lib');

const zcash = {
	...bitcoin.networks.bitcoin,
	pubKeyHash: 0x1C
};

module.exports = () =>
	bitcoin.ECPair.makeRandom({
		network: zcash
	});
