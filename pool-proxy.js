const net = require('net');

const poolHost = 'us1-zcash.flypool.org';
const poolPort = 3333;

net.createServer(client => {
	const socket = net.connect(poolPort, poolHost);

	let sendBuffer = '';
	let recvBuffer = '';

	client.on('data', data => {
		sendBuffer += data;

		const messages = sendBuffer.split('\n');
		sendBuffer = messages.pop();

		for (const rawMessage of messages) {
			const message = JSON.parse(rawMessage);

			console.log('->', message);
		}

		socket.write(data);
	});

	socket.on('data', data => {
		recvBuffer += data;

		const messages = recvBuffer.split('\n');
		recvBuffer = messages.pop();

		for (const rawMessage of messages) {
			const message = JSON.parse(rawMessage);

			console.log('<-', message);
		}

		client.write(data);
	});

	client.on('end', () => {
		socket.end();
	});

	socket.on('end', () => {
		client.end();
	});
}).listen(3333);
