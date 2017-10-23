pragma solidity ^0.4.15;

import '../SpectreUtilityToken.sol';

contract SpectreUtilityTokenMock is SpectreUtilityToken {

  event MockNow(uint _now);

  uint mock_now = 1;

  function SpectreUtilityTokenMock(address _tokenFactory)
    SpectreUtilityToken(_tokenFactory)
  {}

  function getNow() internal constant returns (uint) {
      return mock_now;
  }

  function setMockedNow(uint _b) public {
      mock_now = _b;
      MockNow(_b);
  }

}
