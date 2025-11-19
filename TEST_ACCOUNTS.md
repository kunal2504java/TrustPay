# Test Accounts for TrustPay

This document contains test user accounts for development and testing.

## How to Create Test Users

Run the seed script from the backend directory:

```bash
cd backend
python seed_test_users.py
```

## Available Test Accounts

### 1. Main Test Account
- **Email:** `test@trustpay.com`
- **Password:** `test123`
- **Phone:** +919876543210
- **UPI ID:** test@paytm
- **KYC Status:** ✅ Verified
- **Use Case:** General testing, creating escrows

### 2. Demo Account
- **Email:** `demo@trustpay.com`
- **Password:** `demo123`
- **Phone:** +919876543211
- **UPI ID:** demo@paytm
- **KYC Status:** ✅ Verified
- **Use Case:** Secondary account for testing escrow interactions

### 3. Seller Account
- **Email:** `seller@trustpay.com`
- **Password:** `seller123`
- **Phone:** +919876543212
- **UPI ID:** seller@paytm
- **KYC Status:** ✅ Verified
- **Use Case:** Testing seller-side escrow flows

### 4. Buyer Account
- **Email:** `buyer@trustpay.com`
- **Password:** `buyer123`
- **Phone:** +919876543213
- **UPI ID:** buyer@paytm
- **KYC Status:** ✅ Verified
- **Use Case:** Testing buyer-side escrow flows

### 5. Pending KYC Account
- **Email:** `pending@trustpay.com`
- **Password:** `pending123`
- **Phone:** +919876543214
- **UPI ID:** None
- **KYC Status:** ⏳ Pending
- **Use Case:** Testing KYC verification flows

## Quick Start

1. **Start the backend server:**
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

2. **Run the seed script:**
   ```bash
   python seed_test_users.py
   ```

3. **Start the frontend:**
   ```bash
   cd frontend
   npm start
   ```

4. **Login:**
   - Visit: http://localhost:3000/login
   - Use any of the test accounts above
   - Access the dashboard and create escrows

## Testing Escrow Flows

### Create an Escrow
1. Login with `test@trustpay.com`
2. Go to Dashboard
3. Click "Create Escrow"
4. Fill in details:
   - Payee UPI: `seller@paytm` (or any other test account)
   - Amount: Any amount (e.g., 1000)
   - Description: Test escrow

### Test Multi-User Escrow
1. Login with `buyer@trustpay.com` - Create escrow
2. Logout and login with `seller@trustpay.com` - View and confirm
3. Test the complete escrow lifecycle

## Notes

- All test accounts have **verified KYC** except the "Pending" account
- All passwords are simple for testing: `{username}123`
- UPI IDs follow the pattern: `{username}@paytm`
- Phone numbers are sequential: +9198765432XX

## Security Warning

⚠️ **These are test accounts for development only!**
- Never use these credentials in production
- Change all passwords before deploying
- Remove or disable test accounts in production environment

## Troubleshooting

### Script fails with "User already exists"
This is normal - the script checks for existing users and skips them.

### Database connection error
Make sure:
- PostgreSQL is running
- `.env` file has correct database credentials
- Database migrations are up to date: `alembic upgrade head`

### Can't login after seeding
- Check backend logs for errors
- Verify the user was created: Check database directly
- Ensure frontend is pointing to correct API URL
