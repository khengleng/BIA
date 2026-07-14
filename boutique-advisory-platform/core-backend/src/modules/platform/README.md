# Module: platform — Dev 5

Bounded context: administration, operations, audit, and reporting/intelligence.

## Owns (migrate from `src/routes/`)
- Admin: `admin.ts`, `admin-action-center.ts`, `admin-cases.ts`, `admin-onboarding.ts`, `admin-role-lifecycle.ts`, `admin-deal-ops.ts`, `admin-investor-ops.ts`, `admin-data-governance.ts`, `admin-security.ts`, `admin-bot.ts`
- Ops & audit: `operations.ts`, `audit.ts`
- Insights: `dashboard.ts`, `reports.ts`, `analytics.ts`, `ai.ts`

## Watch-outs
- Admin routes use nested mount paths (`/api/admin/cases`, `/api/admin/onboarding`, …) — preserve the exact prefixes.
- `admin-reconciliation.ts` is owned by **money** (Dev 3), not here.
- `analytics.ts` currently returns hardcoded zeros (TODO stub) — flag for a follow-up, keep the route.
- Audit logging is best-effort (swallowed errors, in-memory secondary log in `authorize.ts`) — this module should own hardening it toward tamper-evidence.

## Definition of done
- Files under `modules/platform/`, `@/shared/*` imports, `index.ts` exports mounted router with all nested admin prefixes intact, build + tests green.
