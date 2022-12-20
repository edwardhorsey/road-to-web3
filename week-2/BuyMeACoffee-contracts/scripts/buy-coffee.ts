import { ethers } from "hardhat";
import { Memo } from "../types";

// Returns the Ether balance of a given address.
async function getBalance(address: string) {
    const balanceBigInt = await ethers.provider.getBalance(address);
    return ethers.utils.formatEther(balanceBigInt);
}

// Logs the Ether balances for a list of addresses.
async function printBalances(addresses: string[]) {
    let idx = 0;

    for (const address of addresses) {
        console.log(`Address ${idx} balance: `, await getBalance(address));

        idx += 1;
    }
}

// Logs the memos stored on-chain from coffee purchases.
async function printMemos(memos: Memo[]) {
    for (const memo of memos) {
        const timestamp = memo.timestamp;
        const tipper = memo.name;
        const tipperAddress = memo.from;
        const message = memo.message;

        console.log(`At ${timestamp}, ${tipper} ${tipperAddress} said: "${message}"`);
    }
}

async function main() {
    // Get example accounts.
    const [owner, tipper, tipper2, tipper3] = await ethers.getSigners();

    // Get the contract to deploy & deploy.
    const BuyMeACoffee = await ethers.getContractFactory("BuyMeACoffee");
    const buyMeACoffee = await BuyMeACoffee.deploy();
    await buyMeACoffee.deployed();
    console.log("BuyMeACoffee deployed to ", buyMeACoffee.address);

    // Check balances before the coffee purchase.
    const addresses = [owner.address, tipper.address, buyMeACoffee.address];
    console.log("== start ==");
    await printBalances(addresses);

    // Buy the owner a few coffess.
    const tip = { value: ethers.utils.parseEther("1.0") };
    await buyMeACoffee.connect(tipper).buyCoffee("Carolina", "You're the best!", tip);
    await buyMeACoffee.connect(tipper2).buyCoffee("Vitto", "Amazing teacher :)", tip);
    await buyMeACoffee.connect(tipper3).buyCoffee("Kay", "I love my Proof of Knowledge NFT", tip);

    // Check balances after coffee purchase.
    console.log("== bought coffee ==");
    await printBalances(addresses);

    // Withdraw funds.
    await buyMeACoffee.connect(owner).withdrawTips();

    // Check balance after withdraw.
    console.log("== after withdraw tips ==");
    await printBalances(addresses);

    // Read all the memos left for the owner.
    console.log("== after withdraw tips ==");
    const memos = (await buyMeACoffee.getMemos()) as unknown as Memo[];
    printMemos(memos);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
