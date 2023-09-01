import { ethers, Contract } from 'ethers';
import { LoyaltyTokenABI } from './utils';


/**
 * The LoyaltySDK class provides an interface to interact with the LoyaltyToken smart contract.
 */

class LoyaltySDK {
  private provider: ethers.providers.JsonRpcProvider;
  private signer: ethers.Signer;
  private contract: Contract;

  /**
   * Initializes the LoyaltySDK with the Ethereum provider, private key, and contract address.
   * @param providerUrl - The URL of the Ethereum provider.
   * @param privateKey - The private key of the user's Ethereum account.
   * @param contractAddress - The address of the LoyaltyToken smart contract.
   */

  constructor(provider: ethers.providers.JsonRpcProvider, privateKey: string, contractAddress: string) {
    this.provider = provider;
    this.signer = new ethers.Wallet(privateKey, this.provider);
    this.contract = new ethers.Contract(contractAddress, LoyaltyTokenABI, this.signer);
  }

  /**
   * Gets the account balance for the provided Ethereum address.
   * @param account - The Ethereum address to retrieve the balance.
   * @returns The account balance in Wei.
   */
  async getBalance(account: string): Promise<string> {
    this.checkAddress(account);
    const balance = await this.contract.balanceOf(account);
    return balance.toString();
  }

  /**
   * Transfers a specified amount of tokens from the sender's address for a purchace
   * @param recipient - The Ethereum address of the recipient.
   * @param amount - The amount of tokens to transfer.
   */
  async transfer(to: string, amount: number): Promise<void> {
    this.checkAddress(to);
    this.checkPositiveNumber(amount);

    const tx = await this.contract.transfer(to, amount);
    await tx.wait();
  }

  /**
   * Approves another Ethereum address to spend a specified amount of tokens
   * @param spender - The Ethereum address of the spender.
   * @param amount - The amount of tokens to approve.
   */
  async approve(spender: string, amount: number): Promise<void> {
    this.checkAddress(spender);
    this.checkPositiveNumber(amount);

    const tx = await this.contract.approve(spender, amount);
    await tx.wait();
  }

  /**
   * Checks the allowance granted to a spender by an owner for spending tokens.
   * @param owner - The Ethereum address of the token owner.
   * @param spender - The Ethereum address of the spender.
   * @returns The allowance amount in Wei.
   */
  async allowance(owner: string, spender: string): Promise<string> {
    this.checkAddress(owner);
    this.checkAddress(spender);

    const allowedAmount = await this.contract.allowance(owner, spender);
    return allowedAmount.toString();
  }

  /**
   * Checks the allowance granted to a spender by an owner for spending tokens.
   * @param owner - The Ethereum address of the token owner.
   * @param spender - The Ethereum address of the spender.
   * @returns The allowance amount in Wei.
   */
  async increaseAllowance(spender: string, amount: number): Promise<void> {
    this.checkAddress(spender);

    await this.contract.increaseAllowance(spender, amount);
  }

  /**
   * Checks the allowance granted to a spender by an owner for spending tokens.
   * @param owner - The Ethereum address of the token owner.
   * @param spender - The Ethereum address of the spender.
   * @returns The allowance amount in Wei.
   */
  async decreaseAllowance(spender: string, amount: number): Promise<void> {
    this.checkAddress(spender);

    await this.contract.decreaseAllowance(spender, amount);
  }

  /**
   * Transfers tokens from an owner to a recipient using the allowance mechanism.
   * @param owner - The Ethereum address of the token owner.
   * @param recipient - The Ethereum address of the recipient.
   * @param amount - The amount of tokens to transfer.
   */
  async transferFrom(from: string, to: string, amount: number): Promise<void> {
    this.checkAddress(from);
    this.checkAddress(to);
    this.checkPositiveNumber(amount);

    await this.contract.transferFrom(from, to, amount);
  }

  /**
   * Transfers the ownership to a new owner. Only the owner can call this function.
   * @param newOwner - The Ethereum address of the new owner.
   */
  async transferOwnership(newOwner: string) {
    this.checkAddress(newOwner);

    await this.contract.transferOwnership(newOwner);
  }

  private checkAddress(address: string): void {
    if (!ethers.utils.isAddress(address)) {
      throw new Error('Invalid Ethereum address');
    }
  }

  private checkPositiveNumber(value: number): void {
    if (value < 0) {
      throw new Error('Value must be a positive number');
    }
  }

  /**
   * The adress of the owner
   * @return owner - The Owner
   */
  async owner() {
    return this.contract.owner();
  }
}

export default LoyaltySDK;