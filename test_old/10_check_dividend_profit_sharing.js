//testrpc --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e1c, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e11, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e12, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e13, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e14, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e15, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e16, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e17, 1000000000000000000000000"

const SpectreSubscriberToken = artifacts.require("./SpectreSubscriberTokenMock.sol");
const SpectreUtilityToken = artifacts.require("./SpectreUtilityTokenMock.sol");
const SpectreDividendToken = artifacts.require("./SpectreDividendTokenMock.sol");
const ProfitSharing = artifacts.require("./ProfitSharing.sol");

const assertFail = require("./helpers/assertFail");

//NB - there are comprehensive unit tests for this contract found in:
//https://github.com/adamdossa/ProfitSharingContract

contract('Check Dividend Profit Sharing', function (accounts) {

  var owner = accounts[0];
  var SPECTRE_TEAM = accounts[1];
  var MANAGEMENT_LOCKED = accounts[2];
  var OPTION_POOL = accounts[3];
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

  it("1. generate some SpectreAI and investor balances from investor token swaps", async () => {

    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();
    var spectreUtilityToken = await SpectreUtilityToken.deployed();
    var spectreDividendToken = await SpectreDividendToken.deployed();

    //Transfer to dividend token
    await spectreSubscriberToken.transfer(SpectreDividendToken.address, 500000 * TOKENSDEC, {from: investor_1});
    await spectreSubscriberToken.transfer(SpectreDividendToken.address, 1000000 * TOKENSDEC, {from: investor_2});
    //Transfer to utiity token
    await spectreSubscriberToken.transfer(SpectreUtilityToken.address, 500000 * TOKENSDEC, {from: investor_1});
    await spectreSubscriberToken.transfer(SpectreUtilityToken.address, 1000000 * TOKENSDEC, {from: investor_2});

    //Check investor balances
    assert.equal((await spectreSubscriberToken.balanceOf(investor_1)).toNumber(), 0, "Remaining temp balance of 0");
    assert.equal((await spectreSubscriberToken.balanceOf(investor_2)).toNumber(), 0, "Remaining temp balance of 0");
    assert.equal((await spectreSubscriberToken.balanceOf(SpectreDividendToken.address)).toNumber(), 1500000 * TOKENSDEC, "Dividend Token has Temp balance of 1500000");
    assert.equal((await spectreSubscriberToken.balanceOf(SpectreUtilityToken.address)).toNumber(), 1500000 * TOKENSDEC, "Utility Token has Temp balance of 1500000");
    assert.equal((await spectreDividendToken.balanceOf(investor_1)).toNumber(), 500000 * TOKENSDEC, "New dividend balance of 500000");
    assert.equal((await spectreUtilityToken.balanceOf(investor_1)).toNumber(), 500000 * TOKENSDEC, "New utility balance of 500000");
    assert.equal((await spectreDividendToken.balanceOf(investor_2)).toNumber(), 1000000 * TOKENSDEC, "New dividend balance of 1000000");
    assert.equal((await spectreUtilityToken.balanceOf(investor_2)).toNumber(), 1000000 * TOKENSDEC, "New utility balance of 1000000");

    //Check spectre wallet balances
    //1500000 tokens transferred, so spectreTeam has 42/100 * 1500000 = 630000, managementLocked has 18/100 * 1500000 = 270000, optionPool has 40/100 * 1500000 = 600000
    assert.equal((await spectreDividendToken.balanceOf(SPECTRE_TEAM)).toNumber(), 630000 * TOKENSDEC, "Spectre Team has 630000 tokens");
    assert.equal((await spectreDividendToken.balanceOf(MANAGEMENT_LOCKED)).toNumber(), 270000 * TOKENSDEC, "Spectre Team has 270000 tokens");
    assert.equal((await spectreDividendToken.balanceOf(OPTION_POOL)).toNumber(), 600000 * TOKENSDEC, "Spectre Team has 600000 tokens");

  });

  it("2. make dividend payment", async () => {

    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();
    var spectreUtilityToken = await SpectreUtilityToken.deployed();
    var spectreDividendToken = await SpectreDividendToken.deployed();
    var profitSharing = await ProfitSharing.deployed();

    //Deposit an amount proportional to token supply to make calculations easier
    var totalSupply = await spectreDividendToken.totalSupply.call();
    await profitSharing.depositDividend({from: owner, value: totalSupply / 1000});

  });

  it("3. claim investor dividends and check balances", async () => {

    var spectreSubscriberToken = await SpectreSubscriberToken.deployed();
    var spectreUtilityToken = await SpectreUtilityToken.deployed();
    var spectreDividendToken = await SpectreDividendToken.deployed();
    var profitSharing = await ProfitSharing.deployed();

    //Get starting balances
    var investor_1_start_ether = await web3.eth.getBalance(investor_1);
    var investor_2_start_ether = await web3.eth.getBalance(investor_2);
    var spectre_team_start_ether = await web3.eth.getBalance(SPECTRE_TEAM);
    var management_locked_start_ether = await web3.eth.getBalance(MANAGEMENT_LOCKED);
    var option_pool_start_ether = await web3.eth.getBalance(OPTION_POOL);

    //Claim dividend
    //Use 0 gasPrice to avoid accounting for gas costs
    await profitSharing.claimDividend(0, {from: investor_1, gasPrice: 0});
    await profitSharing.claimDividend(0, {from: investor_2, gasPrice: 0});
    await profitSharing.claimDividend(0, {from: SPECTRE_TEAM, gasPrice: 0});
    await profitSharing.claimDividend(0, {from: MANAGEMENT_LOCKED, gasPrice: 0});
    await profitSharing.claimDividend(0, {from: OPTION_POOL, gasPrice: 0});

    //Get ending balances
    var investor_1_end_ether = await web3.eth.getBalance(investor_1);
    var investor_2_end_ether = await web3.eth.getBalance(investor_2);
    var spectre_team_end_ether = await web3.eth.getBalance(SPECTRE_TEAM);
    var management_locked_end_ether = await web3.eth.getBalance(MANAGEMENT_LOCKED);
    var option_pool_end_ether = await web3.eth.getBalance(OPTION_POOL);

    //Dividend allocations should match exactly token balances
    assert.equal(investor_1_end_ether.sub(investor_1_start_ether).toNumber(), (await spectreDividendToken.balanceOf(investor_1)).div(1000).toNumber(), "investor_1 gets dividend");
    assert.equal(investor_2_end_ether.sub(investor_2_start_ether).toNumber(), (await spectreDividendToken.balanceOf(investor_2)).div(1000).toNumber(), "investor_2 gets dividend");
    assert.equal(spectre_team_end_ether.sub(spectre_team_start_ether).toNumber(), (await spectreDividendToken.balanceOf(SPECTRE_TEAM)).div(1000).toNumber(), "spectre team gets dividend");
    assert.equal(management_locked_end_ether.sub(management_locked_start_ether).toNumber(), (await spectreDividendToken.balanceOf(MANAGEMENT_LOCKED)).div(1000).toNumber(), "management locked gets dividend");
    assert.equal(option_pool_end_ether.sub(option_pool_start_ether).toNumber(), (await spectreDividendToken.balanceOf(OPTION_POOL)).div(1000).toNumber(), "option pool gets dividend");

  });

});
