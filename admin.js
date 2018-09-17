const crypto = require('crypto');
const redis = require('./lib/redis');

console.log(...[ ...process.argv ].slice(2));

({
	'external': async cmd => {
		await ({
			'new-key': async () => {
				const privateKey = await crypto.randomBytes(32);

				const hash = crypto.createHash('sha256');

				hash.update(privateKey);

				const publicKey = hash.digest();

				redis.sadd('external-keys', publicKey.toString('hex'));

				console.log(`Private Key: ${privateKey.toString('hex')}`);
				console.log(`Public Key: ${publicKey.toString('hex')}`);
			},

			'delete-key': async publicKey => {
				await redis.srem('external-keys', publicKey.toString('hex'));
			},

			'list-keys': async () => {
				const publicKeys = await redis.smembers('external-keys');

				for(const publicKey of publicKeys)
					console.log(publicKey);
			}
		})[cmd]();
	}
})[process.argv[2]](...[ ...process.argv ].slice(3)).then(() => {
	process.exit(0);
}).catch(() => {
	process.exit(1);
});
