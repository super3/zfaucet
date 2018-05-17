module.exports = class FilterableList {
	constructor({db, name, filterFields}) {
		if (typeof db !== 'object')
			throw new Error('Expected \'db\' to be a database object');

		if (typeof name !== 'string')
			throw new Error('Expected \'name\' to be a string');

		if (!Array.isArray(filterFields))
			throw new Error('Expected \'filterFields\' to be an array');

		for (const field of filterFields) {
			if (typeof field !== 'string')
				throw new Error('Expected \'filterFields\' to be an array of strings');
		}

		this.db = db;
		this.name = name;
		this.filterFields = filterFields;
	}

	async insert(document) {
		if (typeof document !== 'object')
			throw new Error('Expected document to be an object');

		const i = await this.db.incr(`${this.name}:i`);

		await this.db.set(`${this.name}:document:${i}`, JSON.stringify(document));

		await this.db.rpush(`${this.name}:all`, i);

		for (const field of this.filterFields) {
			await this.db.rpush(`${this.name}:field:${field}`, i);
		}
	}

	async find(amount, fields = {}) {
		if (typeof amount !== 'number')
			throw new Error('Expect \'amount\' to be a number');

		if (typeof fields !== 'object')
			throw new Error('Expected \'fields\' to be an object');

		const list = Object.keys(fields).length === 0 ?
			`${this.name}:all` :
			`${this.name}:field:${Object.values(fields)[0]}`;

		const ids = await this.db.lrange(list, 0, 0 - amount);

		return Promise.all(ids.map(async id =>
			JSON.parse(await this.db.get(`${this.name}:document:${id}`))
		));
	}
};
