//testrpc --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e1c, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e11, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e12, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e13, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e14, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e15, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e16, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e17, 1000000000000000000000000"

const BigNumber = require("bignumber.js");

const SpectreSubscriber2Token = artifacts.require("./SpectreSubscriber2TokenMock.sol");
const SpectreUtilityToken = artifacts.require("./SpectreUtilityTokenMock.sol");
const SpectreDividendToken = artifacts.require("./SpectreDividendTokenMock.sol");

const assertFail = require("./helpers/assertFail");
const D160 = new BigNumber("10000000000000000000000000000000000000000", 16);

contract('Check Burning', function (accounts) {

  var OWNER = accounts[0];
  var WALLET = accounts[1];
  var SPECTRE_TEAM = accounts[2];
  var MANAGEMENT_LOCKED = accounts[3];
  var OPTION_POOL = accounts[4];
  var investor_1 = accounts[5];
  var investor_2 = accounts[6];
  var investor_3 = accounts[7];
  var TOKENSDEC = 10**18;

  // =========================================================================
  it("0. mint some tokens", async () => {

    var spectreSubscriberToken = await SpectreSubscriber2Token.deployed();
    var spectreUtilityToken = await SpectreUtilityToken.deployed();
    var spectreDividendToken = await SpectreDividendToken.deployed();

    await spectreSubscriberToken.mint(investor_1, 1000 * TOKENSDEC, {from: OWNER});
    await spectreSubscriberToken.mint(investor_2, 2000 * TOKENSDEC, {from: OWNER});
    await spectreSubscriberToken.mint(investor_3, 3000 * TOKENSDEC, {from: OWNER});

    var investor_1_balance = await spectreSubscriberToken.balanceOf(investor_1);
    var investor_2_balance = await spectreSubscriberToken.balanceOf(investor_2);
    var investor_3_balance = await spectreSubscriberToken.balanceOf(investor_3);

    assert.equal(investor_1_balance.toNumber(), 1000 * TOKENSDEC, "investor_1 set");
    assert.equal(investor_2_balance.toNumber(), 2000 * TOKENSDEC, "investor_2 set");
    assert.equal(investor_3_balance.toNumber(), 3000 * TOKENSDEC, "investor_3 set");

  });

  it("1. check non-owner can not burn tokens", async () => {

    var spectreSubscriberToken = await SpectreSubscriber2Token.deployed();
    var spectreUtilityToken = await SpectreUtilityToken.deployed();
    var spectreDividendToken = await SpectreDividendToken.deployed();

    await assertFail(async () => {
      await spectreSubscriberToken.burn(investor_1, 1000 * TOKENSDEC, {from: investor_1});
    });

  });

  it("1. check owner can burn tokens", async () => {

    var spectreSubscriberToken = await SpectreSubscriber2Token.deployed();
    var spectreUtilityToken = await SpectreUtilityToken.deployed();
    var spectreDividendToken = await SpectreDividendToken.deployed();

    await spectreSubscriberToken.burn(investor_1, 500 * TOKENSDEC, {from: OWNER});
    await spectreSubscriberToken.burn(investor_2, 1000 * TOKENSDEC, {from: OWNER});
    await spectreSubscriberToken.burn(investor_3, 1500 * TOKENSDEC, {from: OWNER});

    var investor_1_balance = await spectreSubscriberToken.balanceOf(investor_1);
    var investor_2_balance = await spectreSubscriberToken.balanceOf(investor_2);
    var investor_3_balance = await spectreSubscriberToken.balanceOf(investor_3);

    assert.equal(investor_1_balance.toNumber(), 500 * TOKENSDEC, "investor_1 set");
    assert.equal(investor_2_balance.toNumber(), 1000 * TOKENSDEC, "investor_2 set");
    assert.equal(investor_3_balance.toNumber(), 1500 * TOKENSDEC, "investor_3 set");

  });

  it("1. check owner can multi-burn tokens", async () => {

    var spectreSubscriberToken = await SpectreSubscriber2Token.deployed();
    var spectreUtilityToken = await SpectreUtilityToken.deployed();
    var spectreDividendToken = await SpectreDividendToken.deployed();

    var balances = [{address: investor_1, amount: 500 * TOKENSDEC}, {address: investor_2, amount: 1000 * TOKENSDEC}, {address: investor_3, amount: 1500 * TOKENSDEC}];

    const packetbalances = [];
    for (i = 0; i < balances.length; i += 1) {
        packetbalances.push(pack(balances[ i ].address, balances[ i ].amount));
    }

    await spectreSubscriberToken.multiBurn(packetbalances, {from: OWNER});

    var investor_1_balance = await spectreSubscriberToken.balanceOf(investor_1);
    var investor_2_balance = await spectreSubscriberToken.balanceOf(investor_2);
    var investor_3_balance = await spectreSubscriberToken.balanceOf(investor_3);

    assert.equal(investor_1_balance.toNumber(), 0 * TOKENSDEC, "investor_1 set");
    assert.equal(investor_2_balance.toNumber(), 0 * TOKENSDEC, "investor_2 set");
    assert.equal(investor_3_balance.toNumber(), 0 * TOKENSDEC, "investor_3 set");

  });

});

function pack(address, amount) {
    const addressNum = new BigNumber(address.substring(2), 16);
    const amountWei = new BigNumber(amount);
    const v = D160.mul(amountWei).add(addressNum);
    return v.toString(10);
}
