var Otp = artifacts.require("./Otp.sol");

module.exports = function(deployer) {
  deployer.deploy(Otp);
};
