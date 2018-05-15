<style>
@keyframes rainbow {
    0%{background-position:0% 82%}
    50%{background-position:100% 19%}
    100%{background-position:0% 82%}
}

.admin {
	color: transparent;
	background: linear-gradient(124deg, #ff2400, #e81d1d, #e8b71d, #e3e81d, #1de840, #1ddde8, #2b1de8, #dd00f3, #dd00f3);
	background-size: 1800% 1800%;
	animation: rainbow 18s ease infinite;
	-webkit-background-clip: text;
}
</style>

<template>
	<div class="card mb-4 box-shadow">
		<div class="card-header">
		  <h4 class="my-0 font-weight-normal">3. Chat</h4>
		</div>
		<div class="card-body" style="overflow-y: scroll; height: 200px;" ref="messageBox">
				<div v-for="message in chatMsgs" style="text-align: left;">
					<strong v-bind:class="{ admin: message.admin }">{{message.name}}</strong>: {{message.text}}
				</div>
		</div>
		<div class="card-footer">
		<div class="input-group">
			<div class="input-group-prepend">
				<span class="input-group-text">{{name}}</span>
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
			name: '',
			message: '',
			chatMsgs: []
		}),
		methods: {
			send() {
				if (this.message === '')
					return;

				socket.emit('message', this.message);

				this.message = '';
			}
		},
		created() {
			socket.on('name', name => {
				this.name = name;
			});

			socket.on('message', message => {
				this.chatMsgs.push(message);
			});

			socket.emit('chat-init', localStorage.getItem('admin'));
		},
		updated() {
			this.$refs.messageBox.scrollTop = this.$refs.messageBox.scrollHeight;
		}
	}
</script>
