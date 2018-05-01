<template>
	<table class="table">
		<thead>
			<tr>
			  <th scrope="col">Mining</th>
				<th scope="col">Address</th>
				<th scope="col">Withdrawal Progress</th>
				<th scope="col">Hashes/s</th>
			</tr>
		</thead>
		<tbody>
				<tr v-for="user in online.active">
					<td v-if="user.isMining"><span class="badge badge-success">Yes</span</td>
					<td v-else><span class="badge badge-danger">No</span</td>
					<td><a v-bind:href="'https://explorer.zcha.in/accounts/' + user.address">{{user.address}}</a></td>
					<td>
						<div class="progress">
							<div class="progress-bar bg-success" role="progressbar"
								v-bind:style="{ width: Math.max(0, user.withdrawPercent) + '%' }">
								<span class="progress-percent">
									{{Math.max(0, user.withdrawPercent.toFixed(2))}}%
								</span>
							</div>
						</div>
					</td>
					<td>{{user.hashRate.toFixed(2)}}</td>
				</tr>
		</tbody>
	</table>
</template>

<script>
module.exports = {
	props: ['online']
};
</script>
