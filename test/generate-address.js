/* global it, describe */
const assert = require('assert');
const utils = require('../lib/utils');
const generateAddress = require('../lib/generate-address');

describe('generate-address', () => {
	it('should be a valid zcash address', () => {
		const keyPair = generateAddress();

		assert(utils.isAddress(keyPair.getAddress()));
	});

	it('should generate an address from a WIF', () => {
		const keyPair = generateAddress();

		keyPair.setPrivateKey('L4kRn8dYD5T7kGhkGAiAoNpb71cnT66im2suQmfHB8xuhSdR5ktm');

		assert.equal(keyPair.getAddress(), 't1ZWC29ZTAMsYdQydbagcs9RsiGBzNCCLuf');
	});

	it('should return a valid private key WIF', () => {
		const keyPair = generateAddress();

		assert.equal(typeof keyPair.getPrivateKey(), 'string');
	});
});
