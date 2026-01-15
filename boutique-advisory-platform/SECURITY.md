# Security Implementation Guide

## Boutique Advisory Platform - Security Features

This document outlines the security features implemented in the platform.

---

## 1. Authentication Security

### Password Requirements
- **Minimum length**: 12 characters
- **Complexity**: Must include uppercase, lowercase, numbers, and special characters
- **Hashing**: bcrypt with 12 rounds (adaptive cost factor)

### JWT Tokens
- **Algorithm**: HS256
- **Expiry**: 24 hours
- **Secure storage**: HttpOnly cookies recommended for production

### Account Lockout
- **Threshold**: 5 failed login attempts
- **Lockout duration**: 15 minutes
- **Applies to**: Both email and IP address

---

## 2. Two-Factor Authentication (2FA)

### TOTP Support
- **Algorithm**: SHA-1 (RFC 6238 compliant)
- **Period**: 30 seconds
- **Digits**: 6
- **Compatible with**: Google Authenticator, Authy, Microsoft Authenticator

### Backup Codes
- **Count**: 10 codes per user
- **Format**: XXXX-XXXX (alphanumeric)
- **Storage**: SHA-256 hashed

### 2FA Endpoints
```
POST /api/auth/2fa/setup     - Generate TOTP secret
POST /api/auth/2fa/verify    - Verify TOTP code
POST /api/auth/2fa/disable   - Disable 2FA
POST /api/auth/2fa/backup    - Generate backup codes
```

---

## 3. Input Validation & Sanitization

### SQL Injection Prevention
The platform detects and blocks common SQL injection patterns:
- Union-based attacks
- Comment injection
- Stacked queries
- Boolean-based blind injection

### XSS Prevention
Blocked patterns include:
- Script tags
- Event handlers (onclick, onload, etc.)
- JavaScript URIs
- Iframe/object/embed tags

### Email Validation
- Format validation with regex
- Lowercase normalization
- XSS character stripping

---

## 4. Rate Limiting

### Global Rate Limits
| Endpoint | Window | Max Requests |
|----------|--------|--------------|
| API (general) | 15 min | 100 (prod) / 1000 (dev) |
| Auth endpoints | 15 min | 10 (prod) / 100 (dev) |

### Role-Based Rate Limits
| Role | Window | Max Requests/min |
|------|--------|------------------|
| ADMIN | 1 min | 1000 |
| ADVISOR | 1 min | 500 |
| INVESTOR | 1 min | 300 |
| SME | 1 min | 200 |
| Anonymous | 1 min | 60 |

---

## 5. Security Headers

All responses include:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=()
```

API responses additionally include:
```
Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate
Pragma: no-cache
Expires: 0
```

In production (HSTS):
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

---

## 6. Audit Logging

### Logged Events
| Action | Trigger |
|--------|---------|
| LOGIN_SUCCESS | Successful authentication |
| LOGIN_FAILED | Invalid credentials |
| LOGIN_BLOCKED | Account locked or inactive |
| REGISTER_ATTEMPT | Registration attempt |
| PASSWORD_RESET_REQUESTED | Password reset initiated |
| PASSWORD_RESET_SUCCESS | Password successfully reset |
| PASSWORD_CHANGE_SUCCESS | Password changed by user |
| SQL_INJECTION_ATTEMPT | SQL injection pattern detected |
| XSS_ATTEMPT | XSS pattern detected |
| RATE_LIMIT_EXCEEDED | Rate limit reached |
| BLOCKED_IP_ACCESS | Blocked IP tried to access |

### Log Format
```json
{
  "type": "AUDIT_LOG",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "userId": "user_123",
  "action": "LOGIN_SUCCESS",
  "resource": "auth",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "success": true
}
```

---

## 7. CORS Configuration

### Production Settings
- **Allowed Origins**: Explicitly whitelisted (FRONTEND_URL env var)
- **Credentials**: Enabled
- **Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Headers**: Content-Type, Authorization, X-Requested-With, Accept, X-CSRF-Token
- **Max Age**: 24 hours (preflight caching)

### Development Settings
- Allows localhost variants
- Allows requests without origin (Postman, mobile apps)

---

## 8. Data Protection

### Sensitive Data Masking
The following fields are automatically redacted in logs:
- password, currentPassword, newPassword
- token, accessToken, refreshToken, apiKey
- creditCard, cardNumber, cvv, ssn
- totpCode, backupCode, otp

### Role-Based Data Masking
API responses are masked based on user role:
- Financial data (funding amounts, valuations)
- Personal identifiers (national ID, tax ID)
- Contact information (email, phone)

---

## 9. Request Tracing

Every request is assigned a unique ID:
```
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
```

Use this ID for:
- Debugging
- Log correlation
- Support tickets

---

## 10. IP Security

### Automatic Blocking
IPs are blocked for:
- Repeated SQL injection attempts
- Repeated XSS attempts
- Excessive failed logins

### Manual IP Management
```typescript
import { blockIp, unblockIp } from './middleware/securityMiddleware';

blockIp('192.168.1.100');    // Block an IP
unblockIp('192.168.1.100');  // Unblock an IP
```

---

## 11. Environment Variables (Security)

### Required for Production
```bash
# Strong secret (min 64 hex chars)
JWT_SECRET=<generate with: openssl rand -hex 64>

# Initial admin password (min 12 chars, complex)
INITIAL_ADMIN_PASSWORD=<strong password>

# Frontend URL for CORS
FRONTEND_URL=https://your-app.railway.app

# Production mode
NODE_ENV=production
```

### Never Commit
- `.env` files with real values
- API keys or secrets
- Database credentials

---

## 12. Security Checklist for Deployment

### Pre-Deployment
- [ ] Remove all hardcoded credentials
- [ ] Set strong JWT_SECRET (64+ chars)
- [ ] Set strong INITIAL_ADMIN_PASSWORD
- [ ] Configure FRONTEND_URL for CORS
- [ ] Enable NODE_ENV=production
- [ ] Review and test rate limits
- [ ] Test authentication flows

### Post-Deployment
- [ ] Change initial admin password immediately
- [ ] Enable 2FA for all admin accounts
- [ ] Review audit logs regularly
- [ ] Set up log forwarding to SIEM
- [ ] Configure backup procedures
- [ ] Set up monitoring alerts

---

## 13. Incident Response

### Security Event Detection
Monitor for:
- Spike in LOGIN_FAILED events
- SQL_INJECTION_ATTEMPT or XSS_ATTEMPT logs
- RATE_LIMIT_EXCEEDED from same IP
- Unusual access patterns

### Response Actions
1. **Block IP** if malicious activity confirmed
2. **Force password reset** for compromised accounts
3. **Revoke tokens** if account compromised
4. **Review audit logs** for scope assessment
5. **Notify users** if data exposed

---

## Contact

For security issues, contact: security@boutique-advisory.com
