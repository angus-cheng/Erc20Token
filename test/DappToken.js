const { assert } = require("chai");

let DappToken = artifacts.require("./DappToken.sol");

contract("DappToken", function(accounts) {
    var tokenInstance;

    it("Initializes the contract with the correct values", function() { 
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
            // Call does not trigger transaction - used to inspect event and whether it returns true/false
            return tokenInstance.transfer.call(accounts[1], 9999999999); 
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf("revert") >= 0, "Error message must contain revert");
            // Only blockchain recipt/log can be inspected from transfer
            return tokenInstance.transfer.call(accounts[1], 250000, { from: accounts[0]});
        }).then(function(success) {
            assert.equal(success, true, "Transfer returns true");
            // { from: accounts[0] } explicitly tells us which account transferring from
            return tokenInstance.transfer(accounts[1], 250000, { from: accounts[0] });
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, "Triggers one event");
            assert.equal(receipt.logs[0].event, "Transfer", "'Transfer' event shouold exist");
            assert.equal(receipt.logs[0].args._from, accounts[0], "Logs the account the tokens are transferred from");
            assert.equal(receipt.logs[0].args._to, accounts[1], "Logs the account the tokens are transferred to");
            assert.equal(receipt.logs[0].args._value, 250000, "Logs the transfer amount");
            return tokenInstance.balanceOf(accounts[1]);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 250000), "Adds the amount to the receiving account";
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 750000, "Deducts the amount from the sending account");
        });
    });

    it("Approves tokens for delegated transfer", function() {
        return DappToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.approve.call(accounts[1], 100);
        }).then(function(success) {
            assert.equal(success, true, "Returns true");
            return tokenInstance.approve(accounts[1], 100, { from: accounts[0] });
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, "Triggers one event");
            assert.equal(receipt.logs[0].event, "Approval", "Triggers an 'Approval' event");
            assert.equal(receipt.logs[0].args._owner, accounts[0], "Logs the account the tokens are authorized by");
            assert.equal(receipt.logs[0].args._spender, accounts[1], "Logs the account the tokens are authorized to");
            assert.equal(receipt.logs[0].args._value, 100, "Logs the transfer amount");
            return tokenInstance.allowance(accounts[0], accounts[1]);
        }).then(function(allowance) {
            assert.equal(allowance.toNumber(), 100, "Stores the allowance for delegated transfer");
        });
    });

    it("Handles delegated token transfers", function() {
        return DappToken.deployed().then(function(instance) {
            tokenInstance = instance;
            fromAccount = accounts[2];
            toAccount = accounts[3]
            spendingAccount = accounts[4];
            // Transfer some tokens to fromAccount
            return tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });
        }).then(function(receipt) {
            // Approve spendingAccount to spend 10 tokens from FromAccount
            return tokenInstance.approve(spendingAccount, 10, { from: fromAccount });
        }).then(function(receipt) {
            // Try transferring something larger than the sender's balance
            return tokenInstance.transferFrom(fromAccount, toAccount, 200, { from: spendingAccount });
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf("revert") >= 0, "Cannot transfer value larger than balance");
            // Try transferring something larger than the approved amount
            return tokenInstance.transferFrom(fromAccount, toAccount, 20, { from: spendingAccount });
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf("revert") >= 0, "Cannot transfer value larger than approved amount");
            return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount });
        }).then(function(success) {
            assert.equal(success, true);
            return tokenInstance.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount});
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, "Triggers one event");
            assert.equal(receipt.logs[0].event, "Transfer", "Triggers a 'Transfer' event");
            assert.equal(receipt.logs[0].args._from, fromAccount, "Logs the account the tokens are transferred by");
            assert.equal(receipt.logs[0].args._to, toAccount, "Logs the account the tokens are transferred to");
            assert.equal(receipt.logs[0].args._value, 10, "Logs the transfer amount");
            return tokenInstance.balanceOf(fromAccount);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 90, "Deducts the correct amount from the sending account");
            return tokenInstance.balanceOf(toAccount);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 10, "Transfers the correct amount to the receiving account");
            return tokenInstance.allowance(fromAccount, spendingAccount);
        }).then(function(allowance) {
            assert.equal(allowance.toNumber(), 0, "Deducts the amount from the allowance");
        });
    });
});