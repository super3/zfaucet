/* global it, describe */
const assert = require('assert');
const utils = require('../lib/utils');
const generateAddress = require('../lib/generate-address');

describe('generate-address', () => {
	it('should be a valid zcash address', () => {
		const keyPair = generateAddress();

		assert(utils.isAddress(keyPair.getAddress()));
	});
});
