const db = require('../db');

/* istanbul ignore next */
module.exports = async socket => {
	socket.emit('online', await db.onlineStatus());

	socket.on('statusReport', db.submitReport);

	const interval = setInterval(async () => {
		socket.emit('online', await db.onlineStatus());
	}, 5000);

	socket.on('disconnect', () => {
		clearInterval(interval);
	});
};
