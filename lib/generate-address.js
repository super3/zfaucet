const bitcoin = require('bitcoinjs-lib');

const zcash = {
	...bitcoin.networks.bitcoin,
	wif: 0x1C
};

module.exports = () =>
	bitcoin.ECPair.makeRandom({
		network: zcash
	});
