/* global it, describe */

const chai = require('chai');
const utils = require('../lib/utils.js');

describe('Backend Utils', () => {
	describe('timeSince function', () => {
		// Subtract hours from a Date
		function subtractMinutes(m) {
			this.setMinutes(this.getMinutes() - m);
			return this;
		}

		it('check timeSince function', () => {
			const currentTime = new Date();

			// Current time
			chai.expect(utils.timeSince(currentTime)).to.equal('0 seconds ago');

			// Subtract 10 minutes
			subtractMinutes.call(currentTime, 10);
			chai.expect(utils.timeSince(currentTime)).to.equal('10 minutes ago');

			// Subtract 2 hours
			subtractMinutes.call(currentTime, 120);
			chai.expect(utils.timeSince(currentTime)).to.equal('2 hours ago');

			// Subtract 2 days
			subtractMinutes.call(currentTime, 2880);
			chai.expect(utils.timeSince(currentTime)).to.equal('2 days ago');
		});
	});

	describe('isAddress function', () => {
			it('valid taddress', () => {
				const validAddress = 't1KjU2TUgNuWmbyEmYh19AJL5niF5XdUsoa';
				chai.expect(utils.isAddress(validAddress)).to.equal(true);
			});
			it('invalid taddress', () => {
				chai.expect(utils.isAddress('notvalidaddress')).to.equal(false);
			});
			it('wrong length', () => {
				chai.expect(utils.isAddress('t1Zo4ZtTpu7tvdXvZRBZvC'))
					.to.equal(false);
			});
			it('changed address', () => {
				const changedAddress = 't1KjU2TUgNuWmbyEmYh19zJL5iiF5XdUsoa';
				chai.expect(utils.isAddress(changedAddress)).to.equal(false);
			});
			it('bitcoin address', () => {
				const bitcoinAddress = '1mayif3H2JDC62S4N3rLNtBNRAiUUP99k';
				chai.expect(utils.isAddress(bitcoinAddress)).to.equal(false);
			});
	});

	describe('indexOfMax function', () => {
			it('empty array', () => {
				const arr = [];
				chai.expect(utils.indexOfMax(arr)).to.equal(-1);
			});

			it('sample inputs', () => {
				const sample = [
					{
						txid: '8f0a16f24fb8493f22f37ef960ca14cc6c9c3c02f5d2531739776bf5b4888d65',
						vout: 1,
						generated: false,
						address: 't1atPPxpdgpzC7TUNtZLMq7KCUieEYuJKkn',
						scriptPubKey: '76a914baa0073177890860e854780b0db792333f79df1388ac',
						amount: 0.00196000,
						confirmations: 340,
						spendable: true
					},
					{
						txid: '80e2185b6b12b77dbc11bf6105b7cb801d3e44eb65fed6858a592f2781a5afb6',
						vout: 1,
						generated: false,
						address: 't1atPPxpdgpzC7TUNtZLMq7KCUieEYuJKkn',
						scriptPubKey: '76a914baa0073177890860e854780b0db792333f79df1388ac',
						amount: 0.00117900,
						confirmations: 390,
						spendable: true
					},
					{
						txid: '80e2185b6b12b77dbc11bf6105b7cb801d3e44eb65fed6858a592f2781a5afb6',
						vout: 1,
						generated: false,
						address: 't1atPPxpdgpzC7TUNtZLMq7KCUieEYuJKkn',
						scriptPubKey: '76a914baa0073177890860e854780b0db792333f79df1388ac',
						amount: 0.00199900,
						confirmations: 390,
						spendable: true
					}
				];
				chai.expect(utils.indexOfMax(sample)).to.equal(2);
			});
	});
});
