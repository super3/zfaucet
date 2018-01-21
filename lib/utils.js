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

  if (interval > 1) { return interval + ' days'; }
  interval = Math.floor(seconds / 3600);

  if (interval > 1) { return interval + ' hours'; }
  interval = Math.floor(seconds / 60);

  if (interval > 1) { return interval + ' minutes'; }
  return Math.floor(seconds) + ' seconds';
}

module.exports.timeSince = timeSince;
