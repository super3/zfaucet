/*jslint node: true */
'use strict';

var supertest = require('supertest');
var api = supertest('http://localhost');

/* jshint undef: true */
var app     = require('../server.js');
var db      = require('../lib/db.js');
var port    = process.env.PORT || 80;

describe('Server Routes', function() {

  before(function(done) {
    app.listen(port, done);
  });

  describe('Index Route', function() {

    it('index should return a 200 response', function(done) {
      api.get('/').expect(200, done);
    });

  });

  describe('Add Route', function() {

    it('missing inputAddress in /api/add', function(done) {
      api.post('/api/add')
       .set("Content-Type", "application/json")
       .type("form")
       .send({'invalidAddress': 'notcorrectforminput'})
       .expect(400, done);
    });

    it('sample address to /api/add', function(done) {
      api.post('/api/add')
       .set("Content-Type", "application/json")
       .type("form")
       .send({'inputAddress': 't1KjU2TUgNuWmbyEmYh19AJL5niF5XdUsoa'})
       .expect(302, done); // 302 because we are redirecting to index route
    });

    it('invalid address to /api/add', function(done) {
      api.post('/api/add')
       .set("Content-Type", "application/json")
       .type("form")
       .send({'inputAddress': 'notvalidaddress'})
       .expect(400, done);
    });

    it('changed address to /api/add', function(done) {
      api.post('/api/add')
       .set("Content-Type", "application/json")
       .type("form")
       .send({'inputAddress': 't1KjU2TUgNuWmbyXmYh19AJL5niF5EdUsoa'})
       .expect(400, done);
    });

  });

});
