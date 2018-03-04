/* global Vue, get */

const app = new Vue({
	el: '#app',
	data: {
		transactions: []
	},
	methods: {
		async getTransactions() {
			this.transactions = await get('/api/recent');
		}
	}
});

app.getTransactions();

setInterval(() => app.getTransactions(), 5000);
