/* global Vue, Engine, axios, localStorage, withdrawThreshold */
/* global referralAddress, io */

async function get(url) {
	const {data} = await axios.get(url);
	return data;
}

const OnlineTable = Vue.component('online-table', {
	props: ['online'],
	template: `
	<table class="table">
		<thead>
			<tr>
				<th scope="col">Address</th>
				<th scope="col">Withdraw Progress</th>
				<th scope="col">Hashes/s</th>
			</tr>
		</thead>
		<tbody>
				<tr v-for="user in online">
					<td>{{user.address}}</td>
					<td>{{user.withdrawPercent}}</td>
					<td>{{user.hashesPerSecond}}</td>
				</tr>
		</tbody>
	</table>`
});

const TransactionsTable = Vue.component('transactions-table', {
	props: ['drips'],
	template: `
		<table class="table">
			<thead>
				<tr>
					<th scope="col">Time</th>
					<th scope="col">Address</th>
					<th scope="col">Transaction ID</th>
					<th scope="col">Referral?</th>
				</tr>
			</thead>
			<tbody>
					<tr v-for="drip in drips">
						<td>{{drip.timestamp}}</td>
						<td><a v-bind:href="'https://explorer.zcha.in/accounts/' + drip.payoutAddress">{{drip.payoutAddress}}</a></td>
						<td v-if="drip.processed === false">Pending...</td>
						<td v-else-if="drip.processed !== false && !drip.transactionId">Sent.</td>
						<td v-else><a v-bind:href="'https://zcash.blockexplorer.com/tx/' + drip.transactionId">View Transaction</a></td>
						<td v-if="drip.referralAddress !== ''">Yes</td>
						<td v-else>No</td>
					</tr>
			</tbody>
		</table>
	`
});

let engine;

const remainingBuffer = [];

const app = new Vue({
	el: '#app',
	data: {
		transactions: [],
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
	},
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
		await this.validateAddress();
	},
	components: {
		TransactionsTable, OnlineTable
	}
});

const socket = io.connect('http://localhost:3010');
socket.on('online', data => {
	console.log(data);
});

function sendStatus() {
	socket.emit('statusReport', {
		address: app.address,
		hashRate: app.hashesPerSecond,
		withdrawPercent: app.totalPercent
	});
}

setInterval(() => sendStatus(), 5000);

app.getTransactions();
app.getUserTransactions();
app.getReferralTransactions();

setInterval(() => app.getTransactions(), 5000);
setInterval(() => app.getUserTransactions(), 5000);
setInterval(() => app.getReferralTransactions(), 5000);
