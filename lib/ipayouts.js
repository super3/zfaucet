const FilterableList = require('./filterable-list');
const utils = require('./utils');
const redis = require('./redis');

const list = new FilterableList({
	redis,
	name: 'ipayouts',
	filters: [
		'address',
		'amount',
		'processed',
		'operationId',
		'transactionId'
	],
	length: 10000
});

module.exports = {
	async insert(document) {
		const {address, amount} = document;

		if (!utils.isAddress(address))
			throw new Error('\'address\' must be an address');

		if (typeof amount !== 'number')
			throw new Error('\'amount\' must be a number');

		await list.insert(document);
	},

	async getUnpaid() {
		return list.find(100, {
			processed: false
		});
	},

	async update(document) {
		await list.update(document);
	}
};
