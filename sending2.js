var r      = require('rethinkdb');
var stdrpc = require('stdrpc');

// internal libs
var db     = require('./lib/db.js');
var config = require('./config.js');

const rpc = stdrpc("http://localhost:8232", {
        req: {
                auth: {
                        username: "a",
                        password: "b"
                }
        }
});

async function main() {
  console.log(await rpc.getinfo());
};

main();
