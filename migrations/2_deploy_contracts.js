var ContractReceiver = artifacts.require("./ContractReceiver.sol");
var MiniMeTokenFactory = artifacts.require("./MiniMeTokenFactory.sol");
var ProfitSharing = artifacts.require("./ProfitSharing.sol");

//NB - change from mocked contracts to non-mocked version
var SpectreUtilityToken = artifacts.require("./SpectreUtilityToken.sol");
var SpectreDividendToken = artifacts.require("./SpectreDividendToken.sol");
var SpectreSubscriberToken = artifacts.require("./SpectreSubscriberToken.sol");

//NB - confirm timings
var presaleStart = 1509105600; //12pm GMT 27th Oct
var presaleEnd = 1509883200; //12pm GMT 5th Nov
var saleStart = 1510920000; //12pm GMT 17th Nov
var saleEnd = 1512907200; //12pm GMT 10th Dec
var discountSaleEnd = 1511524800; //12pm GMT 24th Nov

//NB - set real addresses
var OWNER = "0x09a568fd510741ae68e315d6d001a8d4b1682256";
var WALLET = "0x670e095e92aff090fb8475131f7a8a5d98bd0155";
var SPECTRE_TEAM = "0xdf20278eda5acf0d00e8a9162e60a35433cb070f";
var MANAGEMENT_LOCKED = "0xcdb540d97dc828e855e87b8b3a3b546124e8d0e1";
var OPTION_POOL = "0x8b04def77e45afb87d82a1e67675bbcc2566edd9";

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
