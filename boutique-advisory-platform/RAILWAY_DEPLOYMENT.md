# Railway.com Deployment Guide

## 🚀 Quick Deploy

Your code has been pushed to GitHub! Railway will automatically detect the changes and redeploy.

## Current Setup

Based on your previous deployments, you have:
- **Project**: Boutique Advisory Platform
- **Domain**: www.cambobia.com
- **Services**:
  - PostgreSQL Database
  - Backend Service
  - Frontend Service

## Deployment Steps

### Option 1: Automatic Deployment (Recommended)
Railway is likely configured with auto-deploy from GitHub. The deployment should start automatically.

1. Go to https://railway.app/dashboard
2. Find your project "Boutique Advisory Platform"
3. Check the deployment status for backend and frontend services
4. Wait for both services to complete deployment

### Option 2: Manual Trigger via Dashboard
1. Go to https://railway.app/dashboard
2. Select your project
3. Click on the **Backend** service
4. Click **"Deploy"** or **"Redeploy"**
5. Repeat for the **Frontend** service

### Option 3: Deploy via CLI

```bash
# Make sure you're logged in
railway login

# Link to your project (if not already linked)
railway link

# Deploy backend
cd backend
railway up

# Deploy frontend
cd ../frontend
railway up
```

## Required Environment Variables

### Backend Service
Make sure these are set in Railway:
```
DATABASE_URL=<Railway PostgreSQL URL>
JWT_SECRET=<your-jwt-secret>
PORT=3003
NODE_ENV=production
FRONTEND_URL=https://www.cambobia.com


# Stripe (if using payments)
STRIPE_SECRET_KEY=<your-stripe-secret>
STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable>

# Email (if configured)
RESEND_API_KEY=<your-resend-key>
FROM_EMAIL=<your-from-email>

# File Upload (S3/R2 Compatible)
# Note: The code uses S3_ prefix even for R2
S3_ENDPOINT=<your-r2-endpoint>
S3_REGION=auto
S3_ACCESS_KEY_ID=<your-access-key>
S3_SECRET_ACCESS_KEY=<your-secret-key>
S3_BUCKET_NAME=<your-bucket>
# Optional: Public URL if using custom domain
S3_PUBLIC_URL=https://<your-custom-domain>

# Identity Verification (Sumsub)
SUMSUB_APP_TOKEN=<your-sumsub-token>
SUMSUB_SECRET_KEY=<your-sumsub-secret>
SUMSUB_LEVEL_NAME=basic-kyc-level

# AI Features (Gemini)
GEMINI_API_KEY=<your-gemini-key>
```

### Frontend Service
```
NEXT_PUBLIC_API_URL=<your-backend-url>
NODE_ENV=production
```

## Post-Deployment Checklist

### 1. Check Backend Health
```bash
curl https://your-backend-url.railway.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "...",
  "environment": "production",
  "database": "connected"
}
```

### 2. Check Frontend
Visit: https://www.cambobia.com

### 3. Test Key Features
- [ ] User registration/login
- [ ] Advisory services page loads
- [ ] Advisors can access "Manage Services"
- [ ] SME owners can see advisory services
- [ ] Booking flow works
- [ ] Payment integration (if enabled)

### 4. Check Database Migrations
The backend should automatically run migrations on startup. Check the deployment logs:
```
✓ Prisma migrations applied
✓ Database schema up to date
```

## New Features in This Deployment

✅ **Advisory Service Management**
- Advisors can create/edit/delete services at `/advisory/manage`
- New backend endpoints for CRUD operations
- Enhanced booking system with mock data support

✅ **Fixed Access Control**
- SME owners and investors can now access advisory services
- Role-based navigation properly configured

✅ **Improved Booking System**
- Handles both real and mock service data
- Stores service details in notes when using mock data
- No more foreign key constraint errors

## Troubleshooting

### Backend Won't Start
1. Check deployment logs in Railway dashboard
2. Verify DATABASE_URL is correct
3. Ensure all required env vars are set
4. Check if migrations failed

### Frontend Can't Connect to Backend
1. Verify NEXT_PUBLIC_API_URL is set correctly
2. Check CORS settings in backend
3. Ensure backend is healthy

### 502 Bad Gateway
1. Backend might be starting up (wait 1-2 minutes)
2. Check backend logs for errors
3. Verify healthcheck endpoint is responding

### Database Connection Issues
```bash
# Check if DATABASE_URL includes sslmode=require
DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require
```

## Monitoring

### View Logs
```bash
# Backend logs
railway logs -s backend

# Frontend logs
railway logs -s frontend
```

### Check Deployment Status
```bash
railway status
```

## Rollback (if needed)

If something goes wrong:
1. Go to Railway dashboard
2. Select the service
3. Click "Deployments"
4. Find the previous working deployment
5. Click "Redeploy"

## Domain Configuration

Your domain `www.cambobia.com` should already be configured. If you need to update it:

1. Go to Frontend service settings
2. Click "Networking"
3. Add custom domain: `www.cambobia.com`
4. Update DNS records as shown

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Check deployment logs for specific errors

---

## 🎉 Ready to Deploy!

Your code is pushed and ready. Railway should auto-deploy, or you can trigger manually via the dashboard or CLI.

**Expected deployment time**: 5-10 minutes for both services
