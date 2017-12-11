pragma solidity ^0.4.15;

import "./SpectreToken.sol";

contract SpectreDividendToken is SpectreToken {

    function SpectreDividendToken(address _tokenFactory)
      MiniMeToken(
        _tokenFactory,
        0x0,                     // no parent token
        0,                       // no snapshot block number from parent
        "Spectre.ai D-Token",           // Token name
        18,                       // Decimals
        "SXDT",                   // Symbol
        true                    // Enable transfers
      )
    {}

}
