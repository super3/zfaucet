// grab the packages we need
var express = require('express');
var path    = require("path");
var app     = express();
var ejs     = require('ejs');

var port    = process.env.PORT || 5000;
var db      = require('./lib/db.js');
var r = require('rethinkdb');
var connectionConfig = { host: 'localhost', port: 28015 };

// make the css folder viewable
app.use(express.static('public/css'));

var bodyParser = require('body-parser'); // create application/json parser
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// set the view engine to ejs
app.set('view engine', 'ejs');

// index route
app.get('/',function(req, res){
  r.connect(connectionConfig, function(err, conn) {
    if(err) throw err;

    // pass drips to ejs for rendering
    db.latestDrips(conn).then(function(cursor) {
      cursor.toArray(function(err, rows) {
        res.render('index', { drips: rows });
      });
    });

  });
});

// add route
app.post('/api/add', function (req, res) {
  if (!req.body.inputAddress) return res.sendStatus(400);
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
