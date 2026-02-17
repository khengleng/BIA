# Security Best Practices Report

## Executive Summary

The platform has strong foundational controls (JWT auth, CSRF middleware, route protection wrappers), but there are several high-impact authorization and tenant-isolation gaps that can enable manipulation or sensitive data exposure by any authenticated user.  
Most critical risks are in route-level access control and tenant resolution trust boundaries.

## Findings

### [CRIT-001] Pipeline endpoints allow unauthorized deal manipulation and broad data exposure
- Severity: Critical
- Location:
  - `/Users/mlh/BIA/boutique-advisory-platform/backend/src/routes/pipeline.ts:8`
  - `/Users/mlh/BIA/boutique-advisory-platform/backend/src/routes/pipeline.ts:66`
  - `/Users/mlh/BIA/boutique-advisory-platform/backend/src/index.ts:376`
- Evidence:
  - Pipeline routes are mounted with `authenticateToken` only.
  - `GET /deals` returns `prisma.deal.findMany(...)` without tenant or ownership filter.
  - `PUT /deals/:id/stage` updates any deal by ID without role/permission checks.
- Impact:
  - Any authenticated user can enumerate broad deal data and potentially change pipeline stage for deals they do not own.
  - This is direct broken access control and allows workflow manipulation.
- Fix:
  - Add `authorize(...)` checks for list/update.
  - Enforce tenant and ownership constraints in query filters (`where: { tenantId, ... }`).
  - Add invariant tests for “user cannot modify unrelated deal.”
- Mitigation:
  - Temporary WAF/API gateway block for `/api/pipeline/deals/:id/stage` except admin/advisor roles.
- False positive notes:
  - If route is intended as admin-only, code currently does not enforce that.

### [HIGH-002] Tenant can be spoofed via `x-forwarded-host` trust in tenant resolution
- Severity: High
- Location:
  - `/Users/mlh/BIA/boutique-advisory-platform/backend/src/utils/auth-utils.ts:77`
  - `/Users/mlh/BIA/boutique-advisory-platform/backend/src/utils/auth-utils.ts:84`
  - `/Users/mlh/BIA/boutique-advisory-platform/backend/src/index.ts:145`
- Evidence:
  - `getTenantId` reads `req.headers['x-forwarded-host']` directly and derives tenant from it.
  - Proxy trust is globally enabled (`app.set('trust proxy', 1)`), but header is consumed directly rather than via trusted proxy-derived host.
- Impact:
  - If deployment/proxy path allows attacker-controlled forwarded host headers, attacker can force tenant context and cross-tenant auth operations.
- Fix:
  - Do not read raw `x-forwarded-host`; use a trusted source (`req.hostname`) after strict proxy config.
  - Enforce allowlist of known domains/tenant mappings.
  - Reject unknown tenant domains rather than fallbacking silently.
- Mitigation:
  - Strip forwarded host headers at edge and set canonical host headers from gateway only.
- False positive notes:
  - Risk is lower if edge always overwrites forwarded headers and backend is not directly reachable.

### [HIGH-003] Stored XSS risk in agreement content rendering
- Severity: High
- Location:
  - `/Users/mlh/BIA/boutique-advisory-platform/backend/src/routes/agreements.ts:12`
  - `/Users/mlh/BIA/boutique-advisory-platform/backend/src/routes/agreements.ts:77`
  - `/Users/mlh/BIA/boutique-advisory-platform/frontend/src/components/AgreementSigning.tsx:169`
- Evidence:
  - Agreement content accepts HTML/Markdown and is stored as-is.
  - Frontend renders with `dangerouslySetInnerHTML` without visible sanitization.
- Impact:
  - A malicious user who can create/edit agreements can inject script payloads that execute in other users’ browsers (session-riding, data exfiltration, action forgery).
- Fix:
  - Sanitize HTML server-side before persistence and/or client-side before render (strict allowlist sanitizer).
  - Prefer rendering markdown via safe renderer with HTML disabled.
  - Add CSP hardening specific to script injection defense.
- Mitigation:
  - Temporarily disable raw HTML rendering for agreements.
- False positive notes:
  - If upstream guarantees sanitized content (not visible here), verify that contract and tests.

### [HIGH-004] Cross-tenant messaging isolation is explicitly bypassed
- Severity: High
- Location:
  - `/Users/mlh/BIA/boutique-advisory-platform/backend/src/routes/messages.ts:29`
  - `/Users/mlh/BIA/boutique-advisory-platform/backend/src/routes/messages.ts:31`
  - `/Users/mlh/BIA/boutique-advisory-platform/backend/src/routes/messages.ts:21`
- Evidence:
  - Code comment states tenant is intentionally ignored when searching existing conversations.
  - Recipient lookup and conversation start do not enforce same-tenant or policy-based cross-tenant allowance.
- Impact:
  - Authenticated users may create or traverse communication links across tenant boundaries, violating isolation assumptions and enabling metadata leakage/social engineering.
- Fix:
  - Enforce tenant-aware policy checks before conversation creation/access.
  - If cross-tenant messaging is a feature, enforce explicit allow rules (deal/shared context) and audit logs.
- Mitigation:
  - Block cross-tenant recipient IDs until explicit policy exists.
- False positive notes:
  - Could be intended behavior; if so, document policy and add explicit authorization checks.

### [MED-005] Analytics/stat overview endpoints lack explicit permission checks and tenant scoping
- Severity: Medium
- Location:
  - `/Users/mlh/BIA/boutique-advisory-platform/backend/src/routes/duediligence.ts:388`
  - `/Users/mlh/BIA/boutique-advisory-platform/backend/src/routes/syndicates.ts:557`
  - `/Users/mlh/BIA/boutique-advisory-platform/backend/src/routes/duediligence.ts:403`
  - `/Users/mlh/BIA/boutique-advisory-platform/backend/src/routes/syndicates.ts:571`
- Evidence:
  - Stats endpoints are accessible to any authenticated user (no `authorize(...)` middleware).
  - Queries perform global counts without tenant filters.
- Impact:
  - Sensitive business telemetry can be exposed across tenants/roles.
- Fix:
  - Add `authorize('...')` middleware for appropriate roles.
  - Scope counts/aggregates by tenant and role visibility.
  - Add negative tests for unauthorized roles and tenant leakage.
- Mitigation:
  - Restrict these routes at API gateway level to admin/advisor roles.
- False positive notes:
  - If intentionally global/public-for-authenticated-users, add documentation and governance approval.

## Open Questions / Assumptions

1. Is strict tenant isolation a hard requirement for messages and analytics? Existing code suggests yes in other modules.
2. Is backend directly reachable from internet (bypassing trusted proxy)? This materially affects forwarded-header spoofing risk.
3. Is agreement content sanitized upstream before API persistence? No evidence found in this repo.

## Immediate Remediation Priority

1. Fix pipeline authorization and tenant filters (`CRIT-001`).
2. Fix tenant resolution trust boundary (`HIGH-002`).
3. Remove/contain unsafe agreement HTML rendering (`HIGH-003`).
4. Enforce explicit messaging tenant policy (`HIGH-004`).
5. Lock stats endpoints to authorized roles and tenant scopes (`MED-005`).
