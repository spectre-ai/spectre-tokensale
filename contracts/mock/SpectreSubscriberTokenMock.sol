pragma solidity ^0.4.15;

import '../SpectreSubscriberToken.sol';

contract SpectreSubscriberTokenMock is SpectreSubscriberToken {

  event MockNow(uint _now);

  uint mock_now = 1;

  function SpectreSubscriberTokenMock(address _specWallet)
    SpectreSubscriberToken(_specWallet)
  {}

  function getNow() internal constant returns (uint) {
      return mock_now;
  }

  function setMockedNow(uint _b) public {
      mock_now = _b;
      MockNow(_b);
  }

}
