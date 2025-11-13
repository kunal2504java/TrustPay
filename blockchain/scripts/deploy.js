const hre = require("hardhat");

async function main() {
  console.log("Deploying TrustPayEscrow contract...");

  // Get the contract factory
  const TrustPayEscrow = await hre.ethers.getContractFactory("TrustPayEscrow");
  
  // Deploy the contract
  const escrow = await TrustPayEscrow.deploy();
  
  await escrow.waitForDeployment();
  
  const address = await escrow.getAddress();
  
  console.log("✅ TrustPayEscrow deployed to:", address);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", (await hre.ethers.getSigners())[0].address);
  
  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: address,
    deployer: (await hre.ethers.getSigners())[0].address,
    deployedAt: new Date().toISOString(),
    chainId: hre.network.config.chainId
  };
  
  fs.writeFileSync(
    `./deployments/${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n📝 Deployment info saved to deployments/" + hre.network.name + ".json");
  
  // Wait for block confirmations before verifying
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n⏳ Waiting for block confirmations...");
    await escrow.deploymentTransaction().wait(6);
    
    console.log("\n🔍 Verifying contract on Polygonscan...");
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
      console.log("✅ Contract verified!");
    } catch (error) {
      console.log("❌ Verification failed:", error.message);
    }
  }
  
  console.log("\n🎉 Deployment complete!");
  console.log("\n📋 Next steps:");
  console.log("1. Update backend/.env with:");
  console.log(`   CONTRACT_ADDRESS=${address}`);
  console.log("2. Test the contract with: npx hardhat test");
  console.log("3. View on explorer: https://mumbai.polygonscan.com/address/" + address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
