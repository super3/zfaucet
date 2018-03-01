const r = require('rethinkdb');
const config = require('../config.js');

async function createDrip(payoutAddress) {
	const conn = await r.connect(config.connectionConfig);

	// Build payout object for database insertion
	const payoutObj = {payoutAddress,
		timestamp: new Date(),
		processed: false,
		transactionId: '',
		operationId: ''
	};

	await r.table('payouts').insert(payoutObj).run(conn);
}

module.exports.createDrip = createDrip;

function latestDrips(conn) {
	return r.table('payouts').orderBy({index: r.desc('timestamp')})
		.limit(config.displayPendingNum).run(conn);
}

module.exports.latestDrips = latestDrips;

function pendingDrips(conn) {
	return r.table('payouts').orderBy({index: r.desc('timestamp')})
		.filter({processed: false}).limit(config.dripsPerSend).run(conn);
}

module.exports.pendingDrips = pendingDrips;
