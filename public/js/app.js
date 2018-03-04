/* global Vue, get, engine */

const app = new Vue({
	el: '#app',
	data: {
		transactions: [],
		userTransactions: []
	},
	methods: {
		async getTransactions() {
			this.transactions = await get('/api/recent');
		},
		async getUserTransactions() {
			if (engine !== undefined && engine.miningAddress !== undefined) {
				this.userTransactions = await get(`/api/recent/${engine.miningAddress}`);
			}
		}
	}
});

app.getTransactions();
app.getUserTransactions();

setInterval(() => app.getTransactions(), 5000);
setInterval(() => app.getUserTransactions(), 5000);
