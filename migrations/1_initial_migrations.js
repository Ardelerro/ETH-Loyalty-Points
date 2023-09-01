const LoyaltyToken = artifacts.require("LoyaltyToken");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(LoyaltyToken, 1000000) // Specify the initial supply here
    .then(async (loyaltyTokenInstance) => {
      if (network !== 'development') {
        await loyaltyTokenInstance.mint(1000000, { from: accounts[0] }); // Mint initial tokens to the owner
      }
    });
};