/* eslint curly: ["error", "multi"] */

/**
 * Gets the time since a date object in a human readable form.
 * @param {date} date Date object.
 * @returns {string} Human readable time diff.
 */
function timeSince(date) {
	const seconds = Math.floor((new Date() - date) / 1000);
	let interval = Math.floor(seconds / 31536000);

	interval = Math.floor(seconds / 2592000); // Years
	interval = Math.floor(seconds / 86400); // Months

	if (interval > 1) return `${interval} days ago`;
	interval = Math.floor(seconds / 3600);

	if (interval > 1) return `${interval} hours ago`;
	interval = Math.floor(seconds / 60);

	if (interval > 1) return `${interval} minutes ago`;
	return `${Math.floor(seconds)} seconds ago`;
}

module.exports.timeSince = timeSince;

/**
 * Check if the address is a valid zcash address.
 * @param {string} address A supposed zcash address.
 * @returns {boolean} Is or is not a zcash address.
 */
function isAddress(address) {
	const base58check = require('base58check');

	try {
		const check = base58check.decode(address, 'hex');
		if (check.prefix === '1c')
			return true;

		return false;
	} catch (error) {
		return false;
	}
}

module.exports.isAddress = isAddress;

/**
 * Makes the timestamp field in an row array human readable.
 * @param {array} rows An array of drips.
 * @returns {array} Modified array of drips with human readable
 * timestamp field.
 */
function readableTime(rows) {
	for (const rowTime in rows)
		if (Object.prototype.hasOwnProperty.call(rows, rowTime))
			rows[rowTime].timestamp = timeSince(rows[rowTime].timestamp);
	return rows;
}

module.exports.readableTime = readableTime;

function indexOfMax(arr) {
	if (arr.length === 0)
		return -1;

	let max = arr[0].amount;
	let maxIndex = 0;

	for (let i = 1; i < arr.length; i++)
		if (arr[i].amount > max) {
			maxIndex = i;
			max = arr[i].amount;
		}

	return maxIndex;
}

module.exports.indexOfMax = indexOfMax;
