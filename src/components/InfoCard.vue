<template>
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
		<p>~100 sats / {{withdrawThreshold/1000}}k hashes</p>
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
</template>

<script>
const socket = require('../socket');
const get = require('../get');

module.exports = {
	props: ['mining', 'address'],
	data: () => ({
		withdrawThreshold,
		online: [],
		currentTab: 0,
		transactions: [],
		userTransactions: [],
		referralTransactions: []
	}),
	async created() {
		this.getTransactions();
		this.getUserTransactions();
		this.getReferralTransactions();

		setInterval(() => this.getTransactions(), 5000);
		setInterval(() => this.getUserTransactions(), 5000);
		setInterval(() => this.getReferralTransactions(), 5000);

		socket.on('online', data => {
			this.online = data;
		});
	},
	methods: {
		async getTransactions() {
			this.transactions = await get('/api/recent');
		},
		async getUserTransactions() {
			this.userTransactions = await get(`/api/recent/${this.address}`);
		},
		async getReferralTransactions() {
			this.referralTransactions = await get(`/api/referral/${this.address}`);
		}
	},
	watch: {
		mining() {
			this.currentTab = this.mining ? this.currentTab : 0;
		}
	},
	components: {
		TransactionsTable: require('./TransactionsTable.vue'),
		OnlineTable: require('./OnlineTable.vue')
	}
}
</script>
