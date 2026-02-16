# Go-Live Readiness Checklist

Last updated: 2026-02-16
Release target: TBD
Owner: TBD
Status legend: `Not Started` | `In Progress` | `Blocked` | `Done`

## Release Gate (Go/No-Go)

| Item | Standard Mapping | Owner | Due Date | Status | Evidence |
|---|---|---|---|---|---|
| No open Critical/High security findings | SOC2 CC7, OWASP ASVS | TBD | TBD | Not Started | Link to security report |
| All required CI checks pass on release commit | SOC2 CC8.1 | TBD | TBD | Not Started | CI run URL |
| Tenant isolation tests pass | SOC2 CC6.6, ISO A.8.12 | TBD | TBD | Not Started | Test report URL |
| Incident and DR runbooks approved | SOC2 CC7, ISO A.5.30-A.5.31 | TBD | TBD | Not Started | Approved docs |
| Production secrets and key rotation schedule verified | SOC2 CC6.1, ISO A.8.24 | TBD | TBD | Not Started | Secrets review record |
| Admin action audit trail validated in staging | SOC2 CC7.2 | TBD | TBD | Not Started | Staging evidence |

---

## 1) Identity & Access Management

**Standards:** SOC2 CC6, ISO 27001 Annex A (A.5/A.8), OWASP ASVS V4

| Task | Owner | Due Date | Status | Evidence |
|---|---|---|---|---|
| Add automated tests for cross-tenant admin access denial | TBD | TBD | Done | `backend/src/tests/tenant-isolation.test.ts` |
| Add maker-checker workflow for privileged actions (role change, user deletion, tenant config) | TBD | TBD | Not Started | PR link |
| Complete quarterly access review process for admins/service accounts | TBD | TBD | Not Started | Access review doc |
| Enforce MFA for all ADMIN/SUPER_ADMIN accounts | TBD | TBD | Not Started | Policy + config evidence |

## 2) Authentication & Session Security

**Standards:** OWASP ASVS V2/V3

| Task | Owner | Due Date | Status | Evidence |
|---|---|---|---|---|
| Validate refresh token rotation/replay behavior under load | TBD | TBD | Not Started | Test report |
| Verify cookie/security flags in production environment | TBD | TBD | Not Started | Runtime header/cookie capture |
| Verify forced session revocation on password reset/MFA toggle | TBD | TBD | Not Started | Test logs |

## 3) Tenant Isolation & Data Segregation

**Standards:** SOC2 CC6.6, ISO A.8.12

| Task | Owner | Due Date | Status | Evidence |
|---|---|---|---|---|
| Validate trusted proxy/header config for `x-forwarded-host` at edge | TBD | TBD | Not Started | Infra config snapshot |
| Add negative tests for cross-tenant read/write across admin APIs | TBD | TBD | Not Started | Integration test results |
| Confirm tenant-scoped analytics and admin aggregates except super-admin global views | TBD | TBD | In Progress | API test matrix |

## 4) Application Security Controls

**Standards:** OWASP ASVS V5-V14, OWASP Top 10

| Task | Owner | Due Date | Status | Evidence |
|---|---|---|---|---|
| Reconcile CORS policy docs with runtime behavior and update docs/code | TBD | TBD | Not Started | PR + docs update |
| Add dependency vulnerability scanning gate (fail on critical) | TBD | TBD | Done | `.github/workflows/security.yml` |
| Add static analysis (SAST) in CI for backend/frontend | TBD | TBD | Done | `.github/workflows/codeql.yml` |
| Review and minimize CSP allowlist for production | TBD | TBD | Not Started | Security review notes |

## 5) Data Protection & Privacy

**Standards:** SOC2 CC8, ISO A.8.11, PCI-aligned data protection

| Task | Owner | Due Date | Status | Evidence |
|---|---|---|---|---|
| Confirm ENCRYPTION_KEY managed via KMS/Secrets Manager in production | TBD | TBD | In Progress | `PROD_SECRETS_EVIDENCE.md` |
| Validate encrypted backups and restore process | TBD | TBD | Not Started | Backup/restore drill report |
| Define PII retention/deletion schedule and enforce it | TBD | TBD | Not Started | Policy doc + job config |
| Verify least-privilege access to decrypted KYC data | TBD | TBD | Not Started | Access policy + test |

## 6) Payments & Financial Controls

**Standards:** PCI DSS practical SAQ A controls

| Task | Owner | Due Date | Status | Evidence |
|---|---|---|---|---|
| Confirm no PAN/card data is stored or logged in platform | TBD | TBD | Not Started | Data flow review |
| Validate webhook signature and replay protections for payment/KYC providers | TBD | TBD | Not Started | Security test report |
| Implement daily reconciliation SOP for payments/disputes | TBD | TBD | Not Started | Finance runbook |

## 7) Auditability & Compliance Evidence

**Standards:** SOC2 CC7, ISO A.5.28

| Task | Owner | Due Date | Status | Evidence |
|---|---|---|---|---|
| Centralize immutable audit logs for admin/security events | TBD | TBD | In Progress | `backend/src/middleware/authorize.ts`, `backend/src/routes/audit.ts` |
| Define release evidence package (tests, scans, approvals, migrations) | TBD | TBD | Not Started | Checklist artifact |
| Define incident severity matrix and mandatory timeline logging | TBD | TBD | Not Started | Incident policy |

## 8) Reliability, DR, and Operations

**Standards:** SOC2 CC7, ISO A.5.30-A.5.31

| Task | Owner | Due Date | Status | Evidence |
|---|---|---|---|---|
| Define and approve SLOs (uptime, latency, error rate) | TBD | TBD | Not Started | SLO doc |
| Define RTO/RPO targets and execute DR test | TBD | TBD | Not Started | DR drill report |
| Publish incident response runbook and on-call escalation | TBD | TBD | Not Started | Runbook link |
| Implement alerting thresholds for critical services | TBD | TBD | Not Started | Monitoring dashboards |

## 9) Change Management & Release Safety

**Standards:** SOC2 CC8.1

| Task | Owner | Due Date | Status | Evidence |
|---|---|---|---|---|
| Require PR approvals for auth/admin/payment/tenant files | TBD | TBD | Not Started | Branch protection settings |
| Enforce required CI checks before merge | TBD | TBD | Not Started | GitHub ruleset |
| Document rollback steps including DB migration strategy | TBD | TBD | Not Started | Release runbook |

## 10) Product & Business Operations Readiness

**Standards:** Practical business operations / regulated marketplace practice

| Task | Owner | Due Date | Status | Evidence |
|---|---|---|---|---|
| Publish KYC/AML SOP (manual override, escalation, evidence retention) | TBD | TBD | Not Started | SOP document |
| Publish customer support SOP for deletion/recovery/disputes | TBD | TBD | Not Started | SOP document |
| Publish admin operations handbook for user lifecycle actions | TBD | TBD | Not Started | Handbook |

---

## Current Technical Snapshot (as of 2026-02-16)

- Tenant-scoped admin isolation: **In Progress** (major route fixes completed)
- User management delete lifecycle: **In Progress** (soft-delete + archive flow implemented)
- Frontend/backed build health: **Passing**
- CI security workflow: **Baseline present**, needs expanded gates (SAST/dependency policy)
- Compliance/ops documentation: **Not complete**

## Sign-off

| Role | Name | Signature | Date |
|---|---|---|---|
| Engineering Lead | TBD |  |  |
| Security Lead | TBD |  |  |
| Product Owner | TBD |  |  |
| Operations Lead | TBD |  |  |
