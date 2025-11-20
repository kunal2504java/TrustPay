# 🚀 Deploy TrustPay to Vercel - Quick Start

## Option 1: Automated Script (Easiest)

Just run the deployment script:

```bash
deploy-frontend.bat
```

This will:
1. Install dependencies
2. Build the project
3. Deploy to Vercel

## Option 2: Manual CLI Deployment

### Step 1: Login to Vercel

```bash
vercel login
```

### Step 2: Navigate to Frontend

```bash
cd frontend
```

### Step 3: Deploy

**For Preview (Staging):**
```bash
vercel
```

**For Production:**
```bash
vercel --prod
```

## Important: Set Your Backend URL

After deployment, set your backend API URL:

```bash
vercel env add VITE_API_URL
```

Enter your backend URL when prompted (e.g., `https://your-backend.com`)

Then redeploy:
```bash
vercel --prod
```

## What Happens Next?

1. Vercel will build your project
2. You'll get a deployment URL (e.g., `trustpay.vercel.app`)
3. Your site will be live!

## First Time Setup

If this is your first deployment, Vercel will ask:

- **Project name?** → `trustpay` (or your choice)
- **Directory?** → `./` (press Enter)
- **Override settings?** → `N` (we have vercel.json)

## View Your Deployment

After deployment, Vercel will show:
- **Preview URL:** https://trustpay-xxx.vercel.app
- **Production URL:** https://trustpay.vercel.app

## Troubleshooting

**"Vercel not found"?**
```bash
npm install -g vercel
```

**Build fails?**
Test locally first:
```bash
npm run build
```

**Need help?**
Check `VERCEL_DEPLOYMENT.md` for detailed guide.

---

**Ready? Let's deploy! 🎉**

```bash
cd frontend
vercel --prod
```
