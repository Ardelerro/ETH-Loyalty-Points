// SPDX-License-Identifier: MIT 
// contracts/LoyaltyToken.sol
pragma solidity ^0.8.0;

import "./interfaces/IERC20.sol";
import "./Ownable.sol";

/**
 * @title LoyaltyToken
 * @dev A basic ERC20 token with additional features for loyalty points.
 */
contract LoyaltyToken is IERC20, Ownable {   

    string private _name = "Loyalty Token";
    string private _symbol = "LOYAL";
    uint8 private _decimals = 18;
    uint256 private _totalSupply;
    
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    constructor(uint256 initialSupply) {
        _totalSupply = initialSupply * (10 ** uint256(_decimals));
        _balances[msg.sender] = _totalSupply;
    }
    
    function name() external view returns (string memory) {
        return _name;
    }

    function symbol() external view returns (string memory) {
        return _symbol;
    }

    function decimals() external view returns (uint8) {
        return _decimals;
    }

    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) external view override returns (uint256) {
        return _balances[account];
    }

    function transfer(address recipient, uint256 amount) external override returns (bool) {
        _transfer(msg.sender, recipient, amount);
        return true;
    }

    function allowance(address owner, address spender) external view override returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) external override {
        _approve(msg.sender, spender, amount);
    }

    function transferFrom(address sender, address recipient, uint256 amount) external override {
        uint256 currentAllowance = _allowances[sender][msg.sender];
        require(currentAllowance >= amount, "Transfer amount exceeds allowance");
        
        _approve(sender, msg.sender, currentAllowance - amount);

        _transfer(sender, recipient, amount);
        
    }

    function increaseAllowance(address spender, uint256 addedValue) external{
        _approve(msg.sender, spender, _allowances[msg.sender][spender] + addedValue);
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) external{
        _approve(msg.sender, spender, _allowances[msg.sender][spender] - subtractedValue);
    }

    function mint(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        _totalSupply += amount;
        _balances[msg.sender] += amount;
        emit Transfer(address(0), msg.sender, amount);
    }

    function burn(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        _totalSupply -= amount;
        _balances[msg.sender] -= amount;
        emit Transfer(msg.sender, address(0), amount);
    }

    function _transfer(address sender, address recipient, uint256 amount) internal {
        require(sender != address(0), "Transfer from the zero address");
        require(recipient != address(0), "Transfer to the zero address");
        require(_balances[sender] >= amount, "Insufficient balance");
        
        _balances[sender] -= amount;
        _balances[recipient] += amount;
        emit Transfer(sender, recipient, amount);
    }

    function _approve(address owner, address spender, uint256 amount) internal {

        require(owner != address(0), "Approve from the zero address");
        require(spender != address(0), "Approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }
}
