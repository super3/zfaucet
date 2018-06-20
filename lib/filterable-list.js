// const log = require('debug')('filterable-list');

const keys = {
	document: (name, id) => `${name}:document:${id}`,
	all: name => `${name}:all`,
	field: (name, key, value) => `${name}:field:${key}:${JSON.stringify(value)}`,
	counter: name => `${name}:i`
};

module.exports = class FilterableList {
	constructor({redis, name, length, filters, hooks = {}}) {
		if (typeof redis !== 'object')
			throw new Error('Expected \'redis\' to be a database object');

		if (typeof name !== 'string')
			throw new Error('Expected \'name\' to be a string');

		if (typeof length !== 'number')
			throw new Error('Expected \'length\' to be a number');

		if (!Array.isArray(filters))
			throw new Error('Expected \'filters\' to be an array');

		for (const field of filters) {
			if (typeof field !== 'string')
				throw new Error('Expected \'filters\' to be an array of strings');
		}

		if (typeof hooks !== 'object')
			throw new Error('Expected \'hooks\' to be an object');

		for (const key in hooks) {
			if (typeof hooks[key] !== 'function')
				throw new Error('Expected \'hooks\' to be an object of functions');
		}

		this.ids = new WeakMap();

		Object.assign(this, {
			redis,
			name,
			length,
			filters,
			hooks
		});
	}

	async insert(document) {
		if (typeof document !== 'object')
			throw new Error('Expected \'document\' to be an object');

		if ('insert' in this.hooks)
			await this.hooks.insert.apply(this, arguments);

		const i = await this.redis.incr(keys.counter(this.name));

		const tx = this.redis.multi();

		tx.set(keys.document(this.name, i), JSON.stringify(document));

		tx.lpush(keys.all(this.name), i);

		for (const field of this.filters)
			tx.lpush(keys.field(this.name, field, document[field]), i);

		await tx.exec();

		await this.trim();
	}

	async update(document) {
		if (typeof document !== 'object')
			throw new Error('Expected \'document\' to be an object');

		if (!this.ids.has(document))
			throw new Error('Cannot update unrecognised document');

		if ('update' in this.hooks)
			await this.hooks.update.apply(this, arguments);

		const id = this.ids.get(document);

		const originalDocument = JSON.parse(
			await this.redis.getset(
				keys.document(this.name, id),
				JSON.stringify(document)
			)
		);

		const tx = this.redis.multi();

		for (const field of this.filters) {
			const key = keys.field(this.name, field, document[field]);
			const originalKey = keys.field(this.name, field, originalDocument[field]);

			if (key !== originalKey) {
				tx.lrem(originalKey, 0, id);
				tx.lpush(key, id);
			}
		}

		await tx.exec();
	}

	async find(amount, fields = {}) {
		if (typeof amount !== 'number')
			throw new Error('Expected \'amount\' to be a number');

		if (typeof fields !== 'object')
			throw new Error('Expected \'fields\' to be an object');

		if (Object.keys(fields).length > 1)
			throw new Error('Multiple fields as a filter is not supported yet');

		if ('find' in this.hooks)
			await this.hooks.find.apply(this, arguments);

		const list = Object.keys(fields).length === 0 ?
			`${this.name}:all` :
			`${this.name}:field:${Object.keys(fields)[0]}:${JSON.stringify(Object.values(fields)[0])}`;

		const ids = await this.redis.lrange(list, 0, amount - 1);

		return Promise.all(ids.map(async id => {
			const document = JSON.parse(await this.redis.get(`${this.name}:document:${id}`));
			this.ids.set(document, id);

			return document;
		}));
	}

	async delete(id) {
		if (typeof id === 'object') {
			if (!this.ids.has(id))
				throw new Error('Cannot update unrecognised document');

			id = this.ids.get(id);
		}

		if ('delete' in this.hooks)
			await this.hooks.delete.apply(this, arguments);

		const document = JSON.parse(await this.redis.get(`${this.name}:document:${id}`));

		const tx = this.redis.multi();

		for (const field of this.filters)
			tx.lrem(`${this.name}:field:${field}:${JSON.stringify(document[field])}`, 0, id);

		tx.lrem(`${this.name}:all`, 0, id);
		tx.del(`${this.name}:document:${id}`);

		await tx.exec();
	}

	async trim(length = this.length) {
		if ('trim' in this.hooks)
			await this.hooks.trim.apply(this, arguments);

		const documentIds = await this.redis.lrange(`${this.name}:all`, length - 1, -1);

		for (const documentId of documentIds)
			await this.delete(documentId);
	}
};
