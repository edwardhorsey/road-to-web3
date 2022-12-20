import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

const GOERLI_URL = process.env.GOERLI_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!GOERLI_URL || !PRIVATE_KEY) {
    throw new Error("Please set environment variables");
}

const config: HardhatUserConfig = {
    solidity: "0.8.17",
    networks: {
        goerli: {
            url: GOERLI_URL,
            accounts: [PRIVATE_KEY],
        },
    },
};

export default config;
