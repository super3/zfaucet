// get external modules
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

// get internal config
var config = require('../config.js');

// setup mongo
mongoose.connect('mongodb://' + config.mongoHost + ':' +
 config.mongoPort + '/' + config.mongoName);

// define image schema
var dripSchema = new mongoose.Schema({
  dripId: mongoose.Schema.Types.ObjectId,
  payoutAddress: String,
  transactionId: String
});
var dripModel = mongoose.model('dripModel', dripSchema);
module.exports.dripModel = dripModel;

// create thread
function createDrip(payoutAddress, callback) {

  // create drip
  var drip  = new imageModel({
    //imageId: thread.imageId, // fix this
    payoutAddress: payoutAddress,
    transactionId: "Pending..."
  });

  // save the drip to the db
  drip.save(callback);

}

module.exports.createDrip = createDrip;
