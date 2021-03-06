//testrpc --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e1c, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e11, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e12, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e13, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e14, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e15, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e16, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e17, 1000000000000000000000000"

const SpectreSubscriber2Token = artifacts.require("./SpectreSubscriber2TokenMock.sol");
const SpectreUtilityToken = artifacts.require("./SpectreUtilityTokenMock.sol");
const SpectreDividendToken = artifacts.require("./SpectreDividendTokenMock.sol");

const assertFail = require("./helpers/assertFail");

contract('Mixed Utility and Dividend Transfers', function (accounts) {

  var owner = accounts[0];
  var SPECTRE_TEAM = accounts[1];
  var MANAGEMENT_LOCKED = accounts[2];
  var OPTION_POOL = accounts[3];
  var investor_1 = accounts[4];
  var investor_2 = accounts[5];
  var investor_3 = accounts[6];

  var TOKENSDEC = 1000000000000000000;

  // =========================================================================
  it("0. initialise all subscriber tokens", async () => {

    var spectreSubscriberToken = await SpectreSubscriber2Token.deployed();
    var spectreUtilityToken = await SpectreUtilityToken.deployed();
    var spectreDividendToken = await SpectreDividendToken.deployed();

    await spectreSubscriberToken.mint(investor_1, web3.toWei(500 * 2000, 'ether'));
    await spectreSubscriberToken.mint(investor_2, web3.toWei(1000 * 2000, 'ether'));
    await spectreSubscriberToken.mint(investor_3, web3.toWei(1500 * 2000, 'ether'));

  });

  it("1. investor transfers 50% of tokens to utility contract and 50% to dividend contract", async () => {

    var spectreSubscriberToken = await SpectreSubscriber2Token.deployed();
    var spectreUtilityToken = await SpectreUtilityToken.deployed();
    var spectreDividendToken = await SpectreDividendToken.deployed();

    //Transfer to dividend token
    await spectreSubscriberToken.transfer(SpectreDividendToken.address, 1000000 * TOKENSDEC, {from: investor_2});
    //Transfer to utiity token
    await spectreSubscriberToken.transfer(SpectreUtilityToken.address, 1000000 * TOKENSDEC, {from: investor_2});

    //Check investor balances
    assert.equal((await spectreSubscriberToken.balanceOf(investor_2)).toNumber(), 0, "Remaining temp balance of 0");
    assert.equal((await spectreSubscriberToken.balanceOf(SpectreDividendToken.address)).toNumber(), 1000000 * TOKENSDEC, "Dividend Token has Temp balance of 1000000");
    assert.equal((await spectreSubscriberToken.balanceOf(SpectreUtilityToken.address)).toNumber(), 1000000 * TOKENSDEC, "Utility Token has Temp balance of 1000000");
    assert.equal((await spectreDividendToken.balanceOf(investor_2)).toNumber(), 1000000 * TOKENSDEC, "New dividend balance of 1000000");
    assert.equal((await spectreUtilityToken.balanceOf(investor_2)).toNumber(), 1000000 * TOKENSDEC, "New utility balance of 1000000");

  });

  it("2. spectre wallets receive dividend token allocations", async () => {

    var spectreSubscriberToken = await SpectreSubscriber2Token.deployed();
    var spectreUtilityToken = await SpectreUtilityToken.deployed();
    var spectreDividendToken = await SpectreDividendToken.deployed();

    //Check spectre wallet balances
    //1000000 tokens transferred, so spectreTeam has 42/100 * 1000000 = 420000, managementLocked has 18/100 * 1000000 = 180000, optionPool has 40/100 * 1000000 = 400000
    assert.equal((await spectreDividendToken.balanceOf(SPECTRE_TEAM)).toNumber(), 420000 * TOKENSDEC, "Spectre Team has 42 tokens");
    assert.equal((await spectreDividendToken.balanceOf(MANAGEMENT_LOCKED)).toNumber(), 180000 * TOKENSDEC, "Spectre Team has 18 tokens");
    assert.equal((await spectreDividendToken.balanceOf(OPTION_POOL)).toNumber(), 400000 * TOKENSDEC, "Spectre Team has 40 tokens");

  });

  it("3. spectre wallets receive utility token allocations", async () => {

    var spectreSubscriberToken = await SpectreSubscriber2Token.deployed();
    var spectreUtilityToken = await SpectreUtilityToken.deployed();
    var spectreDividendToken = await SpectreDividendToken.deployed();

    //Check spectre wallet balances
    //1000000 tokens transferred, so spectreTeam has 42/100 * 1000000 = 420000, managementLocked has 18/100 * 1000000 = 180000, optionPool has 40/100 * 1000000 = 400000
    assert.equal((await spectreUtilityToken.balanceOf(SPECTRE_TEAM)).toNumber(), 420000 * TOKENSDEC, "Spectre Team has 420000 tokens");
    assert.equal((await spectreUtilityToken.balanceOf(MANAGEMENT_LOCKED)).toNumber(), 180000 * TOKENSDEC, "Spectre Team has 180000 tokens");
    assert.equal((await spectreUtilityToken.balanceOf(OPTION_POOL)).toNumber(), 400000 * TOKENSDEC, "Spectre Team has 400000 tokens");

  });

  it("4. new investor transfers some tokens to utility and dividend contracts", async () => {

    var spectreSubscriberToken = await SpectreSubscriber2Token.deployed();
    var spectreUtilityToken = await SpectreUtilityToken.deployed();
    var spectreDividendToken = await SpectreDividendToken.deployed();

    //Transfer to dividend token
    await spectreSubscriberToken.transfer(SpectreDividendToken.address, 250000 * TOKENSDEC, {from: investor_1});
    //Transfer to utiity token
    await spectreSubscriberToken.transfer(SpectreUtilityToken.address, 250000 * TOKENSDEC, {from: investor_1});

    //Check investor balances
    assert.equal((await spectreSubscriberToken.balanceOf(investor_1)).toNumber(), 500000 * TOKENSDEC, "Remaining temp balance of 500000");
    assert.equal((await spectreSubscriberToken.balanceOf(SpectreDividendToken.address)).toNumber(), 1250000 * TOKENSDEC, "Dividend Token has Temp balance of 1250000");
    assert.equal((await spectreSubscriberToken.balanceOf(SpectreUtilityToken.address)).toNumber(), 1250000 * TOKENSDEC, "Utility Token has Temp balance of 1250000");
    assert.equal((await spectreDividendToken.balanceOf(investor_1)).toNumber(), 250000 * TOKENSDEC, "New dividend balance of 250000");
    assert.equal((await spectreDividendToken.balanceOf(investor_1)).toNumber(), 250000 * TOKENSDEC, "New utility balance of 250000");

  });

  it("5. spectre wallets receives more dividend token allocations", async () => {

    var spectreSubscriberToken = await SpectreSubscriber2Token.deployed();
    var spectreUtilityToken = await SpectreUtilityToken.deployed();
    var spectreDividendToken = await SpectreDividendToken.deployed();

    //Check spectre wallet balances
    //250000 tokens transferred, so spectreTeam has 42/100 * 250000 = 105000, managementLocked has 18/100 * 250000 = 45000, optionPool has 40/100 * 250000 = 100000
    assert.equal((await spectreDividendToken.balanceOf(SPECTRE_TEAM)).toNumber(), (420000 + 105000) * TOKENSDEC, "Spectre Team has 420000 + 105000 tokens");
    assert.equal((await spectreDividendToken.balanceOf(MANAGEMENT_LOCKED)).toNumber(), (180000 + 45000) * TOKENSDEC, "Spectre Team has 180000 + 45000 tokens");
    assert.equal((await spectreDividendToken.balanceOf(OPTION_POOL)).toNumber(), (400000 + 100000) * TOKENSDEC, "Spectre Team has 400000 + 100000 tokens");

  });


  it("6. spectre wallets receives more utility token allocations", async () => {

    var spectreSubscriberToken = await SpectreSubscriber2Token.deployed();
    var spectreUtilityToken = await SpectreUtilityToken.deployed();
    var spectreDividendToken = await SpectreDividendToken.deployed();

    //Check spectre wallet balances
    //250000 tokens transferred, so spectreTeam has 42/100 * 250000 = 105000, managementLocked has 18/100 * 250000 = 45000, optionPool has 40/100 * 250000 = 100000
    assert.equal((await spectreUtilityToken.balanceOf(SPECTRE_TEAM)).toNumber(), (420000 + 105000) * TOKENSDEC, "Spectre Team has 420000 + 105000 tokens");
    assert.equal((await spectreUtilityToken.balanceOf(MANAGEMENT_LOCKED)).toNumber(), (180000 + 45000) * TOKENSDEC, "Spectre Team has 180000 + 45000 tokens");
    assert.equal((await spectreUtilityToken.balanceOf(OPTION_POOL)).toNumber(), (400000 + 100000) * TOKENSDEC, "Spectre Team has 40 + 10 tokens");

  });

});
