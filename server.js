const r = require('rethinkdb');
const express = require('express');
const bodyParser = require('body-parser'); // create application/json parser
const apicache = require('apicache');

// create app and config vars
const app = express();
const cache = apicache.middleware;

// make the css folder viewable
app.use(express.static('public/css'));
app.use(express.static('public/js'));
app.use(express.static('public/assets'));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies

// set the view engine to ejs
app.set('view engine', 'ejs');

// internal libs
const config = require('./config');
const db = require('./lib/db');
const utils = require('./lib/utils');
const coinhive = require('./lib/coinhive');

// middleware
app.use(async (req, res, next) => {
	req.conn = await r.connect(config.connectionConfig);
	const {end} = res;

	res.end = function (...args) {
		req.conn.close();
		end.apply(this, args);
	};

	next();
});

app.get('/', async (req, res) => {
	res.render('index', {withdrawThreshold: config.withdrawThreshold});
});

app.get('/api/check/:address', (req, res) => {
		res.set('Content-Type', 'application/json');
		res.end(JSON.stringify(utils.isAddress(req.params.address)));
});

app.get('/api/recent', cache('30 seconds'), async (req, res) => {
	const rows = await db.latestDrips(req.conn);
	res.set('Content-Type', 'application/json');
	res.end(JSON.stringify(utils.readableTime(rows)));
});

app.get('/api/recent/:address', cache('15 seconds'), async (req, res) => {
	if (!utils.isAddress(req.params.address)) return res.sendStatus(401);

	// find the drips for the user and return
	const rows = await db.userDrips(req.conn, req.params.address);
	res.set('Content-Type', 'application/json');
	res.end(JSON.stringify(utils.readableTime(rows)));
});

app.get('/api/balance/:address', async (req, res) => {
	if (!utils.isAddress(req.params.address)) return res.sendStatus(401);

	// check the balance from coinhive and return
	const response = await coinhive.getBalance(req.params.address);
	res.set('Content-Type', 'application/json');
	res.end(JSON.stringify(response));
});

app.get('/api/withdraw/:address', async (req, res) => {
	if (!utils.isAddress(req.params.address)) return res.sendStatus(401);

	// make sure the user has enough balance
	const balResponse = await coinhive.getBalance(req.params.address);
	if (balResponse.balance < config.withdrawThreshold)
		return res.sendStatus(402);

	// make sure the withdrawal was successful
	const withReponse = await coinhive.withdraw(req.params.address,
		config.withdrawThreshold);
	if (withReponse.success !== true) return res.sendStatus(403);

	// add the withdrawal to the queue and return true
	await db.createDrip(req.conn, req.params.address);
	res.end('true');
});

/* istanbul ignore next */
// start the server, if running this script alone
if (require.main === module)
	app.listen(config.port, () => {
		console.log('Server started! At http://localhost:' + config.port);
	});

module.exports = app;
