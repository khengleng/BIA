# Railway Deployment Troubleshooting

## Issue: Healthcheck Failing (Service Unavailable)

### Root Cause
The backend server is not starting, causing the `/health` endpoint to be unreachable.

### Common Causes

#### 1. Missing Environment Variables ❌
The server has security validation that requires certain env vars:

**Required Variables:**
```bash
DATABASE_URL=postgresql://...?sslmode=require
JWT_SECRET=<your-secret-key>
PORT=3000  # Railway provides this automatically
NODE_ENV=production
```

**Check in Railway Dashboard:**
1. Go to your backend service
2. Click "Variables"
3. Ensure all required variables are set

#### 2. Database Connection Issues
- Ensure `DATABASE_URL` includes `?sslmode=require`
- Verify the PostgreSQL service is running
- Check if the database is accessible from the backend service

#### 3. Migration Failures
The start command now runs:
```bash
npx prisma generate && npx prisma migrate deploy && node dist/index.js
```

If migrations fail, the server won't start.

### Quick Fix Steps

#### Step 1: Check Environment Variables
In Railway Dashboard → Backend Service → Variables:

```bash
# Essential
DATABASE_URL=postgresql://postgres:...@...railway.app:5432/railway?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
NODE_ENV=production

# Optional but recommended
FRONTEND_URL=https://www.cambobia.com
STRIPE_SECRET_KEY=sk_...
RESEND_API_KEY=re_...
```

#### Step 2: Check Deployment Logs
In Railway Dashboard → Backend Service → Deployments → Latest → Logs

Look for:
- ❌ "CRITICAL SECURITY CHECKS FAILED" → Missing env vars
- ❌ "Database connection failed" → DATABASE_URL issue
- ❌ "Migration failed" → Database schema issue
- ✅ "Boutique Advisory Platform API running on port..." → Success!

#### Step 3: Manual Migration (if needed)
If migrations are failing, you can run them manually:

```bash
# Connect to your Railway project
railway link

# Run migrations manually
cd backend
railway run npx prisma migrate deploy
```

#### Step 4: Verify Database Connection
Test the DATABASE_URL:

```bash
# In Railway backend service shell
npx prisma db pull
```

### Expected Successful Startup Logs

```
🚀 Starting Boutique Advisory Platform...
🔒 Validating security configuration...
✅ Security configuration validated
📋 Checking database connection and migration status...
✅ Database migration already completed
🗄️  Using PostgreSQL database
🚀 Boutique Advisory Platform API running on port 3000
📡 Real-time WebSockets enabled
📊 Health check available at http://localhost:3000/health
✅ Admin account synced with password from .env
```

### If Still Failing

#### Option 1: Simplify Start Command Temporarily
In `backend/railway.json`, change:
```json
{
  "deploy": {
    "startCommand": "node dist/index.js"
  }
}
```

Then run migrations separately in Railway shell:
```bash
railway run npx prisma migrate deploy
```

#### Option 2: Check Security Validator
The file `backend/src/utils/securityValidator.ts` checks for:
- JWT_SECRET (must be set and not default)
- Other security configurations

Make sure JWT_SECRET is properly set in Railway.

#### Option 3: Increase Healthcheck Timeout
In `backend/railway.json`:
```json
{
  "deploy": {
    "healthcheckTimeout": 300,  // Already set to 5 minutes
    "healthcheckPath": "/health"
  }
}
```

### Monitoring the New Deployment

The fix has been pushed. Watch the deployment:

1. Go to https://railway.app/dashboard
2. Find your project
3. Click on Backend service
4. Watch the "Deployments" tab
5. Click on the latest deployment to see logs

### Success Indicators

✅ Build completes successfully
✅ Migrations run without errors
✅ Server starts and logs "running on port 3000"
✅ Healthcheck passes (green checkmark)
✅ Service status shows "Active"

### Testing After Deployment

```bash
# Test health endpoint
curl https://your-backend-url.railway.app/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2026-02-06T...",
  "environment": "production",
  "database": "connected"
}
```

### Next Steps After Fix

1. ✅ Backend deploys successfully
2. ✅ Frontend redeploys (should be automatic)
3. ✅ Visit www.cambobia.com
4. ✅ Test login and advisory features

---

## Recent Changes

### What Was Fixed
- Changed `railway:start` from `prisma db push` to `prisma migrate deploy`
- Added `npx prisma generate` before migrations
- This ensures proper migration handling in production

### Why It Failed Before
- `prisma db push --accept-data-loss` can fail in production
- Missing `prisma generate` meant Prisma Client wasn't available
- Security validation was blocking startup due to missing env vars

---

## Contact Support

If issues persist:
- Railway Discord: https://discord.gg/railway
- Check Railway status: https://status.railway.app
- Review Railway docs: https://docs.railway.app
