//testrpc --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e1c, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e11, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e12, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e13, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e14, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e15, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e16, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e17, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e18, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e19, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e20, 1000000000000000000000000"

const SpectreSubscriberToken = artifacts.require("./SpectreSubscriberTokenMock.sol");
const SpectreUtilityToken = artifacts.require("./SpectreUtilityTokenMock.sol");
const SpectreDividendToken = artifacts.require("./SpectreDividendTokenMock.sol");

const assertFail = require("./helpers/assertFail");

contract('Check ICO Sale', function (accounts) {

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
  var initialWalletBalance = web3.eth.getBalance(WALLET);
  // =========================================================================
  it("0. make some presale contributions", async () => {

    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();

    await spectreSubscriberToken.setWhiteList(investor_1, web3.toWei(1, 'ether'));
    await spectreSubscriberToken.setWhiteList(investor_2, web3.toWei(2, 'ether'));
    await spectreSubscriberToken.setMockedNow(presaleStart + 1);

    await spectreSubscriberToken.sendTransaction({from: investor_1, value: web3.toWei(1, 'ether')});
    await spectreSubscriberToken.sendTransaction({from: investor_2, value: web3.toWei(2, 'ether')});

    var investor_1_balance = await spectreSubscriberToken.balanceOf(investor_1);
    var investor_2_balance = await spectreSubscriberToken.balanceOf(investor_2);

    assert.equal(investor_1_balance.toNumber(), (1 * (133 / 100)) * 2000 * TOKENSDEC, "Investor 1 should have 33% bonus");
    assert.equal(investor_2_balance.toNumber(), (2 * (133 / 100)) * 2000 * TOKENSDEC, "Investor 2 should have 33% bonus");

  });

  it("1. move to sale, check min. contribution", async () => {

    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();
    await spectreSubscriberToken.setMockedNow(saleStart + 1);

    //Check minimum contribution
    await assertFail(async () => {
      await spectreSubscriberToken.sendTransaction({from: investor_1, value: web3.toWei(0.95, 'ether')});
    });

  });

  it("2. check week 1 bonus - 11%", async () => {

    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();

    await spectreSubscriberToken.sendTransaction({from: investor_3, value: web3.toWei(100, 'ether')});

    var investor_3_balance = await spectreSubscriberToken.balanceOf(investor_3);
    assert.equal(investor_3_balance.toNumber(), 111 * 2000 * TOKENSDEC, "Investor 3 should have 11% bonus");
  });

  it("3. check no bonus after 1st week", async () => {

    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();
    await spectreSubscriberToken.setMockedNow(discountSaleEnd + 1);

    await spectreSubscriberToken.sendTransaction({from: investor_4, value: web3.toWei(100, 'ether')});

    var investor_4_balance = await spectreSubscriberToken.balanceOf(investor_4);
    assert.equal(investor_4_balance.toNumber(), 100 * 2000 * TOKENSDEC, "Investor 4 should have 0% bonus");

  });

  it("4. check can't breach max cap", async () => {

    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();

    await assertFail(async () => {
      await spectreSubscriberToken.sendTransaction({from: investor_4, value: web3.toWei(300000, 'ether')});
    });
    //A more sensible contribution should succeed
    await spectreSubscriberToken.sendTransaction({from: investor_4, value: web3.toWei(100000, 'ether')});
  });


  it("5. check  can't transfer tokens to address or utility / dividend contracts", async () => {
    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();

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


  });

  it("6. check can't contribute after sale", async () => {

    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();
    await spectreSubscriberToken.setMockedNow(saleEnd + 1);
    await assertFail(async () => {
      await spectreSubscriberToken.sendTransaction({from: investor_4, value: web3.toWei(1, 'ether')});
    });


  });

  it("7. check can now transfer tokens to utility / dividend contracts", async () => {
    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();
    var spectreUtilityToken = await SpectreUtilityToken.deployed();
    var spectreDividendToken = await SpectreDividendToken.deployed();

    //check can transfer to utility
    await spectreSubscriberToken.transfer(SpectreUtilityToken.address, 1, {from: investor_1});
    assert.equal((await spectreSubscriberToken.balanceOf(SpectreUtilityToken.address)).toNumber(), 1, "transfer successful");

    //check can dividend to utility
    await spectreSubscriberToken.transfer(SpectreDividendToken.address, 1, {from: investor_1});
    assert.equal((await spectreSubscriberToken.balanceOf(SpectreDividendToken.address)).toNumber(), 1, "transfer successful");

    //check using approve and transfer also works
    await spectreSubscriberToken.approve(investor_2, 2, {from: investor_1});

    //check can transfer to utility
    await spectreSubscriberToken.transferFrom(investor_1, SpectreUtilityToken.address, 1, {from: investor_2});
    assert.equal((await spectreSubscriberToken.balanceOf(SpectreUtilityToken.address)).toNumber(), 2, "transfer successful");

    //check can transfer to dividend
    await spectreSubscriberToken.transferFrom(investor_1, SpectreDividendToken.address, 1, {from: investor_2});
    assert.equal((await spectreSubscriberToken.balanceOf(SpectreDividendToken.address)).toNumber(), 2, "transfer successful");

  });

  it("8. check owner can't transfer on users behalf yet", async () => {

    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();

    var utilityAddress = await spectreSubscriberToken.specUWallet.call();
    var dividendAddress = await spectreSubscriberToken.specUWallet.call();

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

  it("9. check still can't transfer to other addresses", async () => {
    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();

    //check can't tranfer to address
    await assertFail(async () => {
      await spectreSubscriberToken.transfer(investor_2, 1, {from: investor_4});
    });

    //check using approve and transfer also fails
    await spectreSubscriberToken.approve(investor_1, 1, {from: investor_4});

    //check can't tranfer to address
    await assertFail(async () => {
      await spectreSubscriberToken.transferFrom(investor_4, investor_1, 1, {from: investor_1});
    });

  });

  it("10. check owner can transfer on users behalf yet after 28 days", async () => {

    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();

    var utilityAddress = await spectreSubscriberToken.specUWallet.call();
    var dividendAddress = await spectreSubscriberToken.specUWallet.call();

    await spectreSubscriberToken.setMockedNow(1 + saleEnd + 28 * 24 * 60 * 60);

    //owner can only transfer to utility / dividend contracts - does not require approve
    await assertFail(async () => {
      await spectreSubscriberToken.transferFrom(investor_4, investor_1, 1, {from: OWNER});
    });
    await spectreSubscriberToken.transferFrom(investor_4, utilityAddress, 1, {from: OWNER});
    await spectreSubscriberToken.transferFrom(investor_4, dividendAddress, 1, {from: OWNER});

  });

  it("10. check that wallet has received all contributions", async () => {
    var newWalletBalance = web3.eth.getBalance(WALLET);
    assert.equal(newWalletBalance.sub(initialWalletBalance).toNumber(), web3.toWei(100203, 'ether'), "Wallet has received all transfers");

  });

});
