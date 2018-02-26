//var expect = require('chai').expect;
var sending = require('../sending.js');
const assert = require("assert");

describe('Sending Script', function() {

  describe("testBalance", function() {
    it("should fail on 0", async () => {
      const rpc = {
        getbalance: async () => 0
      };

      try {
        await sending.testBalance(rpc)
      } catch(err) {
        return;
      }

      throw new Error();
    });
  });

  // it('test balance', async function() {
  //   const rpcBalance = Symbol();
  //
  //   const rpc = {
  //     getbalance: async () => rpcBalance
  //   };
  //
  //   const balance = await sending.testBalance(rpc);
  //
  //   expect(balance).to.be.a("number");
  // });

});
