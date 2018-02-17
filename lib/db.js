r = require('rethinkdb');
var config = require('../config.js');

function createDrip(payoutAddress) {
  r.connect(config.connectionConfig, function(err, conn) {
    if(err) throw err;

    // build payout object for database insertion
    payoutObj = { payoutAddress: payoutAddress,
       timestamp: new Date(),
       processed: false,
       transactionId: "",
       operationId: ""
     };

    r.table('payouts').insert(payoutObj).run(conn, function(err, res) {
      if(err) throw err;
      //console.log(res);
    });
  });
}

module.exports.createDrip = createDrip;

//createDrip('0x3c2f77619da4225a56b02eae4f9a1e2873435c5b');

function latestDrips(conn) {
  return r.table('payouts').orderBy({index: r.desc('timestamp')}).limit(10).
  run(conn);
}

module.exports.latestDrips = latestDrips;

function pendingDrips(conn) {
  return r.table('payouts').orderBy({index: r.desc('timestamp')}).
  filter({processed: false}).limit(1).run(conn);
}

module.exports.pendingDrips = pendingDrips;
