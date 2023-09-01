const LoyaltySDK = require("../dist/index").default;
const ethers = require("ethers");
const chai = require("chai");
const { log } = require("console");
const assert = chai.assert;

const providerUrl = "HTTP://127.0.0.1:7545"; // Update with your provider URL
const privateKey = "YourPrivateKey"; // Update with your private key
const contractAddress = "YourContractAddress"; // Update with your contract address

async function expectRevert(promise) {
  try {
    await promise;
  } catch (error) {
    const revertFound = error.message.search("revert") >= 0;
    assert(revertFound, `Expected "revert", but got ${error} instead`);
    return;
  }
  assert.fail("Expected revert not received");
}

describe("LoyaltySDK", () => {
  let loyaltySDK;
  let wallet;

  before(() => {
    const provider = new ethers.providers.JsonRpcProvider(providerUrl);
    wallet = new ethers.Wallet(privateKey, provider);
    loyaltySDK = new LoyaltySDK(provider, privateKey, contractAddress);
  });

  it("should get account balance", async () => {
    const account = await wallet.getAddress();
    const balance = await loyaltySDK.getBalance(account);
    assert.equal(
      balance.toString(),
      ethers.utils.parseEther("1000000").toString() // Assuming initial balance is 1000000
    );
  });

  it("should transfer tokens", async () => {
    const sender = await wallet.getAddress();
    const recipient = ethers.Wallet.createRandom().address;
    const amount = 100; // Assuming decimals is 18

    const initialSenderBalance = await loyaltySDK.getBalance(sender);
    const initialRecipientBalance = await loyaltySDK.getBalance(recipient);

    await loyaltySDK.transfer(recipient, amount);

    const finalSenderBalance = await loyaltySDK.getBalance(sender);
    const finalRecipientBalance = await loyaltySDK.getBalance(recipient);

    assert.equal(
      finalSenderBalance.toString(),
      ethers.BigNumber.from(initialSenderBalance).sub(amount).toString()
    );
    assert.equal(
      finalRecipientBalance.toString(),
      ethers.BigNumber.from(initialRecipientBalance).add(amount).toString()
    );
  });

  it("should approve another address to spend tokens", async () => {
    const account = await wallet.getAddress();
    const spender = ethers.Wallet.createRandom().address;
    const amount = 100;

    await loyaltySDK.approve(spender, amount);

    const allowedAmount = await loyaltySDK.allowance(account, spender);

    assert.equal(
      allowedAmount.toString(),
      amount.toString()
    );
  });

  it("should check allowance", async () => {
    const account = await wallet.getAddress();
    const spender = ethers.Wallet.createRandom().address;
    const amount = 100; // Assuming decimals is 18

    await loyaltySDK.approve(spender, amount);

    const allowedAmount = await loyaltySDK.allowance(account, spender);

    assert.equal(
      allowedAmount.toString(),
      amount.toString()
    );
  });

  it("should increase allowance", async () => {
    const account = await wallet.getAddress();
    const spender = ethers.Wallet.createRandom().address;
    const amount = 100;

    await loyaltySDK.approve(spender, amount);

    const initialAllowance = await loyaltySDK.allowance(account, spender);

    await loyaltySDK.increaseAllowance(spender, amount);

    const updatedAllowance = await loyaltySDK.allowance(account, spender);

    assert.equal(
      updatedAllowance.toString(),
      ethers.BigNumber.from(initialAllowance).add(amount).toString()
    );
  });

  it("should decrease allowance", async () => {

    const account = await wallet.getAddress();
    const spender = ethers.Wallet.createRandom().address;
    const amount = 100;

    await loyaltySDK.approve(spender, amount);

    const initialAllowance = await loyaltySDK.allowance(account, spender);

    await loyaltySDK.decreaseAllowance(spender, amount);

    const updatedAllowance = await loyaltySDK.allowance(account, spender);
    assert.equal(
      updatedAllowance.toString(),
      ethers.BigNumber.from(initialAllowance).sub(amount).toString()
    );
  });

});

