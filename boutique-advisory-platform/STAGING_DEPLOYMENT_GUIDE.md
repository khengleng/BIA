# BIA Platform - Staging Deployment Guide

This guide explains how to deploy the Boutique Investment Advisory (BIA) Platform to a staging environment on Railway.

## Prerequisites

1. Railway CLI installed (`npm install -g @railway/cli`)
2. Railway account with access to the BIA project
3. Git repository access

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    STAGING ENVIRONMENT                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │   Frontend      │    │    Backend      │                    │
│  │   (Next.js)     │───▶│   (Express)     │                    │
│  │                 │    │                 │                    │
│  │ staging.railway │    │ staging.railway │                    │
│  └─────────────────┘    └────────┬────────┘                    │
│                                   │                             │
│                    ┌──────────────┼──────────────┐             │
│                    ▼              ▼              ▼             │
│              ┌──────────┐  ┌──────────┐   ┌──────────┐        │
│              │PostgreSQL│  │  Redis   │   │   S3     │        │
│              │ (Staging)│  │(Staging) │   │(Staging) │        │
│              └──────────┘  └──────────┘   └──────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Step 1: Create Staging Environment on Railway

### Option A: Via Railway Dashboard

1. Go to [Railway Dashboard](https://railway.com/workspace)
2. Select the BIA project
3. Click "Environments" → "Create Environment"
4. Name it "staging"
5. Railway will create copies of all services for staging

### Option B: Via Railway CLI

```bash
# Login to Railway
railway login

# Link to project
railway link

# Create staging environment
railway environment create staging

# Switch to staging environment
railway environment staging
```

## Step 2: Configure Staging Services

### Frontend Service

In Railway Dashboard, set these environment variables for the frontend staging service:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://backend-staging-XXXX.up.railway.app` |
| `NEXT_PUBLIC_ENV` | `staging` |
| `NEXT_PUBLIC_ENABLE_DEBUG_MODE` | `true` |
| `NEXT_PUBLIC_APP_NAME` | `BIA Platform (Staging)` |
| `NODE_ENV` | `production` |

### Backend Service

Set these environment variables for the backend staging service:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `staging` |
| `PORT` | `4000` |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (Railway reference) |
| `REDIS_URL` | `${{Redis.REDIS_URL}}` (Railway reference) |
| `JWT_SECRET` | `<your-staging-jwt-secret>` |
| `FRONTEND_URL` | `https://frontend-staging-XXXX.up.railway.app` |

### PostgreSQL Database

1. Add PostgreSQL plugin to staging environment
2. Railway will auto-provision and set `DATABASE_URL`

### Redis Cache

1. Add Redis plugin to staging environment
2. Railway will auto-provision and set `REDIS_URL`

## Step 3: Deploy to Staging

### Using Git Branch (Recommended)

1. Create a staging branch:
```bash
git checkout -b staging
git push origin staging
```

2. In Railway, configure the staging environment to deploy from the `staging` branch

### Using Railway CLI

```bash
# Switch to staging environment
railway environment staging

# Deploy current code
railway up
```

## Step 4: Run Database Migrations

After backend deployment:

```bash
# Connect to Railway shell
railway run npx prisma migrate deploy

# Or seed initial data
railway run npx prisma db push
```

## Step 5: Verify Deployment

### Health Checks

- Frontend: `https://frontend-staging-XXXX.up.railway.app`
- Backend: `https://backend-staging-XXXX.up.railway.app/api/v1/health`

### Test Login

Use test credentials:
- **Admin**: `admin@boutique-advisory.com` / `admin123`
- **Advisor**: `advisor@boutique-advisory.com` / `advisor123`
- **Investor**: `investor@boutique-advisory.com` / `investor123`
- **SME**: `sme@boutique-advisory.com` / `sme123`

## Environment Comparison

| Setting | Production | Staging |
|---------|------------|---------|
| NODE_ENV | production | staging |
| Debug Mode | false | true |
| Rate Limiting | Strict (100/15min) | Relaxed (200/15min) |
| Database | Production DB | Staging DB |
| Log Level | info | debug |

## Rollback Procedure

If issues occur in staging:

```bash
# Via CLI
railway environment staging
railway rollback

# Or via Dashboard
# Go to Deployments → Click on previous successful deployment → Rollback
```

## Monitoring

- **Logs**: `railway logs --service frontend` / `railway logs --service backend`
- **Metrics**: Available in Railway Dashboard under each service

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check `FRONTEND_URL` is correctly set in backend
2. **Database Connection**: Verify `DATABASE_URL` references Railway's PostgreSQL
3. **Build Failures**: Check `nixpacks.toml` configuration
4. **Health Check Failures**: Ensure `/api/v1/health` endpoint is accessible

### Debug Commands

```bash
# Check service status
railway status

# View recent logs
railway logs -n 100

# Open shell in service
railway shell
```

## CI/CD Integration (Optional)

For automated staging deployments, add this to `.github/workflows/staging-deploy.yml`:

```yaml
name: Deploy to Staging

on:
  push:
    branches: [staging]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Railway CLI
        run: npm install -g @railway/cli
        
      - name: Deploy to Staging
        run: railway up --environment staging
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `railway login` | Authenticate with Railway |
| `railway link` | Link to project |
| `railway environment staging` | Switch to staging |
| `railway up` | Deploy current code |
| `railway logs` | View logs |
| `railway rollback` | Rollback deployment |
| `railway shell` | Open service shell |

---

**Last Updated**: December 2024
**Maintained by**: BIA Development Team
