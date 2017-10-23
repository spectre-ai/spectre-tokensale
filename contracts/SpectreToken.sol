pragma solidity ^0.4.15;

import "./MiniMeToken.sol";
import "./ContractReceiver.sol";
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';

contract TokenBurner {
    function burn(address , uint )
    returns (bool result) {
        return false;
    }
}

contract SpectreToken is MiniMeToken, Ownable, ContractReceiver {

    event WalletAddressesSet(address _spectreTeam, address _managementLocked, address _optionPool);

    TokenBurner public tokenBurner;

    //Spectre addresses
    address public spectreTeam;
    address public managementLocked;
    address public optionPool;
    bool public walletAddressesSet;

    //In percentages of tokens allocated to Spectre
    uint256 public SPECTRE_BOUNTY_ADVISORY_DEV_TEAM_ALLOC = 42;
    uint256 public MANAGEMENT_LOCKED_ALLOC = 18;
    uint256 public OPTION_POOL_ALLOC = 40;

    //Lock up periods
    uint256 public LOCK_START_TIME = 1512896400;
    uint256 public MANAGEMENT_LOCKED_PERIOD = LOCK_START_TIME + 180 days;
    uint256 public OPTION_POOL_PERIOD = LOCK_START_TIME + 365 days;
    mapping (address => uint) public lockedBalances;

    function setTokenBurner(address _tokenBurner) onlyOwner public {
      tokenBurner = TokenBurner(_tokenBurner);
    }

    function setWalletAddresses(address _spectreTeam, address _managementLocked, address _optionPool) onlyOwner public {
      require(!walletAddressesSet);
      require(_spectreTeam != address(0));
      require(_managementLocked != address(0));
      require(_optionPool != address(0));
      spectreTeam = _spectreTeam;
      managementLocked = _managementLocked;
      optionPool = _optionPool;
      walletAddressesSet = true;
      WalletAddressesSet(spectreTeam, managementLocked, optionPool);
    }

    // allows a token holder to burn tokens
    // requires tokenBurner to be set to a valid contract address
    // tokenBurner can take any appropriate action
    function burn(uint256 _amount) public {
      uint curTotalSupply = totalSupply();
      require(curTotalSupply >= _amount);
      uint previousBalanceFrom = balanceOf(msg.sender);
      require(previousBalanceFrom >= _amount);
      updateValueAtNow(totalSupplyHistory, curTotalSupply - _amount);
      updateValueAtNow(balances[msg.sender], previousBalanceFrom - _amount);
      assert(tokenBurner.burn(msg.sender, _amount));
      Transfer(msg.sender, 0, _amount);
    }

    //@notice function to accept incoming token transfers from SPECT
    //@notice _from - address that is transferring tokens
    //@notice _value - amount of tokens being transferred
    //@notice _data - ignored - no data is expected
    function tokenFallback(address _from, uint _value, bytes _data) public {
      require(walletAddressesSet);
      //First we generate tokens for user that is transferring
      generateTokens(_from, _value);
      //Then we generate Spectre team tokens
      generateSpectreTokens(_value);
    }

    function generateSpectreTokens(uint256 _value) internal {
      //Calculate amounts for each Spectre Wallet
      uint256 managementLockedAlloc = SafeMath.div(SafeMath.mul(_value, percent(MANAGEMENT_LOCKED_ALLOC)), percent(100));
      uint256 optionPoolAlloc = SafeMath.div(SafeMath.mul(_value, percent(OPTION_POOL_ALLOC)), percent(100));
      //Account for any rounding errors by using subtraction rather than allocation
      //spectreTeam allocation is for bounty, dev, and advisory allocations
      //quantity should correspond to SPECTRE_BOUNTY_ADVISORY_DEV_TEAM_ALLOC percentage
      uint256 spectreTeamAlloc = SafeMath.sub(_value, SafeMath.add(managementLockedAlloc, optionPoolAlloc));
      //Assert invariant
      assert(SafeMath.add(SafeMath.add(managementLockedAlloc, optionPoolAlloc), spectreTeamAlloc) == _value);
      //Generate team tokens
      generateTokens(spectreTeam, spectreTeamAlloc);
      generateTokens(managementLocked, managementLockedAlloc);
      generateTokens(optionPool, optionPoolAlloc);
      //Lock balances - no locks for spectreTeam
      lockedBalances[managementLocked] = SafeMath.add(managementLockedAlloc, lockedBalances[managementLocked]);
      lockedBalances[optionPool] = SafeMath.add(optionPoolAlloc, lockedBalances[optionPool]);
    }

    // Check token locks before transferring
    function transfer(address _to, uint _value) returns (bool success) {
      require(checkLockedBalance(msg.sender, _value));
      require(super.transfer(_to, _value));
      return true;
    }

    // Override this to enforce locking periods
    function transferFrom(address _from, address _to, uint256 _value) returns (bool success) {
      require(checkLockedBalance(_from, _value));
      require(super.transferFrom(_from, _to, _value));
      return true;
    }

    //Check whether transfer is valid for locked tokens
    function checkLockedBalance(address _holder, uint256 _value) public constant returns (bool success) {
      if ((_holder != managementLocked) && (_holder != optionPool)) {
        return true;
      }
      if ((_holder == managementLocked) && (getNow() > MANAGEMENT_LOCKED_PERIOD)) {
        return true;
      }
      if ((_holder == optionPool) && (getNow() > OPTION_POOL_PERIOD)) {
        return true;
      }
      return (SafeMath.sub(balanceOf(_holder), _value) >= lockedBalances[_holder]);
    }

    function percent(uint256 p) constant internal returns (uint256) {
      return SafeMath.mul(p, 10**16);
    }

    function getNow() internal constant returns (uint256) {
      return now;
    }
}
