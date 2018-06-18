const utils = require('./lib/utils');
const rpc = require('./lib/rpc');
const ipayouts = require('./lib/ipayouts');

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
	// const inputAddress = await findInput();
	const payouts = await ipayouts.getUnpaid();

	const sendList = buildSendList(payouts);

	console.log(sendList);
}

sendPayouts();
setInterval(sendPayouts, 2.5 * 60 * 1000);
