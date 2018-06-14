const BN = require('bignumber.js');

module.exports = (difficulty, target) => {
	const maxTarget = (new BN(2)).pow(new BN(256));

	// const shareDifficulty = maxTarget.dividedBy(target);
	const shareDifficulty = new BN(target);

	const networkDifficulty = new BN(difficulty);

	console.log('new target', target.toString(10));
	console.log('maxTarget', maxTarget.toString(10));
	console.log('new difficulty', shareDifficulty.toString(10));
	console.log('raw network difficulty', difficulty);
	console.log('network difficulty', networkDifficulty.toString(10));

	const blockReward = new BN(10);

	return blockReward
		.multipliedBy(shareDifficulty)
		.dividedBy(networkDifficulty)
		.dividedBy(8192);
};
