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

  db.pendingDrips(conn).then(function(cursor) {
    cursor.toArray(function(err, rows) {
      var command = 'zcash-cli z_sendmany "' + config.sendingAddress +
       '" [{\"amount\": ' + config.sendingAmount + ', \"address\": \"' +
        rows[0].payoutAddress + '\"}]"';
       console.log(command);
    });
  });

});

// // Run external tool synchronously
// if (shell.exec('git commit -am "Auto-commit"').code !== 0) {
//   shell.echo('Error: Git commit failed');
//   shell.exit(1);
// }
