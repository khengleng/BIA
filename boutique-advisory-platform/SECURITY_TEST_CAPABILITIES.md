# Security Test Capabilities and Release Gates

This document defines the security-focused testing stack for the Boutique Advisory Platform.

## Scope and Guarantee

No test suite can mathematically guarantee that manipulation is impossible.  
This capability is designed to make manipulation attempts hard to execute, easy to detect, and release-blocking when controls regress.

## Implemented Capabilities

1. Backend authorization and security unit tests
- Location: `/Users/mlh/BIA/boutique-advisory-platform/backend/src/tests`
- Covers:
  - tenant isolation rules
  - admin audit trail behavior
  - RBAC direct/inherited/owner permissions
  - middleware authorization paths (`authorize`, `authorizeAny`, `authorizeAll`, ownership checks)

2. Frontend security logic tests
- Location: `/Users/mlh/BIA/boutique-advisory-platform/frontend/src/tests`
- Covers:
  - permission helper correctness
  - API client CSRF behavior for state-changing requests

3. Manipulation-focused smoke tests (local or Railway)
- Runner: `/Users/mlh/BIA/boutique-advisory-platform/scripts/railway-smoke-security.mjs`
- Checks:
  - `/health` availability and baseline security headers
  - CSRF token issuance
  - unauthenticated access denied for privileged/private endpoints
  - blocked self-registration privilege escalation (`role=ADMIN`)
  - optional role-boundary check with real investor credentials against admin endpoint

4. CI security gates
- Workflow: `/Users/mlh/BIA/boutique-advisory-platform/.github/workflows/security.yml`
- Gates:
  - backend dependency audit (`npm audit --audit-level=high --omit=dev`)
  - frontend dependency audit (`npm audit --audit-level=high --omit=dev`)
  - backend tests
  - frontend tests
  - local smoke-security against a live CI backend
  - optional Railway smoke-security job

## Commands

From repo root (`/Users/mlh/BIA/boutique-advisory-platform`):

1. Run backend tests
```bash
npm run test:backend
```

2. Run frontend tests
```bash
npm run test:frontend
```

3. Run local manipulation smoke checks
```bash
npm run test:smoke
```

4. Run Railway manipulation smoke checks
```bash
SMOKE_BASE_URL="https://your-app.up.railway.app" npm run test:smoke:railway
```

5. Run the core security gate locally
```bash
npm run test:security:gate
```

## Railway Smoke Credentials (Optional, Recommended)

These environment variables enable authenticated boundary checks:

- `SMOKE_INVESTOR_EMAIL`
- `SMOKE_INVESTOR_PASSWORD`

For CI (GitHub Actions secrets), configure:

- `RAILWAY_SMOKE_BASE_URL`
- `RAILWAY_SMOKE_INVESTOR_EMAIL`
- `RAILWAY_SMOKE_INVESTOR_PASSWORD`

## Release Gate Policy

A deployment is release-eligible only if all required gates pass:

1. Dependency audit: no high/critical unresolved findings.
2. Backend test suite passes.
3. Frontend test suite passes.
4. Local smoke-security passes.
5. On `main` (or manual dispatch with `run_railway_smoke=true`): Railway smoke-security passes when secrets are configured.

If any required gate fails, release is blocked.

## Recommended Next Hardening Extensions

1. Add authenticated admin smoke account and tests for cross-role CRUD barriers beyond `/api/admin/users`.
2. Add DAST with OWASP ZAP against staging.
3. Add semgrep or similar SAST policy gate.
4. Add immutable audit-log verification job and alerting checks.
