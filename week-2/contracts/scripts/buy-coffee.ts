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
        const amount = ethers.utils.formatEther(memo.amount);

        console.log(`At ${timestamp}, ${tipper} ${tipperAddress} said: "${message}" and sent ${amount} ETH`);
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
    const addresses = [owner.address, buyMeACoffee.address, tipper.address, tipper2.address, tipper3.address];
    console.log("== start ==");
    await printBalances(addresses);

    // Buy the owner a few coffees.
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
    console.log("== read memos ==");
    const memos = (await buyMeACoffee.getMemos()) as unknown as Memo[];
    printMemos(memos);

    // Owner changes
    console.log("== try to change withdrawal address not as owner - should fail ==");

    try {
        await buyMeACoffee.connect(tipper2).changeWithdrawAddress(tipper.address);
    } catch (error) {
        console.log(error instanceof Error ? error.message : error);
    }

    console.log("== change withdrawal address as owner ==");
    await buyMeACoffee.connect(owner).changeWithdrawAddress(tipper.address);

    console.log("== buy some more coffees and withdraw tips to new owner ==");
    const largerTip = { value: ethers.utils.parseEther("3.0") };
    await buyMeACoffee.connect(tipper2).buyCoffee("Vitto", "Here's another larger coffee", largerTip);
    await buyMeACoffee.connect(tipper3).buyCoffee("Kay", "Here's another larger coffee", largerTip);
    printMemos((await buyMeACoffee.getMemos()) as unknown as Memo[]);

    await buyMeACoffee.connect(tipper).withdrawTips();
    await printBalances(addresses);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
