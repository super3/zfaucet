const fs = require('fs');
const r = require('rethinkdb');
const utils = require('./lib/utils');
const config = require('./config');
const db = require('./lib/db');

async function main() {
	const addrs = fs.readFileSync('feedback.csv', 'utf8')
		.split('\n').map(x => x.split(',')[0]).filter(x => utils.isAddress(x));
	console.log('Addresses:', addrs);

	const conn = await r.connect(config.connectionConfig);
	for (const addr of addrs) {
		console.log('Adding ', addr);
		await db.createDrip(conn, addr, '');
		console.log('Added.');
	}
	process.exit(0);
}

main();
