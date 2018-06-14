const net = require('net');
const BN = require('bignumber.js');
const rpc = require('./lib/rpc');
const calculatePayout = require('./lib/calculate-payout');
const ipayouts = require('./lib/ipayouts');

const poolHost = 'us1-zcash.flypool.org';
const poolPort = 3333;

net.createServer(client => {
	const socket = net.connect(poolPort, poolHost);

	let sendBuffer = '';
	let recvBuffer = '';

	let target;

	const submits = [];

	client.on('data', data => {
		sendBuffer += data;

		const messages = sendBuffer.split('\n');
		sendBuffer = messages.pop();

		for (const rawMessage of messages) {
			const message = JSON.parse(rawMessage);

			console.log('->', message);

			if (message.method === 'mining.submit')
				submits.push(message.id);
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

			if (message.method === 'mining.set_target')
				target = new BN(message.params[0], 16);

			if (message.id in submits) {
				if (message.error) return;

				const networkDifficulty = await rpc.getdifficulty();

				const amount = Number(calculatePayout(networkDifficulty, target));

				await ipayouts.insert({
					address: 't1Pa2z4BMzNS9FCx51jtSMZjPugY5EPDjKV',
					amount,
					processed: false
				});
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
