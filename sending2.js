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

async function findInputs() {
  var info = await rpc.getinfo();
  console.log(`Current Balance: ${info.balance}`);

  var inputs = await rpc.listunspent();
  if (inputs.length) {
    console.log(`Number of Inputs: ${inputs.length}\n`);

    console.log(`First Input Amount: ${inputs[0].amount}`);
    console.log(`First Input Address: ${inputs[0].address}\n`);

    return inputs[0].address;
  }
  else {
    console.log(`No Inputs. Exiting...`);
    process.exit();
  }

  console.log(inputs);

}

findInputs().then(sendingAddress => {
  console.log(sendingAddress);
  var output = await rpc.zSendmany(sendingAddress, [
  	{
  			address: sendingAddress,
  			amount: 0.000001,
  	},
  ], 1, 0.000001);

});
