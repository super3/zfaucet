var shell  = require('shelljs');
var r      = require('rethinkdb');

// internal libs
var db     = require('./lib/db.js');
var config = require('./config.js');

// $ ./src/zcash-cli z_sendmany "$ZADDR" "[{\"amount\": 0.8, \"address\": \"$FRIEND\"}]"

// Check for zcash install
// if (!shell.which('zcash-cli')) {
//   shell.echo('Sorry, this script requires zcash-cli');
//   shell.exit(1);
// }

r.connect(config.connectionConfig, function(err, conn) {
  if(err) throw err;

  doWork(conn).then(function() {
    console.log('drips and update txids done');
    exit(0);
  });

});


function doWork(conn) {
  return new Promise(function(resolve, reject) {
    doDrips(conn).then(function() {
      console.log('drips done');
      updateTransactionIds(conn).then(function() {
        console.log('update txids done');
        resolve();
      });
    });
  });
}

function doDrips(conn) {
  return new Promise(function(resolve, reject) {
    db.pendingDrips(conn).then(function(cursor) {
      cursor.toArray(function(err, rows) {
        if(err) return;
        if(rows.length === 0) return;

        var cmd = createCmd(config.sendingAddress, config.sendingAmount,
           rows[0].payoutAddress);

        // run and check output
        var res = shell.exec(cmd);
        if (res.code !== 0) reject(function() {
          console.log("FAILED! " + res);
        });

        // update drip
        r.table('payouts').get(rows[0].id).update({processed: true,
           operationId: res.stdout.trim()}).run(conn);
        resolve();
      });
    });
  });

}

function createCmd(sendAddress, sendAmount, payAddress) {
  var str = `zcash-cli z_sendmany "${sendAddress}" `;
  str += `"[{\\"amount\\": ${sendAmount},`;
  str += `\\"address\\": \\"${payAddress}\\"}]"`;
  return str;
}

function updateTransactionIds(conn) {
  return new Promise(function(resolve, reject) {
    // Run external tool synchronously
    res = shell.exec('zcash-cli z_getoperationresult');
    sendList = JSON.parse(res.stdout);
    sendList.forEach(function(transaction) {
      if(!transaction.hasOwnProperty('result')) return;
      console.log('updating txid ' + transaction.id);
      var record = r.table('payouts').filter({operationId: transaction.id})
                    .update({transactionId: transaction.result.txid}).run(conn);
      console.log('updated txid with ' + transaction.result.txid);
    });
    //console.log(sendList);
    if (res.code !== 0) reject(function() {
      console.log("FAILED! " + res);
    });
    resolve();
  });
}
