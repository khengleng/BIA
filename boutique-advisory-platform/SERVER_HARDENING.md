# Server Hardening & Deployment Security Guide

## Boutique Advisory Platform

This guide covers all server hardening and deployment security measures implemented for the platform.

---

## 1. Container Hardening (Dockerfile)

### Multi-Stage Build
The Dockerfile uses a multi-stage build to minimize the final image size and attack surface:

```dockerfile
# Stage 1: Build (includes devDependencies)
FROM node:20-slim AS builder
# Build TypeScript, generate Prisma client

# Stage 2: Production (minimal)
FROM node:20-slim AS production
# Only production dependencies and compiled code
```

### Security Features

| Feature | Implementation |
|---------|---------------|
| **Non-root user** | Application runs as `appuser` (UID 1001) |
| **Minimal image** | Uses `node:20-slim` base (~150MB vs ~900MB full) |
| **dumb-init** | Proper signal handling for graceful shutdown |
| **Read-only files** | Application files have 550 permissions |
| **No sensitive files** | .env, .git, src removed from production image |
| **Health checks** | Built-in Docker HEALTHCHECK |

### File Permissions
```
/app (application code): 550 (read + execute only)
/app/uploads (file uploads): 770 (read + write + execute)
/app/logs (log files): 770 (read + write + execute)
```

---

## 2. Runtime Security Validation

On every server startup, the following checks are performed:

### Critical Checks (Server won't start if failed)
- ✅ JWT_SECRET is set and strong (32+ characters)
- ✅ JWT_SECRET is not a default/weak value
- ✅ DATABASE_URL is configured
- ✅ Database is not localhost in production

### High Priority Checks (Warnings logged)
- ⚠️ FRONTEND_URL set for CORS
- ⚠️ Database SSL mode enabled
- ⚠️ Cookie security settings
- ⚠️ Rate limiting configuration

### Medium Priority Checks
- ℹ️ HTTPS/HSTS configuration
- ℹ️ Session configuration
- ℹ️ Logging configuration

---

## 3. Network Security

### Railway Platform (Managed)
When deployed to Railway, these are automatically handled:
- **HTTPS/TLS**: All traffic encrypted with Let's Encrypt certificates
- **DDoS Protection**: Railway's edge network provides protection
- **Isolation**: Containers run in isolated environments

### Application Level
| Protection | Implementation |
|------------|----------------|
| **Rate Limiting** | 100 req/15min (production) |
| **Auth Rate Limiting** | 10 req/15min for login attempts |
| **Role-based Limits** | Different limits per user role |
| **Request Size Limit** | 10MB max for JSON/form data |
| **IP Blocking** | Automatic for malicious activity |

---

## 4. Database Security

### Connection Security
```bash
# Production DATABASE_URL should include:
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

### Prisma Security
- Parameterized queries (SQL injection prevention)
- Connection pooling for stability
- Automatic connection cleanup

### Password Storage
- bcrypt with 12 rounds (adaptive cost)
- Salted hashes (built into bcrypt)
- No plaintext passwords logged

---

## 5. Environment Variables

### Required for Production
```bash
# Strong JWT secret (64 hex chars recommended)
JWT_SECRET=<generate with: openssl rand -hex 64>

# Initial admin password (12+ chars, complex)
INITIAL_ADMIN_PASSWORD=<strong password>

# Frontend URL for CORS
FRONTEND_URL=https://your-app.railway.app

# Production mode
NODE_ENV=production

# Port (Railway provides this)
PORT=4000
```

### Security Rules
1. **Never commit** `.env` files with real values
2. **Use secrets manager** for sensitive values in CI/CD
3. **Rotate secrets** periodically (JWT_SECRET every 90 days)
4. **Different secrets** for each environment

---

## 6. Middleware Security Stack

The following middleware runs on every request:

```
Request → Request ID → Security Headers → IP Check → SQL Injection → XSS → Rate Limit → Route
```

### Order of Execution
1. **Request ID**: Assigns unique ID for tracing
2. **Helmet**: Security headers (CSP, HSTS, etc.)
3. **Security Headers**: Additional headers
4. **IP Security**: Block known malicious IPs
5. **SQL Injection**: Detect and block patterns
6. **XSS Prevention**: Detect and block script injection
7. **CORS**: Validate request origin
8. **Rate Limiting**: Prevent abuse
9. **Authentication**: Validate JWT tokens
10. **Authorization**: Check role permissions

---

## 7. Secrets Management

### Development
- Use `.env` file (gitignored)
- Use default/weak secrets locally

### Production (Railway)
```bash
# Set via CLI
railway variables --set "JWT_SECRET=$(openssl rand -hex 64)"
railway variables --set "INITIAL_ADMIN_PASSWORD=YourStr0ng!P@ss"

