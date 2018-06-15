const ipayouts = require('./lib/ipayouts');

(async () => {
	console.log(await ipayouts.getUnpaid());
})();
