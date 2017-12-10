//testrpc --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e1c, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e11, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e12, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e13, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e14, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e15, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e16, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e17, 1000000000000000000000000"

const SpectreSubscriber2Token = artifacts.require("./SpectreSubscriber2TokenMock.sol");
const SpectreUtilityToken = artifacts.require("./SpectreUtilityTokenMock.sol");
const SpectreDividendToken = artifacts.require("./SpectreDividendTokenMock.sol");

const assertFail = require("./helpers/assertFail");

contract('Check Initialisation', function (accounts) {

  var OWNER = accounts[0];
  var WALLET = accounts[1];
  var SPECTRE_TEAM = accounts[2];
  var MANAGEMENT_LOCKED = accounts[3];
  var OPTION_POOL = accounts[4];
  var investor_1 = accounts[5];
  var investor_2 = accounts[6];
  var investor_3 = accounts[7];

  // =========================================================================
  it("0. check initial settings", async () => {

    var spectreSubscriberToken = await SpectreSubscriber2Token.deployed();
    var spectreUtilityToken = await SpectreUtilityToken.deployed();
    var spectreDividendToken = await SpectreDividendToken.deployed();

    //Balances should be zero
    assert.equal(await spectreSubscriberToken.totalSupply(), 0, "subscriber token should have 0 supply");

    //Check utility / dividend contract addresses
    assert.equal(await spectreSubscriberToken.specUWallet(), SpectreUtilityToken.address, "Utility Address set");
    assert.equal(await spectreSubscriberToken.specDWallet(), SpectreDividendToken.address, "Dividend Address set");
  });

});
