pragma solidity ^0.4.15;

import "./SpectreToken.sol";

contract SpectreUtilityToken is SpectreToken {

    function SpectreUtilityToken(address _tokenFactory)
      MiniMeToken(
        _tokenFactory,
        0x0,                     // no parent token
        0,                       // no snapshot block number from parent
        "Spectre.ai U-Token",           // Token name
        18,                       // Decimals
        "SXUT",                   // Symbol
        true                    // Enable transfers
      )
    {}

}
