import { ethers } from "hardhat";

function readBase64EncodedString(data: string) {
    const base64 = data.split(",")[1];
    const decoded = Buffer.from(base64, "base64").toString();
    return decoded;
}

function readBase64EncodedJSONObject(data: string) {
    const decoded = readBase64EncodedString(data);
    return JSON.parse(decoded);
}

function printTokenMetadata(data: string) {
    const tokenMetadata = readBase64EncodedJSONObject(data);
    tokenMetadata.image = readBase64EncodedString(tokenMetadata.image);

    console.log(tokenMetadata);
}

async function main() {
    try {
        const nftContractFactory = await ethers.getContractFactory("ChainBattles");
        const nftContract = await nftContractFactory.deploy();
        await nftContract.deployed();
        console.log("Contract deployed to:", nftContract.address);

        console.log("-- Mint contract --");
        const [owner] = await ethers.getSigners();
        await nftContract.connect(owner).mint();

        printTokenMetadata(await nftContract.getTokenURI(1));

        console.log("-- Train contract --");
        await nftContract.train(1);

        printTokenMetadata(await nftContract.getTokenURI(1));

        process.exit(0);
    } catch (error) {
        console.log(error);

        process.exit(1);
    }
}

main();
