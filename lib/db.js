const config = require('../config');
const FilterableList = require('./filterable-list');
const reports = require('./reports');
const redis = require('./redis');
const utils = require('./utils');

const payouts = new FilterableList({
	redis,
	name: 'payouts',
	filters: ['payoutAddress', 'processed', 'operationId', 'transactionId'],
	length: 1000
});

async function submitReport({address, isMining, hashRate, withdrawPercent, algorithm = 'xmr'}) {
	if (!utils.isAddress(address) || typeof hashRate !== 'number' ||
		typeof isMining !== 'boolean' || typeof withdrawPercent !== 'number')
		return false;

	if (typeof algorithm !== 'string')
		return false;

	await redis.zadd('miners-active', Date.now(), address);

	await reports.insert({
		address,
		hashRate,
		isMining,
		withdrawPercent,
		lastSeen: Date.now(),
		algorithm
	});

	return true;
}

async function onlineStatus() {
	const timeSince = Date.now() - (5 * 60 * 1000);

	const addresses = await redis.zrangebyscore('miners-active', timeSince,
		Date.now());

	const active = await Promise.all(addresses.map(async address =>
		(await reports.find(1, {address}))[0]
	));

	active.sort((a, b) => {
		if (a.withdrawPercent < b.withdrawPercent)
			return 1;

		if (a.withdrawPercent > b.withdrawPercent)
			return -1;

		return 0;
	});

	return {active};
}

async function createDrip(payoutAddress) {
	// build payout object for database insertion
	await payouts.insert({
		payoutAddress,
		timestamp: Date.now(),
		processed: false,
		transactionId: '',
		operationId: ''
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
