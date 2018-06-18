const redis = require('./lib/redis');
const config = require('./config');
const shares = require('./lib/shares');

const rpc = {
	zSendmany(...args) {
		console.log('z_sendmany', ...args);
	}
};

const sending = {
	findInputs: () => 't1R5WEPSsvHowVUAtbQFo4bAFVgaAfh9ySX'
};

(async () => {
	await redis.flushall();
	await shares.retrieveTotals();
	await shares.generateBalances();

	const users = await shares.getPositiveBalances();

	// build list in format for z_sendmany
	const sendList = users.map(({address, balance}) => ({
		address,
		amount: balance
	}));

	// substract from local balance
	await Promise.all(sendList.map(async ({address, amount}) =>
		shares.withdraw(address, amount)
	));

	// send transaction
	await rpc.zSendmany(
		await sending.findInputs,
		sendList,
		1,
		config.sendingFee
	);
})().catch(error => {
	console.warn(error);
});
