const db = require('../db');

/* istanbul ignore next */
module.exports = async socket => {
	const resp = await db.onlineStatus();
	socket.emit('online', resp);

	socket.on('statusReport', async ({address, isMining, hashRate, withdrawPercent}) => {
		db.submitReport({address, isMining, hashRate, withdrawPercent});
	});

	const interval = setInterval(async () => {
		const resp = await db.onlineStatus();
		socket.emit('online', resp);
	}, 5000);

	socket.on('disconnect', () => {
		clearInterval(interval);
	});
};
