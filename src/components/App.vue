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
			 v-model.trim="address"
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
				  v-on:click="numThreads = Math.min(16, numThreads + 1)"
				  v-bind:class="{ linkt: numThreads === 16 }"
				>+</button> /
				<button type="button" class="link"
				  v-on:click="numThreads = Math.max(1, numThreads - 1)"
				  v-bind:class="{ linkt: numThreads === 1 }"
				>-</button>
			  </td>
			</tr>
			<tr>
			  <th scope="row">{{100-numThrottle}}% Speed</th>
			  <td>
				<button type="button" class="link"
				  v-on:click="numThrottle = Math.max(0, numThrottle - 10)"
				  v-bind:class="{ linkt: (100-numThrottle) === 100 }"
				  >+</button> /
				<button type="button" class="link"
				 v-on:click="numThrottle = Math.min(90, numThrottle + 10)"
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
			  class="oi oi-media-stop center-icon"
				></span> Stop Mining
		  </button>
		</div>
	  </div>
		<Chat></Chat>

		<InfoCard v-bind:mining="mining"
		v-bind:address="address"></InfoCard>

</div>

</div>
</template>

<script>
const Vue = require('vue');
const Engine = require('../engine');
const socket = require('../socket');
const get = require('../get');
const utils = require('../../lib/utils');

const remainingBuffer = [];

let engine;

module.exports = {
	data: () => ({
		address: localStorage.getItem('address') || '',
		mining: false,
		withdrawThreshold,
		hashesPerSecond: 0,
		totalHashes: 0,
		acceptedHashes: 0,
		acceptedPercent: 0,
		pendingPercent: 0,
		withdrawn: 0,
		referralAddress,
		numThreads: Number(localStorage.getItem('numThreads')) || 4,
		numThrottle: Number(localStorage.getItem('numThrottle')) || 50
	}),
	methods: {
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
		},
		addressValid() {
			return utils.isAddress(this.address);
		}
	},
	watch: {
		numThreads() {
			if (this.mining) engine.miner.setNumThreads(this.numThreads);
			localStorage.setItem('numThreads', this.numThreads);
		},
		numThrottle() {
			if (this.mining) engine.miner.setThrottle(this.numThrottle / 100);
			localStorage.setItem('numThrottle', this.numThrottle);
		}
	},
	async created() {
		const sendStatus = () => {
			socket.emit('statusReport', {
				address: this.address,
				isMining: this.mining,
				hashRate: this.hashesPerSecond,
				withdrawPercent: this.totalPercent
			});
		}

		setInterval(() => sendStatus(), 5000);
	},
	components: {
		ZMineCard: require('./ZMineCard.vue'),
		Chat: require('./Chat.vue'),
		InfoCard: require('./InfoCard.vue')
	}
};
</script>
