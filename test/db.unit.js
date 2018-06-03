const chai = require('chai');

const db = require('../lib/db');
const redis = require('../lib/redis');
const helper = require('./helper');

describe('Database Testing', () => {
	describe('RethinkDB', () => {
		it('create drip', async () => {
			await db.createDrip(helper.validAddr);
		});

		it('pending drips', async () => {
			const rows = await db.pendingDrips();
			chai.assert.strictEqual(rows[0].payoutAddress, helper.validAddr, '');
		});

		it('latest drips', async () => {
			const rows = await db.searchDrips({});
			chai.assert.strictEqual(rows[0].payoutAddress, helper.validAddr, '');
		});
	});
	describe('Redis', () => {
		it('submit report', async () => {
			let result = await db.submitReport(
				{
					address: helper.validAddr,
					isMining: true,
					hashRate: 50,
					withdrawPercent: 50
				});
			chai.assert.isTrue(result);

			result = await db.submitReport(
				{
					address: helper.invalidAddr,
					isMining: true,
					hashRate: 50,
					withdrawPercent: 50
				});
			chai.assert.isFalse(result);
		});
		it('online status', async () => {
			await redis.del('miners-active');
			await db.submitReport(
				{
					address: 't1fnAYvhHkzrLVQvT6bJueLamfTyyZLPnin',
					isMining: true,
					hashRate: 50,
					withdrawPercent: 50
				});
			await db.submitReport(
				{
					address: 't1fUTVEY1nFVVvSzb6q4AC6uMiugg729q9k',
					isMining: true,
					hashRate: 50,
					withdrawPercent: 50
				}
			);
			await db.submitReport(
				{
					address: 't1ReNX1Vb9oVXAPsrbcUZaHDVNW89whJwGB',
					isMining: true,
					hashRate: 50,
					withdrawPercent: 70
				});
			await db.submitReport(
				{
					address: helper.validAddr,
					isMining: true,
					hashRate: 50,
					withdrawPercent: 45
				});

			const result = await db.onlineStatus();
			chai.assert.strictEqual(result.active[result.active.length - 1].address,
				helper.validAddr);
		});
	});
});
