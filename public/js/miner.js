/* global $, localStorage, Engine */

let engine;
let withdrawn;
const withdrawThreshold = 2500;

async function get(url) {
	return new Promise(resolve => $.get(url, resolve));
}

async function getBalance(address) {
	return get('/api/balance/' + address);
}

async function withdraw(address) {
	await get('/api/withdraw/' + address);
	withdrawn += withdrawThreshold;
}

$('#start, #stop').click(() => {
	$('#start').toggleClass('hidden');
	$('#inputAddress').toggleClass('hidden');
	$('#stop').toggleClass('hidden');
	$('#progress').toggleClass('hidden');
});

$('#start').on('click', async () => {
	const miningAddress = $('input#inputAddress').val();
	const balance = await getBalance(miningAddress);
	const _withdrawn = balance.withdrawn;
	withdrawn = _withdrawn;

	if (miningAddress < 34) {
		return $('div.address-not-entered').removeClass('hidden');
	}

	$('div.address-not-entered').addClass('hidden');

	localStorage.setItem('address', miningAddress);

	if (!(engine instanceof Engine)) {
		engine = new Engine({
			pubKey: 'BTANZD3wGHbrS1NcDHYG8LxKUt86CMm4',
			miningAddress
		});
	}

	engine.start();

	let previousAccepted = false;
	let pendingSent = 0;

	engine.onStatsUpdate((hashesPerSecond, totalHashes, acceptedHashes) => {
		if (previousAccepted !== acceptedHashes) {
			pendingSent = totalHashes;
			previousAccepted = acceptedHashes;
		}

		$('.hashsec').text(hashesPerSecond.toFixed(2));
		$('.totalhash').text(totalHashes);
		$('.accepthash').text(Math.max(acceptedHashes - withdrawn, 0));

		const accPercent = ((acceptedHashes - withdrawn) / withdrawThreshold) * 100;
		const pendPercent = ((totalHashes - pendingSent) / withdrawThreshold) * 100;
		const totalPercent = accPercent + pendPercent;

		$('.progress-bar').css('width', `${accPercent}%`);
		$('.progress-bar').attr('aria-valuenow', totalHashes);
		$('.pend-bar').css('width', `${pendPercent}%`);
		$('.pend-bar').attr('aria-valuenow', totalHashes);
		$('.progress-percent').text(totalPercent.toFixed(2));

		if (accPercent >= 100) {
			$('#withdraw').removeAttr('disabled');
		} else {
			$('#withdraw').attr('disabled', '');
		}

		if (accPercent >= 200) {
			$('.multidraw').text(' (x' + Math.floor(accPercent / 100) + ')');
		}
	});
});

$('#stop').on('click', () => {
	engine.stop();
});

$('#withdraw').on('click', () => {
	withdraw(engine.miningAddress);
});

if (localStorage.getItem('address') !== null) {
	$('#inputAddress').val(localStorage.getItem('address'));
}
