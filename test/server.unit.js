/* global it, describe, before */

const supertest = require('supertest');

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

	describe('Index Route', () => {
		it('index should return a 200 response', done => {
			api.get('/').expect(200, done);
		});
	});
});
