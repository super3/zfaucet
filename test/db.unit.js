/* global it, describe */
const chai = require('chai');
const r = require('rethinkdb');

const db = require('../lib/db');
const config = require('../config');
const helper = require('./helper');

describe('Database Testing', () => {
	it('create drip', async () => {
		await db.createDrip(helper.validAddr);
	});

	it('pending drips', async () => {
		const conn = await r.connect(config.connectionConfig);
		const rows = await db.pendingDrips(conn);
		chai.assert.strictEqual(rows[0].payoutAddress, helper.validAddr);
	});

	it('latest drips', async () => {
		const conn = await r.connect(config.connectionConfig);
		const rows = await db.latestDrips(conn);
		chai.assert.strictEqual(rows[0].payoutAddress, helper.validAddr);
	});
});
