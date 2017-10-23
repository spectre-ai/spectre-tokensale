//testrpc --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e1c, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e11, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e12, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e13, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e14, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e15, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e16, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e17, 1000000000000000000000000"

const SpectreSubscriberToken = artifacts.require("./SpectreSubscriberTokenMock.sol");
const SpectreUtilityToken = artifacts.require("./SpectreUtilityTokenMock.sol");
const SpectreDividendToken = artifacts.require("./SpectreDividendTokenMock.sol");

const assertFail = require("./helpers/assertFail");

contract('Check Utility Token Locks', function (accounts) {

  var owner = accounts[0];
  var SPECTRE_TEAM = accounts[1];
  var MANAGEMENT_LOCKED = accounts[2];
  var OPTION_POOL = accounts[3];
  var ONEDAY = 24 * 60 * 60;
  var investor_1 = accounts[4];
  var investor_2 = accounts[5];
  var investor_3 = accounts[6];

  var TOKENSDEC = 1000000000000000000;
  var presaleStart = 1509105600; //12am GMT 27th Oct
  var presaleEnd = 1509883200; //12am GMT 5th Nov
  var saleStart = 1510920000; //12am GMT 17th Nov
  var saleEnd = 1512907200; //12am GMT 10th Dec
  var discountSaleEnd = 1511524800; //9am GMT 24th Nov

  // =========================================================================
  it("0. initialise all subscriber tokens", async () => {

    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();
    var spectreUtilityToken = await SpectreUtilityToken.deployed();
    var spectreDividendToken = await SpectreDividendToken.deployed();

    //Generate some subscriber token balances and meet min. cap
    await spectreSubscriberToken.setMockedNow(discountSaleEnd + 1);

    await spectreSubscriberToken.sendTransaction({from: investor_1, value: web3.toWei(500, 'ether')});
    await spectreSubscriberToken.sendTransaction({from: investor_2, value: web3.toWei(1000, 'ether')});
    await spectreSubscriberToken.sendTransaction({from: investor_3, value: web3.toWei(1500, 'ether')});

    await spectreSubscriberToken.setMockedNow(saleEnd + 1);
  });

  it("1. generate some SpectreAI balances from investor token swaps", async () => {

    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();
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

    //Check spectre wallet balances
    //1000000 tokens transferred, so spectreTeam has 42/100 * 1000000 = 420000, managementLocked has 18/100 * 1000000 = 180000, optionPool has 40/100 * 1000000 = 400000
    assert.equal((await spectreUtilityToken.balanceOf(SPECTRE_TEAM)).toNumber(), 420000 * TOKENSDEC, "Spectre Team has 420000 tokens");
    assert.equal((await spectreUtilityToken.balanceOf(MANAGEMENT_LOCKED)).toNumber(), 180000 * TOKENSDEC, "Management has 180000 tokens");
    assert.equal((await spectreUtilityToken.balanceOf(OPTION_POOL)).toNumber(), 400000 * TOKENSDEC, "Options Pool has 400000 tokens");

  });

  it("2. check investor can transfer tokens", async () => {

    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();
    var spectreUtilityToken = await SpectreUtilityToken.deployed();
    var spectreDividendToken = await SpectreDividendToken.deployed();

    await spectreUtilityToken.transfer(investor_1, 500000 * TOKENSDEC, {from: investor_2});

    //Can't transfer more than balance
    await assertFail(async () => {
      await spectreUtilityToken.transfer(investor_1, 510000 * TOKENSDEC, {from: investor_2});
    });

    assert.equal((await spectreUtilityToken.balanceOf(investor_1)).toNumber(), 500000 * TOKENSDEC, "investor_1 utility balance of 500000");
    assert.equal((await spectreUtilityToken.balanceOf(investor_2)).toNumber(), 500000 * TOKENSDEC, "investor_2 utility balance of 500000");

  });

  it("3. check spectreAI unlocked wallet can transfer tokens", async () => {

    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();
    var spectreUtilityToken = await SpectreUtilityToken.deployed();
    var spectreDividendToken = await SpectreDividendToken.deployed();

    await spectreUtilityToken.transfer(investor_1, 400000 * TOKENSDEC, {from: SPECTRE_TEAM});

    //Can't transfer more than balance
    await assertFail(async () => {
      await spectreUtilityToken.transfer(investor_1, 30000 * TOKENSDEC, {from: SPECTRE_TEAM});
    });

    assert.equal((await spectreUtilityToken.balanceOf(investor_1)).toNumber(), 900000 * TOKENSDEC, "investor_1 dividend balance of 900000");
    assert.equal((await spectreUtilityToken.balanceOf(SPECTRE_TEAM)).toNumber(), 20000 * TOKENSDEC, "SPECTRE_TEAM dividend balance of 20000");

  });

  it("4. check spectreAI locked wallets can not transfer tokens", async () => {

    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();
    var spectreUtilityToken = await SpectreUtilityToken.deployed();
    var spectreDividendToken = await SpectreDividendToken.deployed();

    //Can't transfer from locked accounts
    await assertFail(async () => {
      await spectreUtilityToken.transfer(investor_1, 1, {from: MANAGEMENT_LOCKED});
    });
    await assertFail(async () => {
      await spectreUtilityToken.transfer(investor_1, 1, {from: OPTION_POOL});
    });

  });

  it("5. check spectreAI locked wallets can not approve and transfer tokens", async () => {

    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();
    var spectreUtilityToken = await SpectreUtilityToken.deployed();
    var spectreDividendToken = await SpectreDividendToken.deployed();

    await spectreUtilityToken.approve(investor_1, 1, {from: MANAGEMENT_LOCKED});
    await spectreUtilityToken.approve(investor_1, 1, {from: OPTION_POOL});

    //Can't transfer from locked accounts
    await assertFail(async () => {
      await spectreUtilityToken.transferFrom(MANAGEMENT_LOCKED, investor_1, 1, {from: investor_1});
    });
    await assertFail(async () => {
      await spectreUtilityToken.transferFrom(OPTION_POOL, investor_1, 1, {from: investor_1});
    });

  });

  it("6. check spectreAI locked wallets can transfer surplus tokens (amounts over minted locked amounts)", async () => {

    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();
    var spectreUtilityToken = await SpectreUtilityToken.deployed();
    var spectreDividendToken = await SpectreDividendToken.deployed();

    await spectreUtilityToken.transfer(MANAGEMENT_LOCKED, 100000 * TOKENSDEC, {from: investor_1});
    await spectreUtilityToken.transfer(OPTION_POOL, 100000 * TOKENSDEC, {from: investor_1});

    await spectreUtilityToken.transfer(investor_1, 100000 * TOKENSDEC, {from: OPTION_POOL});
    await spectreUtilityToken.transfer(investor_1, 100000 * TOKENSDEC, {from: MANAGEMENT_LOCKED});

    //Can't transfer more than surplus
    await assertFail(async () => {
      await spectreUtilityToken.transfer(investor_1, 1, {from: MANAGEMENT_LOCKED});
    });
    await assertFail(async () => {
      await spectreUtilityToken.transfer(investor_1, 1, {from: OPTION_POOL});
    });


  });

  it("7. check spectreAI management locked wallet can transfer tokens after 180 days", async () => {

    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();
    var spectreUtilityToken = await SpectreUtilityToken.deployed();
    var spectreDividendToken = await SpectreDividendToken.deployed();

    //Move forward 90 days - should still fail
    await spectreUtilityToken.setMockedNow(saleEnd + 1 + (90 * ONEDAY));

    //Can't transfer from locked accounts
    await assertFail(async () => {
      await spectreUtilityToken.transfer(investor_1, 1, {from: MANAGEMENT_LOCKED});
    });
    await assertFail(async () => {
      await spectreUtilityToken.transfer(investor_1, 1, {from: OPTION_POOL});
    });

    //Move forward 180 days - management locked should now work
    await spectreUtilityToken.setMockedNow(saleEnd + 1 + (180 * ONEDAY));

    //Can't transfer from locked accounts
    await spectreUtilityToken.transfer(investor_1, 10000 * TOKENSDEC, {from: MANAGEMENT_LOCKED});

    //Option pool should still fail
    await assertFail(async () => {
      await spectreUtilityToken.transfer(investor_1, 1, {from: OPTION_POOL});
    });

    assert.equal((await spectreUtilityToken.balanceOf(investor_1)).toNumber(), 910000 * TOKENSDEC, "investor_1 dividend balance of 910000");
    assert.equal((await spectreUtilityToken.balanceOf(MANAGEMENT_LOCKED)).toNumber(), 170000 * TOKENSDEC, "MANAGEMENT_LOCKED dividend balance of 170000");

    //Cant transfer more tokens than you have
    await assertFail(async () => {
      await spectreUtilityToken.transfer(investor_1, 180000 * TOKENSDEC, {from: MANAGEMENT_LOCKED});
    });

  });

  it("8. check spectreAI option pool locked wallet can transfer tokens after 365 days", async () => {

    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();
    var spectreUtilityToken = await SpectreUtilityToken.deployed();
    var spectreDividendToken = await SpectreDividendToken.deployed();

    //Move forward 270 days - managementLocked works, optionPool doesn't work
    await spectreUtilityToken.setMockedNow(saleEnd + 1 + (270 * ONEDAY));

    //Can't transfer from locked accounts
    await assertFail(async () => {
      await spectreUtilityToken.transfer(investor_1, 1, {from: OPTION_POOL});
    });

    await spectreUtilityToken.transfer(investor_1, 10000 * TOKENSDEC, {from: MANAGEMENT_LOCKED});

    assert.equal((await spectreUtilityToken.balanceOf(investor_1)).toNumber(), 920000 * TOKENSDEC, "investor_1 dividend balance of 920000");
    assert.equal((await spectreUtilityToken.balanceOf(MANAGEMENT_LOCKED)).toNumber(), 160000 * TOKENSDEC, "MANAGEMENT_LOCKED dividend balance of 160000");

    //Move forward 360 days, everything unlocked
    await spectreUtilityToken.setMockedNow(saleEnd + 1 + (365 * ONEDAY));
    await spectreUtilityToken.transfer(investor_1, 10000 * TOKENSDEC, {from: OPTION_POOL});
    await spectreUtilityToken.transfer(investor_1, 10000 * TOKENSDEC, {from: MANAGEMENT_LOCKED});

    assert.equal((await spectreUtilityToken.balanceOf(investor_1)).toNumber(), 940000 * TOKENSDEC, "investor_1 dividend balance of 940000");
    assert.equal((await spectreUtilityToken.balanceOf(MANAGEMENT_LOCKED)).toNumber(), 150000 * TOKENSDEC, "MANAGEMENT_LOCKED dividend balance of 150000");
    assert.equal((await spectreUtilityToken.balanceOf(OPTION_POOL)).toNumber(), 390000 * TOKENSDEC, "OPTION_POOL dividend balance of 390000");

  });

  it("9. check spectreAI unlocked wallets can approve and transfer tokens", async () => {

    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();
    var spectreUtilityToken = await SpectreUtilityToken.deployed();
    var spectreDividendToken = await SpectreDividendToken.deployed();

    //Can transfer from unlocked accounts
    await spectreUtilityToken.transferFrom(MANAGEMENT_LOCKED, investor_1, 1, {from: investor_1});
    await spectreUtilityToken.transferFrom(OPTION_POOL, investor_1, 1, {from: investor_1});

  });

});
