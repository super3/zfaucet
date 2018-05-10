const fs = require('fs');
const ejs = require('ejs');
const r = require('rethinkdb');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');
const _static = require('koa-static');
const json = require('koa-json');
const Redis = require('ioredis');
const dogNames = require('dog-names');

// const apicache = require('apicache');
const io = require('socket.io')(3012);

// create app and config vars
const app = new Koa();
const router = new Router();

// make the public folder viewable
app.use(async (ctx, next) => {
	try {
		await next();
	} catch (error) {
		ctx.response.status = 500;

		/* istanbul ignore next */
		ctx.body = process.env.NODE_ENV === 'production' ?
			'Internal Server Error' :
			error.toString();
	}
});

app.use(_static('public'));
app.use(bodyParser());
app.use(json());

const cache = time => async (ctx, next) => {
	const key = `cache:${ctx.request.url}`;

	const value = await redis.get(key);

	if (value !== null) {
		ctx.body = JSON.parse(value);

		return;
	}

	await next();

	await redis.set(key, JSON.stringify(ctx.body));
	await redis.expire(key, time);
};

// set the view engine to ejs
// app.set('view engine', 'ejs');

// internal libs
const config = require('./config');
const db = require('./lib/db');
const utils = require('./lib/utils');
const coinhive = require('./lib/coinhive');

// report status via socket.io
io.on('connection', async socket => {
	const resp = await db.onlineStatus();
	socket.emit('online', resp);

	/* istanbul ignore next */
	const interval = setInterval(async () => {
		const resp = await db.onlineStatus();
		socket.emit('online', resp);
	}, 5000);

	/* istanbul ignore next */
	socket.on('disconnect', () => {
		clearInterval(interval);
	});
});

// report status via socket.io
io.on('connection', socket => {
	socket.on('statusReport', async ({address, isMining, hashRate, withdrawPercent}) => {
		db.submitReport({address, isMining, hashRate, withdrawPercent});
	});
});

const pub = new Redis();
const sub = new Redis();

sub.subscribe('messages');

sub.on('message', (channel, message) => {
	console.log(message);
	io.emit('message', JSON.parse(message));
});

/* istanbul ignore next */
io.on('connection', socket => {
	socket.on('chat-init', () => {
		const name = dogNames.allRandom();

		socket.emit('name', name);

		socket.on('message', text => {
			pub.publish('messages', JSON.stringify({
				name,
				text
			}));
		});
	});
});

// middleware
router.use(async (ctx, next) => {
	// create database connection to use in all routes
	// res.set('Content-Type', 'application/json');
	ctx.conn = await r.connect(config.connectionConfig);
	await next();
	ctx.conn.close();
});

const indexTemplate = ejs.compile(fs.readFileSync(`${__dirname}/views/index.ejs`, 'utf8'));

router.get('/', async ctx => {
	const referralAddress = utils.isAddress(ctx.query.referral) ?
		ctx.query.referral : '';

	ctx.body = indexTemplate({
		withdrawThreshold: config.withdrawThreshold,
		referralAddress
	});
});

router.get('/api/recent', cache(30), async ctx => {
	const rows = await db.searchDrips(ctx.conn, {});

	ctx.body = utils.readableTime(rows);
});

router.get('/api/recent/:address', cache(15), async ctx => {
	const payoutAddress = ctx.params.address;

	if (!utils.isAddress(payoutAddress))
		throw new Error('Please enter a valid address');

	// find the drips for the user and return
	const rows = await db.searchDrips(ctx.conn, payoutAddress, {payoutAddress});

	ctx.body = utils.readableTime(rows);
});

router.get('/api/referral/:address', cache(15), async ctx => {
	const referralAddress = ctx.params.address;

	if (!utils.isAddress(referralAddress))
		throw new Error('Please enter a valid address');

	// find the drips for the user and return
	const rows = await db.searchDrips(ctx.conn, {referralAddress});

	ctx.body = utils.readableTime(rows);
});

router.get('/api/balance/:address', async ctx => {
	if (!utils.isAddress(ctx.params.address))
		throw new Error('Please enter a valid address');

	// check the balance from coinhive and return
	ctx.body = await coinhive.getBalance(ctx.params.address);
});

router.get('/api/withdraw/:address', async ctx => {
	if (!utils.isAddress(ctx.params.address))
		throw new Error('Please enter a valid address');

	const referralAddress = utils.isAddress(ctx.query.referral) ?
		ctx.query.referral : '';

	// make sure the user has enough balance
	const balResponse = await coinhive.getBalance(ctx.params.address);

	if (balResponse.balance < config.withdrawThreshold)
		throw new Error('Not enough coins');

	// make sure the withdrawal was successful
	const withReponse = await coinhive.withdraw(ctx.params.address,
		config.withdrawThreshold);

	if (withReponse.success !== true)
		throw new Error('Withdraw Failed');

	// add the withdrawal to the queue and return true
	await db.createDrip(ctx.conn, ctx.params.address, referralAddress);

	ctx.body = true;
});

app
	.use(router.routes())
	.use(router.allowedMethods());

/* istanbul ignore next */
// start the server, if running this script alone
if (require.main === module)
	app.listen(config.port, () => {
		console.log('Server started! At http://localhost:' + config.port);
	});

module.exports = app;
