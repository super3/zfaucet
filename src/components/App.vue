<template>
	<div class="container">
	<div class="card-deck mb-3 text-center">
	  <div class="card mb-4 box-shadow">
		<div class="card-header">
		  <h4 class="my-0 font-weight-normal">1. Wallet</h4>
		</div>

		<div class="card-body">
		  <div v-bind:class="{ hidden: mining }">
			<label><b>Your Wallet Address:</b></label>
			<input type="text" class="form-control bottom-space"
			 placeholder="Your ZEC Address (e.g. t1hASvMj8e6TXWryuB3L5TKXJB7XfNioZP3)"
			 v-model.trim="address" v-on:change="validateAddress"
			 v-bind:class="{ hidden: mining, 'is-valid': addressValid, 'is-invalid': !addressValid }">

			<label><b>Suggested Wallets:</b></label>
			<a href="https://walletgenerator.net/?currency=Zcash"
			  target="_blank"
			  class="btn btn-lg btn-block btn-outline-primary">
			  WalletGenerator.net</a>
			<a href="https://jaxx.io/" target="_blank"
			  class="btn btn-lg btn-block btn-outline-primary">Jaxx</a>
		  </div>
		  <div v-bind:class="{ hidden: !mining }" v-cloak>
			<h1 class="card-title pricing-card-title">{{timeRemaining}}
			  <small class="text-muted">left</small>
			</h1>
			<div class="progress progress-extra">
			  <div class="progress-bar bg-success" role="progressbar"
				v-bind:style="{ width: acceptedPercent + '%' }">
				<span class="progress-percent">
				  {{totalPercent.toFixed(2)}}%
				</span>
			  </div>
			  <div class="progress-bar pend-bar bg-success bg-warning"
			  role="progressbar"
			  v-bind:style="{ width: pendingPercent + '%' }"></div>
			</div>

			<ul class="list-unstyled mt-3 mb-4">
			  <li><b>Pending:</b> {{totalHashes}} hashes</li>
			  <li><b>Balance:</b> {{hashBalance}} hashes</li>
			</ul>
			<button type="submit"
			 class="btn btn-lg btn-block btn-primary bottom-space-small"
			 v-bind:disabled="hashBalance < withdrawThreshold"
			 v-on:click="withdraw"
			>
			  <span style="top: 4px;" class="oi oi-action-undo"></span> Withdraw
			  <span v-if="acceptedPercent >= 200">
				({{ Math.floor(hashBalance / withdrawThreshold) }}x)
			  </span>
			</button>
		  </div>
		</div>
	  </div>
	  <div class="card mb-4 box-shadow">
		<div class="card-header">
		  <h4 class="my-0 font-weight-normal">2. Mine Online</h4>
		</div>
		<div class="card-body">
		  <h1 class="card-title pricing-card-title" v-cloak>
			{{hashesPerSecond.toFixed(2)}} <small class="text-muted"> hashes/s </small>
		  </h1>

		  <table class="table big-table" style="margin-bottom: 10px;">
		  <tbody>
			<tr>
			  <th scope="row">{{numThreads}} Thread(s)</th>
			  <td>
				<button type="button" class="link"
				  v-on:click="upThreads"
				  v-bind:class="{ linkt: numThreads === 16 }"
				>+</button> /
				<button type="button" class="link"
				  v-on:click="downThreads"
				  v-bind:class="{ linkt: numThreads === 1 }"
				>-</button>
			  </td>
			</tr>
			<tr>
			  <th scope="row">{{100-numThrottle}}% Speed</th>
			  <td>
				<button type="button" class="link"
				  v-on:click="downThrottle"
				  v-bind:class="{ linkt: (100-numThrottle) === 100 }"
				  >+</button> /
				<button type="button" class="link"
				 v-on:click="upThrottle"
				 v-bind:class="{ linkt: (100-numThrottle) === 10 }"
				>-</button>
			  </td>
			</tr>
		  </tbody>
		</table>

		  <button type="submit" class="btn btn-lg btn-block btn-success"
			 v-bind:class="{ hidden: mining }"
			 v-bind:disabled="address == ''"
			 v-on:click="startMining"
		   >
			<span style="top: 4px; margin-right: 3px;"
			  class="oi oi-play-circle center-icon"></span> Start Mining
		  </button>

		  <button type="submit" class="btn btn-lg btn-block btn-danger"
			 v-bind:class="{ hidden: !mining }"
			 v-on:click="stopMining"
			 v-cloak
		   >
			<span style="top: 4px; margin-right: 3px;"
			  class="oi oi-media-stop center-icon"></span> Stop Mining
		  </button>
		</div>
	  </div>
	  <div class="card mb-4 box-shadow">
		<div class="card-header">
		  <h4 class="my-0 font-weight-normal">
			3. Download GUI</h4>
		</div>
		<div class="card-body">
		  <h1 class="card-title pricing-card-title">
			zMine <small class="text-muted"> v0.2.3</small>
		  </h1>
		  <ul class="list-unstyled mt-3 mb-4">
			<li>One click mining support</li>
			<li>Open source / free software</li>
			<li>CPU, NVIDIA, and AMD mining</li>
			<li>Automatic miner downloads</li>
		  </ul>

		  <a href="https://github.com/super3/zmine/releases"
			target="_blank" class="btn btn-lg btn-block btn-primary">
			<span class="oi oi-cloud-download"
			  style="top: 4px; margin-right: 3px;"></span> Download
		  </a>
		</div>
	  </div>
	  <div class="card text-center box-shadow">
		<div class="card-header">
		  <ul class="nav nav-tabs card-header-tabs">
			<li class="nav-item">
			  <a class="nav-link" href="#"
				v-bind:class="{ active: currentTab === 0 }"
				v-on:click="currentTab=0">Recent</a>
			</li>
			<li class="nav-item" v-if="mining">
			  <a class="nav-link" href="#"
				v-bind:class="{ active: currentTab === 1 }"
				v-on:click="currentTab=1">My Transactions</a>
			</li>
			<li class="nav-item" v-if="mining">
			  <a class="nav-link" href="#"
				v-bind:class="{ active: currentTab === 2 }"
				v-on:click="currentTab=2">My Referrals</a>
			</li>
		  </ul>
		</div>
		<div class="card-body" v-if="currentTab === 0">
		  <online-table v-bind:online="online"></online-table>
		  <transactions-table v-bind:drips="transactions"></transactions-table>
		</div>
		<div class="card-body" v-if="currentTab === 1">
		  <div class="bottom-space">
			<div class="bold">Current Payout Rate:</div>
			<p>~100 sats / <%= withdrawThreshold/1000 %>k hashes</p>
		  </div>
		  <transactions-table v-bind:drips="userTransactions"></transactions-table>
		</div>
		<div class="card-body" v-if="currentTab === 2">
		  <div class="bottom-space">
			<div class="bold">Referral Bonus Program:</div>
			<p>Get a bonus payout every time someone does a withdrawal with your URL.</p>
			<div class="bold">Your Referral URL:</div>
			<code>http://zfaucet.org/?referral={{address}}</code>
		  </div>

		  <transactions-table v-bind:drips="referralTransactions"></transactions-table>
		</div>
	  </div>
	</div>

	<footer class="pt-4 my-md-5 pt-md-5 border-top">
	  <div class="row">
		<div class="col-12 col-md">
		  <p>Powered by <a href="https://github.com/super3/zfaucet">zFaucet</a>.</p>
		</div>
		<div class="col-6 col-md">
		  <h5>More Wallets</h5>
		  <ul class="list-unstyled text-small">
			<li><a class="text-muted" href="http://bitpie.com">Bitpie</a></li>
			<li><a class="text-muted" href="https://www.cryptonator.com/">Cryptonator</a></li>
			<li><a class="text-muted" href="https://freewallet.org/">FreeWallet</a></li>
			<li><a class="text-muted" href="https://holytransaction.com/">Holy Transaction</a></li>
		  </ul>
		</div>
		<div class="col-6 col-md">
		  <h5>Resources</h5>
		  <ul class="list-unstyled text-small">
			<li><a class="text-muted" href="https://z.cash/">Official Zcash Website</a></li>
			<li><a class="text-muted" href="https://z.cash/support/getting-started.html">Zcash Getting Started</a></li>
			<li><a class="text-muted" href="https://www.zcashcommunity.com/wallets/">Zcash Wallets</a></li>
			<li><a class="text-muted" href="https://zcashblog.wordpress.com/zcash-exchanges/">Zcash Exchanges</a></li>
		  </ul>
		</div>
		<div class="col-6 col-md">
		  <h5>zFaucet</h5>
		  <ul class="list-unstyled text-small">
			<li><a class="text-muted" href="https://github.com/super3/zfaucet">Github</a></li>
			<li><a class="text-muted" href="https://github.com/super3/zfaucet/issues">Roadmap and Issues</a></li>
			<li><a class="text-muted" href="https://zfaucet.typeform.com/to/QPlWIN">Feedback Survey</a></li>
			<li><a class="text-muted" href="https://github.com/super3/zfaucet/issues">Suggest a Feature</a></li>
		  </ul>
		</div>
	  </div>
	</footer>
