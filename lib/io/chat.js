const Redis = require('ioredis');
const dogNames = require('dog-names');
const config = require('../../config');

// pub/sub with Redis
const pub = new Redis();
const sub = new Redis();
sub.subscribe('messages');

const sockets = new Set();

/* istanbul ignore next */
sub.on('message', (channel, message) => {
	for (const socket of sockets) {
		socket.emit('message', JSON.parse(message));
	}
});

/* istanbul ignore next */
module.exports = socket => {
	socket.on('chat-init', async password => {
		console.log(config, password);
		const admin = config.chatAdmin === password;

		sockets.add(socket);

		const name = dogNames.allRandom();

		socket.emit('name', name);

		const messages = await pub.lrange('messages', 0, -1);

		messages.reverse();

		for (const message of messages) {
			socket.emit('message', JSON.parse(message));
		}

		socket.on('message', async text => {
			const message = JSON.stringify({
				name,
				text,
				admin
			});

			await pub.lpush('messages', message);
			await pub.ltrim('messages', 0, 10);

			pub.publish('messages', message);
		});
	});
};
