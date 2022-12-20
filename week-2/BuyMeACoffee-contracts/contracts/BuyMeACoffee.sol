// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract BuyMeACoffee {
    // Event to emit when a Memo is created.
    event NewMemo(
        address indexed from,
        uint256 timestamp,
        string name,
        string message
    );

    // Memo struct.
    struct Memo {
        address from;
        uint256 timestamp;
        string name;
        string message;
    }

    // List of all memos received from friends.
    Memo[] memos;

    // Address of contract deployer & tip WithdrawalAddress.
    address payable owner;
    address payable withdrawalAddress;

    // Deploy logic.
    constructor() {
        owner = payable(msg.sender);
        withdrawalAddress = payable(msg.sender);
    }

    /**
     * @dev Buy a coffee for the contract owner
     * @param _name name of the coffee buyer
     * @param _message message from the coffee buyer
     */
    function buyCoffee(string memory _name, string memory _message) public payable {
        require(msg.value > 0, "Can't buy coffee with 0 eth");

        // Add the memo to storage
        memos.push(Memo(
            msg.sender,
            block.timestamp,
            _name,
            _message
        ));

        // Emit a log event when a new memo is created!
        emit NewMemo(
            msg.sender,
            block.timestamp, 
            _name,
            _message
        );
    }

    /**
     * @dev Send the entire balance stored in this contract to the owner
     */
    function withdrawTips() public {
        require(withdrawalAddress.send(address(this).balance));
    }

    /**
     * @dev Retrieve all the memos stored on the blockchain
     */
    function getMemos() public view returns(Memo[] memory) {
        return memos;
    }

    /**
     * @dev Change WithdrawalAddress of tips
     */
    function changeWithdrawalAddress(address newWithdrawalAddress) public {
        require(msg.sender == owner, "You are not the owner of this contract");

        withdrawalAddress = payable(newWithdrawalAddress);
    }
}
