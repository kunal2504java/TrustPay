# TrustPay Smart Contracts

Solidity smart contracts for TrustPay escrow platform.

## ⚠️ IMPORTANT: Network Update

**Mumbai testnet is deprecated!** Use **Amoy testnet** instead.
- See [NETWORK_MIGRATION_NOTICE.md](../NETWORK_MIGRATION_NOTICE.md) for details
- Use `npm run deploy:amoy` (not `deploy:mumbai`)
- Get test POL from https://faucet.polygon.technology/ (select Amoy)

## 🚀 Quick Deployment

### Windows Users
```bash
# From project root
deploy-contract.bat
```

### Manual Deployment
```bash
# 1. Install dependencies
npm install

# 2. Verify setup
npm run verify-setup

# 3. Check wallet balance
npm run check-balance

# 4. Compile contracts
npm run compile

# 5. Deploy to Mumbai testnet
npm run deploy:mumbai
```

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `npm run verify-setup` | Verify deployment configuration |
| `npm run check-balance` | Check wallet MATIC balance |
| `npm run compile` | Compile smart contracts |
| `npm test` | Run contract tests |
| `npm run deploy:mumbai` | Deploy to Mumbai testnet |
| `npm run deploy:polygon` | Deploy to Polygon mainnet |
| `npm run verify:mumbai` | Verify contract on Mumbai |

## 🔧 Setup

1. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

2. **Add your private key to `.env`:**
   ```env
   PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
   ```

3. **Get test MATIC:**
   - Visit: https://faucet.polygon.technology/
   - Select "Mumbai" network
   - Request tokens

4. **Deploy:**
   ```bash
   npm run deploy:mumbai
   ```

## 📁 Contract Address

After deployment, the contract address will be saved in:
- `deployments/mumbai.json` (testnet)
- `deployments/polygon.json` (mainnet)

Update `backend/.env` with the deployed contract address:
```env
CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
```

## 📚 Documentation

- **Quick Reference:** [DEPLOYMENT_QUICK_REFERENCE.md](../DEPLOYMENT_QUICK_REFERENCE.md)
- **Complete Guide:** [SMART_CONTRACT_DEPLOYMENT.md](../SMART_CONTRACT_DEPLOYMENT.md)
- **Integration Guide:** [BLOCKCHAIN_INTEGRATION.md](../BLOCKCHAIN_INTEGRATION.md)

## 🔗 Useful Links

- Mumbai Faucet: https://faucet.polygon.technology/
- Mumbai Explorer: https://mumbai.polygonscan.com/
- Polygon Explorer: https://polygonscan.com/
- Get API Key: https://polygonscan.com/apis

## 🆘 Troubleshooting

**"insufficient funds"**
- Get test MATIC from faucet (testnet)
- Buy MATIC on exchange (mainnet)

**"nonce too low"**
```bash
rm -rf cache artifacts
npm run compile
```

**"network timeout"**
- Try different RPC URL in `hardhat.config.js`
- Check network status: https://status.polygon.technology/

## 🔐 Security

- ⚠️ **NEVER** commit your `.env` file
- ⚠️ **NEVER** share your private key
- ✅ Test on Mumbai before mainnet
- ✅ Use a dedicated deployment wallet

---

**Need help?** See [SMART_CONTRACT_DEPLOYMENT.md](../SMART_CONTRACT_DEPLOYMENT.md) for detailed instructions.
