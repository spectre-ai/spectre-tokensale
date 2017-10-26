pragma solidity ^0.4.15;

import 'zeppelin-solidity/contracts/lifecycle/Pausable.sol';
import 'zeppelin-solidity/contracts/token/StandardToken.sol';
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/math/Math.sol";

import './ContractReceiver.sol';
import './MiniMeToken.sol';

/// @title SpecToken - Crowdfunding code for the Spectre.ai Token Sale
/// @author Parthasarathy Ramanujam
contract SpectreSubscriberToken is StandardToken, Pausable, TokenController {
  using SafeMath for uint;

  string public constant name = "SPECTRE SUBSCRIBER TOKEN";
  string public constant symbol = "SPECT";
  uint256 public constant decimals = 18;

  uint256 constant public TOKENS_AVAILABLE             = 240000000 * 10**decimals;
  uint256 constant public BONUS_SLAB                   = 100000000 * 10**decimals;
  uint256 constant public MIN_CAP                      = 5000000 * 10**decimals;
  uint256 constant public MIN_FUND_AMOUNT              = 1 ether;
  uint256 constant public TOKEN_PRICE                  = 0.0005 ether;
  uint256 constant public WHITELIST_PERIOD             = 2 hours;

  address public specWallet;
  address public specDWallet;
  address public specUWallet;

  bool public refundable = false;
  bool public configured = false;
  bool public tokenAddressesSet = false;
  //presale start and end blocks
  uint256 public presaleStart;
  uint256 public presaleEnd;
  //main sale start and end blocks
  uint256 public saleStart;
  uint256 public saleEnd;
  //discount end block for main sale
  uint256 public discountSaleEnd;

  //whitelisting
  mapping(address => uint256) public whitelist;
  uint256 constant D160 = 0x0010000000000000000000000000000000000000000;

  //bonus earned
  mapping(address => uint256) public bonus;

  event Refund(address indexed _to, uint256 _value);
  event ContractFunded(address indexed _from, uint256 _value, uint256 _total);
  event Refundable();
  event WhiteListSet(address indexed _subscriber, uint256 _value);
  event OwnerTransfer(address indexed _from, address indexed _to, uint256 _value);

  modifier isRefundable() {
    require(refundable);
    _;
  }

  modifier isNotRefundable() {
    require(!refundable);
    _;
  }

  modifier isTransferable() {
    require(tokenAddressesSet);
    require(getNow() > saleEnd);
    require(totalSupply >= MIN_CAP);
    _;
  }

  modifier onlyWalletOrOwner() {
    require(msg.sender == owner || msg.sender == specWallet);
    _;
  }

  //@notice function to initilaize the token contract
  //@notice _specWallet - The wallet that receives the proceeds from the token sale
  //@notice _specDWallet - Wallet that would receive tokens chosen for dividend
  //@notice _specUWallet - Wallet that would receive tokens chosen for utility
  function SpectreSubscriberToken(address _specWallet) {
    require(_specWallet != address(0));
    specWallet = _specWallet;
    pause();
  }

  //@notice Fallback function that accepts the ether and allocates tokens to
  //the msg.sender corresponding to msg.value
  function() payable whenNotPaused public {
    require(msg.value >= MIN_FUND_AMOUNT);
    if(getNow() >= presaleStart && getNow() <= presaleEnd) {
      purchasePresale();
    } else if (getNow() >= saleStart && getNow() <= saleEnd) {
      purchase();
    } else {
      revert();
    }
  }

  //@notice function to be used for presale purchase
  function purchasePresale() internal {
    //Only check whitelist for the first 3 days of presale
    if (getNow() < (presaleStart + WHITELIST_PERIOD)) {
      require(whitelist[msg.sender] > 0);
      //Accept if the subsciber 95% to 120% of whitelisted amount
      uint256 minAllowed = whitelist[msg.sender].mul(95).div(100);
      uint256 maxAllowed = whitelist[msg.sender].mul(120).div(100);
      require(msg.value >= minAllowed && msg.value <= maxAllowed);
      //remove the address from whitelist
      whitelist[msg.sender] = 0;
    }

    uint256 numTokens = msg.value.mul(10**decimals).div(TOKEN_PRICE);
    uint256 bonusTokens = 0;

    if(totalSupply < BONUS_SLAB) {
      //Any portion of tokens less than BONUS_SLAB are eligable for 33% bonus, otherwise 22% bonus
      uint256 remainingBonusSlabTokens = SafeMath.sub(BONUS_SLAB, totalSupply);
      uint256 bonusSlabTokens = Math.min256(remainingBonusSlabTokens, numTokens);
      uint256 nonBonusSlabTokens = SafeMath.sub(numTokens, bonusSlabTokens);
      bonusTokens = bonusSlabTokens.mul(33).div(100);
      bonusTokens = bonusTokens.add(nonBonusSlabTokens.mul(22).div(100));
    } else {
      //calculate 22% bonus for tokens purchased on presale
      bonusTokens = numTokens.mul(22).div(100);
    }
    //
    numTokens = numTokens.add(bonusTokens);
    bonus[msg.sender] = bonus[msg.sender].add(bonusTokens);

    //transfer money to Spectre MultisigWallet (could be msg.value)
    specWallet.transfer(msg.value);

    totalSupply = totalSupply.add(numTokens);
    require(totalSupply <= TOKENS_AVAILABLE);

    balances[msg.sender] = balances[msg.sender].add(numTokens);
    //fire the event notifying the transfer of tokens
    Transfer(0, msg.sender, numTokens);

  }

  //@notice function to be used for mainsale purchase
  function purchase() internal {

    uint256 numTokens = msg.value.mul(10**decimals).div(TOKEN_PRICE);
    uint256 bonusTokens = 0;

    if(getNow() <= discountSaleEnd) {
      //calculate 11% bonus for tokens purchased on discount period
      bonusTokens = numTokens.mul(11).div(100);
    }

    numTokens = numTokens.add(bonusTokens);
    bonus[msg.sender] = bonus[msg.sender].add(bonusTokens);

    //transfer money to Spectre MultisigWallet
    specWallet.transfer(msg.value);

    totalSupply = totalSupply.add(numTokens);

    require(totalSupply <= TOKENS_AVAILABLE);
    balances[msg.sender] = balances[msg.sender].add(numTokens);
    //fire the event notifying the transfer of tokens
    Transfer(0, msg.sender, numTokens);
  }

  //@notice Function reports the number of tokens available for sale
  function numberOfTokensLeft() constant returns (uint256) {
    return TOKENS_AVAILABLE.sub(totalSupply);
  }

  //Override unpause function to only allow once configured
  function unpause() onlyOwner whenPaused public {
    require(configured);
    paused = false;
    Unpause();
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
    if (configured) {
      unpause();
    }
  }

  //@notice Function to configure contract parameters
  //@param `_startPresaleBlock` - block from when presale begins.
  //@param `_endPresaleBlock` - block from when presale ends.
  //@param `_saleStart` - block from when main sale begins.
  //@param `_saleEnd` - block from when main sale ends.
  //@param `_discountEnd` - block from when the discounts would end.
  //@notice Can be called only when funding is not active and only by the owner
  function configure(uint256 _presaleStart, uint256 _presaleEnd, uint256 _saleStart, uint256 _saleEnd, uint256 _discountSaleEnd) onlyOwner public {
    require(!configured);
    require(_presaleStart > getNow());
    require(_presaleEnd > _presaleStart);
    require(_saleStart > _presaleEnd);
    require(_saleEnd > _saleStart);
    require(_discountSaleEnd > _saleStart && _discountSaleEnd <= _saleEnd);
    presaleStart = _presaleStart;
    presaleEnd = _presaleEnd;
    saleStart = _saleStart;
    saleEnd = _saleEnd;
    discountSaleEnd = _discountSaleEnd;
    configured = true;
    if (tokenAddressesSet) {
      unpause();
    }
  }

  //@notice Function that can be called by purchasers to refund
  //@notice Used only in case the ICO isn't successful.
  function refund() isRefundable public {
    require(balances[msg.sender] > 0);

    uint256 tokenValue = balances[msg.sender].sub(bonus[msg.sender]);
    balances[msg.sender] = 0;
    tokenValue = tokenValue.mul(TOKEN_PRICE).div(10**decimals);

    //transfer to the requesters wallet
    msg.sender.transfer(tokenValue);
    Refund(msg.sender, tokenValue);
  }

  function withdrawEther() public isNotRefundable onlyOwner {
    //In case ether is sent, even though not refundable
    msg.sender.transfer(this.balance);
  }

  //@notice Function used for funding in case of refund.
  //@notice Can be called only by the Owner or Wallet
  function fundContract() public payable onlyWalletOrOwner {
    //does nothing just accepts and stores the ether
    ContractFunded(msg.sender, msg.value, this.balance);
  }

  function setRefundable() onlyOwner {
    require(this.balance > 0);
    require(getNow() > saleEnd);
    require(totalSupply < MIN_CAP);
    Refundable();
    refundable = true;
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
    if (msg.sender == owner && getNow() > saleEnd + 1 hours) {
      OwnerTransfer(_from, _to, _value);
    } else {
      uint256 _allowance = allowed[_from][msg.sender];
      allowed[_from][msg.sender] = _allowance.sub(_value);
    }

    //Now make the transfer
    bytes memory empty;
    return transferToContract(_from, _to, _value, empty);

  }

  //@notice function that is used for whitelisting an address
  function setWhiteList(address _subscriber, uint256 _amount) public onlyOwner {
    require(_subscriber != address(0));
    require(_amount != 0);
    whitelist[_subscriber] = _amount;
    WhiteListSet(_subscriber, _amount);
  }

  // data is an array of uint256s. Each uint256 represents a address and amount.
  // The 160 LSB is the address that wants to be added
  // The 96 MSB is the amount of to be set for the whitelist for that address
  function multiSetWhiteList(uint256[] data) public onlyOwner {
    for (uint256 i = 0; i < data.length; i++) {
      address addr = address(data[i] & (D160 - 1));
      uint256 amount = data[i] / D160;
      setWhiteList(addr, amount);
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
