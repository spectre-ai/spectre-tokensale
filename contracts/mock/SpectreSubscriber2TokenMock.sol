pragma solidity ^0.4.15;

import '../SpectreSubscriber2Token.sol';

contract SpectreSubscriber2TokenMock is SpectreSubscriber2Token {

  event MockNow(uint _now);

  uint mock_now = 1;

  function getNow() internal constant returns (uint) {
      return mock_now;
  }

  function setMockedNow(uint _b) public {
      mock_now = _b;
      MockNow(_b);
  }

}
