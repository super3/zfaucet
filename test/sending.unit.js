var expect = require('chai').expect;
var sending = require('../sending.js');

describe('Sending Script', function() {

  it('create command function', function() {
    var expOut = `zcash-cli z_sendmany "t1gLDWRtoY8xCyyMwQWoUCkm8fjiUJooUY7" `;
    expOut += `"[{\\"amount\\": 0.000001,\\"address\\": `;
    expOut += `\\"t1gLDWRtoY8xCyyMwQWoUCkm8fjiUJooUY7\\"}]" 1 0.000001`;

    expect(sending.createCmd('t1gLDWRtoY8xCyyMwQWoUCkm8fjiUJooUY7',
       0.000001, 't1gLDWRtoY8xCyyMwQWoUCkm8fjiUJooUY7', 0.000001)).
       to.equal(expOut);
  });

});
