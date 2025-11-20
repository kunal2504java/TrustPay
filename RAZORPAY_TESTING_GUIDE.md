# 🧪 Razorpay Testing Guide for TrustPay

This guide will help you test the Razorpay payment integration in your TrustPay application.

## 📋 Prerequisites

- Backend server running (`uvicorn main:app --reload`)
- Frontend server running (`npm run dev`)
- Razorpay test credentials configured in `backend/.env`
- Test user account created (use `python seed_test_users.py`)

## 🔑 Your Razorpay Test Credentials

From your `.env` file:
```
RAZORPAY_KEY_ID=rzp_test_Rh0JyQKq8WAWmt
RAZORPAY_KEY_SECRET=Jkti2mtAov7qQSZHEZ9SWRkO
```

⚠️ **Note:** These are TEST credentials. No real money will be charged.

## 🧪 Test Cards for Razorpay

Razorpay provides test cards that simulate different payment scenarios:

### ✅ Successful Payment
| Card Number | CVV | Expiry | Result |
|-------------|-----|--------|--------|
| 4111 1111 1111 1111 | Any 3 digits | Any future date | Success |
| 5555 5555 5555 4444 | Any 3 digits | Any future date | Success |

### ❌ Failed Payment
| Card Number | CVV | Expiry | Result |
|-------------|-----|--------|--------|
| 4000 0000 0000 0002 | Any 3 digits | Any future date | Card declined |
| 4000 0000 0000 9995 | Any 3 digits | Any future date | Insufficient funds |

### ⏳ Pending/Processing
| Card Number | CVV | Expiry | Result |
|-------------|-----|--------|--------|
| 4000 0000 0000 9979 | Any 3 digits | Any future date | Payment pending |

### 🔐 3D Secure Authentication
| Card Number | CVV | Expiry | Result |
|-------------|-----|--------|--------|
| 4000 0027 6000 3184 | Any 3 digits | Any future date | Requires 3D Secure |

**For 3D Secure:** Use OTP `1234` when prompted.

## 🚀 Testing Flow

### Step 1: Start Your Servers

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 2: Login to Dashboard

1. Go to http://localhost:3000
2. Click "Login"
3. Use test credentials:
   - Email: `test@trustpay.com`
   - Password: `test123`

### Step 3: Create an Escrow

1. Click "Create Escrow" in the sidebar
2. Fill in the form:
   - **Payee UPI:** `seller@paytm` (or any test UPI)
   - **Amount:** `1000` (₹10.00 - Razorpay uses paise)
   - **Description:** "Test escrow payment"
3. Click "Create Escrow"

### Step 4: Make Payment

1. You'll see the escrow details
2. Click "Pay Now" or "Make Payment"
3. Razorpay payment modal will open
4. Use one of the test cards above
5. Complete the payment

### Step 5: Verify Payment

**Check in Dashboard:**
- Payment status should update to "Paid"
- Escrow status should change accordingly

**Check Backend Logs:**
```bash
# Look for payment logs in your backend terminal
# You should see:
# - Payment order created
# - Payment captured
# - Webhook received (if configured)
```

**Check Database:**
```bash
cd backend
python check_payment.py  # We'll create this script
```

## 🔍 Testing Different Scenarios

### Scenario 1: Successful Payment
```
Card: 4111 1111 1111 1111
Amount: ₹1000
Expected: Payment succeeds, escrow funded
```

### Scenario 2: Failed Payment
```
Card: 4000 0000 0000 0002
Amount: ₹1000
Expected: Payment fails, error message shown
```

### Scenario 3: Pending Payment
```
Card: 4000 0000 0000 9979
Amount: ₹1000
Expected: Payment pending, status updates later
```

### Scenario 4: 3D Secure
```
Card: 4000 0027 6000 3184
Amount: ₹1000
OTP: 1234
Expected: 3D Secure prompt, then success
```

### Scenario 5: Webhook Testing
```
1. Make a payment
2. Check backend logs for webhook
3. Verify payment_log table updated
```

## 🛠️ Testing Tools

### 1. Razorpay Dashboard

Visit: https://dashboard.razorpay.com/signin

**Test Mode Features:**
- View all test payments
- Check payment status
- Test webhooks
- View logs

### 2. Backend API Testing

**Check Payment Status:**
```bash
curl http://localhost:8000/api/v1/escrows/{escrow_id}/payment-status
```

**List Payments:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/payments/
```

### 3. Database Verification

Create a script to check payments:

```python
# backend/check_payment.py
import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.payment_log import PaymentLog

