# Module: money — Dev 3  ⚠️ HIGHEST RISK

Bounded context: wallet, payments, escrow, cashflow, secondary trading, syndication, reconciliation. This module moves real money — treat every change as compile- AND test-gated.

## Owns (migrate from `src/routes/`)
- `wallet.ts`, `payments.ts`, `escrow.ts`, `cashflow.ts`
- `secondary-trading.ts`, `syndicates.ts`, `syndicate-tokens.ts`, `launchpad.ts`
- `webhooks.ts` (ABA/Sumsub callbacks — raw-body verification), `disputes.ts`
- `admin-reconciliation.ts`

## Carry the known financial-control defects into this module's backlog (do NOT ship money live until fixed)
1. No double-entry ledger; balances are mutable `Float` fields — introduce a balanced ledger with integer minor units and an operator/fee account.
2. Platform/success fees computed then credited to no account (revenue leak) — book them.
3. Payment callbacks are check-then-act (double-credit race) — make settlement atomic/idempotent (conditional update / row lock).
4. Escrow deposit skips payment verification; deposits/withdrawals are simulated stubs — wire real ABA settlement.
5. No PSP↔ledger reconciliation; the bank's real txn reference is never stored.
6. KHR unsupported (USD hardcoded, 2-dp rounding).

## Definition of done (for the restructure step)
- Files under `modules/money/`, `@/shared/*` imports, `index.ts` exports mounted router (preserve `authenticateToken` guards; `/api/webhooks` stays unauthenticated by design — verify signature instead), build clean.
- **Add money-path tests** (currently zero) as part of this module's charter.
