# Seed Railway Database with Test Users

## Option 1: Run Locally (Recommended)

This method runs the seed script from your local machine but connects to Railway's database.

### Steps:

1. **Get your Railway DATABASE_URL:**
   - Go to Railway Dashboard → Your Project → PostgreSQL service
   - Click on **Variables** tab
   - Copy the `DATABASE_URL` value

2. **Set the environment variable:**

   **Windows (PowerShell):**
   ```powershell
   $env:DATABASE_URL="your-database-url-here"
   ```

   **Windows (CMD):**
   ```cmd
   set DATABASE_URL=your-database-url-here
   ```

   **Mac/Linux:**
   ```bash
   export DATABASE_URL="your-database-url-here"
   ```

3. **Run the seed script:**
   ```bash
   cd backend
   python seed_production.py
   ```

4. **Verify:**
   - You should see output confirming users were created
   - Try logging in with: `test@trustpay.com` / `test123`

## Option 2: Run on Railway

Run the seed script directly on Railway using their CLI.

### Steps:

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Link to your project:**
   ```bash
   railway link
   ```
   Select your TrustPay project.

4. **Run the seed script:**
   ```bash
   railway run python backend/seed_production.py
   ```

## Option 3: One-Time Deployment Command

Add a one-time command in Railway dashboard.

### Steps:

1. Go to Railway Dashboard → Your Backend Service
2. Click **Settings** → **Deploy**
3. Under **Custom Start Command**, temporarily change to:
   ```
   python seed_production.py && uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
4. Click **Deploy** → **Redeploy**
5. After deployment completes, change the start command back to:
   ```
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

## Test Accounts Created

After seeding, you'll have these accounts:

| Email | Password | Role | KYC Status |
|-------|----------|------|------------|
| test@trustpay.com | test123 | Test User | Verified |
| demo@trustpay.com | demo123 | Demo User | Verified |
| seller@trustpay.com | seller123 | Seller | Verified |
| buyer@trustpay.com | buyer123 | Buyer | Verified |
| pending@trustpay.com | pending123 | Pending | Pending |

## Verify Users Were Created

### Method 1: Try Logging In
Go to your Vercel frontend and try logging in with `test@trustpay.com` / `test123`

### Method 2: Check via API
```bash
# Get auth token
curl -X POST https://your-backend.up.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@trustpay.com","password":"test123"}'

# Use token to get user info
curl https://your-backend.up.railway.app/api/v1/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Method 3: Check Database Directly
1. Go to Railway Dashboard → PostgreSQL service
2. Click **Data** tab
3. Run query: `SELECT email, name, kyc_status FROM users;`

## Troubleshooting

### "DATABASE_URL not set"
Make sure you've exported the environment variable in your current terminal session.

### "Connection refused"
- Check if your Railway PostgreSQL service is running
- Verify the DATABASE_URL is correct
- Ensure your IP is not blocked (Railway allows all IPs by default)

### "User already exists"
This is normal! The script checks for existing users and won't create duplicates.

### "Table doesn't exist"
The script automatically creates tables. If this fails:
1. Check Railway logs for database errors
2. Ensure PostgreSQL service is healthy
3. Try redeploying your backend service first

## Security Note

⚠️ **Important:** These are test accounts with simple passwords. For production:
- Use strong, unique passwords
- Consider removing test accounts after initial testing
- Never commit real user credentials to git

## Next Steps

After seeding:
1. ✅ Login to your Vercel frontend with test accounts
2. ✅ Create test escrows
3. ✅ Test payment flow with Razorpay test mode
4. ✅ Verify WebSocket real-time updates work

---

**Need help?** Check Railway logs or backend logs for any errors during seeding.
