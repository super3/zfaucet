// packages we need
var express = require('express');
var path    = require("path");
var app     = express();
var ejs     = require('ejs');
var r       = require('rethinkdb');

// config vars
var port    = process.env.PORT || 5000;
var config = require('./config.js');

// internal libs
var db      = require('./lib/db.js');
var utils   = require('./lib/utils.js');

// make the css folder viewable
app.use(express.static('public/css'));

var bodyParser = require('body-parser'); // create application/json parser
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// set the view engine to ejs
app.set('view engine', 'ejs');

// index route
app.get('/',function(req, res){
  r.connect(config.connectionConfig, function(err, conn) {
    if(err) throw err;

    // pass drips to ejs for rendering
    db.latestDrips(conn).then(function(cursor) {
      cursor.toArray(function(err, rows) {
        // make human reable in table
        for (var rowTime in rows) {
          var text = "Pending...";
          rows[rowTime].timestamp = utils.timeSince(rows[rowTime].timestamp);
          if (!rows[rowTime].transactionId) rows[rowTime].transactionId = text;
        }
        res.render('index', { drips: rows });
      });
    });

  });
});

// add route
app.post('/api/add', function (req, res) {
  // validate address
  if (!req.body.inputAddress) return res.sendStatus(400);
  else if (!utils.isAddress(req.body.inputAddress)) return res.sendStatus(400);

  // save to db, and redirect to index
  db.createDrip(req.body.inputAddress);
  res.redirect('/'); // TODO: Figure out how to use AJAX, and remove this.
});

// start the server, if running this script alone
/* istanbul ignore next */
if (require.main === module) {
  app.listen(port, function() {
    console.log('Server started! At http://localhost:' + port);
  });
}

module.exports = app;
