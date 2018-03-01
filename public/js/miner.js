/* global $, CoinHive */

class Engine {
	constructor(config) {
		Object.assign(this, config);

		this.miner = new CoinHive.User(this.pubKey,
			this.miningAddress, {
				threads: 4,
				throttle: 0.8,
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

let engine;

$('#start').on('click', e => {
	const [address] = $('input#inputAddress');

		e.preventDefault();

		if (address.value.length < 34) {
		$('div.address-not-entered').removeClass('hidden');
		} else {
			$('div.address-not-entered').addClass('hidden');

			$('#start').addClass('hidden');
			$('#stop').removeClass('hidden');

			if (!(engine instanceof Engine)) {
				engine = new Engine({
					pubKey: 'BTANZD3wGHbrS1NcDHYG8LxKUt86CMm4',
					miningAddress: address.value
				});
			}

			engine.start();

			engine.onStatsUpdate((hashesPerSecond, totalHashes, acceptedHashes) => {
				console.log(hashesPerSecond, totalHashes, acceptedHashes);
			});
		}
});

$('#stop').on('click', e => {
	e.preventDefault();

	$('#stop').addClass('hidden');
	$('#start').removeClass('hidden');

	engine.stop();
});
