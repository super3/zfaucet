/* eslint capitalized-comments: ["error", "never"] */
/* eslint curly: ["error", "multi"] */
/* eslint no-process-exit: "off" */

const r = require('rethinkdb');

// internal libs
const db = require('./lib/db.js');
const config = require('./config.js');
const utils = require('./lib/utils.js');
const rpc = require('./lib/rpc.js');

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

	// send payment
	const opid = await rpc.zSendmany(sendingAddress, [
		{
			address: rows[0].payoutAddress,
			amount: config.sendingAmount
		}
	], 1, config.sendingFee);

	// change drips to processed:true
	await r.table('payouts').get(rows[0].id).update({processed: true,
		operationId: opid}).run(conn);

	// console.log(`Send Was: ${opid}\n`);
	return opid;
}

module.exports.sendDrip = sendDrip;

async function updateDrips(conn) {
	const operations = await rpc.zGetoperationresult();

	await Promise.all(operations.map(async transaction => {
		// update drips
		// console.log('Updating TXID for operation id: ' + transaction.id);
		await r.table('payouts').filter({operationId: transaction.id})
			.update({transactionId: transaction.result.txid}).run(conn);
		// console.log(`Updated TXID with ${transaction.result.txid}`);
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
if (require.main === module) main();
