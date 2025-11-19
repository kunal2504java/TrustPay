# Fund Flow in TrustPay Escrow System

## Current Implementation

### How It Works Now

```
┌─────────┐         ┌──────────────┐         ┌─────────────┐
│  Payer  │────────▶│   Razorpay   │────────▶│  TrustPay   │
│         │  Pay    │   Gateway    │ Capture │  Account    │
└─────────┘         └──────────────┘         └─────────────┘
                                                     │
                                                     │ Held
                                                     │
                                              ┌──────▼──────┐
                                              │   Escrow    │
                                              │  (Database) │
                                              └──────┬──────┘
                                                     │
                                                     │ Release
                                                     ▼
                                              ┌─────────────┐
                                              │   Payout    │
                                              │   to Payee  │
                                              └─────────────┘
```

### Step-by-Step Flow

1. **Payment Creation**
   - User creates escrow
   - Razorpay payment order created
   - Order ID: `order_xxx`

2. **Payment Capture**
   - User completes payment via Razorpay Checkout
   - Funds captured to **YOUR Razorpay merchant account**
   - Payment ID: `pay_xxx`
   - Webhook: `payment.captured` → Updates escrow to HELD

3. **Funds Held**
   - Funds sit in **your Razorpay account balance**
   - Escrow status: HELD in database
   - You control the funds

4. **Release (Payout)**
   - Both parties confirm
   - Payout initiated from **your Razorpay account**
   - Funds transferred to payee's UPI/bank
   - Webhook: `payout.processed` → Updates escrow to RELEASED

## Where Funds Are Actually Held

### In Test Mode
- **Razorpay Test Account**: No real money, just test transactions
- You can see test payments in Razorpay Dashboard → Test Mode

### In Live Mode
- **Your Razorpay Merchant Account**: Real money
- Funds appear in: Razorpay Dashboard → Balance
- Settlement: Razorpay settles to your bank account (T+2 days by default)

## Important Considerations

### 1. Settlement Delay
```
Day 0: Payment captured → Funds in Razorpay balance
Day 2: Razorpay settles to your bank account
```

**Issue**: If escrow is released before settlement, you need working capital.

**Solution**: 
- Keep sufficient balance in Razorpay account
- Use Razorpay Capital for instant settlements
- Or use Razorpay Route (see below)

### 2. Your Responsibilities

As the merchant holding funds:
- ✅ You're responsible for fund security
- ✅ You must comply with RBI regulations
- ✅ You need proper accounting/reconciliation
- ✅ You handle disputes and refunds
- ✅ You pay GST on your service fee

### 3. Business Model

**Your Revenue**:
```
Payment: ₹1000
Razorpay Fee (2%): -₹20
Your Service Fee (1%): +₹10
Payout to Payee: -₹990
────────────────────────
Your Profit: ₹10 - ₹20 = -₹10 (Loss!)
```

**Better Model**:
```
Payment: ₹1000
Your Service Fee (2%): +₹20
Razorpay Fee (2%): -₹20
Payout to Payee: -₹980
────────────────────────
Your Profit: ₹20 - ₹20 = ₹0 (Break-even)
```

**Recommended**:
```
Payment: ₹1000 + ₹30 (service fee) = ₹1030
Your Service Fee: +₹30
Razorpay Fee (2% of 1030): -₹20.60
Payout to Payee: -₹1000
────────────────────────
Your Profit: ₹30 - ₹20.60 = ₹9.40
```

## Better Approach: Razorpay Route

### What is Razorpay Route?

Razorpay Route allows you to:
- Create **linked accounts** for payees
- Split payments automatically
- Hold funds in **sub-accounts** (true escrow)
- Transfer funds between accounts

### How It Works

```
┌─────────┐         ┌──────────────┐         ┌─────────────┐
│  Payer  │────────▶│   Razorpay   │────────▶│  TrustPay   │
│         │  Pay    │   Gateway    │         │   Master    │
└─────────┘         └──────────────┘         │  Account    │
                                              └──────┬──────┘
                                                     │
                                              ┌──────▼──────┐
                                              │   Linked    │
                                              │  Account    │
                                              │  (Payee)    │
                                              └─────────────┘
```

