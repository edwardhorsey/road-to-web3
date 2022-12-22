import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const TESTNET_RPC = process.env.TESTNET_RPC;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY;

if (!TESTNET_RPC || !PRIVATE_KEY || !POLYGONSCAN_API_KEY) {
    throw new Error("Set environment variables");
}

const config: HardhatUserConfig = {
    solidity: "0.8.17",
    networks: {
        mumbai: {
            url: TESTNET_RPC,
            accounts: [PRIVATE_KEY],
        },
    },
    etherscan: {
        apiKey: POLYGONSCAN_API_KEY,
    },
};

export default config;
