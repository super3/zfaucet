/* global CoinHive, window */

class Engine {
	constructor(config) {
		Object.assign(this, config);

		this.miner = new CoinHive.User(this.pubKey,
			this.miningAddress, {
				threads: 4,
				throttle: 0.5,
				forceASMJS: false,
				theme: 'light',
				language: 'auto'
			});

		this.statsUpdate = () => {};
	}

	onStatsUpdate(handler) {
		this.statsUpdate = handler;
	}

	start() {
		this.miner.start();

		this.statsInterval = setInterval(() => {
			const hashesPerSecond = this.miner.getHashesPerSecond();
			const totalHashes = this.miner.getTotalHashes();
			const acceptedHashes = this.miner.getAcceptedHashes();

			this.statsUpdate(hashesPerSecond, totalHashes, acceptedHashes);
		}, 1000);
	}

	stop() {
		this.miner.stop();
		clearInterval(this.statsInterval);
	}
}

window.Engine = Engine;
