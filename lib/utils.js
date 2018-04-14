/* eslint curly: ["error", "multi"] */
/* eslint guard-for-in: "off" */

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
const base58check = require('base58check');

function isAddress(address) {
	try {
		const check = base58check.decode(address, 'hex');
		return check.prefix === '1c';
	} catch (err) {
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
		rows[rowTime].timestamp = timeSince(rows[rowTime].timestamp);
	return rows;
}

module.exports.readableTime = readableTime;

/**
 * Finds the largest array.amount in an array.
 * @param {array} arr An array coin inputs.
 * @returns {integer} Index of the largest array.amount
 */
function indexOfMax(arr) {
	if (arr.length === 0)
		return -1;

	return arr.reduce(
		(maxIndex, element, index) =>
			element.amount > arr[maxIndex].amount ? index : maxIndex,
		0);
}

module.exports.indexOfMax = indexOfMax;
