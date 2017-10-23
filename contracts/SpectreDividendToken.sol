pragma solidity ^0.4.15;

import "./SpectreToken.sol";

contract SpectreDividendToken is SpectreToken {

    function SpectreDividendToken(address _tokenFactory)
      MiniMeToken(
        _tokenFactory,
        0x0,                     // no parent token
        0,                       // no snapshot block number from parent
        "Spectre Dividend Token",           // Token name
        6,                       // Decimals
        "SPECD",                   // Symbol
        true                    // Enable transfers
      )
    {}

}
