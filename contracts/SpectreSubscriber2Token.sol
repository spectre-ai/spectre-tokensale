pragma solidity ^0.4.15;

import 'zeppelin-solidity/contracts/token/StandardToken.sol';
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/math/Math.sol";

import './ContractReceiver.sol';
import './MiniMeToken.sol';

/// @title SpecToken - Crowdfunding code for the Spectre.ai Token Sale
contract SpectreSubscriber2Token is StandardToken, Ownable, TokenController {
  using SafeMath for uint;

  string public constant name = "SPECTRE SUBSCRIBER2 TOKEN";
  string public constant symbol = "SXS2";
  uint256 public constant decimals = 18;

  uint256 public constant TOTAL_CAP = 91627765897795994966351100;

  address public specDWallet;
  address public specUWallet;

  uint256 public transferTime = 0;
  uint256 public saleEnd = 1512907200;
  bool public tokenAddressesSet = false;
  uint256 constant D160 = 0x0010000000000000000000000000000000000000000;

  event OwnerTransfer(address indexed _from, address indexed _to, uint256 _value);
  event TransferTimeSet(uint256 _transferTime);

  modifier isTransferable() {
    require(tokenAddressesSet);
    require(getNow() > transferTime);
    _;
  }

  function setTransferTime(uint256 _transferTime) onlyOwner {
    transferTime = _transferTime;
    TransferTimeSet(transferTime);
  }

  function mint(address _to, uint256 _amount) onlyOwner {
    require(totalSupply.add(_amount) <= TOTAL_CAP);
    balances[_to] = balances[_to].add(_amount);
    totalSupply = totalSupply.add(_amount);
    Transfer(0, _to, _amount);
  }

  function burn(address _to, uint256 _amount) onlyOwner {
    balances[_to] = balances[_to].sub(_amount);
    totalSupply = totalSupply.sub(_amount);
    Transfer(_to, 0, _amount);
  }

  //@notice Function to configure contract addresses
  //@param `_specUWallet` - address of Utility contract
  //@param `_specDWallet` - address of Dividend contract
  function setTokenAddresses(address _specUWallet, address _specDWallet) onlyOwner public {
    require(!tokenAddressesSet);
    require(_specDWallet != address(0));
    require(_specUWallet != address(0));
    require(isContract(_specDWallet));
    require(isContract(_specUWallet));
    specUWallet = _specUWallet;
    specDWallet = _specDWallet;
    tokenAddressesSet = true;
  }

  function withdrawEther() public onlyOwner {
    //In case ether is sent, even though not refundable
    msg.sender.transfer(this.balance);
  }

  //@notice Standard function transfer similar to ERC20 transfer with no _data .
  //@notice Added due to backwards compatibility reasons .
  function transfer(address _to, uint256 _value) isTransferable returns (bool success) {
    //standard function transfer similar to ERC20 transfer with no _data
    //added due to backwards compatibility reasons
    require(_to == specDWallet || _to == specUWallet);
    require(isContract(_to));
    bytes memory empty;
    return transferToContract(msg.sender, _to, _value, empty);
  }

  //@notice assemble the given address bytecode. If bytecode exists then the _addr is a contract.
  function isContract(address _addr) private returns (bool is_contract) {
    uint256 length;
    assembly {
      //retrieve the size of the code on target address, this needs assembly
      length := extcodesize(_addr)
    }
    return (length>0);
  }

  //@notice function that is called when transaction target is a contract
  function transferToContract(address _from, address _to, uint256 _value, bytes _data) internal returns (bool success) {
    require(balanceOf(_from) >= _value);
    balances[_from] = balanceOf(_from).sub(_value);
    balances[_to] = balanceOf(_to).add(_value);
    ContractReceiver receiver = ContractReceiver(_to);
    receiver.tokenFallback(_from, _value, _data);
    Transfer(_from, _to, _value);
    return true;
  }

  /**
   * @dev Transfer tokens from one address to another - needed for owner transfers
   * @param _from address The address which you want to send tokens from
   * @param _to address The address which you want to transfer to
   * @param _value uint256 the amount of tokens to be transferred
   */
  function transferFrom(address _from, address _to, uint256 _value) public isTransferable returns (bool) {
    require(_to == specDWallet || _to == specUWallet);
    require(isContract(_to));
    //owner can transfer tokens on behalf of users after 28 days
    if (msg.sender == owner && getNow() > saleEnd + 30 days) {
      OwnerTransfer(_from, _to, _value);
    } else {
      uint256 _allowance = allowed[_from][msg.sender];
      allowed[_from][msg.sender] = _allowance.sub(_value);
    }

    //Now make the transfer
    bytes memory empty;
    return transferToContract(_from, _to, _value, empty);

  }

  // data is an array of uint256s. Each uint256 represents a address and amount.
  // The 160 LSB is the address that wants to be added
  // The 96 MSB is the amount of to be minted for that address
  function multiMint(uint256[] data) public onlyOwner {
    for (uint256 i = 0; i < data.length; i++) {
      address addr = address(data[i] & (D160 - 1));
      uint256 amount = data[i] / D160;
      mint(addr, amount);
    }
  }

  // data is an array of uint256s. Each uint256 represents a address and amount.
  // The 160 LSB is the address that wants to be added
  // The 96 MSB is the amount of to be minted for that address
  function multiBurn(uint256[] data) public onlyOwner {
    for (uint256 i = 0; i < data.length; i++) {
      address addr = address(data[i] & (D160 - 1));
      uint256 amount = data[i] / D160;
      burn(addr, amount);
    }
  }

  /////////////////
  // TokenController interface
  /////////////////

  /// @notice `proxyPayment()` returns false, meaning ether is not accepted at
  ///  the token address, only the address of FiinuCrowdSale
  /// @param _owner The address that will hold the newly created tokens

  function proxyPayment(address _owner) payable returns(bool) {
      return false;
  }

  /// @notice Notifies the controller about a transfer, for this Campaign all
  ///  transfers are allowed by default and no extra notifications are needed
  /// @param _from The origin of the transfer
  /// @param _to The destination of the transfer
  /// @param _amount The amount of the transfer
  /// @return False if the controller does not authorize the transfer
  function onTransfer(address _from, address _to, uint _amount) returns(bool) {
      return true;
  }

  /// @notice Notifies the controller about an approval, for this Campaign all
  ///  approvals are allowed by default and no extra notifications are needed
  /// @param _owner The address that calls `approve()`
  /// @param _spender The spender in the `approve()` call
  /// @param _amount The amount in the `approve()` call
  /// @return False if the controller does not authorize the approval
  function onApprove(address _owner, address _spender, uint _amount)
      returns(bool)
  {
      return true;
  }

  function getNow() constant internal returns (uint256) {
    return now;
  }

}
