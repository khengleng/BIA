# Production Secrets Evidence

Use this document as formal evidence for go-live gate #5.

Date:
Environment:
Reviewer:

## Required Inputs

- `JWT_SECRET`
- `ENCRYPTION_KEY`
- `COOKIE_SECRET`
- `DATABASE_URL` (must include `sslmode=require`)
- `FRONTEND_URL`
- `JWT_SECRET_ROTATED_AT` (YYYY-MM-DD)
- `ENCRYPTION_KEY_ROTATED_AT` (YYYY-MM-DD)
- `COOKIE_SECRET_ROTATED_AT` (YYYY-MM-DD)

## Validation Command

```bash
cd backend
NODE_ENV=production \
JWT_SECRET=\"...\" \
ENCRYPTION_KEY=\"...\" \
COOKIE_SECRET=\"...\" \
FRONTEND_URL=\"https://...\" \
DATABASE_URL=\"postgresql://...?...sslmode=require\" \
JWT_SECRET_ROTATED_AT=\"YYYY-MM-DD\" \
ENCRYPTION_KEY_ROTATED_AT=\"YYYY-MM-DD\" \
COOKIE_SECRET_ROTATED_AT=\"YYYY-MM-DD\" \
npm run security:prod-secrets
```

Expected output:
- `Production secret policy validation passed.`

## Evidence

- Validation output attached:
- Secret manager screenshot/record attached:
- Rotation ticket/reference:
- Reviewer approval:
