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
        }
});

async function main() {
  var info = await rpc.getinfo();
  console.log(`Current Balance: ${info.balance}`);

  var inputs = await rpc.listunspent();
  if (inputs.length)
    console.log(`Number of Inputs: []`);
  else
    console.log(`Number of Inputs: ${inputs.length}`);

  console.log(inputs);

};

main();
