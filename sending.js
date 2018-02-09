var shell = require('shelljs');
var r     = require('rethinkdb');

// internal libs
var db    = require('./lib/db.js');

// vars
var connectionConfig = { host: 'localhost', port: 28015 };
var sendingAddress = 't1KjU2TUgNuWmbyEmYh19AJL5niF5XdUsoa'; // change this
var sendingAmount = 0.0001;

// $ ./src/zcash-cli z_sendmany "$ZADDR" "[{\"amount\": 0.8, \"address\": \"$FRIEND\"}]"

r.connect(connectionConfig, function(err, conn) {
  if(err) throw err;

  db.pendingDrips(conn).then(function(cursor) {
    cursor.toArray(function(err, rows) {
      console.log(rows);
    });
  });

});

// Check for zcash install
// if (!shell.which('zcash-cli')) {
//   shell.echo('Sorry, this script requires zcash-cli');
//   shell.exit(1);
// }

// // Run external tool synchronously
// if (shell.exec('git commit -am "Auto-commit"').code !== 0) {
//   shell.echo('Error: Git commit failed');
//   shell.exit(1);
// }
