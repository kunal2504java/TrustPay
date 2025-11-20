# Railway Backend Deployment Guide

## Prerequisites
- Railway account (sign up at https://railway.app)
- GitHub repository connected
- PostgreSQL database (Railway provides this)

## Step 1: Create New Project on Railway

1. Go to https://railway.app/dashboard
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your **TrustPay** repository
5. Railway will detect it's a Python project

## Step 2: Configure Root Directory

Since your backend is in a subdirectory:

1. In Railway project settings
2. Go to **Settings** → **Service Settings**
3. Set **Root Directory** to: `backend`
4. Click **Save**

## Step 3: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will create and link the database automatically
4. Copy the **DATABASE_URL** from the PostgreSQL service variables

## Step 4: Configure Environment Variables

In Railway project → **Variables** tab, add these:

### Required Variables:
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
SECRET_KEY=<generate-a-strong-random-key>
FRONTEND_URL=https://your-vercel-app.vercel.app
ENVIRONMENT=production
DEBUG=False
```

### Razorpay Variables:
```
RAZORPAY_KEY_ID=<your-razorpay-key-id>
RAZORPAY_KEY_SECRET=<your-razorpay-secret>
RAZORPAY_WEBHOOK_SECRET=<your-webhook-secret>
```

### Blockchain Variables (if using):
```
POLYGON_RPC_URL=https://polygon-rpc.com
PRIVATE_KEY=<your-private-key>
CONTRACT_ADDRESS=<your-contract-address>
```

### Optional Variables:
```
SETU_API_KEY=<your-setu-api-key>
SETU_BASE_URL=https://api.setu.co
REDIS_URL=<if-using-redis>
```

## Step 5: Generate SECRET_KEY

Run this locally to generate a secure secret key:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copy the output and use it as your `SECRET_KEY` in Railway.

## Step 6: Deploy

1. Railway will automatically deploy after you add variables
2. Check the **Deployments** tab for build logs
3. Once deployed, you'll get a public URL like: `https://your-app.up.railway.app`

## Step 7: Update Frontend API URL

Update your frontend's `.env` file on Vercel:

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add/Update:
   ```
   VITE_API_URL=https://your-app.up.railway.app
   ```
3. Redeploy your frontend

## Step 8: Test the Deployment

Test your API endpoints:

```bash
# Health check
curl https://your-app.up.railway.app/health

# API docs
https://your-app.up.railway.app/docs
```

## Step 9: Database Migrations (if needed)

If you need to run Alembic migrations:

1. In Railway, go to your service
2. Click **"Settings"** → **"Deploy"**
3. Add a **Custom Start Command**:
   ```
   alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

## Troubleshooting

### Build Fails
- Check **Deployments** → **Build Logs** for errors
- Verify `requirements.txt` has all dependencies
- Ensure Python version is compatible (3.10+)

### Database Connection Issues
- Verify `DATABASE_URL` is set correctly
- Check if PostgreSQL service is running
- Ensure database tables are created (check lifespan function in main.py)

### CORS Errors
- Add your Vercel URL to `FRONTEND_URL` environment variable
- Check Railway logs for CORS-related errors

### Port Issues
- Railway automatically sets `$PORT` environment variable
- Ensure your start command uses `--port $PORT`

## Monitoring

- **Logs**: Railway Dashboard → Your Service → **Logs**
- **Metrics**: Railway Dashboard → Your Service → **Metrics**
- **Health**: Monitor `/health` endpoint

## Custom Domain (Optional)

1. Go to Railway project → **Settings**
2. Click **"Generate Domain"** or add custom domain
3. Update `FRONTEND_URL` in Vercel to match

## Cost Optimization

- Railway offers $5 free credit monthly
- Monitor usage in **Usage** tab
- Consider upgrading for production workloads

## Security Checklist

- ✅ Strong `SECRET_KEY` generated
- ✅ `DEBUG=False` in production
- ✅ Database credentials secured
- ✅ API keys in environment variables (not in code)
- ✅ CORS configured for your frontend only
- ✅ HTTPS enabled (automatic on Railway)

## Next Steps

1. Set up monitoring and alerts
2. Configure backup strategy for PostgreSQL
3. Set up CI/CD for automatic deployments
4. Add rate limiting for API endpoints
5. Configure logging and error tracking (e.g., Sentry)

---

**Your Backend URL**: `https://your-app.up.railway.app`
**API Documentation**: `https://your-app.up.railway.app/docs`
