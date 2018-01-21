var expect = require('chai').expect;
var utils = require('../lib/utils.js');

describe('Backend Utils', function() {

  describe('timeSince function', function() {

    // subtract hours from a Date
    Date.prototype.subtractHours= function(h){
      this.setHours(this.getHours()-h);
      return this;
    };

    it('check timeSince function', function() {
      // current date plus 2 hours
      var currentTime = new Date();
      currentTime.subtractHours(2);
      expect(utils.timeSince(currentTime)).to.equal('2 hours');
    });

  });

});
