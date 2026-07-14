# Module: identity — Dev 1

Bounded context: authentication, sessions, 2FA, mobile auth, and RBAC enforcement.

## Owns (migrate from `src/routes/` per ARCHITECTURE.md recipe)
- `auth.ts` — login, register, refresh-token rotation/reuse-detection, password reset, 2FA
- `mobile.ts` — mobile auth/token issuance  ⚠️ **fix the hardcoded fallback JWT secret first** (`const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-bia'`) — remove the fallback, fail fast.

## Also owns (shared kernel pieces this module is the natural steward of)
- `shared/middleware/jwt-auth.ts`, `authorize.ts` — keep in shared kernel; identity is the reviewer of changes to them.

## Definition of done
- Files moved under `modules/identity/`, imports on the `@/shared/*` alias.
- `modules/identity/index.ts` exports the mounted router, preserving `authLimiter` on `/api/auth`.
- `npm run build` clean; auth + RBAC + tenant-isolation tests green.
