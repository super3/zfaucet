/*jslint node: true */
'use strict';

var mongoose = require('mongoose');
var supertest = require('supertest'); // import problems. hold on
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
      res.text.should.contain('<!doctype html>')
      done()
    })
  })

});

// C:\Users\super3\Code\ethfaucet>npm test
//
// > ethfaucet@0.1.0 test C:\Users\super3\Code\ethfaucet
// > npm run testsuite && npm run linter
//
//
// > ethfaucet@0.1.0 testsuite C:\Users\super3\Code\ethfaucet
// > mocha test/* --recursive --exit
//
//
//
//   App
//     √ index should return a 200 response
// res.body {}
//     1) should contain some text in the page
//
//
//   1 passing (62ms)
//   1 failing
//
//   1) App
//        should contain some text in the page:
//      Uncaught TypeError: Cannot read property 'length' of undefined
//       at Test.api.get.end (test\server.unit.js:26:21)
//       at Test.assert (node_modules\supertest\lib\test.js:179:6)
//       at assert (node_modules\supertest\lib\test.js:131:12)
//       at node_modules\supertest\lib\test.js:128:5
//       at Test.Request.callback (node_modules\superagent\lib\node\index.js:706:12)
//       at IncomingMessage.parser (node_modules\superagent\lib\node\index.js:906:18)
//       at endReadableNT (_stream_readable.js:1055:12)
//       at _combinedTickCallback (internal/process/next_tick.js:138:11)
//       at process._tickCallback (internal/process/next_tick.js:180:9)
//
//
//
// npm ERR! code ELIFECYCLE
// npm ERR! errno 1
// npm ERR! ethfaucet@0.1.0 testsuite: `mocha test/* --recursive --exit`
// npm ERR! Exit status 1
// npm ERR!
// npm ERR! Failed at the ethfaucet@0.1.0 testsuite script.
// npm ERR! This is probably not a problem with npm. There is likely additional logging output above.
//
// npm ERR! A complete log of this run can be found in:
// npm ERR!     C:\Users\super3\AppData\Roaming\npm-cache\_logs\2018-01-14T00_49_42_336Z-debug.log
// npm ERR! Test failed.  See above for more details.
