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
    console.log("SVG here: ", tokenMetadata.image);
    tokenMetadata.image = readBase64EncodedString(tokenMetadata.image);

    console.log(tokenMetadata);
}

async function main() {
    try {
        const nftContractFactory = await ethers.getContractFactory("ChainBattles");
        const nftContract = await nftContractFactory.deploy();
        await nftContract.deployed();
        console.log("Contract deployed to:", nftContract.address);

        console.log("\n-- Mint contract --");
        const [owner] = await ethers.getSigners();
        await nftContract.connect(owner).mint();
        printTokenMetadata(await nftContract.getTokenURI(1));

        for (let i = 0; i < 3; i += 1) {
            console.log(`\n-- Train contract ${i} --`);
            await nftContract.train(1);
            printTokenMetadata(await nftContract.getTokenURI(1));
        }

        process.exit(0);
    } catch (error) {
        console.log(error);

        process.exit(1);
    }
}

main();
