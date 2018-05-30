const config = require('../config');
const FilterableList = require('./filterable-list');
const redis = require('./redis');
const utils = require('./utils');

const payouts = new FilterableList({
	redis,
	name: 'payouts',
	filters: ['payoutAddress', 'processed', 'referralAddress', 'operationId', 'transactionId'],
	length: 1000
});

async function submitReport({address, isMining, hashRate, withdrawPercent}) {
	if (!utils.isAddress(address) || typeof hashRate !== 'number' ||
		typeof isMining !== 'boolean' || typeof withdrawPercent !== 'number')
		return false;

	await redis.zadd('miners-active', Date.now(), address);
	await redis.lpush(`miner:${address}`, JSON.stringify({
		hashRate,
		isMining,
		withdrawPercent,
		lastSeen: Date.now()
	}));

	return true;
}

async function onlineStatus() {
	const timeSince = Date.now() - (5 * 60 * 1000);

	const miners = await redis.zrangebyscore('miners-active', timeSince,
		Date.now());

	const active = await Promise.all(miners.map(async address => {
		const {hashRate, isMining, withdrawPercent, lastSeen} = await JSON.parse(
			await redis.lindex(`miner:${address}`, 0));
		return {
			address,
			isMining,
			hashRate,
			withdrawPercent,
			lastSeen
		};
	}));

	active.sort((a, b) => {
		if (a.withdrawPercent < b.withdrawPercent)
			return 1;

		if (a.withdrawPercent > b.withdrawPercent)
			return -1;

		return 0;
	});

	return {active};
}

async function createDrip(payoutAddress, referralAddress) {
	// build payout object for database insertion
	await payouts.insert({
		payoutAddress,
		timestamp: new Date(),
		processed: false,
		transactionId: '',
		operationId: '',
		referralAddress
	});
}

async function pendingDrips() {
	return payouts.find(config.dripsPerSend, {
		processed: false
	});
}

async function searchDrips(query) {
	return payouts.find(config.displayPendingNum, query);
}

module.exports = {
	submitReport,
	onlineStatus,
	createDrip,
	pendingDrips,
	searchDrips,
	payouts // refactor to remove in future
};
