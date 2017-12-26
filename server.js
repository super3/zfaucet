// grab the packages we need
var express = require('express');
var path    = require("path");
var app     = express();
var port    = process.env.PORT || 8080;
app.use(express.static('public'));

// routes go here
app.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/public/index.html'));
  //__dirname : It will resolve to your project folder.
});

// start the server
app.listen(port);
console.log('Server started! At http://localhost:' + port);
