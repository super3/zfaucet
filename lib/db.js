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
    });
  });
}

module.exports.createDrip = createDrip;

function latestDrips(conn) {
  return r.table('payouts').orderBy({index: r.desc('timestamp')}).
  limit(config.displayPendingNum).run(conn);
}

module.exports.latestDrips = latestDrips;

function pendingDrips(conn) {
  return r.table('payouts').orderBy({index: r.desc('timestamp')}).
  filter({processed: false}).limit(config.dripsPerSend).run(conn);
}

module.exports.pendingDrips = pendingDrips;
