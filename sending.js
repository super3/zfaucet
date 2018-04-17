const r = require('rethinkdb');

// internal libs
const db = require('./lib/db');
const config = require('./config');
const utils = require('./lib/utils');
const rpc = require('./lib/rpc');

async function findInputs() {
	// get balance from rpc daemon
	const balance = await rpc.getbalance();

	// check if we have enought money to send
	const balMinusSend = balance -
		(config.sendingAmount * config.dripsPerSend) - config.sendingFee;
	if (balMinusSend <= 0) 	throw new Error('Not enough to send.');

	// get inputs and make sure its not empty
	const inputs = await rpc.listunspent();
	if (inputs.length === 0) throw new Error('No inputs.');

	// get and return largest input address
	const large = utils.indexOfMax(inputs);
	return inputs[large].address;
}

module.exports.findInputs = findInputs;

async function sendDrip(conn, sendingAddress) {
	// get pending drips and make sure its not empty
	const rows = await db.pendingDrips(conn);
	if (rows.length === 0) return 0;

	// make transaction list
	const sendList = [];
	sendList.push({address: rows[0].payoutAddress, amount: config.sendingAmount});

	// add referral if needed
	if (rows[0].referralAddress !== '')
		sendList.push({address: rows[0].referralAddress,
			amount: config.sendingAmount});

	// send payment
	const opid = await rpc.zSendmany(sendingAddress, sendList,
		1, config.sendingFee);

	// change drips to processed and return opid
	await r.table('payouts').get(rows[0].id).update({processed: Date.now(),
		operationId: opid}).run(conn);
	return opid;
}

module.exports.sendDrip = sendDrip;

async function updateDrips(conn) {
	const operations = await rpc.zGetoperationresult();

	// update drips
	await Promise.all(operations.map(async transaction => {
		await r.table('payouts').filter({operationId: transaction.id})
			.update({transactionId: transaction.result.txid}).run(conn);
	}));

	return 1; // signal finished without error
}

module.exports.updateDrips = updateDrips;

async function main() {
	let conn;

	try {
		conn = await r.connect(config.connectionConfig);

		const sendingAddress = await findInputs(conn);
		await sendDrip(conn, sendingAddress);
		await updateDrips(conn);
	} catch (err) {
		conn.close();
		return 0;
	}

	conn.close();
	return 1;
}

module.exports.main = main;

/* istanbul ignore next */
// send the drips, if running this script alone
if (require.main === module) {
	main();
	setInterval(main, config.sendingIntervalMin * 60 * 1000);
}
