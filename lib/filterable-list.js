module.exports = class FilterableList {
	constructor({redis, name, filters}) {
		if (typeof redis !== 'object')
			throw new Error('Expected \'redis\' to be a database object');

		if (typeof name !== 'string')
			throw new Error('Expected \'name\' to be a string');

		if (!Array.isArray(filters))
			throw new Error('Expected \'filters\' to be an array');

		for (const field of filters) {
			if (typeof field !== 'string')
				throw new Error('Expected \'filters\' to be an array of strings');
		}

		this.redis = redis;
		this.name = name;
		this.filters = filters;
	}

	async insert(document) {
		if (typeof document !== 'object')
			throw new Error('Expected document to be an object');

		const i = await this.redis.incr(`${this.name}:i`);

		await this.redis.set(`${this.name}:document:${i}`, JSON.stringify(document));

		await this.redis.lpush(`${this.name}:all`, i);

		for (const field of this.filters) {
			await this.redis.lpush(`${this.name}:field:${field}:${document[field]}`, i);
		}
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
};
