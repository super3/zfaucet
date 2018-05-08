const r = require('rethinkdb');
const Redis = require('ioredis');

const redis = new Redis();
const config = require('../config');
const utils = require('./utils');

async function submitReport({address, isMining, hashRate, withdrawPercent}) {
	if (!utils.isAddress(address) || typeof hashRate !== 'number' ||
		typeof isMining !== 'boolean' || typeof withdrawPercent !== 'number')
		return;

	await redis.zadd('miners-active', Date.now(), address);
	await redis.lpush(`miner:${address}`, JSON.stringify({
		hashRate,
		isMining,
		withdrawPercent,
		lastSeen: Date.now()
	}));
}

module.exports.submitReport = submitReport;

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

module.exports.onlineStatus = onlineStatus;

async function createDrip(conn, payoutAddress, referralAddress) {
	// build payout object for database insertion
	const payoutObj = {
		payoutAddress,
		timestamp: new Date(),
		processed: false,
		transactionId: '',
		operationId: '',
		referralAddress
	};

	await r.table('payouts').insert(payoutObj).run(conn);
}

module.exports.createDrip = createDrip;

async function pendingDrips(conn) {
	const cursor = await r.table('payouts').orderBy({index: r.desc('timestamp')})
		.filter({processed: false}).limit(config.dripsPerSend).run(conn);
	return cursor.toArray(); // rows
}

module.exports.pendingDrips = pendingDrips;

async function searchDrips(conn, query) {
	const cursor = await r.table('payouts').orderBy({index: r.desc('timestamp')})
		.filter(query).limit(config.displayPendingNum).run(conn);
	return cursor.toArray(); // rows
}

module.exports.searchDrips = searchDrips;
