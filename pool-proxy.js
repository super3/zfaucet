const net = require('net');
const BN = require('bignumber.js');
const rpc = require('./lib/rpc');

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

			if (message.id in submits || message.method === 'mining.set_target') {
				// if (message.error) return;

				const maxTarget = (new BN(2)).pow(new BN(256));
				const shareDifficulty = maxTarget.dividedBy(target);

				const networkDifficulty = new BN((await rpc.getdifficulty()).toString(), 10);

				console.log('new target', target.toString(10));
				console.log('maxTarget', maxTarget.toString(10));
				console.log('new difficulty', shareDifficulty.toString(10));
				console.log(await rpc.getdifficulty());
				console.log('network difficulty', networkDifficulty.toString(10));

				const blockReward = new BN('12.5', 10);

				const payout = shareDifficulty.dividedBy(networkDifficulty).multipliedBy(blockReward);

				console.log('payout', payout.toString(10));
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
