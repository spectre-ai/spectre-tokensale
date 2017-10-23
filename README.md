# Spectre Tokens

## Tokens

There are three implemented tokens:  

  - SpectreSubscriberToken: This is the token issued during the contribution period.

  - SpectreUtilityToken: This is the Spectre Utility Token.

  - SpectreDividendToken: This is the Spectre Dividend Token

Subscriber tokens are issued during the contribution period, and can only be swapped for either Utility or Dividend tokens.

Swapping a Subscriber token for a Utility / Dividend token is done by transferring Subscriber tokens to the Utility or Dividend token contract addresses.

## Specification

1. 1 ETH is the minimum contribution amount for pre-sale and public sale.
2. Pre-sale will be from 27-Oct-2017 to 05-Nov-2017 and our public sale will be from 17th November to 10th December.
3. There is an overall cap of 240,000,000 tokens to be minted during the contribution period (total across both pre-sale and public sale).
4. There is no additional cap during the pre-sale.
5. Whitelist is applicable only for first 3 days of pre-sale. There is no whitelist for the public sale. Whitelist allocations can only be used once, so are set to 0 once a contribution from a given whitelist is made.
6. During the pre-sale, contributors can send between 95% and 120% of their whitelisted amounts.
7. Minimum cap is 5,000,000 tokens. If its not reached during public and pre-sale then we need to return the payments.
8. Refund process is initiated by Spectre-AI by sending ETH to the Subscriber token contract, then marking the contract is refundable.
9. The base price is 1 ETH = 2000 Subscriber tokens.
10. 33% bonus is applicable for the first 100,000,000 tokens sold in the pre-sale. 22% bonus will be applicable for all the remaining tokens sold in pre-sale.
11. 11% bonus will be applicable for all the tokens sold during the first week of public sale.
12. Subscriber tokens are delivered to users instantly when purchased, however they only become transferable after the token sale has ended.
13. Subscriber tokens should be transferable only to the Utility and Dividend contract addresses.
14. From 28 days after the public sale ends, Spectre-AI is able to transfer tokens on behalf of users to either the Utility or Dividend contract.
15. Once transferred to the Utility and Dividend contract addresses, an equal number of Utility / Dividend tokens should be minted for the contributor.
16. For every Utility / Dividend token minted for contributors, Spectre-AI receives an equal number of Utility / Dividend tokens.
17. Spectre-AI tokens are minted in the ratio of 42:18:40 for three separate wallet addresses (SPECTRE_BOUNTY_ADVISORY_DEV_TEAM_ALLOC, MANAGEMENT_LOCKED_ALLOC, OPTION_POOL_ALLOC respectively).
18. MANAGEMENT_LOCKED_ALLOC tokens are locked for 180 days from the 10th December.
19. OPTION_POOL tokens are locked for 365 days from the 10th December.
20. Dividend tokens can receive proportional dividends from payments made to the ProfitSharing contract.

## Dependencies

1. This repo uses truffle, node and npm:  
https://nodejs.org/en/ (v8.4.0)  
http://truffle.readthedocs.io/en/beta/getting_started/installation/

1. Run `npm install` in the repo root directory.

## Compilation

To compile the contracts to bytecode, you can execute:  
`truffle compile`

This will display some warnings which can be ignored.

## Deployment

The deployment is configured in `migrations/2_deploy_contracts.js`.

