// grab the packages we need
var express = require('express');
var path    = require("path");
var app     = express();
var port    = process.env.PORT || 8080;

// make the /public folder viewable
app.use(express.static('public'));

// index route
app.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/public/index.html'));
  //__dirname : It will resolve to your project folder.
});

// start the server
app.listen(port);
console.log('Server started! At http://localhost:' + port);
