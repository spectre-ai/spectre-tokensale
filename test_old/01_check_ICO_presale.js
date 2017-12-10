//testrpc --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e1c, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e11, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e12, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e13, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e14, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e15, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e16, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e17, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e18, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e19, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e20, 1000000000000000000000000"

const SpectreSubscriberToken = artifacts.require("./SpectreSubscriberTokenMock.sol");
const SpectreUtilityToken = artifacts.require("./SpectreUtilityTokenMock.sol");
const SpectreDividendToken = artifacts.require("./SpectreDividendTokenMock.sol");

const assertFail = require("./helpers/assertFail");
var BigNumber = require('bignumber.js');

contract('Check ICO Presale', function (accounts) {

  var presaleStart = 1509105600; //12am GMT 27th Oct
  var presaleEnd = 1509883200; //12am GMT 5th Nov
  var saleStart = 1510920000; //12am GMT 17th Nov
  var saleEnd = 1512907200; //12am GMT 10th Dec
  var discountSaleEnd = 1511524800; //9am GMT 24th Nov
  var WHITELIST_PERIOD = 3 * 24 * 60 * 60; //3 days

  var OWNER = accounts[0];
  var WALLET = accounts[1];
  var SPECTRE_TEAM = accounts[2];
  var MANAGEMENT_LOCKED = accounts[3];
  var OPTION_POOL = accounts[4];
  var investor_1 = accounts[5];
  var investor_2 = accounts[6];
  var investor_3 = accounts[7];
  var investor_4 = accounts[8];
  var TOKENSDEC = 1000000000000000000;

  var initialWalletBalance = web3.eth.getBalance(WALLET);

  // =========================================================================
  it("0. check contributions rejected before presale start", async () => {

    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();

    await assertFail(async () => {
      await spectreSubscriberToken.sendTransaction({from: investor_1, value: web3.toWei(1, 'ether')});
    });
    await assertFail(async () => {
      await spectreSubscriberToken.sendTransaction({from: investor_3, value: web3.toWei(1, 'ether')});
    });

    await spectreSubscriberToken.setWhiteList(investor_1, web3.toWei(1, 'ether'));
    await spectreSubscriberToken.setWhiteList(investor_2, web3.toWei(2, 'ether'));

  });

  it("1. move to presale, check min. contribution", async () => {

    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();
    await spectreSubscriberToken.setMockedNow(presaleStart + 1);

    //Check minimum contribution
    await assertFail(async () => {
      await spectreSubscriberToken.sendTransaction({from: investor_1, value: web3.toWei(0.95, 'ether')});
    });

  });

  it("2. whitelisted contributions - 33% bonus up to bonus slab", async () => {

    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();
    //Check +20% whitelist contribution
    await spectreSubscriberToken.sendTransaction({from: investor_1, value: web3.toWei(1.2, 'ether')});
    //Check -5% whitelist contribution
    await spectreSubscriberToken.sendTransaction({from: investor_2, value: web3.toWei(1.9, 'ether')});

    var investor_1_balance = await spectreSubscriberToken.balanceOf(investor_1);
    var investor_2_balance = await spectreSubscriberToken.balanceOf(investor_2);

    assert.equal(investor_1_balance.toNumber(), (1.2 * (133 / 100)) * 2000 * TOKENSDEC, "Investor 1 should have 33% bonus");
    assert.equal(investor_2_balance.toNumber(), (1.9 * (133 / 100)) * 2000 * TOKENSDEC, "Investor 2 should have 33% bonus");

  });

  it("3. check non-whitelist accounts can't contribute in first 3 days", async () => {

    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();

    await assertFail(async () => {
      await spectreSubscriberToken.sendTransaction({from: investor_3, value: web3.toWei(1, 'ether')});
    });

  });

  it("4. check non-whitelist accounts can contribute after first 3 days", async () => {

    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();
    await spectreSubscriberToken.setMockedNow(presaleStart + WHITELIST_PERIOD + 1);

    await spectreSubscriberToken.sendTransaction({from: investor_3, value: web3.toWei(1, 'ether')});

  });

  it("5. check 22% bonus after 100mil. tokens sold", async () => {

    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();

    await spectreSubscriberToken.setWhiteList(investor_3, web3.toWei(50000, 'ether'));

    var old_total_supply = await spectreSubscriberToken.totalSupply.call();
    var old_investor_3_balance = await spectreSubscriberToken.balanceOf(investor_3);
    await spectreSubscriberToken.sendTransaction({from: investor_3, value: web3.toWei(50000, 'ether')});
    var new_investor_3_balance = await spectreSubscriberToken.balanceOf(investor_3);

    //investor_3 should get 33% on 100000000 - old_total_supply, and 22% on the remainder
    var totalTokens = new BigNumber(50000 * 2000 * TOKENSDEC);
    var bonusSlab = new BigNumber(100000000 * TOKENSDEC);
    var bonusSlabTokens = bonusSlab.sub(old_total_supply);
    var nonBonusSlabTokens = totalTokens.sub(bonusSlabTokens);
    var expectedBalance = totalTokens.add(bonusSlabTokens.mul(33).div(100).add(nonBonusSlabTokens.mul(22).div(100)));
    assert.equal(new_investor_3_balance.sub(old_investor_3_balance).toNumber(), expectedBalance.toNumber(), "Correct bonuses applied");

    assert.equal((await spectreSubscriberToken.totalSupply.call()).toNumber() > 100000000 * TOKENSDEC, true, "TotalSupply exceeds bonus slab");

    await spectreSubscriberToken.setWhiteList(investor_4, web3.toWei(100, 'ether'));
    await spectreSubscriberToken.sendTransaction({from: investor_4, value: web3.toWei(100, 'ether')});

    var investor_4_balance = await spectreSubscriberToken.balanceOf(investor_4);
    assert.equal(investor_4_balance.toNumber(), (100 * (122 / 100)) * 2000 * TOKENSDEC, "Investor 4 should have 22% bonus");

  });

  it("6. check can't breach max cap", async () => {

    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();

    //Reuse investor_4 - it should be possible to readd addresses to whitelist during sales
    await spectreSubscriberToken.setWhiteList(investor_4, web3.toWei(200000, 'ether'));
    await assertFail(async () => {
      await spectreSubscriberToken.sendTransaction({from: investor_4, value: web3.toWei(200000, 'ether')});
    });

    //A more sensible contribution should succeed
    await spectreSubscriberToken.setWhiteList(investor_4, web3.toWei(25000, 'ether'));
    await spectreSubscriberToken.sendTransaction({from: investor_4, value: web3.toWei(25000, 'ether')});

  });


  it("7. check  can't transfer tokens to address or utility / dividend contracts", async () => {
    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();

    var utilityAddress = await spectreSubscriberToken.specUWallet.call();
    var dividendAddress = await spectreSubscriberToken.specUWallet.call();

    //check can't tranfer to address
    await assertFail(async () => {
      await spectreSubscriberToken.transfer(investor_2, 1, {from: investor_1});
    });
    //check can't transfer to utility
    await assertFail(async () => {
      await spectreSubscriberToken.transfer(utilityAddress, 1, {from: investor_1});
    });
    //check can't dividend to utility
    await assertFail(async () => {
      await spectreSubscriberToken.transfer(dividendAddress, 1, {from: investor_1});
    });

    //check using approve and transfer also fails
    await spectreSubscriberToken.approve(investor_1, 1, {from: investor_2});

    //check can't tranfer to address
    await assertFail(async () => {
      await spectreSubscriberToken.transferFrom(investor_2, investor_1, 1, {from: investor_1});
    });
    //check can't transfer to utility
    await assertFail(async () => {
      await spectreSubscriberToken.transferFrom(investor_2, utilityAddress, 1, {from: investor_1});
    });
    //check can't dividend to utility
    await assertFail(async () => {
      await spectreSubscriberToken.transferFrom(investor_2, dividendAddress, 1, {from: investor_1});
    });

  });

  it("8. check can't contribute between presale and sale", async () => {

    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();
    await spectreSubscriberToken.setMockedNow(presaleEnd + 1);
    await assertFail(async () => {
      await spectreSubscriberToken.sendTransaction({from: investor_4, value: web3.toWei(1, 'ether')});
    });


  });

  it("9. check still can't transfer tokens", async () => {
    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();

    var utilityAddress = await spectreSubscriberToken.specUWallet.call();
    var dividendAddress = await spectreSubscriberToken.specUWallet.call();

    //check can't tranfer to address
    await assertFail(async () => {
      await spectreSubscriberToken.transfer(investor_2, 1, {from: investor_1});
    });
    //check can't transfer to utility
    await assertFail(async () => {
      await spectreSubscriberToken.transfer(utilityAddress, 1, {from: investor_1});
    });
    //check can't dividend to utility
    await assertFail(async () => {
      await spectreSubscriberToken.transfer(dividendAddress, 1, {from: investor_1});
    });

    //check using approve and transfer also fails
    await spectreSubscriberToken.approve(investor_1, 1, {from: investor_2});

    //check can't tranfer to address
    await assertFail(async () => {
      await spectreSubscriberToken.transferFrom(investor_2, investor_1, 1, {from: investor_1});
    });
    //check can't transfer to utility
    await assertFail(async () => {
      await spectreSubscriberToken.transferFrom(investor_2, utilityAddress, 1, {from: investor_1});
    });
    //check can't dividend to utility
    await assertFail(async () => {
      await spectreSubscriberToken.transferFrom(investor_2, dividendAddress, 1, {from: investor_1});
    });

  });

  it("10. check that wallet has received all contributions", async () => {
    var newWalletBalance = web3.eth.getBalance(WALLET);
    assert.equal(newWalletBalance.sub(initialWalletBalance).toNumber(), web3.toWei(75104.1, 'ether'), "Wallet has received all transfers");

  });

});
