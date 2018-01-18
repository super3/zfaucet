/*jslint node: true */
'use strict';

var supertest = require('supertest');
var api = supertest('http://localhost:5000');

/* jshint undef: true */
var app = require('../server.js');

describe('App', function() {

  before(function(done) {
     app.listen(5000, done);
  });

  it('index should return a 200 response', function(done) {
    api.get('/').expect(200, done);
  });

});
