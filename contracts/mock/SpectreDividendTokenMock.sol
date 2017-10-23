pragma solidity ^0.4.15;

import '../SpectreDividendToken.sol';

contract SpectreDividendTokenMock is SpectreDividendToken {

  event MockNow(uint _now);

  uint mock_now = 1;

  function SpectreDividendTokenMock(address _tokenFactory)
    SpectreDividendToken(_tokenFactory)
  {}

  function getNow() internal constant returns (uint) {
      return mock_now;
  }

  function setMockedNow(uint _b) public {
      mock_now = _b;
      MockNow(_b);
  }

}
