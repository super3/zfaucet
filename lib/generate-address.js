const bitcoin = require('bitcoinjs-lib');

// took from fork
// https://github.com/str4d/bitcore-lib-zcash/blob/master/lib/networks.js#L133

/* eslint "unicorn/number-literal-case": ["off"] */

const zcash = {
	...bitcoin.networks.bitcoin,
	name: 'livenet',
	alias: 'mainnet',
	pubkeyhash: 0x1cb8,
	privatekey: 0x80,
	scripthash: 0x1cbd,
	xpubkey: 0x0488b21e,
	xprivkey: 0x0488ade4,
	zaddr: 0x169a,
	zkey: 0xab36,
	networkMagic: 0x24e92764,
	port: 8233,
	dnsSeeds: [
		'dnsseed.z.cash',
		'dnsseed.str4d.xyz',
		'dnsseed.znodes.org'
	]
};

module.exports = () =>
	bitcoin.ECPair.makeRandom({
		network: zcash
	});
