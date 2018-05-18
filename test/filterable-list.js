const assert = require('assert');
const Redis = require('ioredis');
const FilterableList = require('../lib/filterable-list');

describe('filterable-list', async () => {
	let redis;
	let list;

	before(async () => {
		redis = new Redis({
			db: 2
		});

		await redis.flushall();

		list = new FilterableList({
			redis,
			name: 'test',
			filters: ['name', 'age']
		});
	});

	it('should store documents', async () => {
		await list.insert({
			name: 'John',
			age: 20
		});

		await list.insert({
			name: 'Lisa',
			age: 35
		});

		await list.insert({
			name: 'Josh',
			age: 20
		});
	});

	it('should find all documents', async () => {
		const expected = [
			{name: 'Josh', age: 20},
			{name: 'Lisa', age: 35},
			{name: 'John', age: 20}
		];

		assert.deepEqual(await list.find(100), expected);
	});

	it('should return no more than the amount specified', async () => {
		const expected = [
			{name: 'Josh', age: 20},
			{name: 'Lisa', age: 35}
		];

		assert.deepEqual(await list.find(2), expected);
	});

	it('should return documents only fitting filter', async () => {
		const expected = [
			{name: 'Josh', age: 20},
			{name: 'John', age: 20}
		];

		assert.deepEqual(await list.find(100, {
			age: 20
		}), expected);
	});
});
