# Boutique Advisory Platform - Production Deployment Checklist

> **Last Verified:** December 23, 2024  
> **Platform:** Railway  
> **Status:** ✅ Production Ready

---

## 📋 Table of Contents

1. [Pre-Deployment Requirements](#pre-deployment-requirements)
2. [Environment Variables](#environment-variables)
3. [Service Configuration](#service-configuration)
4. [Database Setup](#database-setup)
5. [Security Checklist](#security-checklist)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Rollback Procedures](#rollback-procedures)
9. [Troubleshooting Guide](#troubleshooting-guide)

---

## 🚀 Pre-Deployment Requirements

### Code Preparation
- [ ] All code changes committed and pushed to the main branch
- [ ] All TypeScript/ESLint errors resolved (or configured to ignore)
- [ ] Production build tested locally: `npm run build`
- [ ] No hardcoded secrets or API keys in codebase
- [ ] Environment-specific configs in `.env.production` files

### Infrastructure Prerequisites
- [ ] Railway project created
- [ ] GitHub repository connected to Railway
- [ ] PostgreSQL database provisioned
- [ ] Redis cache provisioned (optional but recommended)

---

## 🔐 Environment Variables

### Backend Service (Required)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `production` | ✅ Yes |
| `PORT` | Server port | `4000` | ✅ Yes |
| `DATABASE_URL` | PostgreSQL connection string | `${{Postgres.DATABASE_URL}}` | ✅ Yes |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | `your-strong-secret-key` | ✅ Yes |
| `JWT_EXPIRES_IN` | Token expiration | `24h` | ⚠️ Recommended |
| `REDIS_URL` | Redis connection string | `${{Redis.REDIS_URL}}` | ⚠️ Recommended |
| `FRONTEND_URL` | Frontend URL for CORS | `https://frontend-xxx.railway.app` | ✅ Yes |

### Backend Service (Optional - AWS S3)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `AWS_ACCESS_KEY_ID` | AWS access key | `AKIA...` | Only for file uploads |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | `xxx...` | Only for file uploads |
| `AWS_REGION` | AWS region | `us-east-1` | Only for file uploads |
| `AWS_S3_BUCKET` | S3 bucket name | `boutique-advisory-prod` | Only for file uploads |

### Backend Service (Optional - External Services)

| Variable | Description | Example |
|----------|-------------|---------|
| `DID_API_GATEWAY_URL` | DID infrastructure URL | `https://did-api.example.com` |
| `CM_PORTAL_URL` | Case Management URL | `https://cm.example.com` |
| `RWA_API_URL` | RWA infrastructure URL | `https://rwa-api.example.com` |
| `TEMPORAL_SERVER_URL` | Temporal workflow engine | `temporal.example.com:7233` |

### Frontend Service (Required)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://backend-xxx.railway.app` | ✅ Yes |
| `PORT` | Server port | `3000` | ✅ Yes |
| `RAILWAY_SERVICE_ROOT_DIRECTORY` | Root directory | `/frontend` | ✅ Yes (Railway) |

### Frontend Service (Optional)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_ENV` | Environment identifier | `production` |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | Enable analytics | `true` |
| `NEXT_PUBLIC_APP_NAME` | PWA app name | `BIA Platform` |

---

## ⚙️ Service Configuration

### Backend Configuration Files

| File | Purpose | Key Settings |
|------|---------|--------------|
| `railway.json` | Railway deployment config | Builder: NIXPACKS, Health check: `/health` |
| `nixpacks.toml` | Build configuration | Node.js 20, `npm start` |
| `package.json` | Scripts | `build: tsc`, `start: node dist/index.js` |
| `Dockerfile` | Container build (optional) | Multi-stage, OpenSSL support |
| `prisma/schema.prisma` | Database schema | Binary targets for Linux |

### Frontend Configuration Files

| File | Purpose | Key Settings |
|------|---------|--------------|
| `railway.json` | Railway deployment config | Builder: NIXPACKS, Health check: `/` |
| `nixpacks.toml` | Build configuration | Node.js 20, `npm start` |
| `next.config.ts` | Next.js config | `output: 'standalone'` |
| `.env.production` | Production env vars | `NEXT_PUBLIC_API_URL` |

### Railway Configuration Verification

```bash
# Backend railway.json
{
    "build": { "builder": "NIXPACKS" },
    "deploy": {
        "numReplicas": 1,
        "healthcheckPath": "/health",
        "healthcheckTimeout": 30,
        "restartPolicyType": "ON_FAILURE",
        "restartPolicyMaxRetries": 10
    }
}

# Frontend railway.json
{
    "build": { "builder": "NIXPACKS" },
    "deploy": {
        "numReplicas": 1,
        "healthcheckPath": "/",
        "restartPolicyType": "ON_FAILURE",
        "restartPolicyMaxRetries": 10
    }
}
```

---

## 🗄️ Database Setup

### Initial Setup
- [ ] PostgreSQL database provisioned in Railway
- [ ] `DATABASE_URL` environment variable set in backend service
- [ ] Database connection tested

### Prisma Migrations
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (initial setup)
npx prisma db push

# Run migrations (for updates)
npx prisma migrate deploy
```

### Database Verification
```bash
# Check database connection
npx prisma db pull

# View database in browser
npx prisma studio
```

### Seed Data (Optional)
```bash
# If you have a seed script
npm run db:seed
```

---

## 🔒 Security Checklist

### Authentication & Authorization
- [ ] JWT_SECRET is a strong, unique value (min 32 characters)
- [ ] JWT tokens expire appropriately (default: 24h)
- [ ] RBAC (Role-Based Access Control) is properly configured
- [ ] Sensitive endpoints require authentication

### Network Security
- [ ] HTTPS enabled (Railway provides this automatically)
- [ ] CORS properly configured with FRONTEND_URL
- [ ] Rate limiting enabled (express-rate-limit)
- [ ] Helmet.js security headers enabled

### Data Security
- [ ] No sensitive data in logs
- [ ] Database credentials not exposed
- [ ] API keys stored in environment variables
- [ ] Data masking for sensitive fields (RBAC)

### Secrets Management
- [ ] All secrets stored in Railway environment variables
- [ ] No secrets committed to Git
- [ ] `.env` files in `.gitignore`
- [ ] Different secrets for staging vs production

---

## ✅ Post-Deployment Verification

### Health Checks

```bash
# Backend health check
curl https://backend-production-xxx.up.railway.app/health

# Expected response:
# {"status":"ok","timestamp":"...","service":"boutique-advisory-backend"}
```

### API Endpoint Tests

```bash
# Test authentication
curl -X POST https://backend-xxx.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Test protected endpoint (with token)
curl https://backend-xxx.railway.app/api/smes \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Frontend Verification
- [ ] Homepage loads correctly
- [ ] Login/logout works
- [ ] API calls succeed (check browser console)
- [ ] All pages render without errors
- [ ] Multi-language switching works
- [ ] PWA features work (if enabled)

### Database Verification
- [ ] Data persists correctly
- [ ] CRUD operations work
- [ ] No connection timeouts

---

## 📊 Monitoring & Maintenance

### Railway Dashboard Monitoring
- **Deployment Logs:** View build and runtime logs
- **Metrics:** CPU, memory, and network usage
- **Observability:** Request logs and error tracking

### Recommended Monitoring Setup
```
1. Railway built-in monitoring (included)
2. Application-level logging (Morgan/Winston)
3. Error tracking (Sentry - optional)
4. Uptime monitoring (UptimeRobot - optional)
```

### Regular Maintenance Tasks

| Task | Frequency | Description |
|------|-----------|-------------|
| Check logs | Daily | Review error logs for issues |
| Database backup | Weekly | Export database backup |
| Dependency updates | Monthly | Update npm packages |
| Security audit | Monthly | Run `npm audit` |
| SSL certificate | Automatic | Railway handles this |

### Database Backup Command
```bash
# Export database (run from local with DATABASE_URL)
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

---

## 🔄 Rollback Procedures

### Railway Rollback (Recommended)
1. Go to Railway Dashboard → Your Project → Service
2. Click on "Deployments" tab
3. Find the last working deployment
4. Click "Rollback" button

### Git-Based Rollback
```bash
# Find the last working commit
git log --oneline

# Revert to previous commit
git revert HEAD
git push origin main

# Force rollback (use with caution)
git reset --hard <commit-hash>
git push --force origin main
```

### Database Rollback
```bash
# Restore from backup
psql $DATABASE_URL < backup_YYYYMMDD.sql
```

---

## 🔧 Troubleshooting Guide

### Common Issues & Solutions

#### 1. Build Fails
```
Error: Cannot find module 'xxx'
```
**Solution:** 
- Check `package.json` for missing dependencies
- Run `npm install` locally and verify
- Clear build cache in Railway

#### 2. Database Connection Error
```
Error: Can't reach database server
```
**Solution:**
- Verify `DATABASE_URL` is correctly set
- Check PostgreSQL service is running
- Use Railway reference: `${{Postgres.DATABASE_URL}}`

#### 3. CORS Error
```
Access-Control-Allow-Origin error
```
**Solution:**
- Set `FRONTEND_URL` in backend environment
- Verify CORS middleware configuration
- Check the exact frontend URL (no trailing slash)

#### 4. 401 Unauthorized
```
Error: Authentication failed
```
**Solution:**
- Verify `JWT_SECRET` matches between deployments
- Check token expiration
- Verify user credentials in database

#### 5. 500 Internal Server Error
```
Error: Internal server error
```
**Solution:**
- Check Railway deployment logs
- Verify all environment variables are set
- Check database connection and schema

#### 6. Memory/CPU Issues
```
Service restarts frequently
```
**Solution:**
- Check Railway metrics
- Optimize database queries
- Consider upgrading Railway plan

### Logs Access

```bash
# View logs in Railway CLI
railway logs

# Filter logs
railway logs | grep "error"
```

---

## 📝 Production URLs

| Service | URL |
|---------|-----|
| **Frontend** | https://frontend-production-xxx.up.railway.app |
| **Backend API** | https://backend-production-c9de.up.railway.app |
| **Health Check** | https://backend-production-c9de.up.railway.app/health |
| **Railway Dashboard** | https://railway.com/project/bfe61037-736a-48ad-a4e0-08524c4e65b9 |

---

## 📞 Support Resources

- **Railway Documentation:** https://docs.railway.app
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Prisma Deployment:** https://www.prisma.io/docs/guides/deployment
- **Project Repository:** https://github.com/meCambodia/BIA

---

## 📅 Deployment History

| Date | Version | Changes | Status |
|------|---------|---------|--------|
| 2024-12-23 | 1.0.0 | Initial production deployment | ✅ Success |
| | | | |

---

## ✍️ Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | | | |
| QA | | | |
| DevOps | | | |
| Product Owner | | | |

---

**Document Version:** 1.0  
**Last Updated:** December 23, 2024  
**Maintained By:** Boutique Advisory Platform Team
