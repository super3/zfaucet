var expect = require('chai').expect;
var sending = require('../sending2.js');

describe('Sending Script', function() {

  it('test balance', function() {
    sending.testBalance().then(balance => {
      console.log(balance);
    });
  });

});
