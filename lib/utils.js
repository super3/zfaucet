/**
 * Gets the time since a date object in a human readable form.
 * @param {date} date Date object.
 * @returns {string} Human readable time diff.
 */
function timeSince(date) {
  var seconds = Math.floor((new Date() - date) / 1000);
  var interval = Math.floor(seconds / 31536000);

  interval = Math.floor(seconds / 2592000); // years
  interval = Math.floor(seconds / 86400); // months

  if (interval > 1) { return interval + ' days ago'; }
  interval = Math.floor(seconds / 3600);

  if (interval > 1) { return interval + ' hours ago'; }
  interval = Math.floor(seconds / 60);

  if (interval > 1) { return interval + ' minutes ago'; }
  return Math.floor(seconds) + ' seconds ago';
}

module.exports.timeSince = timeSince;

/**
 * Check if the address is a valid zcash address.
 * @param {string} address A supposed zcash address.
 * @returns {boolean} Is or is not a zcash address.
 */
function isAddress(address) {
  var base58check = require('base58check');

  try {
    var check = base58check.decode(address, 'hex');
    if (check.prefix == '1c') {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }

}

module.exports.isAddress = isAddress;
