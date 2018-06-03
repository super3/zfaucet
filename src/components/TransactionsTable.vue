<template>
	<table class="table">
		<thead>
			<tr>
				<th scope="col">Time</th>
				<th scope="col">Address</th>
				<th scope="col">Transaction ID</th>
			</tr>
		</thead>
		<tbody>
				<tr v-for="drip in drips">
					<td>{{drip.timestamp}}</td>
					<td><a v-bind:href="'https://explorer.zcha.in/accounts/' + drip.payoutAddress">{{drip.payoutAddress}}</a></td>
					<td v-if="drip.processed === false">Pending...</td>
					<td v-else-if="drip.processed !== false && !drip.transactionId">Sent.</td>
					<td v-else><a v-bind:href="'https://zcash.blockexplorer.com/tx/' + drip.transactionId">View Transaction</a></td>
				</tr>
		</tbody>
	</table>
</template>

<script>
module.exports = {
	props: ['drips']
};
</script>
