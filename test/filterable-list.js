const assert = require('assert');
const chai = require('chai');
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
			filters: ['name', 'age'],
			length: 4
		});
	});

	describe('constructor()', () => {
		it('should throw on bad redis object', () => {
			assert.throws(() => new FilterableList({
				name: 'test',
				filters: ['name', 'age'],
				length: 3
			}));
		});

		it('should throw on bad name', () => {
			assert.throws(() => new FilterableList({
				redis,
				filters: ['name', 'age'],
				length: 3
			}));
		});

		it('should throw on bad length', () => {
			assert.throws(() => new FilterableList({
				redis,
				name: 'test',
				filters: ['name', 'age']
			}));
		});

		it('should throw on bad filters', () => {
			assert.throws(() => new FilterableList({
				redis,
				name: 'test',
				length: 3
			}));
		});

		it('should throw on bad filters values', () => {
			assert.throws(() => new FilterableList({
				redis,
				name: 'test',
				filters: ['name', undefined],
				length: 3
			}));
		});

		it('should throw on bad hooks', () => {
			assert.throws(() => new FilterableList({
				redis,
				name: 'test',
				filters: ['name', 'age'],
				length: 100,
				hooks: 100
			}));
		});

		it('should throw on bad hook functions', () => {
			assert.throws(() => new FilterableList({
				redis,
				name: 'test',
				filters: ['name', 'age'],
				length: 100,
				hooks: {
					update: undefined
				}
			}));
		});
	});

	describe('#insert()', () => {
		it('should throw on bad document value', async () => {
			await chai.assert.isRejected(list.insert(100));
		});
	});

	describe('#update()', () => {
		it('should throw on bad document value', async () => {
			await chai.assert.isRejected(list.update(100));
		});

		it('should throw on unrecognised document value', async () => {
			await chai.assert.isRejected(list.update({}));
		});
	});

	describe('#find()', () => {
		it('should throw on bad amount value', async () => {
			await chai.assert.isRejected(list.find(true));
		});

		it('should throw on bad fields value', async () => {
			await chai.assert.isRejected(list.find(100, 100));
		});

		it('should throw on multiple fields', async () => {
			await chai.assert.isRejected(list.find(100, {
				a: 1,
				b: 2
			}));
		});
	});

	describe('#delete()', () => {
		it('should throw on unrecognised document value', async () => {
			await chai.assert.isRejected(list.delete({}));
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

	it('should automatically trim based on length', async () => {
		await list.insert({
			name: 'Sam',
			age: 58
		});

		await list.trim();

		const expected = [
			{name: 'Sam', age: 58},
			{name: 'Josh', age: 20},
			{name: 'Lisa', age: 35}
		];

		assert.deepEqual(await list.find(100), expected);
	});

	it('should update documents', async () => {
		const results = await list.find(1, {
			age: 20
		});

		assert.deepEqual(results, [
			{name: 'Josh', age: 20}
		]);

		results[0].age = 30;

		await list.update(results[0]);

		assert.deepEqual(await list.find(1, {
			age: 20
		}), []);

		assert.deepEqual(await list.find(1, {
			age: 30
		}), [
			{name: 'Josh', age: 30}
		]);
	});

	it('should delete all extraneous keys', async () => {
		const results = await list.find(100);

		for (const result of results)
			await list.delete(result);

		assert.deepEqual(await redis.keys('*'), ['test:i']);
	});
});
