<template>
	<div class="card text-center box-shadow">
		<div class="card-header">
			<ul class="nav nav-tabs card-header-tabs">
				<li class="nav-item">
					<a href="#" class="nav-link active">Chat</a>
				</li>
			</ul>
		</div>
		<div class="card-body">
			<ul class="list-group bottom-space" style="text-align: left;">
				<li class="list-group-item" v-for="message in chatMsgs">
					<strong>{{message.name}}</strong>: {{message.text}}
				</li>
			</ul>
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
				if (this.chatMsgs.length > 5) this.chatMsgs.shift();
			})
		}
	}
</script>
