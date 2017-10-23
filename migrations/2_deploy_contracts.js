var ContractReceiver = artifacts.require("./ContractReceiver.sol");
var MiniMeTokenFactory = artifacts.require("./MiniMeTokenFactory.sol");
var ProfitSharing = artifacts.require("./ProfitSharing.sol");

//NB - change from mocked contracts to non-mocked version
var SpectreUtilityToken = artifacts.require("./SpectreUtilityTokenMock.sol");
var SpectreDividendToken = artifacts.require("./SpectreDividendTokenMock.sol");
var SpectreSubscriberToken = artifacts.require("./SpectreSubscriberTokenMock.sol");

//NB - set real addresses
var OWNER = web3.eth.accounts[0];
var WALLET = web3.eth.accounts[1];
var SPECTRE_TEAM = web3.eth.accounts[1];
var MANAGEMENT_LOCKED = web3.eth.accounts[2];
var OPTION_POOL = web3.eth.accounts[3];


//NB - confirm timings
var presaleStart = 1509105600; //12am GMT 27th Oct
var presaleEnd = 1509883200; //12am GMT 5th Nov
var saleStart = 1510920000; //12am GMT 17th Nov
var saleEnd = 1512907200; //12am GMT 10th Dec
var discountSaleEnd = 1511524800; //9am GMT 24th Nov

//Owner of below contracts will be truffle deployment address
module.exports = async function(deployer) {
  deployer.deploy(MiniMeTokenFactory).then(function() {
    return deployer.deploy(SpectreSubscriberToken, WALLET, {from: OWNER});
  }).then(function() {
    return deployer.deploy(SpectreUtilityToken, MiniMeTokenFactory.address, {from: OWNER});
  }).then(function() {
    return deployer.deploy(SpectreDividendToken, MiniMeTokenFactory.address, {from: OWNER});
  }).then(function () {
    return SpectreSubscriberToken.deployed();
  }).then(function (spectreSubscriberToken) {
    return spectreSubscriberToken.configure(presaleStart, presaleEnd, saleStart, saleEnd, discountSaleEnd, {from: OWNER});
  }).then(function () {
    return SpectreSubscriberToken.deployed();
  }).then(function (spectreSubscriberToken) {
    return spectreSubscriberToken.setTokenAddresses(SpectreUtilityToken.address, SpectreDividendToken.address, {from: OWNER});
  }).then(function () {
    return SpectreUtilityToken.deployed();
  }).then(function (spectreUtilityToken) {
    return spectreUtilityToken.changeController(SpectreSubscriberToken.address, {from: OWNER});
  }).then(function () {
    return SpectreUtilityToken.deployed();
  }).then(function (spectreUtilityToken) {
    return spectreUtilityToken.setWalletAddresses(SPECTRE_TEAM, MANAGEMENT_LOCKED, OPTION_POOL, {from: OWNER});
  }).then(function () {
    return SpectreDividendToken.deployed();
  }).then(function (spectreDividendToken) {
    return spectreDividendToken.changeController(SpectreSubscriberToken.address, {from: OWNER});
  }).then(function () {
    return SpectreDividendToken.deployed();
  }).then(function (spectreDividendToken) {
    return spectreDividendToken.setWalletAddresses(SPECTRE_TEAM, MANAGEMENT_LOCKED, OPTION_POOL, {from: OWNER});
  }).then(function () {
    return deployer.deploy(ProfitSharing, SpectreDividendToken.address, {from: OWNER});
  });
};
