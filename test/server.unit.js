/*jslint node: true */
'use strict';

var supertest = require('supertest');
var api = supertest('http://localhost:5000');

/* jshint undef: true */
var app = require('../server.js');

describe('Server Routes', function() {

  before(function(done) {
     app.listen(5000, done);
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
       .send({'inputAddress': '0x3c2f77619da4225a56b02eae4f9a1e2873435c5b'})
       .expect(302, done); // 302 because we are redirecting to index route
    });

  });

});