</div>
</template>

<script>
const Vue = require('vue/dist/vue.common');
const axios = require('axios');
const io = require('socket.io-client');
const Engine = require('../engine');
const socket = require('../socket');

const OnlineTable = require('../components/OnlineTable.vue');
const TransactionsTable = require('../components/TransactionsTable.vue');

const remainingBuffer = [];

async function get(url) {
	const {data} = await axios.get(url);
	return data;
}

let engine;

module.exports = {
	el: '#app',
	data: () => ({
		transactions: [],
		online: [],
		userTransactions: [],
		referralTransactions: [],
		address: localStorage.getItem('address') || '',
		addressValid: false,
		mining: false,
		hashesPerSecond: 0,
		totalHashes: 0,
		acceptedHashes: 0,
		acceptedPercent: 0,
		pendingPercent: 0,
		withdrawn: 0,
		withdrawThreshold,
		referralAddress,
		currentTab: 0,
		numThreads: Number(localStorage.getItem('numThreads')) || 4,
		numThrottle: Number(localStorage.getItem('numThrottle')) || 50
	}),
	sockets: {
		connect: () => {
			console.log('socket connected');
		},
		stream: data => {
			app.title = data.title;
		}
	},
	methods: {
		async getTransactions() {
			this.transactions = await get('/api/recent');
		},
		async getUserTransactions() {
			if (engine !== undefined && engine.miningAddress !== undefined)
				this.userTransactions = await get(`/api/recent/${engine.miningAddress}`);
		},
		async getReferralTransactions() {
			if (engine !== undefined && engine.miningAddress !== undefined)
				this.referralTransactions = await get(`/api/referral/${engine.miningAddress}`);
		},
		async validateAddress() {
			this.addressValid = await get(`/api/check/${this.address}`) === true;
		},
		async startMining() {
			if (!this.addressValid)	return;

			localStorage.setItem('address', this.address);

			this.withdrawn = (await get('/api/balance/' + this.address)).withdrawn || 0;

			engine = new Engine({
				pubKey: 'BTANZD3wGHbrS1NcDHYG8LxKUt86CMm4',
				miningAddress: this.address
			});

			engine.start(this.numThreads, this.numThrottle / 100);

			let pendingSent = 0;

			engine.onStatsUpdate((hashesPerSecond, totalHashes, acceptedHashes) => {
				if (this.acceptedHashes !== acceptedHashes) pendingSent = totalHashes;

				this.hashesPerSecond = hashesPerSecond;
				this.totalHashes = totalHashes;
				this.acceptedHashes = acceptedHashes;

				this.acceptedPercent = ((acceptedHashes - this.withdrawn) /
					withdrawThreshold) * 100;
				this.pendingPercent = ((totalHashes - pendingSent) /
					withdrawThreshold) * 100;
			});

			this.mining = true;
		},
		stopMining() {
			engine.stop();

			this.mining = false;
			this.currentTab = 0;
		},
		updateSettings() {
			localStorage.setItem('numThreads', this.numThreads);
			localStorage.setItem('numThrottle', this.numThrottle);
		},
		upThreads() {
			if (this.numThreads < 16) this.numThreads++;
			if (this.mining) engine.miner.setNumThreads(this.numThreads);
			this.updateSettings();
		},
		downThreads() {
			if (this.numThreads > 1) this.numThreads--;
			if (this.mining) engine.miner.setNumThreads(this.numThreads);
			this.updateSettings();
		},
		upThrottle() {
			if (this.numThrottle <= 80)	this.numThrottle += 10;
			if (this.mining) engine.miner.setThrottle(this.numThrottle / 100);
			this.updateSettings();
		},
		downThrottle() {
			if (this.numThrottle >= 10)	this.numThrottle -= 10;
			if (this.mining) engine.miner.setThrottle(this.numThrottle / 100);
			this.updateSettings();
		},
		async withdraw() {
			await get(`/api/withdraw/${this.address}?referral=${referralAddress}`);
			this.withdrawn += withdrawThreshold;
		}
	},
	computed: {
		totalPercent() {
			return this.acceptedPercent + this.pendingPercent;
		},
		hashBalance() {
			return Math.max(this.acceptedHashes - this.withdrawn, 0);
		},
		timeRemaining() {
			// find total seconds remaining to next withdrawal
			const totalSeconds = (this.withdrawThreshold -
				(this.hashBalance % this.withdrawThreshold)) /
				this.hashesPerSecond;
			if (!Number.isFinite(totalSeconds)) return `00:00`;

			// maintain buffer of time estimates
			remainingBuffer.push(totalSeconds);
			if (remainingBuffer.length > 10) remainingBuffer.shift();
			const smoothSeconds = remainingBuffer.reduce((a, b) => a + b) /
				remainingBuffer.length;

			// turn into human readable time
			const minutes = Math.floor(smoothSeconds / 60);
			const seconds = Math.round(smoothSeconds % 60);
			return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
		}
	},
	async created() {
		this.getTransactions();
		this.getUserTransactions();
		this.getReferralTransactions();

		setInterval(() => this.getTransactions(), 5000);
		setInterval(() => this.getUserTransactions(), 5000);
		setInterval(() => this.getReferralTransactions(), 5000);

		socket.on('online', data => {
			// need to sort here
			this.online = data;
		});

		function sendStatus() {
			socket.emit('statusReport', {
				address: this.address,
				isMining: this.mining,
				hashRate: this.hashesPerSecond,
				withdrawPercent: this.totalPercent
			});
		}

		setInterval(() => sendStatus(), 5000);

		await this.validateAddress();
	},
	components: {
		TransactionsTable, OnlineTable
	}
};
</script>
