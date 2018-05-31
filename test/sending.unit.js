/* eslint camelcase: ["error", {properties: "never"}] */
const sinon = require('sinon');
const chai = require('chai');

chai.use(require('chai-as-promised'));

const rpc = require('../lib/rpc');
const sending = require('../sending');
const config = require('../config');
const db = require('../lib/db');

const realdb = {...db};

describe('Sending Script', () => {
	const inputs = [
		{
			txid: '8f0a16f24fb8493f22f37ef960ca14cc6c9c3c02f5d2531739776bf5b4888d65',
			vout: 1,
			generated: false,
			address: 't1atPPxpdgpzC7TUNtZLMq7KCUieEYuJKkn',
			scriptPubKey: '76a914baa0073177890860e854780b0db792333f79df1388ac',
			amount: 0.00196000,
			confirmations: 530,
			spendable: true
		},
		{
			txid: '80e2185b6b12b77dbc11bf6105b7cb801d3e44eb65fed6858a592f2781a5afb6',
			vout: 1,
			generated: false,
			address: 't1R5WEPSsvHowVUAtbQFo4bAFVgaAfh9ySX',
			scriptPubKey: '76a914baa0073177890860e854780b0db792333f79df1388ac',
			amount: 0.00197900,
			confirmations: 580,
			spendable: true
		}
	];

	const ops = [
		{
			id: 'opid-65f531ba-3fde-4b78-a8e0-bdad702627e4',
			status: 'success',
			creation_time: 1519778150,
			result: {
				txid: '28c9461ccd74a3f9ac6dc54a7a4fe9806ab1b5af2ebf5f40b647c8ef86c1c326'
			},
			execution_secs: 0.0105095,
			method: 'z_sendmany',
			params: {
				fromaddress: 't1atPPxpdgpzC7TUNtZLMq7KCUieEYuJKkn',
				amounts: [
					{
						amount: 0.00001,
						address: 't1MfKGp8b9Spy7z9Lgg8BghaTAaN8Tw88k7'
					}
				],
				minconf: 1,
				fee: 0.0001
			}
		}
	];

	describe('Balance Testing', () => {
		it('error when balance is 0', async () => {
			rpc.getbalance = sinon.stub().returns(0);
			await chai.assert.isRejected(sending.findInputs());
		});

		it(`error when balance is ${config.sendingAmount}`, async () => {
			rpc.getbalance = sinon.stub().returns(config.sendingAmount);
			await chai.assert.isRejected(sending.findInputs());
		});
	});

	describe('Inputs Testing', () => {
		it('error with empty inputs', async () => {
			rpc.getbalance = sinon.stub().returns(1);
			rpc.listunspent = sinon.stub().returns([]);
			await chai.assert.isRejected(sending.findInputs());
		});

		it('pick largest input', async () => {
			rpc.getbalance = sinon.stub().returns(1);
			rpc.listunspent = sinon.stub().returns(inputs);
			await chai.assert.eventually.equal(sending.findInputs(),
				't1R5WEPSsvHowVUAtbQFo4bAFVgaAfh9ySX');
		});
	});

	describe('Send Testing', () => {
		it('send sample drip without referral', async () => {
			rpc.zSendmany = sinon.stub()
				.returns('opid-f746c8ac-116d-476b-8b44-bb098a354dad');

			Object.assign(db, realdb);

			await db.payouts.trim(0);

			await db.payouts.insert({id: '3f5f6846-0d59-40d3-8cda-2b5b54be2e9f',
				operationId: '',
				payoutAddress: 't1KjU2TUgNuWmbyEmYh19AJL5niF5XdUsoa',
				processed: false,
				timestamp: '2018-03-03T14:41:18.333Z',
				transactionId: '',
				referralAddress: ''});

			await chai.assert.eventually.equal(sending
				.sendDrip('t1R5WEPSsvHowVUAtbQFo4bAFVgaAfh9ySX'),
			'opid-f746c8ac-116d-476b-8b44-bb098a354dad');
		});

		it('send sample drip with referral', async () => {
			rpc.zSendmany = sinon.stub()
				.returns('opid-f746c8ac-116d-476b-8b44-bb098a354dad');

			Object.assign(db, realdb);

			await db.payouts.trim(0);

			await db.payouts.insert({id: '3f5f6846-0d59-40d3-8cda-2b5b54be2e9f',
				operationId: '',
				payoutAddress: 't1KjU2TUgNuWmbyEmYh19AJL5niF5XdUsoa',
				processed: false,
				timestamp: '2018-03-03T14:41:18.333Z',
				transactionId: '',
				referralAddress: 't1KjU2TUgNuWmbyEmYh19AJL5niF5XdUsoa'});

			await chai.assert.eventually.equal(sending
				.sendDrip('t1R5WEPSsvHowVUAtbQFo4bAFVgaAfh9ySX'),
			'opid-f746c8ac-116d-476b-8b44-bb098a354dad');
		});

		it('empty drips', async () => {
			rpc.zSendmany = sinon.stub().returns(''); //  block accidentally sending
			db.pendingDrips = sinon.stub().returns([]);

			await chai.assert.eventually.equal(sending
				.sendDrip('t1R5WEPSsvHowVUAtbQFo4bAFVgaAfh9ySX'), 0);
		});
	});

	describe('Update Testing', () => {
		it('update transaction', async () => {
			// relying on other tests...
			rpc.zGetoperationresult = sinon.stub().returns(ops);

			await db.payouts.insert({
				operationId: 'opid-65f531ba-3fde-4b78-a8e0-bdad702627e4'
			});

			await chai.assert.eventually.equal(sending.updateDrips(), 1);
		});
	});

	describe('Main Testing', () => {
		it('make sure it exits properly', async () => {
			rpc.getbalance = sinon.stub().returns(1);
			rpc.listunspent = sinon.stub().returns(inputs);
			rpc.zGetoperationresult = sinon.stub().returns(ops);

			await chai.assert.eventually.equal(sending.main(), 1);
		});

		it('check one error', async () => {
			rpc.getbalance = sinon.stub().returns(0);
			await chai.assert.eventually.equal(sending.main(), 0);
		});
	});
});
