//testrpc --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e1c, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e11, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e12, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e13, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e14, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e15, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e16, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e17, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e18, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e19, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e20, 1000000000000000000000000"

const SpectreSubscriberToken = artifacts.require("./SpectreSubscriberTokenMock.sol");
const SpectreUtilityToken = artifacts.require("./SpectreUtilityTokenMock.sol");
const SpectreDividendToken = artifacts.require("./SpectreDividendTokenMock.sol");

const assertFail = require("./helpers/assertFail");

contract('Check ICO Refunds', function (accounts) {

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
  var investor_4 = accounts[8];
  var TOKENSDEC = 1000000000000000000;
  var ONEWEEK = 7 * 24 * 60 * 60;

  // =========================================================================

  // Use gasPrice 0 for all to make calculations easier
  it("0. make some presale contributions - 33% bonus", async () => {

    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();

    await spectreSubscriberToken.setWhiteList(investor_1, web3.toWei(1, 'ether'));
    await spectreSubscriberToken.setWhiteList(investor_2, web3.toWei(2, 'ether'));
    await spectreSubscriberToken.setMockedNow(presaleStart + 1);

    await spectreSubscriberToken.sendTransaction({from: investor_1, value: web3.toWei(1, 'ether'), gasPrice: 0});
    await spectreSubscriberToken.sendTransaction({from: investor_2, value: web3.toWei(2, 'ether'), gasPrice: 0});

    var investor_1_balance = await spectreSubscriberToken.balanceOf(investor_1);
    var investor_2_balance = await spectreSubscriberToken.balanceOf(investor_2);

    assert.equal(investor_1_balance.toNumber(), (1 * (133 / 100)) * 2000 * TOKENSDEC, "Investor 1 should have 33% bonus");
    assert.equal(investor_2_balance.toNumber(), (2 * (133 / 100)) * 2000 * TOKENSDEC, "Investor 2 should have 33% bonus");

  });

  it("1. make some week 1 contribution - 11%", async () => {

    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();

    await spectreSubscriberToken.setMockedNow(saleStart + 1);
    await spectreSubscriberToken.sendTransaction({from: investor_3, value: web3.toWei(3, 'ether'), gasPrice: 0});

    var investor_3_balance = await spectreSubscriberToken.balanceOf(investor_3);
    assert.equal(investor_3_balance.toNumber(), 3 * 2220 * TOKENSDEC, "Investor 3 should have 11% bonus");

  });

  it("2. make some week 1 contribution - 0%", async () => {

    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();
    await spectreSubscriberToken.setMockedNow(discountSaleEnd + 1);

    await spectreSubscriberToken.sendTransaction({from: investor_4, value: web3.toWei(4, 'ether'), gasPrice: 0});

    var investor_4_balance = await spectreSubscriberToken.balanceOf(investor_4);
    assert.equal(investor_4_balance.toNumber(), 8000 * TOKENSDEC, "Investor 4 should have 0% bonus");

  });

  it("3. sale finishes, unable to refund or transfer", async () => {
    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();
    await spectreSubscriberToken.setMockedNow(saleEnd + 1);

    await assertFail(async () => {
      await spectreSubscriberToken.refund({from: investor_1});
    });

    var utilityAddress = await spectreSubscriberToken.specUWallet.call();
    var dividendAddress = await spectreSubscriberToken.specUWallet.call();

    //check can't tranfer to address
    await assertFail(async () => {
      await spectreSubscriberToken.transfer(investor_2, 1, {from: investor_4});
    });
    //check can't transfer to utility
    await assertFail(async () => {
      await spectreSubscriberToken.transfer(utilityAddress, 1, {from: investor_4});
    });
    //check can't dividend to utility
    await assertFail(async () => {
      await spectreSubscriberToken.transfer(dividendAddress, 1, {from: investor_4});
    });

    //check using approve and transfer also fails
    await spectreSubscriberToken.approve(investor_1, 1, {from: investor_4});

    //check can't tranfer to address
    await assertFail(async () => {
      await spectreSubscriberToken.transferFrom(investor_4, investor_1, 1, {from: investor_1});
    });
    //check can't transfer to utility
    await assertFail(async () => {
      await spectreSubscriberToken.transferFrom(investor_4, utilityAddress, 1, {from: investor_1});
    });
    //check can't dividend to utility
    await assertFail(async () => {
      await spectreSubscriberToken.transferFrom(investor_4, dividendAddress, 1, {from: investor_1});
    });

    //check owner can't transfer
    //check can't tranfer to address
    await assertFail(async () => {
      await spectreSubscriberToken.transferFrom(investor_4, investor_1, 1, {from: OWNER});
    });
    //check can't transfer to utility
    await assertFail(async () => {
      await spectreSubscriberToken.transferFrom(investor_4, utilityAddress, 1, {from: OWNER});
    });
    //check can't dividend to utility
    await assertFail(async () => {
      await spectreSubscriberToken.transferFrom(investor_4, dividendAddress, 1, {from: OWNER});
    });


  });

  it("4. fund contract, unable to refund or transfer", async () => {
    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();

    var utilityAddress = await spectreSubscriberToken.specUWallet.call();
    var dividendAddress = await spectreSubscriberToken.specUWallet.call();

    await spectreSubscriberToken.fundContract({from: OWNER, value: web3.toWei(10, 'ether')});

    await assertFail(async () => {
      await spectreSubscriberToken.refund({from: investor_1});
    });

    //check can't tranfer to address
    await assertFail(async () => {
      await spectreSubscriberToken.transfer(investor_2, 1, {from: investor_4});
    });
    //check can't transfer to utility
    await assertFail(async () => {
      await spectreSubscriberToken.transfer(utilityAddress, 1, {from: investor_4});
    });
    //check can't dividend to utility
    await assertFail(async () => {
      await spectreSubscriberToken.transfer(dividendAddress, 1, {from: investor_4});
    });

  });

  it("5. set refundable, refunds received, unable to transfer", async () => {
    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();

    await spectreSubscriberToken.setRefundable({from: OWNER});

    var investor_1_start_ether = await web3.eth.getBalance(investor_1);
    var investor_2_start_ether = await web3.eth.getBalance(investor_2);
    var investor_3_start_ether = await web3.eth.getBalance(investor_3);
    var investor_4_start_ether = await web3.eth.getBalance(investor_4);

    await spectreSubscriberToken.refund({from: investor_1, gasPrice: 0});
    await spectreSubscriberToken.refund({from: investor_2, gasPrice: 0});
    await spectreSubscriberToken.refund({from: investor_3, gasPrice: 0});
    await spectreSubscriberToken.refund({from: investor_4, gasPrice: 0});

    var investor_1_end_ether = await web3.eth.getBalance(investor_1);
    var investor_2_end_ether = await web3.eth.getBalance(investor_2);
    var investor_3_end_ether = await web3.eth.getBalance(investor_3);
    var investor_4_end_ether = await web3.eth.getBalance(investor_4);

    assert.equal(investor_1_end_ether.sub(investor_1_start_ether).toNumber(), web3.toWei(1, 'ether'), "investor_1 gets refunded");
    assert.equal(investor_2_end_ether.sub(investor_2_start_ether).toNumber(), web3.toWei(2, 'ether'), "investor_2 gets refunded");
    assert.equal(investor_3_end_ether.sub(investor_3_start_ether).toNumber(), web3.toWei(3, 'ether'), "investor_3 gets refunded");
    assert.equal(investor_4_end_ether.sub(investor_4_start_ether).toNumber(), web3.toWei(4, 'ether'), "investor_4 gets refunded");

    var utilityAddress = await spectreSubscriberToken.specUWallet.call();
    var dividendAddress = await spectreSubscriberToken.specUWallet.call();

    //check can't tranfer to address
    await assertFail(async () => {
      await spectreSubscriberToken.transfer(investor_2, 1, {from: investor_4});
    });
    //check can't transfer to utility
    await assertFail(async () => {
      await spectreSubscriberToken.transfer(utilityAddress, 1, {from: investor_4});
    });
    //check can't dividend to utility
    await assertFail(async () => {
      await spectreSubscriberToken.transfer(dividendAddress, 1, {from: investor_4});
    });

  });

});
