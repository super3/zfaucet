var shell  = require('shelljs');
var r      = require('rethinkdb');

// internal libs
var db     = require('./lib/db.js');
var config = require('./config.js');

// Check for zcash install
// if (!shell.which('zcash-cli')) {
//   shell.echo('Sorry, this script requires zcash-cli');
//   shell.exit(1);
// }

function doWork(conn) {
  return new Promise(function(resolve, reject) {
    doDrips(conn).then(function() {
      console.log('Drips done');
      updateTransactionIds(conn).then(function() {
        console.log('Update txids done');
        resolve();

        // close up - errors...
        conn.close();
        process.exit();
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
           rows[0].payoutAddress, config.sendingFee);

        // run and check output
        var res = shell.exec(cmd);
        if (res.code !== 0) reject(function() {
          console.log("FAILED! " + res);
        });

        // change drip to processed
        r.table('payouts').get(rows[0].id).update({processed: true,
           operationId: res.stdout.trim()}).run(conn);

      });

      resolve();
    });
  });

}

// $ ./src/zcash-cli z_sendmany "$ZADDR" "[{\"amount\": 0.8, \"address\": \"$FRIEND\"}]"
function createCmd(sendAddress, sendAmount, payAddress, fee) {
  var str = `zcash-cli z_sendmany "${sendAddress}" `;
  str += `"[{\\"amount\\": ${sendAmount},`;
  str += `\\"address\\": \\"${payAddress}\\"}]" 1 ${fee}`;
  return str;
}

module.exports.createCmd = createCmd;

function updateTransactionIds(conn) {
  return new Promise(function(resolve, reject) {
    res = shell.exec('zcash-cli z_getoperationresult');
    sendList = JSON.parse(res.stdout);

    // update the TXID for each operation result
    sendList.forEach(function(transaction) {
      if(!transaction.hasOwnProperty('result')) return;

      // update drips
      console.log('Updating TXID for operation id: ' + transaction.id);
      r.table('payouts').filter({operationId: transaction.id})
        .update({transactionId: transaction.result.txid}).run(conn);
      console.log(`Updated TXID with ${transaction.result.txid}`);
    });

    if (res.code !== 0) reject(function() {
      console.log("Update transaction failed... " + res);
    });
    resolve();
  });
}

// start the server, if running this script alone
if (require.main === module) {
  r.connect(config.connectionConfig, function(err, conn) {
    this.conn = conn;
    if(err) throw err;

    doWork(conn).then(function() {
      console.log('Drips and update txids done');
    });

  });
}
