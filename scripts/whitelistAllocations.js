// GENERAL PARAMS

const sourceAccount = "0x9a9d8ff9854a2722a76a99de6c1bb71d93898ef5";
const tokenAddress = '0x88bcb77fde91a9da5fa387cb54ed6fc3fa44cb1c';

const Web3 = require("web3");
const fs = require("fs");
const async = require("async");
const path = require("path");
// create an instance of web3 using the HTTP provider.
// NOTE in mist web3 is already available, so check first if its available before instantiating
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const BigNumber = require("bignumber.js");

const eth = web3.eth;

var tokenAbi = [{"constant":true,"inputs":[],"name":"TOKENS_AVAILABLE","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"presaleEnd","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"numberOfTokensLeft","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"data","type":"uint256[]"}],"name":"multiSetWhiteList","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"unpause","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"BONUS_SLAB","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"onTransfer","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"refund","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"paused","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"discountSaleEnd","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_subtractedValue","type":"uint256"}],"name":"decreaseApproval","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"specUWallet","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_presaleStart","type":"uint256"},{"name":"_presaleEnd","type":"uint256"},{"name":"_saleStart","type":"uint256"},{"name":"_saleEnd","type":"uint256"},{"name":"_discountSaleEnd","type":"uint256"}],"name":"configure","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"withdrawEther","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"setRefundable","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"MIN_CAP","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"tokenAddressesSet","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"pause","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"configured","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"whitelist","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"MIN_FUND_AMOUNT","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_specUWallet","type":"address"},{"name":"_specDWallet","type":"address"}],"name":"setTokenAddresses","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"saleStart","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"},{"name":"_data","type":"bytes"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"fundContract","outputs":[],"payable":true,"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"},{"name":"_data","type":"bytes"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"refundable","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"specWallet","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"saleEnd","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_subscriber","type":"address"},{"name":"_amount","type":"uint256"}],"name":"setWhiteList","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"TOKEN_PRICE","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_addedValue","type":"uint256"}],"name":"increaseApproval","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"bonus","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"},{"name":"_amount","type":"uint256"}],"name":"onApprove","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"presaleStart","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"specDWallet","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_owner","type":"address"}],"name":"proxyPayment","outputs":[{"name":"","type":"bool"}],"payable":true,"type":"function"},{"inputs":[{"name":"_specWallet","type":"address"}],"payable":false,"type":"constructor"},{"payable":true,"type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Refund","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":false,"name":"_value","type":"uint256"},{"indexed":false,"name":"_total","type":"uint256"}],"name":"ContractFunded","type":"event"},{"anonymous":false,"inputs":[],"name":"Refundable","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_subscriber","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"WhiteListSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"OwnerTransfer","type":"event"},{"anonymous":false,"inputs":[],"name":"Pause","type":"event"},{"anonymous":false,"inputs":[],"name":"Unpause","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}];
var token = web3.eth.contract(tokenAbi).at(tokenAddress);

const multiple = 50;
const D160 = new BigNumber("10000000000000000000000000000000000000000", 16);

const loadCsv = (cb) => {
    const repeated = {};
    const balances = [];
    fs.readFile(path.join(__dirname, "whitelistAllocations.csv"), "utf8", (err, res) => {
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
            token.multiSetWhiteList(
                sendBalances,
                { from: sourceAccount, gas: 3700000, gasPrice: eth.gasPrice.mul(0.1).floor() },
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
