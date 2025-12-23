# Boutique Advisory Platform - Staging Deployment Checklist

> **Last Updated:** December 23, 2024  
> **Platform:** Railway  
> **Environment:** Staging  
> **Purpose:** Testing & QA before production releases

---

## 📋 Table of Contents

1. [Staging vs Production Differences](#staging-vs-production-differences)
2. [Pre-Deployment Requirements](#pre-deployment-requirements)
3. [Environment Variables](#environment-variables)
4. [Service Configuration](#service-configuration)
5. [Database Setup](#database-setup)
6. [Testing Procedures](#testing-procedures)
7. [Feature Flags & Debug Mode](#feature-flags--debug-mode)
8. [Promotion to Production](#promotion-to-production)
9. [Troubleshooting Guide](#troubleshooting-guide)

---

## 🔄 Staging vs Production Differences

| Aspect | Staging | Production |
|--------|---------|------------|
| **Purpose** | Testing & QA | Live users |
| **Data** | Test/Mock data | Real data |
| **Debug Mode** | Enabled | Disabled |
| **Rate Limits** | Relaxed (200 req/15min) | Strict (100 req/15min) |
| **Log Level** | Debug | Info/Warn |
| **Analytics** | Test analytics | Real analytics |
| **JWT Secret** | Staging secret | Production secret |
| **AWS S3** | Staging bucket | Production bucket |
| **Database** | Staging DB | Production DB |

---

## 🚀 Pre-Deployment Requirements

### Code Preparation
- [ ] Feature branch merged to `staging` or `develop` branch
- [ ] All unit tests passing
- [ ] Code review completed
- [ ] No critical security vulnerabilities
- [ ] Build tested locally

### Infrastructure Prerequisites
- [ ] Staging environment created in Railway
- [ ] Separate PostgreSQL database for staging
- [ ] Separate Redis instance for staging
- [ ] GitHub repository connected

---

## 🔐 Environment Variables

### Backend Service - Staging

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `staging` | Different from production |
| `PORT` | `4000` | Same as production |
| `DATABASE_URL` | `${{Postgres-Staging.DATABASE_URL}}` | Separate staging DB |
| `REDIS_URL` | `${{Redis-Staging.REDIS_URL}}` | Separate staging Redis |
| `JWT_SECRET` | `staging-unique-secret-key` | ⚠️ Different from production |
| `JWT_EXPIRES_IN` | `24h` | Can be shorter for testing |
| `FRONTEND_URL` | `https://frontend-staging.up.railway.app` | Staging frontend |
| `LOG_LEVEL` | `debug` | More verbose logging |
| `RATE_LIMIT_WINDOW_MS` | `900000` | 15 minutes |
| `RATE_LIMIT_MAX_REQUESTS` | `200` | More relaxed for testing |

### Backend Service - AWS S3 (Staging)

| Variable | Value | Notes |
|----------|-------|-------|
| `AWS_ACCESS_KEY_ID` | Staging AWS key | Separate staging account |
| `AWS_SECRET_ACCESS_KEY` | Staging AWS secret | Separate staging account |
| `AWS_REGION` | `us-east-1` | Same region |
| `AWS_S3_BUCKET` | `boutique-advisory-staging-documents` | Separate bucket |

### Backend Service - External Services (Staging)

| Variable | Value |
|----------|-------|
| `DID_API_GATEWAY_URL` | `https://did-gateway-staging.example.com` |
| `CM_PORTAL_URL` | `https://cm-portal-staging.example.com` |
| `RWA_API_URL` | `https://rwa-api-staging.example.com` |
| `TEMPORAL_SERVER_URL` | `temporal-staging.example.com:7233` |

### Frontend Service - Staging

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_API_URL` | `https://backend-staging.up.railway.app` | Staging backend |
| `NEXT_PUBLIC_ENV` | `staging` | Environment identifier |
| `NEXT_PUBLIC_ENABLE_DEBUG_MODE` | `true` | Debug features enabled |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | `true` | Test analytics |
| `NEXT_PUBLIC_APP_NAME` | `BIA Platform (Staging)` | Visual identifier |
| `PORT` | `3000` | Same as production |
| `RAILWAY_SERVICE_ROOT_DIRECTORY` | `/frontend` | Same as production |

---

## ⚙️ Service Configuration

### Staging-Specific Railway Configuration

```json
// Backend railway.json (staging)
{
    "build": { "builder": "NIXPACKS" },
    "deploy": {
        "numReplicas": 1,
        "healthcheckPath": "/health",
        "healthcheckTimeout": 30,
        "restartPolicyType": "ON_FAILURE",
        "restartPolicyMaxRetries": 5
    }
}
```

### Branch Deployment Strategy

| Branch | Environment | Auto-Deploy |
|--------|-------------|-------------|
| `main` | Production | ✅ Yes |
| `staging` or `develop` | Staging | ✅ Yes |
| `feature/*` | None | ❌ No |

### Setting Up Staging Environment in Railway

1. Go to Railway Dashboard → Project
2. Click "New Environment" 
3. Name it "staging"
4. Configure environment variables (different from production)
5. Connect to `staging` or `develop` branch

---

## 🗄️ Database Setup

### Staging Database Guidelines

- [ ] Use **separate database** from production
- [ ] Populate with **test data** (not production data)
- [ ] Reset database periodically (weekly/monthly)
- [ ] Use realistic data volumes for performance testing

### Seed Test Data

```bash
# Navigate to backend directory
cd backend

# Run staging seed script (if available)
npm run db:seed:staging

# Or manually seed with test data
npx prisma db seed
```

### Sample Test Data Script

```typescript
// prisma/seed-staging.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Create test tenant
  const tenant = await prisma.tenant.create({
    data: { name: 'Test Tenant', domain: 'test.example.com' }
  });

  // Create test users for each role
  const roles = ['ADMIN', 'ADVISOR', 'SME', 'INVESTOR'];
  for (const role of roles) {
    await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: `${role.toLowerCase()}@test.com`,
        password: '$2b$10$...', // hashed 'password123'
        firstName: 'Test',
        lastName: role,
        role: role as any,
      }
    });
  }
  
  console.log('Staging seed completed');
}

main();
```

### Database Reset (When Needed)

```bash
# Reset staging database
npx prisma migrate reset --force

# Or drop and recreate
npx prisma db push --force-reset
```

---

## 🧪 Testing Procedures

### Pre-Deployment Testing Checklist

#### Functional Testing
- [ ] User authentication (login/logout/register)
- [ ] Role-based access control (all user types)
- [ ] CRUD operations for SMEs
- [ ] CRUD operations for Investors
- [ ] Deal creation and management
- [ ] Document upload (if S3 configured)
- [ ] Search and filtering
- [ ] Multi-language switching

#### Integration Testing
- [ ] Frontend ↔ Backend API communication
- [ ] Database read/write operations
- [ ] Redis caching (if enabled)
- [ ] External service integrations (if applicable)

#### Performance Testing
- [ ] Page load times < 3 seconds
- [ ] API response times < 500ms
- [ ] No memory leaks during extended use
- [ ] Concurrent user simulation

#### Security Testing
- [ ] Authentication bypass attempts
- [ ] SQL injection tests
- [ ] XSS vulnerability tests
- [ ] RBAC permission verification

### Test Accounts for Staging

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| Admin | admin@test.com | password123 | Full access |
| Advisor | advisor@test.com | password123 | Advisory functions |
| SME | sme@test.com | password123 | SME dashboard |
| Investor | investor@test.com | password123 | Investment view |
| Support | support@test.com | password123 | Read-only |

### API Testing Commands

```bash
# Health check
curl https://backend-staging.up.railway.app/health

# Login test
curl -X POST https://backend-staging.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}'

# Protected endpoint test
curl https://backend-staging.up.railway.app/api/users \
  -H "Authorization: Bearer YOUR_STAGING_TOKEN"

# RBAC test - should fail for wrong role
curl https://backend-staging.up.railway.app/api/admin/users \
  -H "Authorization: Bearer SME_USER_TOKEN"
```

---

## 🚩 Feature Flags & Debug Mode

### Staging-Specific Features

| Feature | Staging | Production |
|---------|---------|------------|
| Debug Mode | ✅ Enabled | ❌ Disabled |
| Verbose Logging | ✅ Enabled | ❌ Disabled |
| API Response Time Headers | ✅ Enabled | ❌ Disabled |
| Mock External Services | ✅ Optional | ❌ Disabled |
| Test Data Endpoints | ✅ Available | ❌ Blocked |

### Debug Mode Benefits

When `NEXT_PUBLIC_ENABLE_DEBUG_MODE=true`:
- Console logs visible
- React DevTools enhanced
- API error details shown
- Performance metrics displayed

### Implementing Feature Flags

```typescript
// Frontend: Check environment
const isStaging = process.env.NEXT_PUBLIC_ENV === 'staging';

if (isStaging) {
  console.log('Debug info:', data);
  // Show additional debug UI
}

// Backend: Check environment
if (process.env.NODE_ENV === 'staging') {
  // Enable test endpoints
  app.use('/api/test', testRoutes);
}
```

---

## 🚀 Promotion to Production

### Pre-Promotion Checklist

- [ ] All staging tests passed
- [ ] No critical bugs identified
- [ ] Performance benchmarks met
- [ ] Security scan completed
- [ ] Product owner approval received
- [ ] Release notes prepared

### Promotion Process

1. **Merge to Main Branch**
   ```bash
   git checkout main
   git merge staging
   git push origin main
   ```

2. **Verify Production Build**
   - Check Railway production deployment
   - Monitor build logs for errors

3. **Run Smoke Tests**
   ```bash
   # Quick health check
   curl https://backend-production-xxx.up.railway.app/health
   
   # Quick login test
   curl -X POST https://backend-production-xxx.up.railway.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"realpassword"}'
   ```

4. **Monitor for 15-30 Minutes**
   - Watch error logs
   - Check performance metrics
   - Verify user reports

### Rollback Trigger Conditions

Immediately rollback if:
- ❌ Build fails
- ❌ Health check fails
- ❌ Login/auth broken
- ❌ Database connection errors
- ❌ Critical API endpoints failing
- ❌ >5% error rate

---

## 🔧 Troubleshooting Guide

### Staging-Specific Issues

#### 1. Staging DB Connection Failed
```
Error: Can't reach staging database
```
**Solution:**
- Verify staging PostgreSQL is running in Railway
- Check `DATABASE_URL` uses staging DB reference
- Ensure staging environment is selected

#### 2. Wrong Environment Loaded
```
Production data appearing in staging
```
**Solution:**
- Verify `NODE_ENV=staging` is set
- Check database URL points to staging DB
- Clear browser cache
- Verify environment selector in Railway

#### 3. Feature Flags Not Working
```
Debug mode not showing
```
**Solution:**
- Verify `NEXT_PUBLIC_ENABLE_DEBUG_MODE=true`
- Rebuild frontend after env change
- Check browser console for errors

#### 4. CORS Errors in Staging
```
Access-Control-Allow-Origin blocked
```
**Solution:**
- Verify `FRONTEND_URL` matches staging frontend URL
- No trailing slash in URL
- Check for http vs https mismatch

#### 5. Test Data Not Loading
```
Empty lists on staging
```
**Solution:**
- Run seed script: `npm run db:seed:staging`
- Check database connection
- Verify tenant exists

### Viewing Staging Logs

```bash
# Railway CLI (if installed)
railway logs -e staging

# Or use Railway Dashboard
# Project → Staging Environment → Service → Logs
```

---

## 📝 Staging URLs

| Service | URL |
|---------|-----|
| **Frontend** | https://frontend-staging.up.railway.app |
| **Backend API** | https://backend-staging.up.railway.app |
| **Health Check** | https://backend-staging.up.railway.app/health |
| **Railway Dashboard** | https://railway.com/project/xxx?environment=staging |

---

## 📅 Staging Maintenance Schedule

| Task | Frequency | Description |
|------|-----------|-------------|
| Database reset | Monthly | Clean up test data |
| Dependency sync | Weekly | Match production dependencies |
| Log cleanup | Weekly | Clear old logs |
| Test data refresh | As needed | Re-seed test data |

---

## ✍️ Staging Deployment Sign-Off

| Role | Name | Date | Result |
|------|------|------|--------|
| Developer | | | ☐ Pass ☐ Fail |
| QA Tester | | | ☐ Pass ☐ Fail |
| Product Owner | | | ☐ Approved ☐ Rejected |

### Notes
_Any issues or observations during staging testing:_

---

**Document Version:** 1.0  
**Last Updated:** December 23, 2024  
**Environment:** Staging  
**Maintained By:** Boutique Advisory Platform Team
