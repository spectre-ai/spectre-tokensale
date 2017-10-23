//testrpc --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e1c, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e11, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e12, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e13, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e14, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e15, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e16, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e17, 1000000000000000000000000"

const SpectreSubscriberToken = artifacts.require("./SpectreSubscriberTokenMock.sol");
const SpectreUtilityToken = artifacts.require("./SpectreUtilityTokenMock.sol");
const SpectreDividendToken = artifacts.require("./SpectreDividendTokenMock.sol");

const assertFail = require("./helpers/assertFail");

contract('Check ICO Initialisation', function (accounts) {

  var presaleStart = 1509105600; //12am GMT 27th Oct
  var presaleEnd = 1509883200; //12am GMT 5th Nov
  var saleStart = 1510920000; //12am GMT 17th Nov
  var saleEnd = 1512907200; //12am GMT 10th Dec
  var discountSaleEnd = 1511524800; //9am GMT 24th Nov

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

    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();
    var spectreUtilityToken = await SpectreUtilityToken.deployed();
    var spectreDividendToken = await SpectreDividendToken.deployed();

    //Check wallet address
    assert.equal(await spectreSubscriberToken.specWallet(), WALLET, "Wallet set");

    //Balances should be zero
    assert.equal(await spectreSubscriberToken.totalSupply(), 0, "subscriber token should have 0 supply");

    //Check start and end times
    assert.equal(await spectreSubscriberToken.presaleStart(), presaleStart, "presaleStart set correctly");
    assert.equal(await spectreSubscriberToken.presaleEnd(), presaleEnd, "preSaleEnd set correctly");
    assert.equal(await spectreSubscriberToken.saleStart(), saleStart, "saleStart set correctly");
    assert.equal(await spectreSubscriberToken.saleEnd(), saleEnd, "saleEnd set correctly");
    assert.equal(await spectreSubscriberToken.discountSaleEnd(), discountSaleEnd, "discountSaleEnd set correctly");

    //Check utility / dividend contract addresses
    assert.equal(await spectreSubscriberToken.specUWallet(), SpectreUtilityToken.address, "Wallet set");
    assert.equal(await spectreSubscriberToken.specDWallet(), SpectreDividendToken.address, "Wallet set");
  });

  it("1. initialise and check whitelists", async () => {
    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();

    await spectreSubscriberToken.setWhiteList(investor_1, web3.toWei(1, 'ether'));
    await spectreSubscriberToken.setWhiteList(investor_2, web3.toWei(2, 'ether'));

    assert.equal((await spectreSubscriberToken.whitelist(investor_1)).toNumber(), web3.toWei(1, 'ether'), "investor_1 whitelist set");
    assert.equal((await spectreSubscriberToken.whitelist(investor_2)).toNumber(), web3.toWei(2, 'ether'), "investor_2 whitelist set");
    assert.equal((await spectreSubscriberToken.whitelist(investor_3)).toNumber(), 0, "investor_3 not whitelist set");
  });
});