### Benefits

✅ **True Escrow**: Funds held in separate linked account
✅ **Automatic Splits**: Can split payment on capture
✅ **Better Compliance**: Clear fund segregation
✅ **Easier Reconciliation**: Each payee has own account
✅ **Instant Transfers**: Move funds between accounts instantly

### Implementation with Route

```python
# 1. Create Linked Account for Payee
linked_account = razorpay.account.create({
    "email": "payee@example.com",
    "phone": "9876543210",
    "type": "route",
    "legal_business_name": "Payee Name",
    "business_type": "individual",
    "contact_name": "Payee Name"
})

# 2. Create Payment with Transfer
order = razorpay.order.create({
    "amount": 100000,  # ₹1000
    "currency": "INR",
    "transfers": [
        {
            "account": linked_account["id"],
            "amount": 98000,  # ₹980 (after 2% fee)
            "currency": "INR",
            "on_hold": True,  # Hold in escrow
            "on_hold_until": 1234567890  # Unix timestamp
        }
    ]
})

# 3. Release Funds (when confirmed)
razorpay.transfer.edit(transfer_id, {
    "on_hold": False  # Release from escrow
})
```

## Recommended Setup for Production

### Phase 1: Current Implementation (MVP)
- ✅ Use payment orders (what you have now)
- ✅ Hold funds in your Razorpay account
- ✅ Manual payouts
- ⚠️ Requires working capital
- ⚠️ Manual reconciliation

### Phase 2: Razorpay Route (Scale)
- ✅ Create linked accounts for payees
- ✅ Use transfers with on_hold
- ✅ Automatic fund segregation
- ✅ Better compliance
- ✅ Easier to scale

### Phase 3: Full Automation
- ✅ Automatic KYC for payees
- ✅ Instant settlements
- ✅ Automated reconciliation
- ✅ Multi-currency support

## Compliance & Regulations

### RBI Guidelines for Payment Aggregators

If you're holding customer funds, you need:

1. **PA License**: Payment Aggregator license from RBI
2. **Escrow Account**: Separate bank account for customer funds
3. **Audit**: Regular audits and reporting
4. **KYC**: Know Your Customer for all parties
5. **AML**: Anti-Money Laundering compliance

### Razorpay's Role

- Razorpay is a licensed Payment Aggregator
- They handle compliance for payment collection
- You're using their license (as a merchant)
- But you're responsible for escrow operations

### Recommendations

1. **Start Small**: Use current implementation for MVP
2. **Consult Legal**: Get legal advice on escrow operations
3. **Use Route**: Migrate to Razorpay Route for better compliance
4. **Get Licensed**: If scaling, consider PA license

## Security Best Practices

### 1. Fund Segregation
```
Your Business Account (Bank)
    ↓
Razorpay Merchant Account
    ↓
Separate Escrow Tracking (Database)
```

### 2. Reconciliation
- Daily reconciliation of Razorpay balance vs database
- Match payments, payouts, refunds
- Alert on mismatches

### 3. Audit Trail
- Log all fund movements
- Store webhook payloads
- Keep payment receipts
- Track refunds and disputes

### 4. Monitoring
- Alert on large transactions
- Monitor payout failures
- Track settlement delays
- Watch for fraud patterns

## Summary

### Current State
- ✅ Funds held in **your Razorpay merchant account**
- ✅ You control releases via payouts
- ✅ Works for MVP and testing
- ⚠️ Requires working capital
- ⚠️ Manual reconciliation needed

### Next Steps
1. **Test thoroughly** with current implementation
2. **Monitor** Razorpay Dashboard for fund flow
3. **Plan migration** to Razorpay Route for scale
4. **Consult legal** for compliance
5. **Set up proper accounting** for fund tracking

### Key Takeaway

**You (TrustPay) are the custodian of funds during escrow.**

This means:
- You have the responsibility to hold funds securely
- You must release funds correctly
- You need proper compliance and accounting
- You should consider Razorpay Route for better fund segregation

---

**Questions?** Check Razorpay Route documentation: https://razorpay.com/docs/route/
