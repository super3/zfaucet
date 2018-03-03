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

	// pass drips to ejs for rendering
	const cursor = await db.latestDrips(conn);
	const rows = await cursor.toArray();

	// const testOut = await coinhive
	// 	.getBalance('t1KjU2TUgNuWmbyEmYh19AJL5niF5XdUsoa');
	// console.log(testOut);

	// make time in rows human readable, and then send to template
	res.render('index', {drips: utils.readableTime(rows), hashes:
	config.hashes});
});

// index route
app.get('/faucet', async (req, res) => {
	const conn = await r.connect(config.connectionConfig);

	// pass drips to ejs for rendering
	const cursor = await db.latestDrips(conn);
	const rows = await cursor.toArray();

	// make time in rows human readable, and then send to template
	res.render('faucet', {drips: utils.readableTime(rows), hashes:
	config.hashes, pubKey: config.coinhivePubKey});
});

// add route
app.post('/api/add', async (req, res) => {
	// empty input, valid zcash address, then empty captcha
	if (!req.body.inputAddress)	return res.sendStatus(400);
	if (!utils.isAddress(req.body.inputAddress)) return res.sendStatus(400);
	if (!req.body['coinhive-captcha-token']) return res.sendStatus(400);

	// check if captcha is valid
	const response = await coinhive.validateCaptcha(
	req.body['coinhive-captcha-token']);

	// check success response
	if (JSON.parse(response).success === false)
		return res.sendStatus(400);

	// save to db, and redirect to index
	db.createDrip(req.body.inputAddress);
	res.redirect('/faucet');
});

/* istanbul ignore next */
// start the server, if running this script alone
if (require.main === module)
	app.listen(config.port, () => {
		console.log('Server started! At http://localhost:' + config.port);
	});

module.exports = app;
