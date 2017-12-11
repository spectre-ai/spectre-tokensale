// GENERAL PARAMS

//Enter Details here
const sourceAccount = "???";
const tokenAddress = "???";
const tokenAbi = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"mint","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"onTransfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_subtractedValue","type":"uint256"}],"name":"decreaseApproval","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"specUWallet","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"withdrawEther","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"tokenAddressesSet","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"data","type":"uint256[]"}],"name":"multiMint","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_transferTime","type":"uint256"}],"name":"setTransferTime","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_specUWallet","type":"address"},{"name":"_specDWallet","type":"address"}],"name":"setTokenAddresses","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"specWallet","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_addedValue","type":"uint256"}],"name":"increaseApproval","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"},{"name":"_amount","type":"uint256"}],"name":"onApprove","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"},{"name":"_amount","type":"uint256"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"transferTime","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"specDWallet","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_owner","type":"address"}],"name":"proxyPayment","outputs":[{"name":"","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address","indexed":true},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"OwnerTransfer","outputs":[{"name":"","type":"bool"}],"payable":true,"stateMutability":"payable","type":"event","anonymous":false},{"anonymous":false,"inputs":[{"indexed":false,"name":"_transferTime","type":"uint256"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"TransferTimeSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}];

const Web3 = require("web3");
const fs = require("fs");
const async = require("async");
const path = require("path");
// create an instance of web3 using the HTTP provider.
// NOTE in mist web3 is already available, so check first if its available before instantiating
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const BigNumber = require("bignumber.js");

const eth = web3.eth;

var token = web3.eth.contract(tokenAbi).at(tokenAddress);

const multiple = 100;
const D160 = new BigNumber("10000000000000000000000000000000000000000", 16);

const loadCsv = (cb) => {
    const repeated = {};
    const balances = [];
    fs.readFile(path.join(__dirname, "migrateBalances.csv"), "utf8", (err, res) => {
        if (err) {
            cb(err);
            return;
        }
        const lines = res.split("\n");
        for (let i = 0; i < lines.length; i += 1) {
            const line = lines[ i ].split(",");
            if (line.length === 2) {
                const addr = line[ 0 ].toLowerCase();
                if (!web3.isAddress(addr)) {
                    console.log("Invalid address: ", addr);
                    cb(new Error(`Invalid address ${ addr }`));
                    return;
                }
                if (repeated[ addr ]) {
                    console.log("Address is repeated: ", addr);
                    cb(new Error(`Address is repeated: ${ addr }`));
                    return;
                }
                repeated[ addr ] = true;
                const amount = new BigNumber(line[ 1 ]);
                if (amount.isZero()) {
                    console.log("Address with zero balance: ", addr);
                    cb(new Error(`Address with zero balance ${ addr }`));
                    return;
                }
                balances.push({
                    address: line[ 0 ],
                    amount: amount.toString(10),
                });
            }
        }

        cb(null, balances);
    });
};

const multiSend = (balances, cb) => {
    let i;
    const packetbalances = [];
    for (i = 0; i < balances.length; i += 1) {
        packetbalances.push(pack(balances[ i ].address, balances[ i ].amount));
    }

    let pos = 0;
    async.whilst(
        () => pos < packetbalances.length,
        (cb1) => {
            const sendBalances = packetbalances.slice(pos, pos + multiple);
            console.log("Transaction: " + pos + " Length: " + sendBalances.length);
            pos += multiple;
            token.multiMint(
                sendBalances,
                { from: sourceAccount, gas: 4000000, gasPrice: 50000000000 },
                (err, txHash) => {
                    if (err) return cb(err);
                    console.log("txHash: ", txHash);
                    cb1();
                });
        },
        cb);

    function pack(address, amount) {
        const addressNum = new BigNumber(address.substring(2), 16);
        const amountWei = new BigNumber(amount);
        const v = D160.mul(amountWei).add(addressNum);
        return v.toString(10);
    }
};

loadCsv((err, balances) => {
    if (err) {
        console.log(err);
    } else {
        multiSend(balances, (err2) => {
            if (err2) {
                console.log(err2);
            } else {
                console.log("terminated successfully");
            }
        });
    }
});
