# Railway Environment Variables Checklist

## ✅ Verified Locally
The start command works perfectly:
```bash
npx prisma generate && npx prisma migrate deploy && node dist/index.js
```

All security checks passed locally, which means the issue on Railway is **missing environment variables**.

## 🔍 Required Environment Variables for Railway

### Backend Service - CRITICAL Variables

Go to Railway Dashboard → Your Project → Backend Service → Variables

#### 1. DATABASE_URL ⚠️ CRITICAL
```bash
# Railway provides this automatically when you add PostgreSQL
# Format should be:
postgresql://postgres:PASSWORD@HOST:5432/railway?sslmode=require

# Make sure it includes ?sslmode=require at the end!
```

**How to get it:**
- Railway auto-generates this when you link PostgreSQL
- Should be in "Variables" tab as `DATABASE_URL`
- **Verify it ends with `?sslmode=require`**

#### 2. JWT_SECRET ⚠️ CRITICAL
```bash
# Must be at least 32 characters
# Example (generate your own):
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long-12345
```

**How to set it:**
1. Go to Backend Service → Variables
2. Click "New Variable"
3. Variable: `JWT_SECRET`
4. Value: (paste a long random string)

#### 3. INITIAL_ADMIN_PASSWORD ⚠️ CRITICAL
```bash
# Required for initial setup and migration
# Must be at least 12 characters
INITIAL_ADMIN_PASSWORD=your-strong-admin-password-123!
```

#### 4. NODE_ENV ⚠️ CRITICAL
```bash
NODE_ENV=production
```

#### 4. PORT (Optional - Railway sets this automatically)
```bash
# Railway provides this automatically
# Usually 3000 or dynamic
```

### Backend Service - RECOMMENDED Variables

#### 5. FRONTEND_URL
```bash
FRONTEND_URL=https://www.cambobia.com
```

#### 6. Stripe (if using payments)
```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### 7. Email (if using Resend)
```bash
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@cambobia.com
```

#### 8. File Upload (if using R2/MinIO)
```bash
R2_ENDPOINT=https://...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
R2_PUBLIC_URL=https://...
```

## 📋 Step-by-Step Verification

### Step 1: Check DATABASE_URL
```bash
# In Railway Backend Service → Variables
# Look for DATABASE_URL
# Should look like:
postgresql://postgres:xxx@containers-us-west-xxx.railway.app:5432/railway?sslmode=require
```

**If missing:**
1. Go to your PostgreSQL service
2. Copy the connection string
3. Add `?sslmode=require` at the end
4. Paste into Backend Service variables as `DATABASE_URL`

### Step 2: Add JWT_SECRET
```bash
# Generate a secure secret:
openssl rand -base64 48

# Or use this example (CHANGE IT!):
JWT_SECRET=BIA-Production-Secret-Key-2026-Change-This-To-Your-Own-Random-String
```

1. Go to Backend Service → Variables
2. Click "New Variable"
3. Name: `JWT_SECRET`
4. Value: (paste your secret)
5. Click "Add"

### Step 3: Add INITIAL_ADMIN_PASSWORD
1. Go to Backend Service → Variables
2. Click "New Variable"
3. Name: `INITIAL_ADMIN_PASSWORD`
4. Value: (set a strong password, e.g., `BIA_Prod_Admin_2026!`)
5. Click "Add"

### Step 4: Set NODE_ENV
1. Go to Backend Service → Variables
2. Click "New Variable"
3. Name: `NODE_ENV`
4. Value: `production`
5. Click "Add"

### Step 5: Set FRONTEND_URL
1. Go to Backend Service → Variables
2. Click "New Variable"
3. Name: `FRONTEND_URL`
4. Value: `https://www.cambobia.com`
5. Click "Add"

## 🚀 After Setting Variables

1. **Redeploy** - Railway should auto-redeploy after adding variables
2. **Watch Logs** - Go to Deployments → Latest → Logs
3. **Look for Success:**
   ```
   ✅ Security configuration validated
   ✅ Database migration already completed
   🚀 Boutique Advisory Platform API running on port 3000
   ```

## 🧪 Test After Deployment

```bash
# Test health endpoint
curl https://your-backend-url.railway.app/health

# Should return:
{
  "status": "ok",
  "timestamp": "...",
  "environment": "production",
  "database": "connected"
}
```

## ❌ Common Errors and Fixes

### Error: "CRITICAL SECURITY CHECKS FAILED"
**Cause:** Missing JWT_SECRET or it's too short
**Fix:** Add JWT_SECRET with at least 32 characters

### Error: "Database connection failed"
**Cause:** DATABASE_URL is wrong or missing `?sslmode=require`
**Fix:** 
1. Get DATABASE_URL from PostgreSQL service
2. Ensure it ends with `?sslmode=require`
3. Add to Backend Service variables

### Error: "Migration failed"
**Cause:** Database schema is out of sync
**Fix:** 
1. Go to Railway PostgreSQL service
2. Open "Data" tab
3. Verify tables exist
4. If empty, migrations will run automatically

### Error: "Port already in use"
**Cause:** Only happens locally (you have dev server running)
**Fix:** This won't happen on Railway - ignore locally

## 📊 Expected Deployment Flow

1. ✅ Build completes (Docker image built)
2. ✅ Container starts
3. ✅ `npx prisma generate` runs
4. ✅ `npx prisma migrate deploy` runs (applies migrations)
5. ✅ `node dist/index.js` starts server
6. ✅ Security validation passes
7. ✅ Database connection succeeds
8. ✅ Server listens on PORT
9. ✅ Healthcheck passes at `/health`
10. ✅ Service shows "Active" 🎉

## 🎯 Quick Checklist

Before redeploying, verify:

- [ ] DATABASE_URL is set and includes `?sslmode=require`
- [ ] JWT_SECRET is set (32+ characters)
- [ ] NODE_ENV=production
- [ ] FRONTEND_URL is set to your domain
- [ ] PostgreSQL service is running
- [ ] Backend service is linked to PostgreSQL

## 🔗 Railway Dashboard Links

1. **Project Dashboard:** https://railway.app/dashboard
2. **Backend Service:** Click on your backend service
3. **Variables Tab:** Where you add environment variables
4. **Deployments Tab:** Where you see logs and status
5. **Settings Tab:** Service configuration

---

## Next Steps

1. ✅ Verify all CRITICAL variables are set
2. ✅ Trigger redeploy (or wait for auto-deploy)
3. ✅ Watch deployment logs
4. ✅ Test health endpoint
5. ✅ Visit www.cambobia.com
6. ✅ Test login and features

**The code is ready - it's just waiting for the environment variables!** 🚀
