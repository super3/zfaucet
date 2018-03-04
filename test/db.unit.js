/* global it, describe */
const chai = require('chai');
const r = require('rethinkdb');
const db = require('../lib/db');
const config = require('../config');

describe('Database Testing', () => {
	const addr = 't1atPPxpdgpzC7TUNtZLMq7KCUieEYuJKkn';

	it('create drip', async () => {
		await db.createDrip(addr);
	});

	it('pending drips', async () => {
		const conn = await r.connect(config.connectionConfig);
		const rows = await db.pendingDrips(conn);
		chai.assert.strictEqual(rows[0].payoutAddress, addr);
	});

	it('latest drips', async () => {
		const conn = await r.connect(config.connectionConfig);
		const rows = await db.latestDrips(conn);
		chai.assert.strictEqual(rows[0].payoutAddress, addr);
	});
});
