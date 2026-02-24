# Source Code Review Notes

## Scope
- `boutique-advisory-platform/backend/src/routes/auth.ts`
- `boutique-advisory-platform/backend/src/middleware/jwt-auth.ts`
- `boutique-advisory-platform/backend/src/utils/security.ts`

## Findings

### 1) High: Audit logs can be written to a synthetic `default` tenant
`logAuditEvent` writes `tenantId` as `entry.details?.tenantId || 'default'`. Most call sites do not pass `tenantId`, so sensitive audit events may be attributed to a synthetic tenant and become incomplete for compliance and forensic reporting.

**Risk:** Multi-tenant audit trail integrity is weakened.

**Recommendation:** Resolve tenant from the user record (`entry.userId`) or require `tenantId` as a first-class field in `AuditLogEntry` and reject/flag writes when missing.

### 2) Medium: Re-registration archival query may match unintended users
Registration cleanup uses `OR: [equals(email), contains(email)]` before archiving old records. The `contains` branch can match unrelated user rows where email includes the substring, and those rows can then be mutated to `DELETED` + rewritten email.

**Risk:** Unintended account mutation/data corruption in edge cases.

**Recommendation:** Remove `contains` matching and only target exact email collisions (case-insensitive), plus explicit legacy markers if needed.

### 3) Medium: Auth middleware does not enforce tenant consistency from token
`authenticateToken` verifies JWT then loads user by `decoded.userId` only; `decoded.tenantId` is not checked against DB user tenant or request tenant context.

**Risk:** In a token misuse/stolen-token scenario, tenant boundary checks depend on downstream route logic instead of the auth boundary.

**Recommendation:** Validate `decoded.tenantId === user.tenantId` during auth middleware and fail closed on mismatch.

### 4) Medium: Encryption key fallback allows insecure runtime defaults
If `ENCRYPTION_KEY` is absent, code silently falls back to a hardcoded dummy key and continues.

**Risk:** Sensitive data may be encrypted under a known key in misconfigured environments.

**Recommendation:** Fail fast on startup when `ENCRYPTION_KEY` is missing in non-test environments.
