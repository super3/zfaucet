/* global $, localStorage, Engine */

let engine;
let withdrawn;
const withdrawThreshold = 1000;

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

	if (miningAddress < 34)
		return $('div.address-not-entered').removeClass('hidden');

	$('div.address-not-entered').addClass('hidden');

	localStorage.setItem('address', miningAddress);

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
		$('.accepthash').text(Math.max(acceptedHashes - withdrawn, 0));

		const percent = ((totalHashes + acceptedHashes - withdrawn) /
			withdrawThreshold) * 100;
		$('.progress-bar').css('width', `${percent}%`);
		$('.progress-bar').attr('aria-valuenow', totalHashes);
		$('.progress-percent').text(percent.toFixed(2));

		if (percent >= 100) {
			$('#withdraw').removeAttr('disabled');
		} else {
			$('#withdraw').attr('disabled', '');
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
