const assert = require('assert');
const ipayoutsDaemon = require('../ipayouts-daemon');

describe('ipayouts-daemon', () => {
	describe('buildSendList', () => {
		it('should merge payouts', () => {
			const input = [
				{
					address: 't1aRSZajXZTgD68ZEKz3QxZM8fwCQfCf9YK',
					amount: 0.3
				},
				{
					address: 't1aRSZajXZTgD68ZEKz3QxZM8fwCQfCf9YK',
					amount: 0.4
				},
				{
					address: 't1aRSZajXZTgD68ZEKz3QxZM8fwCQfCf9YK',
					amount: 0.2
				},
				{
					address: 't1R7fAQTqbhekVCJRC43SmrPTbMkq2sBV3L',
					amount: 0.8
				}
			];

			assert.deepEqual(ipayoutsDaemon.buildSendList(input), [
				{
					address: 't1aRSZajXZTgD68ZEKz3QxZM8fwCQfCf9YK',
					amount: 0.9
				},
				{
					address: 't1R7fAQTqbhekVCJRC43SmrPTbMkq2sBV3L',
					amount: 0.8
				}
			]);
		});
	});
});
