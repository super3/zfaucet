const net = require('net');
const BN = require('bn.js');
const rpc = require('./lib/rpc');

const poolHost = 'us1-zcash.flypool.org';
const poolPort = 3333;

net.createServer(client => {
	const socket = net.connect(poolPort, poolHost);

	let sendBuffer = '';
	let recvBuffer = '';

	let target;

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

	socket.on('data', async data => {
		recvBuffer += data;

		const messages = recvBuffer.split('\n');
		recvBuffer = messages.pop();

		for (const rawMessage of messages) {
			const message = JSON.parse(rawMessage);

			console.log('<-', message);

			if (message.method === 'mining.set_target') {
				target = new BN(message.params[0], 16);

				const maxTarget = (new BN(2)).pow(new BN(256));
				const difficulty = maxTarget.div(target);

				const networkDifficulty = await rpc.getdifficulty();

				console.log('new target', target.toString(10));
				console.log('maxTarget', maxTarget.toString(10));
				console.log('new difficulty', difficulty.toString(10));
				console.log('network difficulty', networkDifficulty);
			}
		}

		client.write(data);
	});

	client.on('end', () => {
		socket.end();
	});

	socket.on('end', () => {
		client.end();
	});

	client.on('error', () => {
		socket.end();
	});

	socket.on('error', () => {
		client.end();
	});
}).listen(3333);
