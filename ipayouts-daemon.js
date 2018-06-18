const utils = require('./lib/utils');
const rpc = require('./lib/rpc');
const ipayouts = require('./lib/ipayouts');
const config = require('./config');

async function findInput() {
	const inputs = await rpc.listunspent();

	if (inputs.length === 0)
		throw new Error('No inputs');

	return inputs[utils.indexOfMax(inputs)].address;
}

function buildSendList(payouts) {
	const sendMap = {};

	for (const {address, amount} of payouts) {
		if (!(address in sendMap))
			sendMap[address] = 0;

		sendMap[address] += amount;
	}

	const sendList = [];

	for (const address in sendMap) {
		if ({}.hasOwnProperty.call(sendMap, address)) {
			sendList.push({
				address,
				amount: sendMap[address]
			});
		}
	}

	return sendList;
}

async function sendPayouts() {
	const inputAddress = await findInput();
	const payouts = await ipayouts.getUnpaid();
	const sendList = buildSendList(payouts);

	const operationId = await rpc.zSendmany(
		inputAddress,
		sendList,
		1,
		config.sendingFee
	);

	await Promise.all(payouts.map(async payout => {
		payout.processed = Date.now();
		payout.operationId = operationId;

		await ipayouts.update(payout);
	}));
}

async function updatePayouts() {
	const operations = await rpc.zGetoperationresult();

	// update drips
	await Promise.all(operations.map(async transaction => {
		const results = await ipayouts.find(1000, {operationId: transaction.id});

		await Promise.all(results.map(async result => {
			result.transactionId = transaction.result.txid;

			await ipayouts.update(result);
		}));
	}));
}

(async () => {
	async function job() {
		await sendPayouts();
		await updatePayouts();
	}

	const interval = 2.5 * 60 * 1000;

	for (;;) {
		const startTime = Date.now();

		await job();

		const delta = Date.now() - startTime;

		await new Promise(resolve => {
			setTimeout(resolve, Math.min(0, interval - delta));
		});
	}
})();
