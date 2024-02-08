
const hre = require("hardhat");
const fs = require("fs/promises");


async function main() {
  const JointBankAccount = await hre.ethers.getContractFactory("JointBankAccount");
  const jointBankAccount = await JointBankAccount.deploy();

  await jointBankAccount.deployed();
  await writeDeploymentInfo(jointBankAccount);
}

async function writeDeploymentInfo(contract){
  

  const data = {
    contract: {
      address: contract.address,
      signerAddress: contract.signer.address,
      abi: contract.interface.format(),
    },
  };

  const content = JSON.stringify(data, null, 2);
  await fs.writeFile("deployment.json", content, { encoding: "utf-8" });
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