# Or via Railway Dashboard
# Settings → Variables → Add Variable
```

### Best Practices
- Use Railway's "vault" for shared secrets
- Reference database credentials with variable references
- Use service-to-service networking (internal URLs)

---

## 8. Logging & Monitoring

### Audit Logging
All security-relevant events are logged:
- Authentication attempts (success/failure)
- Authorization failures
- Rate limit violations
- SQL injection attempts
- XSS attempts
- IP blocks

### Log Format (Production)
```json
{
  "type": "AUDIT_LOG",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "userId": "user_123",
  "action": "LOGIN_FAILED",
  "resource": "auth",
  "ipAddress": "192.168.1.1",
  "success": false,
  "errorMessage": "Invalid credentials"
}
```

### Log Destinations
- Console (Railway captures automatically)
- Railway Logs (searchable in dashboard)
- Optional: External SIEM integration

---

## 9. Health Checks

### Endpoints
| Endpoint | Purpose | Auth Required |
|----------|---------|---------------|
| `GET /health` | Basic health + DB status | No |
| `GET /api/migration/status` | Migration status | No |

### Docker Health Check
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:4000/health', ...)"
```

### Railway Health Check
Configured in `railway.json`:
```json
{
  "deploy": {
    "healthcheckPath": "/health"
  }
}
```

---

## 10. Graceful Shutdown

### Signal Handling
The application handles:
- `SIGTERM`: Kubernetes/Railway shutdown signal
- `SIGINT`: Ctrl+C in development
- `beforeExit`: Node.js process exit

### Shutdown Sequence
1. Stop accepting new requests
2. Complete in-flight requests (30s timeout)
3. Close database connections
4. Flush logs
5. Exit process

---

## 11. Error Handling

### Production Error Responses
```json
{
  "error": "Internal server error",
  "message": "Something went wrong"
}
```
- No stack traces exposed
- No internal error details
- Request ID included for debugging

### Development Error Responses
```json
{
  "error": "Internal server error",
  "message": "Detailed error message for debugging"
}
```

---

## 12. Deployment Checklist

### Pre-Deployment
- [ ] All TypeScript compiles (`npx tsc --noEmit`)
- [ ] Security validator passes
- [ ] Environment variables configured
- [ ] Database provisioned and accessible
- [ ] Dockerfile builds successfully

### Post-Deployment
- [ ] Health check passing
- [ ] Can log in with initial admin
- [ ] Change initial admin password
- [ ] Enable 2FA for admin accounts
- [ ] Verify rate limiting works
- [ ] Test authentication flows
- [ ] Review initial audit logs

### Ongoing
- [ ] Monitor audit logs weekly
- [ ] Rotate JWT_SECRET every 90 days
- [ ] Update dependencies monthly
- [ ] Review access logs for anomalies
- [ ] Test backup restoration quarterly

---

## 13. Railway-Specific Security

### Platform Security
- Isolated containers (no host access)
- Automatic HTTPS with managed certificates
- Private networking between services
- Secrets encrypted at rest
- SOC 2 compliant infrastructure

### Best Practices for Railway
1. Use private networking for database connections
2. Don't expose database publicly
3. Use variable references instead of hardcoded values
4. Enable 2FA on your Railway account
5. Use teams and role-based access for organization projects

---

## 14. Incident Response

### Security Event Categories
| Severity | Example | Response |
|----------|---------|----------|
| **P1 - Critical** | Data breach, auth bypass | Immediate, notify users |
| **P2 - High** | Brute force detected | Block IP, investigate |
| **P3 - Medium** | Rate limit abuse | Monitor, possible block |
| **P4 - Low** | Invalid login attempts | Log and monitor |

### Response Steps
1. **Detect**: Monitor audit logs and alerts
2. **Contain**: Block IP, revoke tokens, disable accounts
3. **Investigate**: Trace request IDs in logs
4. **Remediate**: Patch vulnerability, update configs
5. **Report**: Document incident, notify stakeholders

---

## Contact

For security issues: security@boutique-advisory.com
For deployment support: devops@boutique-advisory.com
