const redis = require('./redis');
const FilterableList = require('./filterable-list');

module.exports = new FilterableList({
	redis,
	name: 'reports',
	filters: [
		'algorithm',
		'address',
		'isMining'
	],
	length: 10000
});
