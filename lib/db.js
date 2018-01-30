r = require('rethinkdb');

var connectionConfig = { host: 'localhost', port: 28015 };

// function setup_table() {
//   r.connect(connectionConfig, function(err, conn) {
//     if(err) throw err;
//     r.tableList().run(conn, function(err, res) {
//       if(res.filter(function(tn) {
//         return tn === 'payouts';
//       }).length === 0) {
//         console.log('table payouts doesnt exist, create it!');
//         r.tableCreate('payouts').indexCreate("timestamp").run(conn, function(err, res) {
//           if(err) throw err;
//           console.log(res);
//         });
//       }
//       console.log('done!');
//     });
//   });
//   return;
// }

function setupTable() {
  return new Promise(function(resolve, reject) {
    r.connect(connectionConfig, function(err, conn) {
      if(err)  reject(err);
      r.tableCreate('payouts').run(conn, function(err, res) {
        if(err)  reject(err);

        r.table('payouts').indexCreate('timestamp').run(conn, function (err, res) {
          console.log('index created on timestamp!');
          if(err)  reject(err);
          resolve();
        });
      });
    });
  });
}

module.exports.setupTable = setupTable;

function createDrip(payoutAddress) {
  r.connect(connectionConfig, function(err, conn) {
    if(err) throw err;

    // build payout object for database insertion
    payoutObj = { payoutAddress: payoutAddress,
       timestamp: new Date(),
       processed: false,
       transactionId: ""
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

//r.table('payouts').indexCreate('timestamp')
