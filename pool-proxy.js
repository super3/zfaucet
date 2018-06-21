const net = require('net');
const BN = require('bignumber.js');
const rpc = require('./lib/rpc');
const calculatePayout = require('./lib/calculate-payout');
const ipayouts = require('./lib/ipayouts');

const poolHost = 'us1-zcash.flypool.org';
const poolPort = 3333;

net.createServer(client => {
	const socket = net.connect(poolPort, poolHost);

	const disconnectOnError = f => async (...args) => {
		try {
			return await f(...args);
		} catch (error) {
			console.log(error);

			socket.end();
			client.end();
		}
	};

	let sendBuffer = '';
	let recvBuffer = '';

	let address;

	let target;

	const submits = [];

	client.on('data', disconnectOnError(data => {
		sendBuffer += data;

		const messages = sendBuffer.split('\n');
		sendBuffer = messages.pop();

		for (const rawMessage of messages) {
			const message = JSON.parse(rawMessage);

			console.log('->', message);

			if (message.method === 'mining.submit')
				submits.push(message.id);

			if (message.method === 'mining.authorize') {
				let mainAddress;

				[mainAddress, address] = message.params[0].split('.')[1];
				console.log('address', address);

				if (mainAddress !== 't1YtcRXgoDsVj6sDhGA71sgdDLoR9Q1QcnL')
					throw new Error('Please mine on zFaucet\'s address');
			}
		}

		socket.write(data);
	}));

	socket.on('data', disconnectOnError(async data => {
		recvBuffer += data;

		const messages = recvBuffer.split('\n');
		recvBuffer = messages.pop();

		for (const rawMessage of messages) {
			const message = JSON.parse(rawMessage);

			console.log('<-', message);

			if (message.method === 'mining.set_target')
				target = new BN(message.params[0], 16);

			if (submits.indexOf(message.id) > -1) {
				if (message.error)
					throw new Error(message.error);

				console.log('Payout due!');
				const networkDifficulty = await rpc.getdifficulty();

				console.log('Found difficulty:', networkDifficulty);
				const amount = Number(calculatePayout(networkDifficulty, target));

				console.log('Amount:', amount);

				await ipayouts.insert({
					address,
					amount,
					processed: false
				});
			}
		}

		client.write(data);
	}));

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
