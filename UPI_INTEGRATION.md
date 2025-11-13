# 💳 UPI Integration Guide (Setu)

## Overview

TrustPay uses Setu's UPI APIs to handle actual money movement in India. Setu provides:
- UPI Collect (request money)
- Virtual Accounts (hold money)
- UPI Pay (send money)

## 🚀 Quick Start

### Step 1: Sign Up for Setu

1. Visit: https://setu.co/
2. Click "Get Started"
3. Fill in business details
4. Complete KYC process
5. Get API credentials

### Step 2: Get Sandbox Access

1. Login to Setu Dashboard
2. Navigate to "Products" → "UPI"
3. Enable "Sandbox Mode"
4. Copy API Key and Secret

### Step 3: Configure Backend

Update `backend/.env`:

```env
SETU_API_KEY=your_setu_api_key_here
SETU_BASE_URL=https://sandbox.setu.co
SETU_SECRET=your_setu_secret_here
```

---

## 📝 Integration Flow

### 1. Create Escrow → UPI Collect

When user creates escrow:

```python
# Backend: app/services/setu_service.py

async def create_collect_request(self, amount: int, description: str):
    payload = {
        "amount": amount / 100,  # Convert paise to rupees
        "description": description,
        "expiresAt": "2024-12-31T23:59:59Z",
        "customerVpa": payer_vpa,  # Payer's UPI ID
        "merchantVpa": "trustpay@axis"  # Your business UPI
    }
    
    response = await client.post(
        f"{self.base_url}/v1/collect",
        json=payload,
        headers=self.headers
    )
    
    return response.json()
```

**Result**: Payer gets UPI collect request on their phone

### 2. Funds Received → Create Virtual Account

When payment is successful:

```python
async def create_virtual_account(self, escrow_id: str):
    payload = {
        "name": f"Escrow-{escrow_id}",
        "ifsc": "SETU0000001",
        "accountType": "current"
    }
    
    response = await client.post(
        f"{self.base_url}/v1/virtual-accounts",
        json=payload,
        headers=self.headers
    )
    
    return response.json()
```

**Result**: Funds held in isolated virtual account

### 3. Release → UPI Pay

When both parties confirm:

```python
async def release_funds(self, virtual_account_id: str, payee_vpa: str, amount: int):
    payload = {
        "amount": amount / 100,
        "payeeVPA": payee_vpa,
        "remarks": "Escrow release"
    }
    
    response = await client.post(
        f"{self.base_url}/v1/virtual-accounts/{virtual_account_id}/pay",
        json=payload,
        headers=self.headers
    )
    
    return response.json()
```

**Result**: Money sent to payee's UPI ID

---

## 🔔 Webhooks

### Setup Webhook Endpoint

```python
# backend/app/api/v1/endpoints/webhooks.py

@router.post("/webhooks/setu/payment-status")
async def setu_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    # Verify webhook signature
    signature = request.headers.get("X-Setu-Signature")
    body = await request.body()
    
    if not verify_signature(body, signature):
        raise HTTPException(status_code=401, detail="Invalid signature")
    
    data = await request.json()
    
    # Handle different events
    if data["event"] == "PAYMENT_SUCCESS":
        escrow_id = data["metadata"]["escrow_id"]
        await update_escrow_status(escrow_id, "HELD", db)
        
        # Record on blockchain
        await blockchain_service.mark_escrow_held(escrow_id)
    
    return {"status": "ok"}
```

### Configure Webhook URL

In Setu Dashboard:
1. Go to "Webhooks"
2. Add URL: `https://your-domain.com/api/v1/webhooks/setu/payment-status`
3. Select events: `PAYMENT_SUCCESS`, `PAYMENT_FAILED`
4. Save

---

## 🧪 Testing in Sandbox

### Test UPI IDs

Setu provides test UPI IDs:

```
Success: test.success@paytm
Failure: test.failure@paytm
Pending: test.pending@paytm
```

### Test Flow

1. Create escrow with test UPI ID
2. Setu will simulate payment
3. Webhook will be triggered
4. Check escrow status updated

---

## 💰 Pricing

### Setu Pricing (Approximate)

| Transaction | Cost |
|-------------|------|
| UPI Collect | ₹0.50 per request |
| Virtual Account | ₹1.00 per month |
| UPI Pay | ₹0.50 per transaction |

**Per escrow**: ~₹2.00

### TrustPay Fee Structure

- **Transaction Fee**: 1-2% of escrow amount
- **Minimum Fee**: ₹10
- **Example**: ₹5,000 escrow = ₹50-100 fee

---

## 🔐 Security

### API Key Management

```python
# Use environment variables
SETU_API_KEY = os.getenv("SETU_API_KEY")

# Rotate keys regularly
# Use different keys for sandbox/production
```

### Webhook Signature Verification

```python
import hmac
import hashlib

def verify_signature(body: bytes, signature: str) -> bool:
    secret = os.getenv("SETU_WEBHOOK_SECRET")
    expected = hmac.new(
        secret.encode(),
        body,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(expected, signature)
```

### Idempotency

```python
# Use idempotency keys for all requests
headers = {
    "Authorization": f"Bearer {api_key}",
    "X-Idempotency-Key": str(uuid.uuid4())
}
```

---

## 📊 Monitoring

### Track Metrics

- Success rate of collect requests
- Average time to payment
- Failed transactions
- Webhook delivery success

### Reconciliation

Daily job to match:
- Setu transactions
- Database escrows
- Blockchain records

```python
async def reconcile_transactions():
    # Get Setu transactions
    setu_txns = await setu_service.get_transactions(date)
    
    # Get database escrows
    db_escrows = await db.query(Escrow).filter(...)
    
    # Compare and flag mismatches
    for txn in setu_txns:
        escrow = find_escrow(txn.metadata.escrow_id)
        if not escrow or escrow.setu_collect_id != txn.id:
            alert_mismatch(txn, escrow)
```

---

## 🚀 Production Checklist

- [ ] Complete Setu KYC
- [ ] Get production API keys
- [ ] Set up business UPI ID
- [ ] Configure webhook URL (HTTPS required)
- [ ] Test with real UPI IDs
- [ ] Set up monitoring
- [ ] Configure alerts
- [ ] Test refund flow
- [ ] Test dispute flow
- [ ] Set up reconciliation job

---

## 🆘 Troubleshooting

### "Invalid API Key"
- Check key is correct in .env
- Verify using sandbox/production key appropriately

### "Webhook not received"
- Check URL is publicly accessible
- Verify HTTPS is enabled
- Check Setu dashboard for delivery logs

### "Payment stuck in pending"
- Check Setu dashboard for transaction status
- Verify payer's UPI app is working
- Contact Setu support if needed

### "Virtual account creation failed"
- Check account limits
- Verify KYC is complete
- Contact Setu support

---

## 📚 Resources

- **Setu Docs**: https://docs.setu.co/
- **UPI Specs**: https://www.npci.org.in/what-we-do/upi
- **Setu Support**: support@setu.co
- **Setu Dashboard**: https://dashboard.setu.co/

---

## 🔄 Alternative Providers

If Setu doesn't work for you:

1. **Cashfree**: https://www.cashfree.com/
2. **Razorpay**: https://razorpay.com/
3. **PhonePe**: https://www.phonepe.com/business/
4. **BharatPe**: https://bharatpe.com/

All provide similar UPI APIs.

---

**Next**: See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
