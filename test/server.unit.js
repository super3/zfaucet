/* global it, describe, before */

const supertest = require('supertest');
const sinon = require('sinon');
const chai = require('chai');

const app = require('../server');
const config = require('../config');

const api = supertest('http://localhost:' + config.port);

const coinhive = require('../lib/coinhive');
const helper = require('./helper');

describe('Server Routes', () => {
	before(done => {
		app.listen(config.port, done);
	});

	describe('Index Route', () => {
		it('index should return a 200 response', done => {
			api.get('/').expect(200, done);
		});
	});

	describe('Index with Referral', () => {
		it('index with bad referral', done => {
			api.get(`?referral=${helper.invalidAddr}`).expect(200, done);
		});
		it('index with good referral', done => {
			api.get(`/?referral=${helper.validAddr}`).expect(200, done);
		});
	});

	describe('Address Check Route', () => {
		const route = '/api/check/';

		it('good address', async () => {
			const response = await api.get(route + helper.validAddr).expect(200);
			chai.assert.strictEqual(response.text, 'true');
		});

		it('bad address', async () => {
			const response = await api.get(route + helper.invalidAddr).expect(200);
			chai.assert.strictEqual(response.text, 'false');
		});
	});

	describe('Recent Routes', () => {
		it('recent should return a 200 response', done => {
			api.get('/api/recent').expect(200, done);
		});

		it('recent + address should return a 200 response', done => {
			api.get('/api/recent/' + helper.validAddr).expect(200, done);
		});

		it('recent + bad address should return a 401 response', done => {
			api.get('/api/recent/' + helper.invalidAddr).expect(401, done);
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

			const response = await api.get('/api/balance/' + helper.validAddr)
				.expect('Content-Type', /json/)
				.expect(200);
			chai.assert.strictEqual(response.body.success, true);
		});

		it('invalid address', async () => {
			await api.get('/api/balance/' + helper.invalidAddr).expect(401);
		});
	});

	describe('Withdraw Route', () => {
		it('invalid address', async () => {
			await api.get('/api/withdraw/' + helper.invalidAddr).expect(401);
		});

		it('empty balance', async () => {
			const sampleBal = {success: true,
				name: 't1WtH7oSXf2d8EhfBjXZhCovYog38rHECn3',
				total: 25344,
				withdrawn: 24000,
				balance: 0};

			coinhive.getBalance = sinon.stub().returns(sampleBal);
			await api.get('/api/withdraw/' + helper.validAddr).expect(402);
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

			const response = await api.get('/api/withdraw/' + helper.validAddr)
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

			await api.get('/api/withdraw/' + helper.validAddr).expect(403);
		});
	});
});
