/* eslint guard-for-in: "error" */
const axios = require('axios');
const redis = require('./redis');

const base = 'https://api-zcash.flypool.org';
const address = 't1QkbjPJiqL9SD7HUmzzD239oncPVxVix8Z';

const keys = {
	total: 'shares:total',
	withdrawn: 'shares:withdrawn',
	balance: 'shares:balance'
};

const shares = {
	async retrieveTotals() {
		const {data: {data}} = await axios.get(`${base}/miner/${address}/dashboard`);

		for (const {worker, validShares} of data.workers)
			await redis.zadd(keys.total, validShares, worker);
	},

	async generateBalances() {
		await redis.zunionstore(keys.balance, 2, keys.total, keys.withdrawn);
	},

	async getPositiveBalances() {
		const balances = await redis.zrangebyscore(keys.balance, 1, '+inf', 'WITHSCORES');

		const list = [];

		while (balances.length) {
			const [address, balance] = balances.splice(0, 2);

			list.push({
				address,
				balance: Number(balance)
			});
		}

		return list;
	},

	async withdraw(address, amount) {
		if (amount <= 0)
			throw new Error('\'amount\' must be positive');

		await redis.zincrby(keys.withdrawn, 0 - amount, address);
	}
};

module.exports = shares;

(async () => {
	await shares.retrieveTotals();
	await shares.generateBalances();

	const users = await shares.getPositiveBalances();

	console.log(users);

	for (const {address, balance} of users)
		await shares.withdraw(address, 1);
})();
