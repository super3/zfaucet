// grab the packages we need
var express = require('express');
var path    = require("path");
var app     = express();
var port    = process.env.PORT || 5000;

// make the css folder viewable
app.use(express.static('public/css'));

// create application/json parser
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// index route
app.get('/',function(req, res){
  res.sendFile(path.join(__dirname + '/public/index.html'));
  //__dirname : It will resolve to your project folder.
});

// add route
app.post('/api/add', function (req, res) {
  if (!req.body) return res.sendStatus(400);
  res.send('Got a POST request: ' + req.body.inputAddress);
});

// start the server, if running this script alone
/* istanbul ignore next */
if (require.main === module) {
  app.listen(port, function() {
    console.log('Server started! At http://localhost:' + port);
  });
}

module.exports = app;
