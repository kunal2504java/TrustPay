# Vercel Deployment Guide for TrustPay

This guide will help you deploy the TrustPay frontend to Vercel using the CLI.

## Prerequisites

- Node.js installed
- Vercel account (sign up at https://vercel.com)
- Your backend API deployed and accessible

## Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

## Step 2: Login to Vercel

```bash
vercel login
```

This will open your browser to authenticate. Choose your preferred login method (GitHub, GitLab, Bitbucket, or Email).

## Step 3: Configure Environment Variables

Before deploying, you need to set up your environment variables. Create a `.env.production` file in the `frontend` directory:

```bash
cd frontend
```

Create `.env.production`:

```env
VITE_API_URL=https://your-backend-api.com
```

**Important:** Replace `https://your-backend-api.com` with your actual backend API URL.

## Step 4: Build Test (Optional but Recommended)

Test the build locally before deploying:

```bash
npm run build
```

If the build succeeds, you're ready to deploy!

## Step 5: Deploy to Vercel

### Option A: Deploy with Interactive Setup

```bash
vercel
```

This will ask you several questions:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your account/team
- **Link to existing project?** → No (first time) or Yes (subsequent deploys)
- **Project name?** → `trustpay` (or your preferred name)
- **Directory?** → `./` (current directory)
- **Override settings?** → No (we have vercel.json)

### Option B: Deploy Directly to Production

```bash
vercel --prod
```

This skips the preview deployment and goes straight to production.

## Step 6: Set Environment Variables on Vercel

After the first deployment, set your environment variables:

```bash
vercel env add VITE_API_URL
```

When prompted:
- **Value:** Enter your backend API URL
- **Environment:** Select `Production`, `Preview`, and `Development`

Or set it via the Vercel Dashboard:
1. Go to your project on Vercel
2. Settings → Environment Variables
3. Add `VITE_API_URL` with your backend URL

## Step 7: Redeploy with Environment Variables

After adding environment variables, redeploy:

```bash
vercel --prod
```

## Deployment Commands Reference

| Command | Description |
|---------|-------------|
| `vercel` | Deploy to preview (staging) |
| `vercel --prod` | Deploy to production |
| `vercel --yes` | Skip all prompts, use defaults |
| `vercel ls` | List all deployments |
| `vercel rm [deployment-url]` | Remove a deployment |
| `vercel domains` | Manage custom domains |
| `vercel env ls` | List environment variables |

## Custom Domain Setup

### Add a Custom Domain

```bash
vercel domains add yourdomain.com
```

Or via Dashboard:
1. Project Settings → Domains
2. Add your domain
3. Follow DNS configuration instructions

## Continuous Deployment

### Connect to Git Repository

For automatic deployments on every push:

1. Go to Vercel Dashboard
2. Import your Git repository (GitHub/GitLab/Bitbucket)
3. Configure build settings (already set in vercel.json)
4. Every push to main branch will auto-deploy

## Troubleshooting

### Build Fails

**Check build logs:**
```bash
vercel logs [deployment-url]
```

**Common issues:**
- Missing dependencies: Run `npm install` locally
- Environment variables: Ensure all required vars are set
- Build errors: Test with `npm run build` locally

### API Connection Issues

**CORS Errors:**
- Ensure your backend allows requests from your Vercel domain
- Add Vercel domain to backend CORS whitelist

**Environment Variables:**
- Verify `VITE_API_URL` is set correctly
- Remember: Vite env vars must start with `VITE_`
- Redeploy after changing env vars

### Routing Issues (404 on Refresh)

The `vercel.json` file handles this with rewrites. If you still have issues:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## Production Checklist

Before deploying to production:

- [ ] Backend API is deployed and accessible
- [ ] Environment variables are configured
- [ ] Build succeeds locally (`npm run build`)
- [ ] Test the preview deployment first
- [ ] CORS is configured on backend
- [ ] Custom domain is set up (optional)
- [ ] SSL certificate is active (automatic on Vercel)

## Monitoring

### View Deployment Logs

```bash
vercel logs [deployment-url] --follow
```

### Analytics

Vercel provides built-in analytics:
- Go to your project dashboard
- Click on "Analytics" tab
- View traffic, performance, and errors

## Rollback

If something goes wrong, rollback to a previous deployment:

1. Go to Vercel Dashboard → Deployments
2. Find the working deployment
3. Click "..." → "Promote to Production"

Or via CLI:
```bash
vercel rollback
```

## Cost

- **Hobby Plan:** Free
  - Unlimited deployments
  - 100GB bandwidth/month
  - Automatic SSL
  - Perfect for personal projects

- **Pro Plan:** $20/month
  - More bandwidth
  - Team collaboration
  - Advanced analytics

## Support

- **Vercel Docs:** https://vercel.com/docs
- **Vercel Support:** https://vercel.com/support
- **Community:** https://github.com/vercel/vercel/discussions

## Quick Deploy Script

Create a `deploy.sh` script for easy deployment:

```bash
#!/bin/bash

echo "🚀 Deploying TrustPay to Vercel..."

# Navigate to frontend
cd frontend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build
echo "🔨 Building..."
npm run build

# Deploy to production
echo "🌐 Deploying to production..."
vercel --prod

echo "✅ Deployment complete!"
```

Make it executable:
```bash
chmod +x deploy.sh
```

Run it:
```bash
./deploy.sh
```

## Next Steps

After deployment:
1. Test all features on the live site
2. Set up custom domain (optional)
3. Configure backend CORS for your Vercel domain
4. Monitor analytics and logs
5. Set up continuous deployment with Git

---

**Your TrustPay frontend is now live on Vercel! 🎉**
