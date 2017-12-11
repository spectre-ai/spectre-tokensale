var ContractReceiver = artifacts.require("./ContractReceiver.sol");
var MiniMeTokenFactory = artifacts.require("./MiniMeTokenFactory.sol");

//NB - change from mocked contracts to non-mocked version
var SpectreUtilityToken = artifacts.require("./SpectreUtilityToken.sol");
var SpectreDividendToken = artifacts.require("./SpectreDividendToken.sol");
var SpectreSubscriber2Token = artifacts.require("./SpectreSubscriber2Token.sol");

//NB - set real addresses

// var OWNER = web3.eth.accounts[0];
// var SPECTRE_TEAM = web3.eth.accounts[1];
// var MANAGEMENT_LOCKED = web3.eth.accounts[2];
// var OPTION_POOL = web3.eth.accounts[3];

// Previous values
var OWNER = "0x3538b1a62f11d1fa03b0482dbf18d78cf9e79f47";
var SPECTRE_TEAM = "0xdf20278eda5acf0d00e8a9162e60a35433cb070f";
var MANAGEMENT_LOCKED = "0xcdb540d97dc828e855e87b8b3a3b546124e8d0e1";
var OPTION_POOL = "0x8b04def77e45afb87d82a1e67675bbcc2566edd9";

//Owner of below contracts will be truffle deployment address
module.exports = async function(deployer) {
  deployer.deploy(MiniMeTokenFactory).then(function() {
    return deployer.deploy(SpectreSubscriber2Token, {from: OWNER});
  }).then(function() {
    return deployer.deploy(SpectreUtilityToken, MiniMeTokenFactory.address, {from: OWNER});
  }).then(function() {
    return deployer.deploy(SpectreDividendToken, MiniMeTokenFactory.address, {from: OWNER});
  }).then(function () {
    return SpectreSubscriber2Token.deployed();
  }).then(function (spectreSubscriberToken) {
    return spectreSubscriberToken.setTokenAddresses(SpectreUtilityToken.address, SpectreDividendToken.address, {from: OWNER});
  }).then(function () {
    return SpectreUtilityToken.deployed();
  }).then(function (spectreUtilityToken) {
    return spectreUtilityToken.changeController(SpectreSubscriber2Token.address, {from: OWNER});
  }).then(function () {
    return SpectreUtilityToken.deployed();
  }).then(function (spectreUtilityToken) {
    return spectreUtilityToken.setWalletAddresses(SPECTRE_TEAM, MANAGEMENT_LOCKED, OPTION_POOL, {from: OWNER});
  }).then(function () {
    return SpectreDividendToken.deployed();
  }).then(function (spectreDividendToken) {
    return spectreDividendToken.changeController(SpectreSubscriber2Token.address, {from: OWNER});
  }).then(function () {
    return SpectreDividendToken.deployed();
  }).then(function (spectreDividendToken) {
    return spectreDividendToken.setWalletAddresses(SPECTRE_TEAM, MANAGEMENT_LOCKED, OPTION_POOL, {from: OWNER});
  });
};
