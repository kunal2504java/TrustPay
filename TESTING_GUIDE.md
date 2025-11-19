# Razorpay Integration Testing Guide

## Prerequisites

Before testing, ensure you have:

1. ✅ Razorpay test account created
2. ✅ Test API keys from Razorpay Dashboard
3. ✅ PostgreSQL database running
4. ✅ Backend and frontend dependencies installed

## Step 1: Configure Razorpay Credentials

### Backend Configuration

Update `backend/.env` with your Razorpay test credentials:

```env
# Razorpay Integration (Add your actual test keys)
RAZORPAY_KEY_ID=rzp_test_YOUR_ACTUAL_KEY_HERE
RAZORPAY_KEY_SECRET=YOUR_ACTUAL_SECRET_HERE
RAZORPAY_WEBHOOK_SECRET=  # Leave empty for now, we'll add this later
```

### Frontend Configuration

Create `frontend/.env` with your Razorpay key:

```env
VITE_API_URL=http://localhost:8000
VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_ACTUAL_KEY_HERE
```

## Step 2: Start the Backend

```bash
cd backend
python main.py
```

Expected output:
```
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

Verify backend is running:
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

## Step 3: Start the Frontend

```bash
cd frontend
npm run dev
```

Expected output:
```
VITE ready in XXX ms
➜  Local:   http://localhost:5173/
```

## Step 4: Test the Payment Flow

### 4.1 Register/Login

1. Open http://localhost:5173
2. Register a new account or login
3. You should see the dashboard

### 4.2 Create Escrow

1. Click "Create Escrow" in the sidebar
2. Fill in the form:
   - **Payee's UPI ID**: `test@paytm` (or any valid format)
   - **Amount**: `100` (₹100)
   - **Purpose**: `Test escrow payment`
   - **Order ID**: (optional)
3. Click "Create Escrow"

**Expected Result:**
- Success message: "Escrow created! Please complete the payment."
- Payment modal should appear

### 4.3 Complete Payment

When the payment modal appears:

1. Click "Pay Now"
2. Razorpay checkout window should open
3. Use Razorpay test credentials:
   - **Card Number**: `4111 1111 1111 1111`
   - **CVV**: Any 3 digits (e.g., `123`)
   - **Expiry**: Any future date (e.g., `12/25`)
   - **Name**: Any name
4. Complete the payment

**Expected Result:**
- Payment success message
- Redirect to dashboard
- Escrow status should be "HELD"

### 4.4 Check Payment Status

1. Go to your dashboard
2. Find the escrow you just created
3. Click on it to view details
4. You should see:
   - Status: HELD
   - Payment details with Razorpay IDs
   - Payment completed timestamp

## Step 5: Test Webhook (Optional - Requires ngrok)

Webhooks require a public URL. For local testing:

1. Install ngrok: https://ngrok.com/
2. Start ngrok:
   ```bash
   ngrok http 8000
   ```
3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
4. Configure in Razorpay Dashboard:
   - Go to Settings → Webhooks
   - Add webhook URL: `https://abc123.ngrok.io/api/v1/webhooks/razorpay`
   - Select events: payment.captured, payment.failed, payout.processed, payout.failed
   - Copy the webhook secret
5. Add webhook secret to `backend/.env`:
   ```env
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
   ```
6. Restart backend

## Test Scenarios

### ✅ Scenario 1: Successful Payment Flow

1. Create escrow → Payment modal appears
2. Complete payment → Status changes to HELD
3. Webhook received → Payment log created
4. Check payment status → Shows payment details

### ✅ Scenario 2: Payment Cancellation

1. Create escrow → Payment modal appears
2. Click "Cancel" or close modal
3. Escrow remains in INITIATED status
4. Can complete payment later

### ✅ Scenario 3: Escrow Confirmation

1. Create escrow with payment
2. Status: HELD
3. Click "Confirm Delivery"
4. If both parties confirm → Payout initiated
5. Status changes to RELEASED

### ✅ Scenario 4: Escrow Cancellation

1. Create escrow with payment
2. Status: HELD
3. Click "Cancel Escrow"
4. Enter cancellation reason
5. Refund initiated
6. Status changes to REFUNDED

## Troubleshooting

### Issue: Payment modal doesn't appear

**Solution:**
- Check browser console for errors
- Verify Razorpay script loaded in Network tab
- Check `VITE_RAZORPAY_KEY_ID` in frontend/.env

### Issue: "Invalid API key" error

**Solution:**
- Verify Razorpay test keys in backend/.env
- Ensure keys start with `rzp_test_`
- Check for extra spaces or line breaks

### Issue: Backend errors

**Solution:**
- Check backend logs for detailed errors
- Verify database is running
- Check all migrations applied: `alembic current`

### Issue: CORS errors

**Solution:**
- Verify backend CORS settings allow frontend origin
- Check `FRONTEND_URL` in backend/.env

## API Endpoints to Test

### Create Escrow
```bash
curl -X POST http://localhost:8000/api/v1/escrows/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "payee_vpa": "test@paytm",
    "amount": 10000,
    "description": "Test payment",
    "currency": "INR",
    "condition": "manual_confirm"
  }'
```

### Get Payment Status
```bash
curl http://localhost:8000/api/v1/escrows/{escrow_id}/payment-status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Webhook Test (Manual)
```bash
curl -X POST http://localhost:8000/api/v1/webhooks/razorpay \
  -H "Content-Type: application/json" \
  -H "X-Razorpay-Signature: test_signature" \
  -d '{
    "event": "payment.captured",
    "payload": {
      "payment": {
        "entity": {
          "id": "pay_test123",
          "order_id": "order_test123",
          "notes": {
            "escrow_id": "YOUR_ESCROW_ID"
          }
        }
      }
    }
  }'
```

## Success Criteria

✅ Backend starts without errors
✅ Frontend starts without errors
✅ Can register/login successfully
✅ Can create escrow
✅ Payment modal appears with Razorpay checkout
✅ Can complete test payment
✅ Escrow status updates to HELD
✅ Payment details visible in UI
✅ Can confirm escrow
✅ Can cancel escrow with refund

## Next Steps After Testing

Once basic flow works:

1. **Configure Webhooks** - Set up ngrok and Razorpay webhooks
2. **Test Payout Flow** - Complete full escrow lifecycle
3. **Test Error Scenarios** - Failed payments, timeouts
4. **Add Real UPI IDs** - Test with actual UPI accounts
5. **Production Setup** - Switch to live keys when ready

## Support

If you encounter issues:

1. Check backend logs: `backend/` terminal
2. Check frontend console: Browser DevTools
3. Check Razorpay Dashboard: Payments → Test Mode
4. Review API docs: http://localhost:8000/docs

## Important Notes

⚠️ **Test Mode Only**: Always use test keys (rzp_test_) for development
⚠️ **No Real Money**: Test payments don't involve real money
⚠️ **Webhook Secret**: Optional for local testing, required for production
⚠️ **Database**: Ensure PostgreSQL is running before starting backend

---

**Happy Testing! 🚀**
