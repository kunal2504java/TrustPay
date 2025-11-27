# 🚀 Blockchain Deployment Guide

## Quick Start

### Deploy to Amoy Testnet:

```bash
cd blockchain
npm install
npm run deploy:amoy
```

## Prerequisites

1. **Get Test POL Tokens:**
   - Visit: https://faucet.polygon.technology/
   - Select "Amoy" network
   - Request tokens

2. **Configure Environment:**
   ```bash
   cd blockchain
   cp .env.example .env
   # Edit .env and add your PRIVATE_KEY
   ```

## Network Information

- **Network:** Polygon Amoy Testnet
- **Chain ID:** 80002
- **Currency:** POL
- **RPC:** https://rpc-amoy.polygon.technology
- **Explorer:** https://amoy.polygonscan.com
- **Faucet:** https://faucet.polygon.technology/

## Commands

```bash
npm run verify-setup    # Check configuration
npm run check-balance   # Check wallet balance
npm run compile         # Compile contracts
npm run deploy:amoy     # Deploy to Amoy testnet
npm run verify:amoy     # Verify on explorer
```

## After Deployment

1. Contract address saved to: `blockchain/deployments/amoy.json`
2. Update `backend/.env`:
   ```env
   CONTRACT_ADDRESS=0xYOUR_CONTRACT_ADDRESS
   POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
   ```
3. Restart backend service

## Troubleshooting

**"Gas price below minimum"**
- Fixed: Gas price set to 30 gwei (see `GAS_PRICE_FIX.md`)

**"Insufficient funds"**
- Get POL from faucet (select Amoy network)

**"Network not found"**
- Use `npm run deploy:amoy` (not `deploy:mumbai`)

## Important Notes

- ⚠️ Mumbai testnet is deprecated - use Amoy instead
- ⚠️ Never commit your `.env` file
- ⚠️ Always test on Amoy before mainnet
- ✅ Gas price configured at 30 gwei (above 25 gwei minimum)

For detailed information, see:
- `START_HERE_AMOY.md` - Complete guide
- `GAS_PRICE_FIX.md` - Gas price issue details
