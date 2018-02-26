var r      = require('rethinkdb');
var stdrpc = require('stdrpc');

// internal libs
var db     = require('./lib/db.js');
var config = require('./config.js');

const rpc = stdrpc("http://localhost:8232", {
        req: {
                auth: {
                        username: config.rpcuser,
                        password: config.rpcpass
                }
        },
        methodTransform: require("decamelize")
});

function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }

    var max = arr[0].amount;
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i].amount > max) {
            maxIndex = i;
            max = arr[i].amount;
        }
    }

    return maxIndex;
}

async function findInputs(conn) {
  var info = await rpc.getinfo();
  console.log(`Current Balance: ${info.balance}`);

  var inputs = await rpc.listunspent();
  if (inputs.length) {
    console.log(`Number of Inputs: ${inputs.length}\n`);

    const large = indexOfMax(inputs);
    console.log(`Largest Input Amount: ${inputs[large].amount}`);
    console.log(`Largest Input Address: ${inputs[large].address}\n`);

    return inputs[large].address;
  }
  else {
    console.log(`No Inputs. Exiting...`);
    process.exit();
  }

  console.log(inputs);

}

async function sendDrip(conn, sendingAddress) {

  db.pendingDrips(conn).then(function(cursor) {
    cursor.toArray(async function(err, rows) {
      if(err) return;
      if(rows.length === 0) return;

      var opid = await rpc.zSendmany(sendingAddress, [
      	{
      			address: rows[0].payoutAddress,
      			amount: config.sendingAmount,
      	},
      ], 1, config.sendingFee);

      // change drip to processed
      r.table('payouts').get(rows[0].id).update({processed: true,
         operationId: opid}).run(conn);

      console.log(`Send Was: ${opid}\n`);

    });

  });
}

async function updateDrips(conn) {
  var operations = await rpc.zGetoperationresult();
  await operations.forEach(async function(transaction) {
    if(!transaction.hasOwnProperty('result')) return;

    // update drips
    console.log('Updating TXID for operation id: ' + transaction.id);
    await r.table('payouts').filter({operationId: transaction.id})
      .update({transactionId: transaction.result.txid}).run(conn);
    console.log(`Updated TXID with ${transaction.result.txid}`);
  });

  return conn;
}

// start the server, if running this script alone
if (require.main === module) {
  r.connect(config.connectionConfig, function(err, conn) {
    this.conn = conn;
    if(err) throw err;

    findInputs(conn).then(sendingAddress => {
      sendDrip(conn, sendingAddress).then(opid => {
        updateDrips(conn).then(conn => {
          // close up - errors...
          // conn.close();
          // process.exit();
          console.log('close');
        });
      });
    });

  });
}
