const r = require('rethinkdb');
const express = require('express');
const bodyParser = require('body-parser'); // create application/json parser
const apicache = require('apicache');
const io = require('socket.io')(3012);
const Redis = require('ioredis');

// create app and config vars
const app = express();
const cache = apicache.middleware;
const redis = new Redis();

// make the public folder viewable
app.use(express.static('public'));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies

// set the view engine to ejs
app.set('view engine', 'ejs');

// internal libs
const config = require('./config');
const db = require('./lib/db');
const utils = require('./lib/utils');
const coinhive = require('./lib/coinhive');

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

// report status via socket.io
io.on('connection', async socket => {
	const resp = await onlineStatus();
	socket.emit('online', resp);

	/* istanbul ignore next */
	setInterval(async () => {
		const resp = await onlineStatus();
		socket.emit('online', resp);
	}, 5000);
});

// report status via socket.io
io.on('connection', socket => {
	socket.on('statusReport', async ({address, isMining, hashRate, withdrawPercent}) => {
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
	});
});

// middleware
app.use(async (req, res, next) => {
	// create database connection to use in all routes
	req.conn = await r.connect(config.connectionConfig);
	const {end} = res;

	// close the connection on res.end
	res.end = function (...args) {
		req.conn.close();
		end.apply(this, args);
	};

	// set default content-type
	res.set('Content-Type', 'application/json');
	next();
});

app.get('/', async (req, res) => {
	const referralAddress = utils.isAddress(req.query.referral) ?
		req.query.referral : '';
	res.set('Content-Type', 'text/html');
	res.render('index', {withdrawThreshold: config.withdrawThreshold,
		referralAddress});
});

app.get('/api/check/:address', (req, res) => {
		res.end(JSON.stringify(utils.isAddress(req.params.address)));
});

app.get('/api/recent', cache('30 seconds'), async (req, res) => {
	const rows = await db.searchDrips(req.conn, {});
	res.end(JSON.stringify(utils.readableTime(rows)));
});

app.get('/api/recent/:address', cache('15 seconds'), async (req, res) => {
	const payoutAddress = req.params.address;
	if (!utils.isAddress(payoutAddress)) return res.sendStatus(401);

	// find the drips for the user and return
	const rows = await db.searchDrips(req.conn, payoutAddress, {payoutAddress});
	res.end(JSON.stringify(utils.readableTime(rows)));
});

app.get('/api/referral/:address', cache('15 seconds'), async (req, res) => {
	const referralAddress = req.params.address;
	if (!utils.isAddress(referralAddress)) return res.sendStatus(401);

	// find the drips for the user and return
	const rows = await db.searchDrips(req.conn, {referralAddress});
	res.end(JSON.stringify(utils.readableTime(rows)));
});

app.get('/api/balance/:address', async (req, res) => {
	if (!utils.isAddress(req.params.address)) return res.sendStatus(401);

	// check the balance from coinhive and return
	const response = await coinhive.getBalance(req.params.address);
	res.end(JSON.stringify(response));
});

app.get('/api/withdraw/:address', async (req, res) => {
	if (!utils.isAddress(req.params.address)) return res.sendStatus(401);
	const referralAddress = utils.isAddress(req.query.referral) ?
		req.query.referral : '';

	// make sure the user has enough balance
	const balResponse = await coinhive.getBalance(req.params.address);
	if (balResponse.balance < config.withdrawThreshold)
		return res.sendStatus(402);

	// make sure the withdrawal was successful
	const withReponse = await coinhive.withdraw(req.params.address,
		config.withdrawThreshold);
	if (withReponse.success !== true) return res.sendStatus(403);

	// add the withdrawal to the queue and return true
	await db.createDrip(req.conn, req.params.address, referralAddress);
	res.end('true');
});

/* istanbul ignore next */
// start the server, if running this script alone
if (require.main === module)
	app.listen(config.port, () => {
		console.log('Server started! At http://localhost:' + config.port);
	});

module.exports = app;
