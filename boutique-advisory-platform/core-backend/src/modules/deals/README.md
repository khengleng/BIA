# Module: deals — Dev 2

Bounded context: SME/investor entities, deals, matchmaking, diligence, advisory.

## Owns (migrate from `src/routes/`)
- `sme.ts`, `investor.ts`, `deal.ts`
- `matches.ts` (investor↔SME compatibility scoring — note: this is matchmaking, NOT order matching)
- `pipeline.ts` (guarded by `authorizeRoles(...pmoRoles)` — preserve exactly)
- `duediligence.ts`, `deal-due-diligence.ts`, `agreements.ts`
- `advisory.ts`, `admin-advisor-ops.ts`

## Watch-outs
- Preserve duplicate path aliases: `/smes`+`/sme`, `/advisory`+`/advisory-services`+`/advisors`, `/due-diligence`+`/duediligence`.
- `investor.ts` handles KYC PII — coordinate with Dev 3/Security on the encryption module fix (`shared/utils/encryption.ts` all-zero-key fallback + silent decrypt failure).

## Definition of done
- Files under `modules/deals/`, `@/shared/*` imports, `index.ts` exports mounted router with all guards intact, build + tests green.
