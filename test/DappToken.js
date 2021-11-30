const { assert } = require("chai");

let DappToken = artifacts.require("./DappToken.sol");

contract("DappToken", function(accounts) {
    var tokenInstance;

    it("Initializes the contract witht the correct values", function() { 
        return DappToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.name();
        }).then(function(name) {
            assert.equal(name, "DApp Token", "Has the correct name");
            return tokenInstance.symbol();
        }).then(function(symbol) {
            assert.equal(symbol, "DAT", "Has the correct symbol");
        });
    });

    it("Sets the total supply upon deployment", function() {
        return DappToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function(totalSupply) {
            assert.equal(totalSupply.toNumber(), 1000000, "Sets the total supply to 1,000,000");
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(adminBalance) {
            assert.equal(adminBalance.toNumber(), 1000000, "Allocates the initial supply to the admin");
        });
    });

    it("Transfers token ownership", function() {
        return DappToken.deployed().then(function(instance) {
            tokenInstance = instance;
            // Test "require" statement first by transferring something larger than the sender's balance
            return tokenInstance.transfer.call(accounts[1], Number.MAX_SAFE_INTEGER);   // call does not trigger transaction - used to inspect event
        }).then(assert.fail).catch(function(error) {
            assert(error.message, "Error message must contain revert");
            return tokenInstance.transfer(accounts[1], 250000, { from: accounts[0] });
        }).then(function(receipt) {
            return tokenInstance.balanceOf(accounts[1]);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 250000), "Adds the amount to the receiving account";
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 750000, "Deducts the amount from the sending account");
        });
    });
});