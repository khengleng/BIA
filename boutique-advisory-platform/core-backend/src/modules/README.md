# Modules

Bounded contexts of the modular monolith. See `../../ARCHITECTURE.md` for the
rationale, boundary rules, and the compiler-gated migration recipe.

| Module | Dev | Surface |
|---|---|---|
| `identity/` | 1 | auth, mobile-auth, 2FA, sessions, RBAC |
| `deals/` | 2 | sme, investor, deal, matches, pipeline, diligence, advisory |
| `money/` | 3 | wallet, payments, escrow, cashflow, secondary-trading, syndication, reconciliation |
| `collaboration/` | 4 | document, dataroom, community, messages, calendar, notifications |
| `platform/` | 5 | admin-*, operations, audit, dashboard, reports, analytics, ai |

Rules of engagement:
- A module never imports another module's internals. Cross-module access goes
  through a published interface or the shared kernel (`../shared/**`).
- The shared kernel imports nothing from `modules/**`.
- `index.ts` (composition root) is owned by the SA/integrator; module devs own
  only their own folder. Module folders are disjoint → parallel work, no conflicts.
