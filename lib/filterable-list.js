module.exports = class FilterableList {
	constructor({redis, name, length, filters}) {
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

		this.redis = redis;
		this.name = name;
		this.length = length;
		this.filters = filters;
	}

	async insert(document) {
		if (typeof document !== 'object')
			throw new Error('Expected document to be an object');

		const i = await this.redis.incr(`${this.name}:i`);

		await this.redis.set(`${this.name}:document:${i}`, JSON.stringify(document));

		await this.redis.lpush(`${this.name}:all`, i);

		for (const field of this.filters)
			await this.redis.lpush(`${this.name}:field:${field}:${document[field]}`, i);

		await this.trim();
	}

	async find(amount, fields = {}) {
		if (typeof amount !== 'number')
			throw new Error('Expect \'amount\' to be a number');

		if (typeof fields !== 'object')
			throw new Error('Expected \'fields\' to be an object');

		const list = Object.keys(fields).length === 0 ?
			`${this.name}:all` :
			`${this.name}:field:${Object.keys(fields)[0]}:${Object.values(fields)[0]}`;

		const ids = await this.redis.lrange(list, 0, amount - 1);

		return Promise.all(ids.map(async id =>
			JSON.parse(await this.redis.get(`${this.name}:document:${id}`))
		));
	}

	async delete(id) {
		const document = JSON.parse(await this.redis.get(`${this.name}:document:${id}`));

		for (const field of this.filters)
			await this.redis.lrem(`${this.name}:field:${field}:${document[field]}`, 0, id);

		await this.redis.lrem(`${this.name}:all`, 0, id);
		await this.redis.del(`${this.name}:document:${id}`);
	}

	async trim() {
		const documentIds = await this.redis.lrange(`${this.name}:all`, this.length - 1, -1);

		for (const documentId of documentIds)
			await this.delete(documentId);
	}
};
