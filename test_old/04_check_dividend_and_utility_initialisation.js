//testrpc --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e1c, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e11, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e12, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e13, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e14, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e15, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e16, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e17, 1000000000000000000000000"

const SpectreSubscriberToken = artifacts.require("./SpectreSubscriberTokenMock.sol");
const SpectreUtilityToken = artifacts.require("./SpectreUtilityTokenMock.sol");
const SpectreDividendToken = artifacts.require("./SpectreDividendTokenMock.sol");

const assertFail = require("./helpers/assertFail");

contract('Check Initialisation', function (accounts) {

  var owner = accounts[0];
  var SPECTRE_TEAM = accounts[1];
  var MANAGEMENT_LOCKED = accounts[2];
  var OPTION_POOL = accounts[3];
  var investor_1 = accounts[4];
  var investor_2 = accounts[5];
  var investor_3 = accounts[6];

  // =========================================================================
  it("0. check initial settings", async () => {

    //First get addresses of tokens from deployment
    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();
    var spectreUtilityToken = await SpectreUtilityToken.deployed();
    var spectreDividendToken = await SpectreDividendToken.deployed();

    //Check controllers - controller of utility & dividend tokens is temp tokens
    assert.equal(await spectreUtilityToken.controller(), SpectreSubscriberToken.address, "Controller of utility token should be temp token");
    assert.equal(await spectreDividendToken.controller(), SpectreSubscriberToken.address, "Controller of dividend token should be temp token");

    //Balances should be zero
    assert.equal(await spectreUtilityToken.totalSupply(), 0, "utility token should have 0 supply");
    assert.equal(await spectreDividendToken.totalSupply(), 0, "utility token should have 0 supply");

  });

  it("1. check wallet address details", async () => {

    var spectreUtilityToken = await SpectreUtilityToken.deployed();
    var spectreDividendToken = await SpectreDividendToken.deployed();

    assert.equal((await spectreUtilityToken.spectreTeam.call()), SPECTRE_TEAM, "spectreTeam account should be set");
    assert.equal((await spectreUtilityToken.managementLocked.call()), MANAGEMENT_LOCKED, "managementLocked account should be set");
    assert.equal((await spectreUtilityToken.optionPool.call()), OPTION_POOL, "optionPool account should be set");

    assert.equal((await spectreDividendToken.spectreTeam.call()), SPECTRE_TEAM, "spectreTeam account should be set");
    assert.equal((await spectreDividendToken.managementLocked.call()), MANAGEMENT_LOCKED, "managementLocked account should be set");
    assert.equal((await spectreDividendToken.optionPool.call()), OPTION_POOL, "optionPool account should be set");

  });

});
