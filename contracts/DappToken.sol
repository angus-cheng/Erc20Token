pragma solidity ^0.8.10;

contract DappToken {
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    string public name;
    string public symbol;

    // Local variables use "_"
    constructor(uint256 _initialSupply) {
        totalSupply = _initialSupply;
        name = "DApp Token";
        symbol = "DAT";
        balanceOf[msg.sender] = _initialSupply; // msg global variable. sender is the address that called function
    }

    // Transfer
    // Exception if account doesn't have enough
    // Return a boolean
    // Transfer Event
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value);   // Require - Only continue if require() functions. Otherwise, throw error & refund gas.
        // Transfer the balance
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
    }
}