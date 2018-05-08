<template>
	<ul class="pages">
    <li class="chat page">
      <div class="chatArea">
        <ul class="messages">
					<li v-for="message in chatMsgs">
						<strong>{{message.name}}</strong>: {{message.text}}
					</li>
				</ul>
      </div>
      <input v-on:keyup.enter="send" v-model="message" class="inputMessage" placeholder="Type here..."/>
    </li>
  </ul>
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
				console.log('got here');
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
