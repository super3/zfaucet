<template>
	<div class="bottom-space">
    <tbody>
			<tr>
				<td v-for="message in chatMsgs">
					<strong>{{message.name}}</strong>: {{message.text}}
				</td>
			</tr>
		</tbody>
		<div class="input-group">
			<div class="input-group-prepend">
				<span class="input-group-text">Bob</span>
			</div>
			<input type="text"
				class="form-control inputMessage"
				v-on:keyup.enter="send"
				v-model="message"
				placeholder="Type message here...">
		</div>
	</div>
</template>

<script>
	const socket = require('../socket');

	module.exports = {
		data: () => ({
			message: '',
			chatMsgs: []
		}),
		methods: {
			send() {
				if (this.message === '') return
				socket.emit('message', this.message);
				this.message = '';
			}
		},
		created() {
			socket.on('message', message => {
				this.chatMsgs.push(message);
			})
		}
	}
</script>
