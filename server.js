const fs = require('fs');
const http = require('http');
const ejs = require('ejs');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');
const _static = require('koa-static');
const json = require('koa-json');
const socketIo = require('socket.io');
const log = require('debug')('zfaucet:server');

const config = require('./config');
const db = require('./lib/db');
const utils = require('./lib/utils');
const coinhive = require('./lib/coinhive');
const reports = require('./lib/reports');

const indexTemplate = ejs.compile(fs.readFileSync(`${__dirname}/views/index.ejs`, 'utf8'));

// create app and config vars
const app = new Koa();
const router = new Router();

// make the public folder viewable
app.use(async (ctx, next) => {
	try {
		await next();
	} catch (error) {
		ctx.response.status = 500;
		log(`error: ${error.message}`);

		/* istanbul ignore next */
		ctx.body = process.env.NODE_ENV === 'production' ?
			'Internal Server Error' :
			error.toString();
	}
});

app.use(_static('public'));
app.use(bodyParser());
app.use(json());

// set the view engine to ejs
// app.set('view engine', 'ejs');

router.get('/', async ctx => {
	ctx.body = indexTemplate({withdrawThreshold: config.withdrawThreshold});
});

router.get('/api/recent', async ctx => {
	const rows = await db.searchDrips({});
	ctx.body = utils.readableTime(rows);
});

router.get('/api/recent/:address', async ctx => {
	const payoutAddress = ctx.params.address;

	if (!utils.isAddress(payoutAddress))
		throw new Error('Please enter a valid address');

	// find the drips for the user and return
	const rows = await db.searchDrips({payoutAddress});

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
	await db.createDrip(ctx.params.address);

	ctx.body = true;
});

router.post('/api/report/:algorithm/:address/:hashRate', async ctx => {
	let {algorithm, address, hashRate} = ctx.params;

	const supportedAlgorithms = [
		'xmr',
		'zec'
	];

	hashRate = Number(hashRate);

	if (supportedAlgorithms.indexOf(algorithm) === -1)
		throw new Error('Please enter a supported algorithm');

	if (!utils.isAddress(address))
		throw new Error('Please enter a valid address');

	if (isNaN(hashRate))
		throw new Error('Please enter a valid hash rate');

	await reports.insert({
		algorithm,
		address,
		hashRate
	});

	ctx.body = true;
});

router.get('/api/reports', async ctx => {
	ctx.body = await reports.find(25);
});

router.get('/api/reports/algorithm/:algorithm', async ctx => {
	ctx.body = await reports.find(25, {
		algorithm: ctx.params.algorithm
	});
});

router.get('/api/reports/address/:address', async ctx => {
	ctx.body = await reports.find(25, {
		address: ctx.params.address
	});
});

app
	.use(router.routes())
	.use(router.allowedMethods());

const server = http.createServer(app.callback());
const io = socketIo(server);

io.on('connection', require('./lib/io/report'));
io.on('connection', require('./lib/io/chat'));

/* istanbul ignore next */
// start the server, if running this script alone
if (require.main === module)
	server.listen(config.port, () => {
		console.log('Server started! At http://localhost:' + config.port);
	});

module.exports = app;
