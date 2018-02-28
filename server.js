/* eslint capitalized-comments: ["error", "never"] */

const r = require('rethinkdb');
const express = require('express');
const bodyParser = require('body-parser'); // create application/json parser

// create app and config vars
const app = express();

// make the css folder viewable
app.use(express.static('public/css'));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies

// set the view engine to ejs
app.set('view engine', 'ejs');

// internal libs
const config = require('./config.js');
const db = require('./lib/db.js');
const utils = require('./lib/utils.js');
require('./lib/captcha.js');

// index route
app.get('/', (req, res) => {
  r.connect(config.connectionConfig, (err, conn) => {
  	if (err) throw err;

    // pass drips to ejs for rendering
    db.latestDrips(conn).then(cursor => {
      cursor.toArray((err, rows) => {
        // make time in rows human readable, and then send to template
        res.render('index', {drips: utils.readableTime(rows), hashes:
          config.hashes});
      });
    });
  });
});

// add route
app.post('/api/add', (req, res) => {
	// empty input, valid zcash address, then empty captcha
	if (!req.body.inputAddress)	return res.sendStatus(400);
	if (!utils.isAddress(req.body.inputAddress)) return res.sendStatus(400);
	if (!req.body['coinhive-captcha-token']) return res.sendStatus(400);

  // check if captcha is valid
  global.validateCaptcha(req.body['coinhive-captcha-token'])
	.then(response => {
  		// check success response
  		if (JSON.parse(response).success === false) {
  			return res.sendStatus(400);
  		}

      // save to db, and redirect to index
      db.createDrip(req.body.inputAddress);
      res.redirect('/');
  	});
});

// start the server, if running this script alone
/* istanbul ignore next */
if (require.main === module) {
  app.listen(config.port, () => {
    console.log('Server started! At http://localhost:' + config.port);
  });
}

module.exports = app;
