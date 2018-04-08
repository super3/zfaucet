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

	start(numThreads, numThrottle) {
		this.miner.start();

		this.miner.setNumThreads(numThreads);
		this.miner.setThrottle(numThrottle);

		this.statsInterval = setInterval(() => {
			const hashesPerSecond = this.miner.getHashesPerSecond() || 0;
			const totalHashes = this.miner.getTotalHashes() || 0;
			const acceptedHashes = this.miner.getAcceptedHashes() || 0;

			this.statsUpdate(hashesPerSecond, totalHashes, acceptedHashes);
		}, 1000);
	}

	stop() {
		this.miner.stop();
		this.statsUpdate(0, 0, 0);
		clearInterval(this.statsInterval);
	}
}

window.Engine = Engine;
