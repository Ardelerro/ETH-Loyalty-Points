const LoyaltyToken = artifacts.require("LoyaltyToken");

contract("LoyaltyToken", accounts => {
  let loyaltyTokenInstance;

  beforeEach(async () => {
    loyaltyTokenInstance = await LoyaltyToken.new(1000000);
  });

  it("should have the correct initial supply and owner balance", async () => {
    const totalSupply = await loyaltyTokenInstance.totalSupply();
    const ownerBalance = await loyaltyTokenInstance.balanceOf(accounts[0]);
    
    assert.equal(totalSupply, 1000000 * (10 ** 18));
    assert.equal(ownerBalance, 1000000 * (10 ** 18));
  });

  it("should have the correct token name", async () => {
    const name = await loyaltyTokenInstance.name();
    assert.equal(name, "Loyalty Token");
  });

  it("should have the correct token symbol", async () => {
    const symbol = await loyaltyTokenInstance.symbol();
    assert.equal(symbol, "LOYAL");
  });

  it("should have the correct token decimals", async () => {
    const decimals = await loyaltyTokenInstance.decimals();
    assert.equal(decimals, 18);
  });
  
  it("should update token balances after transfer", async () => {
    const sender = accounts[0];
    const recipient = accounts[1];
    const amount = web3.utils.toBN(web3.utils.toWei("100", "ether")); // 100 tokens in wei

    const initialSenderBalance = await loyaltyTokenInstance.balanceOf(sender);
    const initialRecipientBalance = await loyaltyTokenInstance.balanceOf(recipient);

    await loyaltyTokenInstance.transfer(recipient, amount, { from: sender });

    const finalSenderBalance = await loyaltyTokenInstance.balanceOf(sender);
    const finalRecipientBalance = await loyaltyTokenInstance.balanceOf(recipient);

    assert.equal(finalSenderBalance.toString(), initialSenderBalance.sub(amount).toString());
    assert.equal(finalRecipientBalance.toString(), initialRecipientBalance.add(amount).toString());
  });
});