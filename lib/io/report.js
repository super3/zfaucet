const db = require('../db');

// report status via socket.io
module.exports = async socket => {
	socket.on('statusReport', async ({address, isMining, hashRate, withdrawPercent}) => {
			db.submitReport({address, isMining, hashRate, withdrawPercent});
	});

	const resp = await db.onlineStatus();
	socket.emit('online', resp);

	/* istanbul ignore next */
	const interval = setInterval(async () => {
		const resp = await db.onlineStatus();
		socket.emit('online', resp);
	}, 5000);

	/* istanbul ignore next */
	socket.on('disconnect', () => {
		clearInterval(interval);
	});
};
