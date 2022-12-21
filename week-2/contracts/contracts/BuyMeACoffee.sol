// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract BuyMeACoffee {
    // Event to emit when a Memo is created.
    event NewMemo(
        address indexed from,
        uint256 timestamp,
        string name,
        string message,
        uint amount
    );

    // Memo struct.
    struct Memo {
        address from;
        uint256 timestamp;
        string name;
        string message;
        uint amount;
    }

    // List of all memos received from friends.
    Memo[] memos;

    // Address of contract deployer & tip WithdrawAddress.
    address payable owner;
    address payable withdrawAddress;

    // Deploy logic.
    constructor() {
        owner = payable(msg.sender);
        withdrawAddress = owner;
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
            _message,
            msg.value
        ));

        // Emit a log event when a new memo is created!
        emit NewMemo(
            msg.sender,
            block.timestamp, 
            _name,
            _message,
            msg.value
        );
    }

    /**
     * @dev Send the entire balance stored in this contract to the owner
     */
    function withdrawTips() public {
        require(withdrawAddress.send(address(this).balance));
    }

    /**
     * @dev Retrieve all the memos stored on the blockchain
     */
    function getMemos() public view returns(Memo[] memory) {
        return memos;
    }

    /**
     * @dev Change withdraw address of tips
     * @param _newAddress new withdrawal address
     */
    function changeWithdrawAddress(address _newAddress) public {
        require(msg.sender == owner, "You are not the owner of this contract");

        withdrawAddress = payable(_newAddress);
    }
}
