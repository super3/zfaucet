/*jslint node: true */
'use strict';

var mongoose = require('mongoose');
var supertest = require('supertest');
var api = supertest('http://localhost:8080');
var chai = require('chai');
var should = chai.should()

/* jshint undef: true */
var app = require('../server.js');

describe('App', function() {

  before(function(done) {
     app.listen(8080, done);
  });

  it('index should return a 200 response', function(done) {
    api.get('/').expect(200, done);
  });

  it('should test the content of the response', done => {
    api.get('/').end((err, res) => {
      should.not.exist(err);
      res.status.should.equal(200);
      console.log('res.body', res.body)
      done()
    })
  })

});
