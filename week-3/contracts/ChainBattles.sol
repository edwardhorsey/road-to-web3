// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract ChainBattles is ERC721URIStorage {
    using Strings for uint256;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct Player {
        uint level;
        string class; // Warrior, Mage or Priest
        uint hp;
        uint mana;
        uint strength;
        uint intellect;
    }

    uint256 private helperCounter = 0;
    mapping(uint256 => string) private classes;
    mapping(uint256 => Player) public tokenIdToPlayers;

    constructor() ERC721("ChainBattles", "CBC") {
        classes[0] = "Warrior";
        classes[1] = "Mage";
        classes[2] = "Priest";
    }

    function randomNumber(uint256 modulus) private returns (uint) {
        helperCounter += 1;

        return
            uint(keccak256(abi.encodePacked(helperCounter, block.timestamp, block.difficulty, msg.sender))) % modulus;
    }

    function generateRandomPlayer() private returns (Player memory) {
        return
            Player(
                0,
                classes[randomNumber(3)],
                100 + randomNumber(20),
                100 + randomNumber(20),
                randomNumber(100),
                randomNumber(100)
            );
    }

    function generateCharacter(uint256 tokenId) public view returns (string memory) {
        Player memory player = getPlayer(tokenId);

        bytes memory svg = abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350">',
            "<style>.base { fill: white; font-family: serif; font-size: 14px; }</style>",
            '<rect width="100%" height="100%" fill="black" />',
            '<text x="50%" y="25%" class="base" dominant-baseline="middle" text-anchor="middle">',
            player.class,
            "</text>",
            '<text x="50%" y="35%" class="base" dominant-baseline="middle" text-anchor="middle">',
            "Level: ",
            player.level.toString(),
            "</text>",
            '<text x="50%" y="45%" class="base" dominant-baseline="middle" text-anchor="middle">',
            "HP: ",
            player.hp.toString(),
            "</text>",
            '<text x="50%" y="55%" class="base" dominant-baseline="middle" text-anchor="middle">',
            "Mana: ",
            player.mana.toString(),
            "</text>",
            '<text x="50%" y="65%" class="base" dominant-baseline="middle" text-anchor="middle">',
            "Strength: ",
            player.strength.toString(),
            "</text>",
            '<text x="50%" y="75%" class="base" dominant-baseline="middle" text-anchor="middle">',
            "Intellect: ",
            player.intellect.toString(),
            "</text>",
            "</svg>"
        );

        return string(abi.encodePacked("data:image/svg+xml;base64,", Base64.encode(svg)));
    }

    function getPlayer(uint256 tokenId) public view returns (Player memory) {
        return tokenIdToPlayers[tokenId];
    }

    function getTokenURI(uint256 tokenId) public view returns (string memory) {
        bytes memory dataURI = abi.encodePacked(
            "{",
            '"name": "Chain Battles #',
            tokenId.toString(),
            '",',
            '"description": "Battles on chain",',
            '"image": "',
            generateCharacter(tokenId),
            '"',
            "}"
        );

        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(dataURI)));
    }

    function mint() public {
        _tokenIds.increment(); // Counters.Counter starts at 0 & we want to start at 1
        uint256 newItemId = _tokenIds.current();
        _safeMint(msg.sender, newItemId);
        tokenIdToPlayers[newItemId] = generateRandomPlayer();
        _setTokenURI(newItemId, getTokenURI(newItemId));
    }

    function train(uint256 tokenId) public {
        require(_exists(tokenId), "Please use an existing tokenId");
        require(ownerOf(tokenId) == msg.sender, "You must own this token to train it");
        uint256 currentLevel = tokenIdToPlayers[tokenId].level;

        tokenIdToPlayers[tokenId].level = currentLevel + 1;
        tokenIdToPlayers[tokenId].hp = tokenIdToPlayers[tokenId].hp + (randomNumber(20) + currentLevel * 2);
        tokenIdToPlayers[tokenId].mana = tokenIdToPlayers[tokenId].mana + (randomNumber(20) + currentLevel * 2);
        tokenIdToPlayers[tokenId].strength = tokenIdToPlayers[tokenId].strength + (randomNumber(20) + currentLevel * 2);
        tokenIdToPlayers[tokenId].intellect =
            tokenIdToPlayers[tokenId].intellect +
            (randomNumber(20) + currentLevel * 2);

        _setTokenURI(tokenId, getTokenURI(tokenId));
    }
}
