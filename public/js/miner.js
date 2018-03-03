/* global $, CoinHive, localStorage */

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

let engine;

$('#start').on('click', e => {
	const miningAddress = $('input#inputAddress').val();

	e.preventDefault();

	if (miningAddress < 34) {
	$('div.address-not-entered').removeClass('hidden');
	} else {
		$('div.address-not-entered').addClass('hidden');

		localStorage.setItem('address', miningAddress);

		$('#start').addClass('hidden');
		$('#inputAddress').addClass('hidden');
		$('#stop').removeClass('hidden');
		$('#progress').removeClass('hidden');

		if (!(engine instanceof Engine)) {
			engine = new Engine({
				pubKey: 'BTANZD3wGHbrS1NcDHYG8LxKUt86CMm4',
				miningAddress
			});
		}

		engine.start();

		engine.onStatsUpdate((hashesPerSecond, totalHashes, acceptedHashes) => {
			$('.hashsec').text(hashesPerSecond.toFixed(2));
			$('.totalhash').text(totalHashes);
			$('.accepthash').text(acceptedHashes);

			const percent = ((totalHashes + acceptedHashes) / 100000) * 100;
			$('.progress-bar').css('width', `${percent}%`);
			$('.progress-bar').attr('aria-valuenow', totalHashes);
			$('.progress-percent').text(percent.toFixed(2));
		});
	}
});

$('#stop').on('click', e => {
	e.preventDefault();

	$('#stop').addClass('hidden');
	$('#start').removeClass('hidden');
	$('#inputAddress').removeClass('hidden');
	$('#progress').addClass('hidden');

	engine.stop();
});

if (localStorage.getItem('address') !== null) {
	$('#inputAddress').val(localStorage.getItem('address'));
}
