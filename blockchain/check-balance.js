// Check wallet balance before deployment
const { ethers } = require('hardhat');
require('dotenv').config();

async function main() {
  console.log('💰 Checking Wallet Balance...\n');
  
  if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === 'your_private_key_here') {
    console.log('❌ ERROR: PRIVATE_KEY not configured in .env');
    console.log('Please add your private key to .env file');
    process.exit(1);
  }
  
  try {
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
    console.log('📍 Wallet Address:', wallet.address);
    console.log('');
    
    // Check Amoy balance
    console.log('🔵 Amoy Testnet:');
    try {
      const amoyProvider = new ethers.JsonRpcProvider(
        process.env.POLYGON_AMOY_RPC || 'https://rpc-amoy.polygon.technology'
      );
      const amoyBalance = await amoyProvider.getBalance(wallet.address);
      const amoyMatic = ethers.formatEther(amoyBalance);
      console.log(`   Balance: ${amoyMatic} POL`);
      
      if (parseFloat(amoyMatic) < 0.1) {
        console.log('   ⚠️  WARNING: Low balance! Get test POL from:');
        console.log('   https://faucet.polygon.technology/');
      } else {
        console.log('   ✅ Sufficient balance for deployment');
      }
    } catch (error) {
      console.log('   ❌ Could not connect to Amoy network');
      console.log('   Error:', error.message);
    }
    
    console.log('');
    
    // Check Polygon mainnet balance
    console.log('🟣 Polygon Mainnet:');
    try {
      const polygonProvider = new ethers.JsonRpcProvider(
        process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com'
      );
      const polygonBalance = await polygonProvider.getBalance(wallet.address);
      const polygonMatic = ethers.formatEther(polygonBalance);
      console.log(`   Balance: ${polygonMatic} MATIC`);
      
      if (parseFloat(polygonMatic) < 0.5) {
        console.log('   ⚠️  WARNING: Low balance for mainnet deployment');
        console.log('   Recommended: At least 1 MATIC for deployment + gas');
      } else {
        console.log('   ✅ Sufficient balance for deployment');
      }
    } catch (error) {
      console.log('   ❌ Could not connect to Polygon network');
      console.log('   Error:', error.message);
    }
    
    console.log('');
    console.log('💡 Estimated Gas Costs:');
    console.log('   Amoy Testnet: ~2-3 POL (free from faucet)');
    console.log('   Polygon Mainnet: ~0.5-1 POL (~$0.50-$1.00)');
    console.log('');
    
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    console.log('');
    console.log('Common issues:');
    console.log('- Invalid private key format (should start with 0x)');
    console.log('- Network connection issues');
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
