const r = require('rethinkdb');

// Internal libs
const db = require('./lib/db.js');
const config = require('./config.js');
const utils = require('./lib/utils.js');
const rpc = require('./lib/rpc.js');

async function findInputs(conn) {
	// Get balance from rpc daemon
	const balance = await rpc.getbalance();

	// Check if we have enought money to send
	const balMinusSend = balance -
		(config.sendingAmount * config.dripsPerSend) - config.sendingFee;
	if (balMinusSend <= 0) {
		throw new Error('Not enough to send.');
	}

	// Get inputs and make sure its not empty
	const inputs = await rpc.listunspent();
	if (inputs.length === 0) {
		throw new Error('No inputs.');
	}

	// Get and return largest input address
	const large = utils.indexOfMax(inputs);
	return inputs[large].address;
}

module.exports.findInputs = findInputs;

async function sendDrip(conn, sendingAddress) {
	// Get pending drips and make sure its not empty
	const cursor = await db.pendingDrips(conn);
	const rows = await cursor.toArray();

	if (rows.length === 0) {
		return;
	}

	// Send payment
	const opid = await rpc.zSendmany(sendingAddress, [
		{
			address: rows[0].payoutAddress,
			amount: config.sendingAmount
		}
	], 1, config.sendingFee);

	// Change drips to processed:true
	await r.table('payouts').get(rows[0].id).update({processed: true,
		operationId: opid}).run(conn);

	// Console.log(`Send Was: ${opid}\n`);
	return opid;
}

module.exports.sendDrip = sendDrip;

async function updateDrips(conn) {
	const operations = await rpc.zGetoperationresult();
	for (const transaction of operations) {
		if (!transaction.hasOwnProperty('result')) {
			continue;
		}

		// Update drips
		// console.log('Updating TXID for operation id: ' + transaction.id);
		await r.table('payouts').filter({operationId: transaction.id})
			.update({transactionId: transaction.result.txid}).run(conn);
		// Console.log(`Updated TXID with ${transaction.result.txid}`);
	}

	return conn;
}

module.exports.updateDrips = updateDrips;

// Start the server, if running this script alone
if (require.main === module) {
  (async () => {
  	const conn = this.conn = await r.connect(config.connectionConfig);

    const sendingAddress = await findInputs(conn);
    const opid = await sendDrip(conn, sendingAddress);
    await updateDrips(conn);

    conn.close();
    process.exit();
    console.log('Closing...');
  })();
}