async def check_payments():
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(PaymentLog).order_by(PaymentLog.created_at.desc()).limit(10)
        )
        payments = result.scalars().all()
        
        print("\n📊 Recent Payments:\n")
        for payment in payments:
            print(f"ID: {payment.id}")
            print(f"Razorpay Order ID: {payment.razorpay_order_id}")
            print(f"Amount: ₹{payment.amount/100}")
            print(f"Status: {payment.status}")
            print(f"Created: {payment.created_at}")
            print("-" * 50)

if __name__ == "__main__":
    asyncio.run(check_payments())
```

Run it:
```bash
cd backend
python check_payment.py
```

## 🐛 Troubleshooting

### Payment Modal Doesn't Open

**Check:**
1. Razorpay script loaded in frontend
2. API key is correct
3. Backend is running
4. CORS is configured

**Fix:**
```javascript
// Check browser console for errors
// Verify Razorpay script in index.html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### Payment Succeeds but Status Doesn't Update

**Check:**
1. Webhook is configured
2. Webhook secret is correct
3. Backend is accessible from Razorpay

**Test Webhook Locally:**
```bash
# Use ngrok to expose local backend
ngrok http 8000

# Update webhook URL in Razorpay dashboard
# URL: https://your-ngrok-url.ngrok.io/api/v1/webhooks/razorpay
```

### Payment Fails Immediately

**Check:**
1. API credentials are correct
2. Amount is valid (minimum ₹1)
3. Backend logs for errors

### Database Not Updating

**Check:**
1. Payment log model is correct
2. Database migrations are up to date
3. Backend has database write permissions

**Run:**
```bash
cd backend
alembic upgrade head
```

## 📊 Test Checklist

Use this checklist to ensure complete testing:

- [ ] **Payment Creation**
  - [ ] Create escrow successfully
  - [ ] Payment order created in Razorpay
  - [ ] Order ID stored in database

- [ ] **Payment Processing**
  - [ ] Razorpay modal opens
  - [ ] Test card accepted
  - [ ] Payment processes successfully
  - [ ] Success callback triggered

- [ ] **Payment Verification**
  - [ ] Payment status updates in UI
  - [ ] Database records payment
  - [ ] Escrow status changes to "funded"

- [ ] **Webhook Handling**
  - [ ] Webhook received
  - [ ] Signature verified
  - [ ] Payment log updated
  - [ ] Escrow status updated

- [ ] **Error Handling**
  - [ ] Failed payment shows error
  - [ ] User can retry payment
  - [ ] Error logged in database

- [ ] **Edge Cases**
  - [ ] Duplicate payment prevention
  - [ ] Timeout handling
  - [ ] Network error handling
  - [ ] Invalid amount handling

## 🔐 Security Testing

### Test Webhook Signature Verification

```python
# Test invalid signature
import requests

payload = {"event": "payment.captured"}
headers = {"X-Razorpay-Signature": "invalid_signature"}

response = requests.post(
    "http://localhost:8000/api/v1/webhooks/razorpay",
    json=payload,
    headers=headers
)

# Should return 400 Bad Request
assert response.status_code == 400
```

### Test Payment Amount Tampering

Try to modify payment amount in browser console - should fail validation.

## 📈 Performance Testing

### Load Test Payments

```bash
# Install Apache Bench
# Windows: Download from Apache website
# Mac: brew install httpd

# Test 100 concurrent payment requests
ab -n 100 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/escrows/create
```

## 🎯 Production Testing Checklist

Before going live:

- [ ] Switch to live Razorpay credentials
- [ ] Test with real bank account (small amount)
- [ ] Verify webhook in production
- [ ] Test refund flow
- [ ] Monitor payment logs
- [ ] Set up alerts for failed payments
- [ ] Test with different browsers
- [ ] Test on mobile devices
- [ ] Verify SSL certificate
- [ ] Test payment timeout scenarios

## 📞 Support

**Razorpay Support:**
- Dashboard: https://dashboard.razorpay.com
- Docs: https://razorpay.com/docs
- Support: support@razorpay.com

**Test Mode Limitations:**
- No real money charged
- Limited to test cards
- Webhooks may be delayed
- Some features disabled

## 🎓 Additional Resources

- **Razorpay Test Cards:** https://razorpay.com/docs/payments/payments/test-card-details/
- **Webhook Testing:** https://razorpay.com/docs/webhooks/test/
- **API Reference:** https://razorpay.com/docs/api/

---

**Happy Testing! 🚀**

Remember: Always test thoroughly in test mode before going live with real payments.
