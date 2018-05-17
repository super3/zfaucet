const bitcoin = require('bitcoinjs-lib');
const base58check = require('base58check');

// https://github.com/zcash/zcash/blob/75546c697a964e77c14aa71b45403a0768c1f563/src/chainparams.cpp#L141

class Address {
	get kp() {
		if (typeof this._kp === 'undefined')
			this._kp = bitcoin.ECPair.makeRandom();

		return this._kp;
	}

	set kp(kp) {
		this._kp = kp;
	}

	getAddress() {
		const publicKeyPrefix = [0x1C, 0xB8];

		return base58check.encode(
			Buffer.concat([
				Buffer.from(publicKeyPrefix.slice(1)),
				bitcoin.crypto.hash160(
					this.kp.getPublicKeyBuffer()
				)
			]),
			Buffer.from(publicKeyPrefix.slice(0, 1)).toString('hex')
		);
	}

	setPrivateKey(privateKey) {
		this.kp = bitcoin.ECPair.fromWIF(privateKey);
	}

	getPrivateKey() {
		return this.kp.toWIF();
	}
}

module.exports = () => new Address();
