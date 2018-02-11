# zecfaucet
Simple Zcash(ZEC) faucet built with Node.

[![Build Status](https://travis-ci.org/super3/zecfaucet.svg?branch=master)](https://travis-ci.org/super3/zecfaucet)
[![Coverage Status](https://coveralls.io/repos/github/super3/zecfaucet/badge.svg?branch=master)](https://coveralls.io/github/super3/zecfaucet?branch=master)
[![License](https://img.shields.io/badge/license-AGPLv3-blue.svg?label=license)](https://github.com/Storj/super3/zecfaucet/blob/master/LICENSE)

### Install
```
npm install
```

#### DB Setup - Install on Linux
```
source /etc/lsb-release && echo "deb http://download.rethinkdb.com/apt $DISTRIB_CODENAME main" | sudo tee /etc/apt/sources.list.d/rethinkdb.list
wget -qO- https://download.rethinkdb.com/apt/pubkey.gpg | sudo apt-key add -
sudo apt-get update
sudo apt-get install rethinkdb
```

#### DB Setup - Create Index for Timestamp
```
npm install -g recli
recli 'r.db("test").tableCreate("payouts")'
recli 'r.table("payouts").indexCreate("timestamp")'
```

### Running
Start RethinkDB:
```
rethinkdb
```

Start the app:
```
npm start
```

### Testing
```
npm run test
```

### Coverage
```
npm run coverage
```

### Linting
```
npm run linter
```
