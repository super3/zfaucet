/* global it, describe, before */

const supertest = require('supertest');
const sinon = require('sinon');
const chai = require('chai');

const app = require('../server');
const config = require('../config');

const api = supertest('http://localhost:' + config.port);

const coinhive = require('../lib/coinhive');
const helper = require('./helper');

coinhive.validateCaptcha = helper.validateCaptcha;

describe('Server Routes', () => {
	before(done => {
		app.listen(config.port, done);
	});

	const addr = 't1WtH7oSXf2d8EhfBjXZhCovYog38rHECn3';
	const addrBad = 't1bad7oSXf2d8EhfBjXZhCovYog38rHECn3';

	describe('Index Route', () => {
		it('index should return a 200 response', done => {
			api.get('/').expect(200, done);
		});
	});

	describe('Balance Route', () => {
		it('balance should return a 200 response', async () => {
			const sampleBody = {success: true,
				name: 't1WtH7oSXf2d8EhfBjXZhCovYog38rHECn3',
				total: 25344,
				withdrawn: 24000,
				balance: 1344};
			coinhive.getBalance = sinon.stub().returns(sampleBody);

			const response = await api.get('/api/balance/' + addr)
				.expect('Content-Type', /json/)
				.expect(200);
			chai.assert.strictEqual(response.body.success, true);
		});

		it('invalid address', async () => {
			await api.get('/api/balance/' + addrBad).expect(401);
		});
	});

	describe('Withdraw Route', () => {
		it('invalid address', async () => {
			await api.get('/api/withdraw/' + addrBad).expect(401);
		});

		it('empty balance', async () => {
			const sampleBal = {success: true,
				name: 't1WtH7oSXf2d8EhfBjXZhCovYog38rHECn3',
				total: 25344,
				withdrawn: 24000,
				balance: 0};

			coinhive.getBalance = sinon.stub().returns(sampleBal);
			await api.get('/api/withdraw/' + addr).expect(402);
		});

		it('withdraw success', async () => {
			const sampleBal = {success: true,
				name: 't1WtH7oSXf2d8EhfBjXZhCovYog38rHECn3',
				total: 25344,
				withdrawn: 24000,
				balance: config.withdrawThreshold};
			const sampleWith = {success: true,
				name: 't1WtH7oSXf2d8EhfBjXZhCovYog38rHECn3',
				amount: 2500};
			coinhive.getBalance = sinon.stub().returns(sampleBal);
			coinhive.withdraw = sinon.stub().returns(sampleWith);

			const response = await api.get('/api/withdraw/' + addr)
				.expect(200);
			chai.assert.strictEqual(response.text, 'true');
		});

		it('withdraw fail', async () => {
			const sampleBal = {success: true,
				name: 't1WtH7oSXf2d8EhfBjXZhCovYog38rHECn3',
				total: 25344,
				withdrawn: 24000,
				balance: config.withdrawThreshold};
			const sampleWith = {success: false,
				name: 't1WtH7oSXf2d8EhfBjXZhCovYog38rHECn3'};
			coinhive.getBalance = sinon.stub().returns(sampleBal);
			coinhive.withdraw = sinon.stub().returns(sampleWith);

			await api.get('/api/withdraw/' + addr).expect(403);
		});
	});
});