Before deploying to mainnet, Mocked contracts must be switched for non-mocked contracts, and all wallet and deployment addresses set correctly. Settings in truffle.js should also be reviewed / modified (you can set gasPrice here if you don't wish to use the 100GWei default).

To deploy, you can execute:  
`truffle migrate --reset`

which should output:
```
Using network 'development'.

Running migration: 1_initial_migration.js
  Deploying Migrations...
  ... 0xd6249bff61c45169ac82b7c491a948ddd0e1e2059b6958aab9475028987ceec8
  Migrations: 0xdde6e70eb8868c8b1140b6d37ae35a61c7574723
Saving successful migration to network...
  ... 0x74e6b470d44ed15bb5e5549b7533b0c2fd4e33419fa4ece0f83d4a8b10f5c223
Saving artifacts...
Running migration: 2_deploy_contracts.js
  Deploying MiniMeTokenFactory...
  ... 0x7fff48173c1e40944d4989c3c7215dd20752399d8fe543ef02c862651a42fa2d
  MiniMeTokenFactory: 0x88ac7d671640a864312071e4304bf9bf12334df6
  Deploying SpectreSubscriberTokenMock...
  ... 0xa3789212efbabb3149dac9f0f5c75980c43ae8c6700d3b43fa243f4abdad359f
  SpectreSubscriberTokenMock: 0x6afc2dabb2e6035b90e2291addf03a323a77b574
  Deploying SpectreUtilityTokenMock...
  ... 0xd1733b2b34d8b8129051e552a2ca6b0b0681c8bb9f4af11612def869f0d3b82c
  SpectreUtilityTokenMock: 0xa67950ed3ec341909263cbecc32239f15363260f
  Deploying SpectreDividendTokenMock...
  ... 0x1420e19521b432cbeb4252651c0a1c68ce38da4e6c469c7605c4288a0fdfa29f
  SpectreDividendTokenMock: 0x16c85c25a926d57774750b128a6ef312a1e51410
  ... 0x5ac09f00918841e5730b8f9c59a1cb11ffb35baef563286ebf802bd11a67cb5b
  ... 0x2027065ad981c3633a49ab335472d8934ab96af475e5886d21c18f344be9ac87
  ... 0x549c67c01c020cb08e7ff573eb2d98297e4f54c26d74b360feb1c49a6d9032e8
  ... 0x7cae77a7786db42c63b7d8d1630aa861862db4a07640869ae27d9553b2382402
  ... 0x0da15d7e1eb969b53dc3f3a1b4800d49ac6d357bf1016f7f1ab4fef9518879bf
  ... 0xf24e60eae2fcc29c1097bf7280437dfd1460071a1c96031478f35cc06c6bb0a5
  Deploying ProfitSharing...
  ... 0x666f103114fd10935076fa29131bd46fa4aa4fccec926a9515882eb58c7ea9e2
  ProfitSharing: 0x5115258bd65c5be96afe5af33357ad9f804ebefc
Saving successful migration to network...
  ... 0x9d9f9e4727e5ede676642266d594522fba3eda3afee6d933303d91b2a7eb937c
Saving artifacts...
```

## Testing

Comprehensive test cases have been added for all contracts.

To run the test cases, you must first run testrpc. Testrpc must be run with high account balances as this is needed in order to test the cap logic of the sale process. This can be done by executing the below (private keys are arbitary):  
`testrpc --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e1c, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e11, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e12, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e13, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e14, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e15, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e16, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e17, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e18, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e19, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e20, 1000000000000000000000000"`

To test, you can execute:  
`truffle test`

which should output:
```
  Contract: Check ICO Initialisation
    ✓ 0. check initial settings (240ms)
    ✓ 1. initialise and check whitelists (125ms)

  Contract: Check ICO Sale
    ✓ 0. make some presale contributions (170ms)
    ✓ 1. move to sale, check min. contribution (53ms)
    ✓ 2. check week 1 bonus - 11% (53ms)
    ✓ 3. check no bonus after 1st week (59ms)
    ✓ 4. check can't breach max cap (44ms)
    ✓ 5. check  can't transfer tokens to address or utility / dividend contracts (243ms)
    ✓ 6. check can't contribute after sale
    ✓ 7. check can now transfer tokens to utility / dividend contracts (701ms)
    ✓ 8. check owner can't transfer on users behalf yet (101ms)
    ✓ 9. check still can't transfer to other addresses (55ms)
    ✓ 10. check owner can transfer on users behalf yet after 28 days (354ms)

  Contract: Check ICO Presale
    ✓ 0. check contributions rejected before presale start (69ms)
    ✓ 1. move to presale, check min. contribution
    ✓ 2. whitelisted contributions - 33% bonus (118ms)
    ✓ 3. check non-whitelist accounts can't contribute
    ✓ 4. check 22% bonus after 100mil. tokens sold (198ms)
    ✓ 4. check can't breach max cap (148ms)
    ✓ 5. check  can't transfer tokens to address or utility / dividend contracts (155ms)
    ✓ 6. check can't contribute between presale and sale
    ✓ 7. check still can't transfer tokens (166ms)

  Contract: Check ICO Refunds
    ✓ 0. make some presale contributions - 33% bonus (190ms)
    ✓ 1. make some week 1 contribution - 11% (63ms)
    ✓ 2. make some week 1 contribution - 0% (80ms)
    ✓ 3. sale finishes, unable to refund or transfer (202ms)
    ✓ 4. fund contract, unable to refund or transfer (159ms)
    ✓ 5. set refundable, refunds received, unable to transfer (1948ms)

  Contract: Check Initialisation
    ✓ 0. check initial settings (96ms)
    ✓ 1. check wallet address details (157ms)

  Contract: Check Utility Transfers
    ✓ 0. initialise all subscriber tokens (209ms)
    ✓ 1. investor transfers 50% of tokens to utility contract (214ms)
    ✓ 2. spectre wallets receive utility token allocations (159ms)
    ✓ 3. owner transfers remaining investor tokens to utility contract (243ms)
    ✓ 4. spectre wallets receives more utility token allocations (178ms)
    ✓ 5. further token transfers fail

  Contract: Check Dividend Transfers
    ✓ 0. initialise all subscriber tokens (122ms)
    ✓ 1. investor transfers 50% of tokens to dividend contract (265ms)
    ✓ 2. spectre wallets receive dividend token allocations (190ms)
    ✓ 3. investor transfers remaining tokens to dividend contract (250ms)
    ✓ 4. spectre wallets receives more dividend token allocations (177ms)
    ✓ 5. further token transfers fail

  Contract: Mixed Utility and Dividend Transfers
    ✓ 0. initialise all subscriber tokens (125ms)
    ✓ 1. investor transfers 50% of tokens to utility contract and 50% to dividend contract (390ms)
    ✓ 2. spectre wallets receive dividend token allocations (185ms)
    ✓ 3. spectre wallets receive utility token allocations (176ms)
    ✓ 4. new investor transfers some tokens to utility and dividend contracts (479ms)
    ✓ 5. spectre wallets receives more dividend token allocations (180ms)
    ✓ 6. spectre wallets receives more utility token allocations (179ms)

  Contract: Check Utility Token Locks
    ✓ 0. initialise all subscriber tokens (194ms)
    ✓ 1. generate some SpectreAI balances from investor token swaps (567ms)
    ✓ 2. check investor can transfer tokens (194ms)
    ✓ 3. check spectreAI unlocked wallet can transfer tokens (198ms)
    ✓ 4. check spectreAI locked wallets can not transfer tokens (44ms)
    ✓ 5. check spectreAI locked wallets can not approve and transfer tokens (108ms)
    ✓ 6. check spectreAI locked wallets can transfer surplus tokens (amounts over minted locked amounts) (299ms)
    ✓ 7. check spectreAI management locked wallet can transfer tokens after 180 days (458ms)
    ✓ 8. check spectreAI option pool locked wallet can transfer tokens after 365 days (551ms)
    ✓ 9. check spectreAI unlocked wallets can approve and transfer tokens (101ms)

  Contract: Check Dividend Token Locks
    ✓ 0. initialise all subscriber tokens (130ms)
    ✓ 1. generate some SpectreAI balances from investor token swaps (645ms)
    ✓ 2. check investor can transfer tokens (176ms)
    ✓ 3. check spectreAI unlocked wallet can transfer tokens (198ms)
    ✓ 4. check spectreAI locked wallets can not transfer tokens (67ms)
    ✓ 5. check spectreAI locked wallets can not approve and transfer tokens (139ms)
    ✓ 6. check spectreAI locked wallets can transfer surplus tokens (amounts over minted locked amounts) (290ms)
    ✓ 7. check spectreAI management locked wallet can transfer tokens after 180 days (369ms)
    ✓ 8. check spectreAI option pool locked wallet can transfer tokens after 365 days (603ms)
    ✓ 9. check spectreAI unlocked wallets can approve and transfer tokens (116ms)

  Contract: Check Dividend Profit Sharing
    ✓ 0. initialise all subscriber tokens (130ms)
    ✓ 1. generate some SpectreAI and investor balances from investor token swaps (1168ms)
    ✓ 2. make dividend payment (118ms)
    ✓ 3. claim investor dividends and check balances (2074ms)


  73 passing (20s)
```

## Whitelist

The script `scripts/whitelistAllocations.js` can be used to set whitelist allocations in batches of 50.

To run the script, you must have a geth node running, with the `sourceAccount` below unlocked.

1. Edit `scripts/whitelistAllocations.js` to reflect:  
  - `sourceAccount`: the owner of the token contract (address that deployed it above).
  - `tokenAddress`: the address of the token contract (output from `truffle migrate --reset`).
  - the gas price you wish to use (`eth.gasPrice.mul(0.1)`).
2. Edit `scripts/whitelistAllocations.csv` to reflect the accounts you want to update:
  - line format is [address],[allocation]
3. Execute `node scripts/whitelistAllocations.js`:  
```
Adams-MBP:spectre-tokens adamdossa$ node scripts/whitelistAllocations.js
Transaction: 0 Length: 50
txHash:  0x8ffe340c2b7a55f985d583182e3ca9e2922afd5d20168730630eb1c3c73930f9
Transaction: 50 Length: 50
txHash:  0x093a376b1090fef4125c6e2d40b79976f50464fce620f2071e1f4bd2a8738f48
Transaction: 100 Length: 50
txHash:  0x1ab3d20d1869cd75e6e829a4ff80d4da0b0b1e4a49a63e0d5af699094b7a9023
Transaction: 150 Length: 50
txHash:  0x114eb8b2a3eaffe107e0bb3c3c270942b81620b92a909b9303dd50b1d9433ea2
Transaction: 200 Length: 50
txHash:  0xb5b2233afb017c2a360fbcdbf6dd5862e0fdfcd38a10e807a8550cb0bbe2b41e
Transaction: 250 Length: 50
txHash:  0x1fe916ed5f4760f5ecbf538434ca7ab5034fcce940ab52d064107d71a7d4d696
Transaction: 300 Length: 50
txHash:  0xae8bd847da11e42d1a95d70b95343309007dda61ae8c9852b1f6c59e69a057d1
Transaction: 350 Length: 50
txHash:  0x110fac3e231cb452da4765fafbe50e4506dc4bd4c395be163d5b6205845197c7
Transaction: 400 Length: 50
txHash:  0x6f83d65b841debb07d1c836b265603a8eec68f2a05a3f6ac3e66a9a409bbc5ef
Transaction: 450 Length: 50
txHash:  0xbe21a8fecb4d66288206496469553c38fdba43040bf9eaa8442bc3f5acf3e7bf
Transaction: 500 Length: 50
txHash:  0x3b0c0ab3018c89627c183aa467a47fe8c36532c749232903582609da9feb1377
Transaction: 550 Length: 50
txHash:  0xa9871b379a956d24d8791698c5eab2bb15df31495b91d91c4d3b79191d36759a
Transaction: 600 Length: 50
txHash:  0xc1b78d38847de515a87190a4a506f09e9e2c0bb262f9c267b55147ab395edbc8
Transaction: 650 Length: 50
txHash:  0xf46acb7e8408bf6e3390a915129f26e013d9375aff771e8a0940570cfac13d6d
Transaction: 700 Length: 50
txHash:  0xf62cb97a3301edf75b02e07194a01128efda14a641e2cfd5ce9e7beac6a809d1
Transaction: 750 Length: 50
txHash:  0x7a151bf91cf90ddb955d7cb6550b3f866b4dac5c32f4b74f5013c5c230855e97
Transaction: 800 Length: 50
txHash:  0x18949bc8a87cc29ac442999f6f51ce779128d7aac7ee2aa9fa2bf445a9f71a86
Transaction: 850 Length: 50
txHash:  0x3893bcc30b89838832811e8107f8c4b931ecad2979fa9b3d804a1dca4bed3947
Transaction: 900 Length: 50
txHash:  0x0456a44ed7c1ecd3da3e6484e68c21b3ef37156836b8ec7e609b861722fd0344
Transaction: 950 Length: 50
txHash:  0xa84b86b0565762780082135063e58fa1cf1ca579c18270a09fd428c0ae5cc25e
Transaction: 1000 Length: 50
txHash:  0x53d02a0a2125682fe8ca76d4e5feda4c81c30a96ceb30f28439450e88b329897
Transaction: 1050 Length: 50
txHash:  0x39106d476ae7ba8dea992f79fb865a0393c43f9a8128d1856a685adecc487664
Transaction: 1100 Length: 33
txHash:  0x8c479884135d69416de49919b8e76d8ab68806f2ec4ca214b8e16c248eaf862d
terminated successfully
```
