// deploy.ts

import { network } from "hardhat";

const { ethers } = await network.connect();

const Voting = await ethers.getContractFactory("Voting");

const voting = await Voting.deploy();

await voting.waitForDeployment();

console.log("Voting contract deployed to:", await voting.getAddress());