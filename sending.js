const sending = require('debug')('zfaucet:sending');

// internal libs
const db = require('./lib/db');
const config = require('./config');
const utils = require('./lib/utils');
const rpc = require('./lib/rpc');

async function findInputs() {
	// get balance from rpc daemon
	const balance = await rpc.getbalance();
	sending(`balance: ${balance}`);

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

async function sendDrip(sendingAddress) {
	// get pending drips and make sure its not empty
	const rows = await db.pendingDrips();

	if (rows.length === 0) {
		sending('sending list empty');
		return 0;
	}

	// make transaction list
	const sendList = [
		{
			address: rows[0].payoutAddress,
			amount: config.sendingAmount
		}
	];

	sending('sendList: %o', sendList);

	// add referral if needed
	if (rows[0].referralAddress !== '')
		sendList.push({
			address: rows[0].referralAddress,
			amount: config.sendingAmount
		});

	// send payment
	const opid = await rpc.zSendmany(
		sendingAddress,
		sendList,
		1,
		config.sendingFee
	);

	// change drips to processed and return opid
	for (const row of rows) {
		row.processed = Date.now();
		row.operationId = opid;

		await db.payouts.update(row);
	}

	return opid;
}

module.exports.sendDrip = sendDrip;

async function updateDrips() {
	const operations = await rpc.zGetoperationresult();

	// update drips
	await Promise.all(operations.map(async transaction => {
		const results = await db.payouts.find(1000, {operationId: transaction.id});

		for (const result of results) {
			result.transactionId = transaction.result.txid;

			await db.payouts.update(result);
		}
	}));

	return 1; // signal finished without error
}

module.exports.updateDrips = updateDrips;

async function main() {
	sending('running sending script');

	try {
		const sendingAddress = await findInputs();
		await sendDrip(sendingAddress);
		await updateDrips();

		sending('sending script done');

		return 1;
	} catch (err) {
		sending(`error: %s`, err.message);

		return 0;
	}
}

module.exports.main = main;

/* istanbul ignore next */
// send the drips, if running this script alone
if (require.main === module) {
	main();
	setInterval(main, config.sendingIntervalMin * 60 * 1000);
}
