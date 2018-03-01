/* global it, describe, before */

const supertest = require('supertest');

const app = require('../server.js');
const config = require('../config.js');

const api = supertest('http://localhost:' + config.port);

const captcha = require('../lib/captcha');
const helper = require('./helper');

captcha.validateCaptcha = helper.validateCaptcha;

describe('Server Routes', () => {
	before(done => {
		app.listen(config.port, done);
	});

	describe('Index Route', () => {
		it('index should return a 200 response', done => {
			api.get('/').expect(200, done);
		});
	});

	describe('Add Route', () => {
		it('missing inputAddress in /api/add', done => {
			api.post('/api/add')
				.set('Content-Type', 'application/json')
				.type('form')
				.send({inputAddress: 'notcorrectforminput',
					'coinhive-captcha-token': 'DS6WL3kCBmnMSPN3vsXspJEOdEIP6Era'})
				.expect(400, done);
		});

		it('no inputAddress in /api/add', done => {
			api.post('/api/add')
				.set('Content-Type', 'application/json')
				.type('form')
				.send({'coinhive-captcha-token': 'DS6WL3kCBmnMSPN3vsXspJEOdEIP6Era'})
				.expect(400, done);
		});

		it('sample address to /api/add', done => {
			api.post('/api/add')
				.set('Content-Type', 'application/json')
				.type('form')
				.send({inputAddress: 't1KjU2TUgNuWmbyEmYh19AJL5niF5XdUsoa',
					'coinhive-captcha-token': 'DS6WL3kCBmnMSPN3vsXspJEOdEIP6Era'})
				.expect(302, done); // 302 because we are redirecting to index route
		});

		it('invalid address to /api/add', done => {
			api.post('/api/add')
				.set('Content-Type', 'application/json')
				.type('form')
				.send({inputAddress: 'notvalidaddress',
					'coinhive-captcha-token': 'DS6WL3kCBmnMSPN3vsXspJEOdEIP6Era'})
				.expect(400, done);
		});

		it('changed address to /api/add', done => {
			api.post('/api/add')
				.set('Content-Type', 'application/json')
				.type('form')
				.send({inputAddress: 't1KjU2TUgNuWmbyXmYh19AJL5niF5EdUsoa',
					'coinhive-captcha-token': 'DS6WL3kCBmnMSPN3vsXspJEOdEIP6Era'})
				.expect(400, done);
		});

		it('empty captcha token on /api/add', done => {
			api.post('/api/add')
				.set('Content-Type', 'application/json')
				.type('form')
				.send({inputAddress: 't1KjU2TUgNuWmbyEmYh19AJL5niF5XdUsoa'})
				.expect(400, done);
		});

		it('invalid captcha token on /api/add', done => {
			api.post('/api/add')
				.set('Content-Type', 'application/json')
				.type('form')
				.send({inputAddress: 't1KjU2TUgNuWmbyEmYh19AJL5niF5XdUsoa',
					'coinhive-captcha-token': 'invalidcaptcha'})
				.expect(400, done);
		});
	});
});