describe("Edge Cases", () => {
  let loyaltySDK;
  let wallet;
  let recipientWallet;

  before(() => {
    const provider = new ethers.providers.JsonRpcProvider(providerUrl);
    wallet = new ethers.Wallet(privateKey, provider);
    loyaltySDK = new LoyaltySDK(provider, privateKey, contractAddress);
    recipientWallet = ethers.Wallet.createRandom();
  });

  it("should succeed but not change balances when transferring 0 tokens", async () => {
    const sender = await wallet.getAddress();
    const recipient = ethers.Wallet.createRandom().address;
    const amount = 0;

    const initialSenderBalance = await loyaltySDK.getBalance(sender);
    const initialRecipientBalance = await loyaltySDK.getBalance(recipient);

    await loyaltySDK.transfer(recipient, amount);

    const finalSenderBalance = await loyaltySDK.getBalance(sender);
    const finalRecipientBalance = await loyaltySDK.getBalance(recipient);

    assert.equal(
      finalSenderBalance.toString(),
      ethers.BigNumber.from(initialSenderBalance).sub(amount).toString()
    );
    assert.equal(
      finalRecipientBalance.toString(),
      ethers.BigNumber.from(initialRecipientBalance).add(amount).toString()
    );
  });

  it("should handle transferring a large amount of tokens", async () => {
    const sender = await wallet.getAddress();
    const recipientAddress = await recipientWallet.getAddress();
    const largeAmount = 1000000000;

    const initialSenderBalance = await loyaltySDK.getBalance(sender);
    const initialRecipientBalance = await loyaltySDK.getBalance(recipientAddress);

    await loyaltySDK.transfer(recipientAddress, largeAmount);

    const finalSenderBalance = await loyaltySDK.getBalance(sender);
    const finalRecipientBalance = await loyaltySDK.getBalance(recipientAddress);

    assert.equal(
      finalSenderBalance.toString(),
      ethers.BigNumber.from(initialSenderBalance).sub(largeAmount).toString()
    );
    assert.equal(
      finalRecipientBalance.toString(),
      ethers.BigNumber.from(initialRecipientBalance).add(largeAmount).toString()
    );
  });

});

describe("Invalid Actions", () => {
  let loyaltySDK;
  let wallet;
  let recipientWallet;

  before(() => {
    const provider = new ethers.providers.JsonRpcProvider(providerUrl);
    wallet = new ethers.Wallet(privateKey, provider);
    loyaltySDK = new LoyaltySDK(provider, privateKey, contractAddress);
    recipientWallet = ethers.Wallet.createRandom();
  });

  it("should revert when transferring tokens from the zero address", async () => {
    const recipientAddress = await recipientWallet.getAddress();
    const amount = 100;

    await expectRevert(
      loyaltySDK.transferFrom(ethers.constants.AddressZero, recipientAddress, amount)
    );
  });

  it("should revert when transferring tokens to the zero address", async () => {
    const amount = 100;

    await expectRevert(
      loyaltySDK.transfer(ethers.constants.AddressZero, amount)
    );
  });

});

describe("Multi User Interactions", () => {
  let loyaltySDK;
  let wallet;
  let user1;

  before(() => {
    const provider = new ethers.providers.JsonRpcProvider(providerUrl);
    wallet = new ethers.Wallet(privateKey, provider);
    loyaltySDK = new LoyaltySDK(provider, privateKey, contractAddress);
    user1 = ethers.Wallet.createRandom();
    user2 = ethers.Wallet.createRandom();
  });

  it("should allow multiple users to transfer tokens", async () => {
    const sender = await wallet.getAddress();
    const user1Address = await user1.getAddress();
    const user2Address = await user2.getAddress();
    const amount = 50;

    await loyaltySDK.transfer(user1Address, 100);
    await loyaltySDK.transfer(user2Address, 100);

    const initialSenderBalance = await loyaltySDK.getBalance(sender);
    const initialUser1Balance = await loyaltySDK.getBalance(user1Address);
    const initialUser2Balance = await loyaltySDK.getBalance(user2Address);

    await loyaltySDK.transfer(user1Address, amount);
    await loyaltySDK.transfer(user2Address, amount);

    const finalSenderBalance = await loyaltySDK.getBalance(sender);
    const finalUser1Balance = await loyaltySDK.getBalance(user1Address);
    const finalUser2Balance = await loyaltySDK.getBalance(user2Address);

    assert.equal(
      finalUser1Balance.toString(),
      ethers.BigNumber.from(initialUser1Balance).add(amount).toString()
    );
    assert.equal(
      finalUser2Balance.toString(),
      ethers.BigNumber.from(initialUser2Balance).add(amount).toString()
    );

    assert.equal(
      finalSenderBalance.toString(),
      ethers.BigNumber.from(initialSenderBalance).sub(amount).sub(amount).toString()
    );
  });

});

describe("Contract Ownership and Access Control", () => {
  let loyaltySDK;
  let wallet;
  let otherWallet;

  before(() => {
    const provider = new ethers.providers.JsonRpcProvider(providerUrl);
    wallet = new ethers.Wallet(privateKey, provider);
    otherWallet = new ethers.Wallet.createRandom();
    loyaltySDK = new LoyaltySDK(provider, privateKey, contractAddress);
  });

  it("should set the correct owner on deployment", async () => {
    const ownerAddress = await wallet.getAddress();
    const contractOwner = await loyaltySDK.owner();

    assert.equal(contractOwner, ownerAddress);
  });

  it("should allow the owner to transfer ownership", async () => {
    const newOwnerAddress = await otherWallet.getAddress();

    await loyaltySDK.transferOwnership(newOwnerAddress, wallet);

    const contractOwner = await loyaltySDK.owner();
    assert.equal(contractOwner, newOwnerAddress);
  });

  it("should prevent non-owner from transferring ownership", async () => {
    const newOwnerAddress = ethers.Wallet.createRandom().address;

    await expectRevert(
      loyaltySDK.transferOwnership(newOwnerAddress, otherWallet)
    )

  });

});