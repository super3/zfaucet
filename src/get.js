const axios = require('axios');

module.exports = async function (url) {
	const {data} = await axios.get(url);
	return data;
};
