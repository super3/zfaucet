const r = require('rethinkdb');
const config = require('../config');

async function createDrip(conn, payoutAddress, referralAddress) {
	// build payout object for database insertion
	const payoutObj = {
		payoutAddress,
		timestamp: new Date(),
		processed: false,
		transactionId: '',
		operationId: '',
		referralAddress
	};

	await r.table('payouts').insert(payoutObj).run(conn);
}

module.exports.createDrip = createDrip;

async function pendingDrips(conn) {
	const cursor = await r.table('payouts').orderBy({index: r.desc('timestamp')})
		.filter({processed: false}).limit(config.dripsPerSend).run(conn);
	return cursor.toArray(); // rows
}

module.exports.pendingDrips = pendingDrips;

async function searchDrips(conn, query) {
	const cursor = await r.table('payouts').orderBy({index: r.desc('timestamp')})
		.filter(query).limit(config.displayPendingNum).run(conn);
	return cursor.toArray(); // rows
}

module.exports.searchDrips = searchDrips;
