var expect = require('chai').expect;
var utils = require('../lib/utils.js');

describe('Backend Utils', function() {

  describe('timeSince function', function() {

    // subtract hours from a Date
    Date.prototype.subtractMinutes= function(m){
      this.setMinutes(this.getMinutes()-m);
      return this;
    };

    it('check timeSince function', function() {
      var currentTime = new Date();

      // current time
      expect(utils.timeSince(currentTime)).to.equal('0 seconds');

      // subtract 10 minutes
      currentTime.subtractMinutes(10);
      expect(utils.timeSince(currentTime)).to.equal('10 minutes');

      // subtract 2 hours
      currentTime.subtractMinutes(120);
      expect(utils.timeSince(currentTime)).to.equal('2 hours');

      // subtract 2 days
      currentTime.subtractMinutes(2880);
      expect(utils.timeSince(currentTime)).to.equal('2 days');

    });

  });

});
