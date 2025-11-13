# 🔗 Blockchain Integration Guide

## Overview

TrustPay uses Polygon blockchain to store immutable proof of escrow transactions. The smart contract does NOT hold funds - it only stores transaction proofs for transparency and auditability.

## Smart Contract: TrustPayEscrow

**Purpose**: Store immutable records of escrow transactions  
**Network**: Polygon (Mumbai testnet for development)  
**Language**: Solidity 0.8.19

### Key Features

- ✅ Create escrow records with metadata hash
- ✅ Update escrow status (HELD, RELEASED, REFUNDED, DISPUTED)
- ✅ Store Setu transaction IDs
- ✅ Emit events for all state changes
- ✅ Verify metadata integrity
- ✅ Gas-optimized for low transaction costs

---

## 🚀 Quick Start

### Step 1: Setup Blockchain Environment

```bash
cd blockchain
npm install
cp .env.example .env
```

### Step 2: Get a Wallet

1. **Install MetaMask**: https://metamask.io/
2. **Create a new wallet** or import existing
3. **Export private key**: MetaMask → Account Details → Export Private Key
4. **Add to `.env`**:
   ```
   PRIVATE_KEY=your_private_key_here
   ```

⚠️ **NEVER commit your private key to git!**

### Step 3: Get Test MATIC

For Mumbai testnet:
1. Visit: https://faucet.polygon.technology/
2. Select "Mumbai"
3. Enter your wallet address
4. Get free test MATIC

### Step 4: Deploy Contract

```bash
# Compile contract
npm run compile

# Deploy to Mumbai testnet
npm run deploy:mumbai
```

You'll see output like:
```
✅ TrustPayEscrow deployed to: 0x1234...5678
```

### Step 5: Update Backend Configuration

Copy the contract address and update `backend/.env`:

```env
CONTRACT_ADDRESS=0x1234...5678
POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=your_private_key_here
```

---

## 📝 Contract Functions

### createEscrow
```solidity
function createEscrow(
    string memory escrowId,
    bytes32 metadataHash,
    uint256 amount
) external
```

Creates a new escrow record on-chain.

**Parameters**:
- `escrowId`: UUID from backend
- `metadataHash`: keccak256 hash of metadata
- `amount`: Amount in paise

**Emits**: `EscrowCreated` event

### markHeld
```solidity
function markHeld(
    string memory escrowId,
    string memory setuTxnId
) external
```

Marks escrow as HELD after funds are received.

**Parameters**:
- `escrowId`: Escrow UUID
- `setuTxnId`: Setu transaction ID

**Emits**: `EscrowHeld` event

### releaseEscrow
```solidity
function releaseEscrow(string memory escrowId) external
```

Marks escrow as RELEASED after funds sent to payee.

**Emits**: `EscrowReleased` event

### refundEscrow
```solidity
function refundEscrow(string memory escrowId) external
```

Marks escrow as REFUNDED after funds returned to payer.

**Emits**: `EscrowRefunded` event

### markDisputed
```solidity
function markDisputed(string memory escrowId) external
```

Marks escrow as DISPUTED.

**Emits**: `EscrowDisputed` event

---

## 🔍 Verification & Transparency

### View on Blockchain Explorer

**Mumbai Testnet**:
```
https://mumbai.polygonscan.com/address/YOUR_CONTRACT_ADDRESS
```

**Polygon Mainnet**:
```
https://polygonscan.com/address/YOUR_CONTRACT_ADDRESS
```

### Verify Contract Source Code

```bash
npm run verify:mumbai YOUR_CONTRACT_ADDRESS
```

This makes the contract code publicly viewable and verifiable.

---

## 💰 Gas Costs (Approximate)

On Polygon (with MATIC at $0.50):

| Function | Gas Used | Cost (MATIC) | Cost (USD) |
|----------|----------|--------------|------------|
| createEscrow | ~100,000 | 0.005 | $0.0025 |
| markHeld | ~50,000 | 0.0025 | $0.00125 |
| releaseEscrow | ~50,000 | 0.0025 | $0.00125 |
| refundEscrow | ~50,000 | 0.0025 | $0.00125 |

**Total per escrow**: ~$0.005 (half a cent!)

---

## 🔐 Security Considerations

1. **Private Key Management**:
   - Use environment variables
   - Never commit to git
   - Use AWS KMS or HashiCorp Vault in production

2. **Access Control**:
   - Only backend wallet can update escrows
   - Use multisig wallet for production

3. **Metadata Privacy**:
   - Only hash is stored on-chain
   - Actual data stays in database
   - Users can verify hash matches

4. **Immutability**:
   - Once written, cannot be changed
   - Provides audit trail
   - Prevents tampering

---

## 🧪 Testing

### Run Tests

```bash
cd blockchain
npx hardhat test
```

### Test Locally

```bash
# Start local blockchain
npx hardhat node

# Deploy to local network
npm run deploy:local
```

---

## 📊 Monitoring

### Listen to Events

```javascript
const contract = new ethers.Contract(address, abi, provider);

contract.on("EscrowCreated", (escrowId, metadataHash, amount, timestamp) => {
  console.log("New escrow created:", escrowId);
});
```

### Query Escrow Data

```javascript
const escrow = await contract.getEscrow(escrowId);
console.log("Status:", escrow.status);
console.log("Amount:", escrow.amount);
```

---

## 🚀 Production Deployment

### Mainnet Deployment Checklist

- [ ] Audit smart contract
- [ ] Test thoroughly on Mumbai
- [ ] Set up multisig wallet
- [ ] Configure monitoring
- [ ] Get sufficient MATIC for gas
- [ ] Deploy to Polygon mainnet
- [ ] Verify contract on Polygonscan
- [ ] Update backend configuration
- [ ] Test end-to-end flow

### Deploy to Mainnet

```bash
npm run deploy:polygon
```

---

## 🆘 Troubleshooting

### "Insufficient funds for gas"
- Get more MATIC from faucet (testnet) or exchange (mainnet)

### "Nonce too high"
- Reset MetaMask account or wait for pending transactions

### "Contract not deployed"
- Check RPC URL is correct
- Verify network in hardhat.config.js

### "Transaction reverted"
- Check escrow doesn't already exist
- Verify status transitions are valid
- Ensure you're using the creator wallet

---

## 📚 Resources

- **Polygon Docs**: https://docs.polygon.technology/
- **Hardhat Docs**: https://hardhat.org/docs
- **Solidity Docs**: https://docs.soliditylang.org/
- **Mumbai Faucet**: https://faucet.polygon.technology/
- **Polygonscan**: https://polygonscan.com/

---

**Next**: See [UPI_INTEGRATION.md](UPI_INTEGRATION.md) for Setu setup
