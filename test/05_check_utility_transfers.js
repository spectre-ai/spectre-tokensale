//testrpc --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e1c, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e11, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e12, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e13, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e14, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e15, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e16, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e17, 1000000000000000000000000"

const SpectreSubscriber2Token = artifacts.require("./SpectreSubscriber2TokenMock.sol");
const SpectreUtilityToken = artifacts.require("./SpectreUtilityTokenMock.sol");
const SpectreDividendToken = artifacts.require("./SpectreDividendTokenMock.sol");

const assertFail = require("./helpers/assertFail");

contract('Check Utility Transfers', function (accounts) {

  var OWNER = accounts[0];
  var SPECTRE_TEAM = accounts[1];
  var MANAGEMENT_LOCKED = accounts[2];
  var OPTION_POOL = accounts[3];
  var investor_1 = accounts[4];
  var investor_2 = accounts[5];
  var investor_3 = accounts[6];

  var TOKENSDEC = 1000000000000000000;
  var transferTime = 1513112400;
  var saleEnd = 1512907200;

  // =========================================================================
  it("0. initialise all subscriber tokens", async () => {

    var spectreSubscriberToken = await SpectreSubscriber2Token.deployed();
    var spectreUtilityToken = await SpectreUtilityToken.deployed();
    var spectreDividendToken = await SpectreDividendToken.deployed();

    await spectreSubscriberToken.mint(investor_1, web3.toWei(500 * 2000, 'ether'));
    await spectreSubscriberToken.mint(investor_2, web3.toWei(1000 * 2000, 'ether'));
    await spectreSubscriberToken.mint(investor_3, web3.toWei(1500 * 2000, 'ether'));
    await spectreSubscriberToken.setTransferTime(transferTime);

  });

  it("0.1 check can not transfer before transfer time", async () => {

    var spectreSubscriberToken = await SpectreSubscriber2Token.deployed();
    var spectreUtilityToken = await SpectreUtilityToken.deployed();
    var spectreDividendToken = await SpectreDividendToken.deployed();
    await assertFail(async () => {
      await spectreSubscriberToken.transfer(SpectreUtilityToken.address, 500000 * TOKENSDEC, {from: investor_1});
    });

  });

  it("1. investor transfers 50% of tokens to utility contract", async () => {

    var spectreSubscriberToken = await SpectreSubscriber2Token.deployed();
    var spectreUtilityToken = await SpectreUtilityToken.deployed();
    var spectreDividendToken = await SpectreDividendToken.deployed();

    await spectreSubscriberToken.setMockedNow(transferTime + 1);

    //Transfer to utility token
    await spectreSubscriberToken.transfer(SpectreUtilityToken.address, 500000 * TOKENSDEC, {from: investor_1});

    //Check investor balances
    assert.equal((await spectreSubscriberToken.balanceOf(investor_1)).toNumber(), 500000 * TOKENSDEC, "Remaining temp balance of 500000");
    assert.equal((await spectreSubscriberToken.balanceOf(SpectreUtilityToken.address)).toNumber(), 500000 * TOKENSDEC, "Utility Token has Temp balance of 500000");
    assert.equal((await spectreUtilityToken.balanceOf(investor_1)).toNumber(), 500000 * TOKENSDEC, "New utility balance of 500000");

  });

  it("2. spectre wallets receive utility token allocations", async () => {

    var spectreSubscriberToken = await SpectreSubscriber2Token.deployed();
    var spectreUtilityToken = await SpectreUtilityToken.deployed();
    var spectreDividendToken = await SpectreDividendToken.deployed();

    //Check spectre wallet balances
    //500000 tokens transferred, so spectreTeam has 42/100 * 500000 = 210000, managementLocked has 18/100 * 500000 = 90000, optionPool has 40/100 * 500000 = 200000
    assert.equal((await spectreUtilityToken.balanceOf(SPECTRE_TEAM)).toNumber(), 210000 * TOKENSDEC, "Spectre Team has 210000 tokens");
    assert.equal((await spectreUtilityToken.balanceOf(MANAGEMENT_LOCKED)).toNumber(), 90000 * TOKENSDEC, "Spectre Team has 90000 tokens");
    assert.equal((await spectreUtilityToken.balanceOf(OPTION_POOL)).toNumber(), 200000 * TOKENSDEC, "Spectre Team has 200000 tokens");

  });

  it("3. owner transfers remaining investor tokens to utility contract", async () => {

    var spectreSubscriberToken = await SpectreSubscriber2Token.deployed();
    var spectreUtilityToken = await SpectreUtilityToken.deployed();
    var spectreDividendToken = await SpectreDividendToken.deployed();

    await assertFail(async () => {
      await spectreSubscriberToken.transferFrom(investor_1, SpectreUtilityToken.address, 500000 * TOKENSDEC, {from: OWNER});
    });

    //Transfer to utility token
    await spectreSubscriberToken.setMockedNow(saleEnd + 1 + 28 * 24 * 60 * 60);
    await spectreSubscriberToken.transferFrom(investor_1, SpectreUtilityToken.address, 500000 * TOKENSDEC, {from: OWNER});

    //Check investor balances
    assert.equal((await spectreSubscriberToken.balanceOf(investor_1)).toNumber(), 0, "Remaining temp balance of 0");
    assert.equal((await spectreSubscriberToken.balanceOf(SpectreUtilityToken.address)).toNumber(), 1000000 * TOKENSDEC, "Utility Token has Temp balance of 1000000");
    assert.equal((await spectreUtilityToken.balanceOf(investor_1)).toNumber(), 1000000 * TOKENSDEC, "New utility balance of 1000000");

  });

  it("4. spectre wallets receives more utility token allocations", async () => {

    var spectreSubscriberToken = await SpectreSubscriber2Token.deployed();
    var spectreUtilityToken = await SpectreUtilityToken.deployed();
    var spectreDividendToken = await SpectreDividendToken.deployed();

    //Check spectre wallet balances
    assert.equal((await spectreUtilityToken.balanceOf(SPECTRE_TEAM)).toNumber(), 420000 * TOKENSDEC, "Spectre Team has 420000 tokens");
    assert.equal((await spectreUtilityToken.balanceOf(MANAGEMENT_LOCKED)).toNumber(), 180000 * TOKENSDEC, "Spectre Team has 180000 tokens");
    assert.equal((await spectreUtilityToken.balanceOf(OPTION_POOL)).toNumber(), 400000 * TOKENSDEC, "Spectre Team has 400000 tokens");

  });

  it("5. further token transfers fail", async () => {

    var spectreSubscriberToken = await SpectreSubscriber2Token.deployed();
    var spectreUtilityToken = await SpectreUtilityToken.deployed();
    var spectreDividendToken = await SpectreDividendToken.deployed();

    await assertFail(async () => {
      await spectreSubscriberToken.transfer(SpectreUtilityToken.address, 1, {from: investor_1});
    });

  });



});
