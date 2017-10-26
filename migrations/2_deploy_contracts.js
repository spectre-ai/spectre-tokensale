var ContractReceiver = artifacts.require("./ContractReceiver.sol");
var MiniMeTokenFactory = artifacts.require("./MiniMeTokenFactory.sol");
var ProfitSharing = artifacts.require("./ProfitSharing.sol");

//NB - change from mocked contracts to non-mocked version
var SpectreUtilityToken = artifacts.require("./SpectreUtilityToken.sol");
var SpectreDividendToken = artifacts.require("./SpectreDividendToken.sol");
var SpectreSubscriberToken = artifacts.require("./SpectreSubscriberToken.sol");

//NB - set real addresses
var OWNER = web3.eth.accounts[0];
var WALLET = "0xf6548e8ab773f3cb6f2b198cacf28a3d7dc34086";
var SPECTRE_TEAM = "0x5de1419d080a6079e6aa98bb0c9c4dfdc67efffc";
var MANAGEMENT_LOCKED = "0x979fcd1319f49317e4b1cf87e0a6f7f13531e332";
var OPTION_POOL = "0x557287965b1664f1ca2f387c023e56f321174b35";

//NB - confirm timings
var presaleStart = 1508994000; //5 AM 26th
var presaleEnd = 1509008400; // 9 AM 26th
var saleStart = 1509012000; // 10 AM 26th
var saleEnd = 1509026400; // 2 PM 26th
var discountSaleEnd = 1509022800; // 1 PM 26th

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
