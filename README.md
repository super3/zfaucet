# zecfaucet
Simple Zcash(ZEC) faucet built with Node.

[![Build Status](https://travis-ci.org/super3/zfaucet.svg?branch=master)](https://travis-ci.org/super3/zfaucet)
[![Coverage Status](https://coveralls.io/repos/github/super3/zfaucet/badge.svg?branch=master)](https://coveralls.io/github/super3/zfaucet?branch=master)
[![License](https://img.shields.io/badge/license-AGPLv3-blue.svg?label=license)](https://github.com/Storj/super3/zfaucet/blob/master/LICENSE)

## DB and Zcash Setup
#### Download and Install RethinkDB
```bash
source /etc/lsb-release && echo "deb http://download.rethinkdb.com/apt $DISTRIB_CODENAME main" | sudo tee /etc/apt/sources.list.d/rethinkdb.list
wget -qO- https://download.rethinkdb.com/apt/pubkey.gpg | sudo apt-key add -
sudo apt-get update
sudo apt-get install rethinkdb
```

#### Create Index for Timestamp
```bash
npm install -g recli
recli 'r.db("test").tableCreate("payouts")'
recli 'r.table("payouts").indexCreate("timestamp")'
```

### Install Zcash
Use the [Zcash Debian binary packages](https://github.com/zcash/zcash/wiki/Debian-binary-packages) install guide. The [Zcash 1.0 User Guide](https://github.com/zcash/zcash/wiki/1.0-User-Guide) has additional information if needed. Will have to fully sync before you can send any payments. 

### Install & Run
```
git clone https://github.com/super3/zfaucet
cd ~/zfaucet
npm install
npm install -g nodemon
nodemon server.js
```

#### Sending Script
We run this as a crontab ```*/5 * * * * ~/script.sh >> ~/zlog.log``` every 5 minutes.
```bash
#!/usr/bin/env sh
cd ~/zfaucet
git fetch && git reset --hard origin/master
echo "captchaApiKey=[Coinhive API KEY]" > ~/zfaucet/.env
/root/.nvm/versions/node/v8.9.4/bin/node ~/zfaucet/sending.js
```
