# Admin Audit Trail Validation

Use this checklist as evidence for go-live gate #6.

Date:
Environment (staging URL):
Tester:

## Preconditions

- Staging environment is running latest release candidate.
- Admin and non-admin test users exist in same tenant.

## Automated Test Evidence

Run backend tests:

```bash
cd backend
npm test
```

Required passing tests:
- `Admin audit trail logs denied privileged action attempts`
- `Admin audit trail can log allowed checks when enabled`

## Manual Staging Validation

1. Login as non-admin test user.
2. Attempt privileged admin action (example: change another user status).
3. Confirm request is denied (HTTP 403).
4. Login as admin test user.
5. Perform privileged admin action (example: suspend user in same tenant).
6. Call audit endpoint:
   - `GET /api/audit`
7. Confirm both events exist in logs:
   - denied entry for non-admin attempt
   - allowed/admin entry for successful action

## Evidence

- Denied response screenshot:
- Successful admin action screenshot:
- `/api/audit` response capture:
- Tester sign-off:
