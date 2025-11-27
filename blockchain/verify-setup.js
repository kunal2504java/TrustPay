// Verify blockchain deployment setup
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying TrustPay Blockchain Setup...\n');

let hasErrors = false;
let hasWarnings = false;

// Check 1: .env file exists
console.log('1. Checking .env file...');
if (fs.existsSync('.env')) {
  console.log('   ✅ .env file found');
  
  // Read and validate .env contents
  const envContent = fs.readFileSync('.env', 'utf8');
  
  if (envContent.includes('your_private_key_here') || !envContent.includes('PRIVATE_KEY=0x')) {
    console.log('   ⚠️  WARNING: PRIVATE_KEY not configured properly');
    hasWarnings = true;
  } else {
    console.log('   ✅ PRIVATE_KEY configured');
  }
  
  if (envContent.includes('your_polygonscan_api_key_here')) {
    console.log('   ⚠️  WARNING: POLYGONSCAN_API_KEY not configured (optional)');
    hasWarnings = true;
  } else {
    console.log('   ✅ POLYGONSCAN_API_KEY configured');
  }
} else {
  console.log('   ❌ ERROR: .env file not found');
  console.log('   Run: cp .env.example .env');
  hasErrors = true;
}

// Check 2: node_modules exists
console.log('\n2. Checking dependencies...');
if (fs.existsSync('node_modules')) {
  console.log('   ✅ Dependencies installed');
} else {
  console.log('   ❌ ERROR: Dependencies not installed');
  console.log('   Run: npm install');
  hasErrors = true;
}

// Check 3: Contract file exists
console.log('\n3. Checking contract file...');
if (fs.existsSync('contracts/TrustPayEscrow.sol')) {
  console.log('   ✅ TrustPayEscrow.sol found');
} else {
  console.log('   ❌ ERROR: Contract file not found');
  hasErrors = true;
}

// Check 4: Hardhat config
console.log('\n4. Checking Hardhat configuration...');
if (fs.existsSync('hardhat.config.js')) {
  console.log('   ✅ hardhat.config.js found');
} else {
  console.log('   ❌ ERROR: hardhat.config.js not found');
  hasErrors = true;
}

// Check 5: Deployment script
console.log('\n5. Checking deployment script...');
if (fs.existsSync('scripts/deploy.js')) {
  console.log('   ✅ deploy.js found');
} else {
  console.log('   ❌ ERROR: deploy.js not found');
  hasErrors = true;
}

// Check 6: Deployments directory
console.log('\n6. Checking deployments directory...');
if (!fs.existsSync('deployments')) {
  fs.mkdirSync('deployments');
  console.log('   ✅ Created deployments directory');
} else {
  console.log('   ✅ Deployments directory exists');
  
  // Check for existing deployments
  const deployments = fs.readdirSync('deployments').filter(f => f.endsWith('.json'));
  if (deployments.length > 0) {
    console.log('   📋 Found existing deployments:');
    deployments.forEach(d => {
      const deployment = JSON.parse(fs.readFileSync(path.join('deployments', d), 'utf8'));
      console.log(`      - ${d}: ${deployment.contractAddress}`);
    });
  }
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ Setup verification FAILED');
  console.log('Please fix the errors above before deploying.');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  Setup verification completed with WARNINGS');
  console.log('You can proceed, but consider fixing warnings.');
  console.log('\n📋 Next steps:');
  console.log('1. Update .env with your PRIVATE_KEY');
  console.log('2. Get test MATIC from https://faucet.polygon.technology/');
  console.log('3. Run: npm run deploy:mumbai');
} else {
  console.log('✅ Setup verification PASSED');
  console.log('\n📋 Ready to deploy!');
  console.log('Run: npm run deploy:mumbai');
}
console.log('='.repeat(50) + '\n');
