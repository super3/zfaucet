// grab the packages we need
var express = require('express');
var path    = require("path");
var app     = express();

var port    = process.env.PORT || 5000;
var db      = require('./lib/db.js');

// make the css folder viewable
app.use(express.static('public/css'));

var bodyParser = require('body-parser'); // create application/json parser
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// index route
app.get('/',function(req, res){
  db.latestDrips(); // TODO: Figure out how to insert into template.
  res.sendFile(path.join(__dirname + '/public/index.html'));
  //__dirname : It will resolve to your project folder.
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
