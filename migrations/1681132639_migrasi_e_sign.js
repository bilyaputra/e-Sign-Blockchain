const eSign = artifacts.require('eSign');

module.exports = function(_deployer) {
  _deployer.deploy(eSign);
};
