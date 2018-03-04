/* eslint capitalized-comments: ["error", "never"] */

const r = require('rethinkdb');
const config = require('../config');

async function createDrip(conn, payoutAddress) {
	// build payout object for database insertion
	const payoutObj = {
		payoutAddress,
		timestamp: new Date(),
		processed: false,
		transactionId: '',
		operationId: ''
	};

	await r.table('payouts').insert(payoutObj).run(conn);
}

module.exports.createDrip = createDrip;

async function latestDrips(conn) {
	const cursor = await r.table('payouts').orderBy({index: r.desc('timestamp')})
		.limit(config.displayPendingNum).run(conn);
	return cursor.toArray(); // rows
}

module.exports.latestDrips = latestDrips;

async function pendingDrips(conn) {
	const cursor = await r.table('payouts').orderBy({index: r.desc('timestamp')})
		.filter({processed: false}).limit(config.dripsPerSend).run(conn);
	return cursor.toArray(); // rows
}

module.exports.pendingDrips = pendingDrips;

async function userDrips(conn, payoutAddress) {
	const cursor = await r.table('payouts').orderBy({index: r.desc('timestamp')})
		.filter({payoutAddress}).limit(config.displayPendingNum).run(conn);
	return cursor.toArray(); // rows
}

module.exports.userDrips = userDrips;
