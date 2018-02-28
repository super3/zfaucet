var r      = require('rethinkdb');
var stdrpc = require('stdrpc');

// internal libs
var db     = require('./lib/db.js');
var config = require('./config.js');
var utils  = require('./lib/utils.js');
const rpc = require("./lib/rpc.js");

async function findInputs(conn) {
  const balance = await rpc.getbalance();
  console.log(`Current Balance: ${balance}`);

  // check if we have enought money to send
  const balMinusSend = balance -
    (config.sendingAmount * config.dripsPerSend) - config.sendingFee;
  if (balMinusSend <= 0)
    throw new Error("Not enough to send.");

  var inputs = await rpc.listunspent();
  if(inputs.length === 0)
    throw new Error("No inputs.");

  console.log(`Number of Inputs: ${inputs.length}\n`);

  const large = utils.indexOfMax(inputs);
  console.log(`Largest Input Amount: ${inputs[large].amount}`);
  console.log(`Largest Input Address: ${inputs[large].address}\n`);

  console.log(inputs[large].address);
  return inputs[large].address;
}

module.exports.findInputs = findInputs;

async function sendDrip(conn, sendingAddress) {
    const cursor = await db.pendingDrips(conn);
    const rows = await cursor.toArray();
    if(rows.length === 0) return;

    var opid = await rpc.zSendmany(sendingAddress, [
    	{
    			address: rows[0].payoutAddress,
    			amount: config.sendingAmount,
    	},
    ], 1, config.sendingFee);

    // change drip to processed
    await r.table('payouts').get(rows[0].id).update({processed: true,
       operationId: opid}).run(conn);

    console.log(`Send Was: ${opid}\n`);
    return opid;
}

module.exports.sendDrip = sendDrip;

async function updateDrips(conn) {
  var operations = await rpc.zGetoperationresult();
  for(let transaction of operations) {
    if(!transaction.hasOwnProperty('result')) continue;

    // update drips
    console.log('Updating TXID for operation id: ' + transaction.id);
    await r.table('payouts').filter({operationId: transaction.id})
      .update({transactionId: transaction.result.txid}).run(conn);
    console.log(`Updated TXID with ${transaction.result.txid}`);
  }

  return conn;
}

module.exports.updateDrips = updateDrips;

// start the server, if running this script alone
if (require.main === module) {
  r.connect(config.connectionConfig, function(err, conn) {
    this.conn = conn;
    if(err) throw err;

    findInputs(conn).then(sendingAddress => {
      sendDrip(conn, sendingAddress).then(opid => {
        updateDrips(conn).then(conn => {
          // close up - errors...
          conn.close();
          process.exit();
          console.log('Closing...');
        });
      });
    });

  });
}
