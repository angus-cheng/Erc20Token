pragma solidity ^0.8.10;

contract DappToken {
    uint256 public totalSupply;
    string public name;
    string public symbol;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // Local variables use "_"
    constructor(uint256 _initialSupply) {
        totalSupply = _initialSupply;
        name = "DApp Token";
        symbol = "DAT";
        balanceOf[msg.sender] = _initialSupply; // msg global variable. sender is the address that called function
    }

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    event Approval(
        address indexed _owner, 
        address indexed _spender, 
        uint256 _value 
    );

    // Transfer
    // Exception if account doesn't have enough
    // Return a boolean
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value);   // Require - Only continue if require() functions. Otherwise, throw error & refund gas.
        // Transfer the balance
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        // Transfer Event
        emit Transfer(msg.sender, _to, _value);

        return true;
    }

    // Approve account '_spender' to spend '_value' amount
    function approve(address _spender, uint256 _value) public returns (bool success) {
        // Allowance
        allowance[msg.sender][_spender] = _value;

        // Approve event
        emit Approval(msg.sender, _spender, _value);

        return true;
    }

    // Certifies transfer from one address to another with some value
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        // Require _from has enough tokens
        require(balanceOf[_from] >= _value);
        // Require allowance is big enough
        require(allowance[_from][msg.sender] >= _value);
        // Change balance
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        // Update allowance
        allowance[_from][msg.sender] -= _value;
        // Transfer event
        emit Transfer(_from, _to, _value);

        return true;
    }
}