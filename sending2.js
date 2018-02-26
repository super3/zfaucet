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

async function findInputs() {
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

async function sendDrip(sendingAddress) {
  var opid = await rpc.zSendmany(sendingAddress, [
  	{
  			address: 't1eMCcdpDXaSgRR7HTHKhGARTGacgPUddVt',
  			amount: 0.000001,
  	},
  ], 1, 0.000001);
  return opid;
}

async function updateDrips() {
  console.log('got here');
  var operations = await rpc.zGetoperationresult();
  operations.forEach(function(transaction) {
    if(!transaction.hasOwnProperty('result')) return;

    console.log(transction.id);
    console.log(transction.result.txid);
  });
}

findInputs().then(sendingAddress => {
  sendDrip(sendingAddress).then(opid => {
    console.log(opid);
    updateDrips();
  });
});
