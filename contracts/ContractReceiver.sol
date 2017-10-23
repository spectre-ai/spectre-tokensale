pragma solidity ^0.4.15;

 /*
 * Contract that is working with ERC223 tokens
 * This is an implementation of ContractReceiver provided here:
 * https://github.com/Dexaran/ERC223-token-standard/blob/Recommended/Receiver_Interface.sol
 */

 contract ContractReceiver {

    function tokenFallback(address _from, uint _value, bytes _data);

}
