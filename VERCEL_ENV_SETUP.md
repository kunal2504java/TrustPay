# Vercel Environment Variables Setup

## Problem

Your Vercel frontend is trying to connect to `localhost:8000` instead of your Railway backend.

## Solution

Set the `VITE_API_URL` environment variable in Vercel to point to your Railway backend.

## Steps

### 1. Get Your Railway Backend URL

1. Go to Railway Dashboard
2. Click on your backend service
3. Go to **Settings** tab
4. Find **Domains** section
5. Copy the public URL (e.g., `https://trustpay-backend-production.up.railway.app`)

### 2. Add Environment Variable in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your **TrustPay** project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Set:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend.up.railway.app` (your Railway URL)
   - **Environment**: Select all (Production, Preview, Development)
6. Click **Save**

### 3. Redeploy Frontend

After adding the environment variable, you need to redeploy:

**Option 1: Trigger from Vercel Dashboard**
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **⋯** (three dots) → **Redeploy**

**Option 2: Push a new commit**
```bash
git commit --allow-empty -m "Trigger Vercel redeploy with backend URL"
git push origin main
```

### 4. Verify

Once redeployed:
1. Open your Vercel frontend: `https://your-app.vercel.app`
2. Open browser DevTools (F12) → Console
3. Try to login with: `test@trustpay.com` / `test123`
4. Check the Network tab - requests should now go to your Railway backend

## Environment Variables Checklist

Make sure you have these set in Vercel:

### Required:
- ✅ `VITE_API_URL` - Your Railway backend URL

### Optional (for Razorpay):
- `VITE_RAZORPAY_KEY_ID` - Your Razorpay key (if different from backend)

## Example Configuration

```env
# Production
VITE_API_URL=https://trustpay-backend-production.up.railway.app

# Preview/Development (optional, can use same as production)
VITE_API_URL=https://trustpay-backend-production.up.railway.app
```

## Troubleshooting

### Still seeing localhost:8000?

1. **Clear browser cache**: Hard refresh with `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. **Check deployment logs**: Verify the environment variable was picked up during build
3. **Verify variable name**: Must be exactly `VITE_API_URL` (case-sensitive)
4. **Check build logs**: Look for "VITE_API_URL" in the build output

### CORS errors after fixing URL?

If you see CORS errors, update your Railway backend environment variables:

1. Go to Railway Dashboard → Backend Service → Variables
2. Add/Update:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
3. Redeploy backend

### How to check if variable is set correctly?

Add this temporarily to your frontend code:

```javascript
console.log('API URL:', import.meta.env.VITE_API_URL);
```

Or check in browser console:
```javascript
// This won't work in production, but you can check Network tab
// to see where requests are going
```

## Quick Fix Command

Run this from your project root:

```bash
# Set the environment variable in Vercel using CLI
vercel env add VITE_API_URL production
# When prompted, enter your Railway backend URL

# Then redeploy
vercel --prod
```

## Next Steps

After setting up:

1. ✅ Test login with `test@trustpay.com` / `test123`
2. ✅ Create a test escrow
3. ✅ Test payment flow
4. ✅ Verify WebSocket real-time updates

---

**Your Railway Backend URL**: (Get from Railway Dashboard)
**Your Vercel Frontend URL**: (Get from Vercel Dashboard)

Once both are connected, your full-stack app will be live! 🚀
