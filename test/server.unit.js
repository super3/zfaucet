/*jslint node: true */
'use strict';

var mongoose = require('mongoose');
var supertest = require('supertest');
var api = supertest('http://localhost:8080');

/* jshint undef: true */
var app = require('../server.js');

describe('App', function() {

  before(function(done) {
     app.listen(8080, done);
  });

  it('index should return a 200 response', function(done) {
    api.get('/').expect(200, done);
  });

});
