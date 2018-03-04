/* eslint capitalized-comments: ["error", "never"] */
/* eslint curly: ["error", "multi"] */

const r = require('rethinkdb');
const express = require('express');
const bodyParser = require('body-parser'); // create application/json parser

// create app and config vars
const app = express();

// make the css folder viewable
app.use(express.static('public/css'));
app.use(express.static('public/js'));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies

// set the view engine to ejs
app.set('view engine', 'ejs');

// internal libs
const config = require('./config');
const db = require('./lib/db');
const utils = require('./lib/utils');
const coinhive = require('./lib/coinhive');

// index route
app.get('/', async (req, res) => {
	const conn = await r.connect(config.connectionConfig);
	const rows = await db.latestDrips(conn);

	// make time in rows human readable, and then send to template
	res.render('index', {drips: utils.readableTime(rows), hashes:
	config.hashes, withdrawThreshold: config.withdrawThreshold});
});

// recent route
app.get('/api/recent', async (req, res) => {
	const conn = await r.connect(config.connectionConfig);
	const rows = await db.latestDrips(conn);
	res.send(JSON.stringify(utils.readableTime(rows)));
});

// recent address route
app.get('/api/recent/:address', async (req, res) => {
	if (!utils.isAddress(req.params.address)) return res.sendStatus(401);

	const conn = await r.connect(config.connectionConfig);
	const rows = await db.userDrips(conn, req.params.address);
	res.send(JSON.stringify(utils.readableTime(rows)));
});

app.get('/api/balance/:address', async (req, res) => {
	if (!utils.isAddress(req.params.address)) return res.sendStatus(401);

	const response = await coinhive.getBalance(req.params.address);
	res.set('Content-Type', 'application/json');
	res.send(JSON.stringify(response));
});

app.get('/api/withdraw/:address', async (req, res) => {
	const conn = await r.connect(config.connectionConfig);
	if (!utils.isAddress(req.params.address)) return res.sendStatus(401);

	// make sure the user has enough balance
	const balResponse = await coinhive.getBalance(req.params.address);
	if (balResponse.balance < config.withdrawThreshold)
		return res.sendStatus(402);

	// make sure the withdrawal was successful
	const withReponse = await coinhive.withdraw(req.params.address,
		config.withdrawThreshold);
	if (withReponse.success !== true) return res.sendStatus(403);

	await db.createDrip(conn, req.params.address);
	res.end('true');
});

/* istanbul ignore next */
// start the server, if running this script alone
if (require.main === module)
	app.listen(config.port, () => {
		console.log('Server started! At http://localhost:' + config.port);
	});

module.exports = app;
