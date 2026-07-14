# core-backend — Modular Monolith Architecture

**Status:** consolidation complete; internal module restructure in progress.

## Why a modular monolith (not microservices)

The platform previously shipped as 8 backend deployables (`identity/wallet/funding/
market/advisory/document-service` + `trade-api` + `core-backend`) that **shared one
byte-identical Prisma schema and one database**. That is a *distributed monolith*:
every cost of microservices (N deploys, network hops, config drift, duplicated
public webhooks) with none of the benefits (independent data ownership, independent
scaling, fault isolation). Every satellite route already existed inside
`core-backend`, so the satellites were deleted (commit `2ded08e7`).

We are standardizing on **one backend deployable, internally partitioned into
bounded modules**. This gives clean boundaries and transactional integrity (critical
for the ledger) today, and preserves the option to extract any single module into a
true service *with its own database* later — which is exactly what good module
boundaries enable.

```
core-backend (one deploy, one DB)
└── src/
    ├── modules/           # bounded contexts (owned by module devs)
    │   ├── identity/      # Dev 1 — auth, mobile-auth, sessions, 2FA, RBAC guards
    │   ├── deals/         # Dev 2 — sme, investor, deal, matches, pipeline,
    │   │                  #         duediligence, agreements, advisory
    │   ├── money/         # Dev 3 — wallet, payments, escrow, cashflow,
    │   │                  #         secondary-trading, syndicates, launchpad,
    │   │                  #         webhooks, disputes, reconciliation  (HIGH RISK)
    │   ├── collaboration/ # Dev 4 — document, dataroom, community, messages,
    │   │                  #         calendar, notifications
    │   └── platform/      # Dev 5 — admin-*, operations, audit, dashboard,
    │                      #         reports, analytics, ai
    ├── shared/            # shared kernel — imported by every module, owns nothing
    │   (lib, middleware, utils, services, config, database, redis, socket)
    └── index.ts           # composition root — mounts each module's router
```

Adjacent deployables kept as separate processes (legitimately separate concerns):
- **twallet-bff-service** — thin mobile backend-for-frontend / edge gateway.
- **mobile-bot-service** — Telegram bot worker.

## Module boundary rules

1. A module owns its `routes/` and `services/` and its slice of the domain.
2. Modules **must not import another module's internals.** Cross-module needs go
   through a published interface (a service exported from the module's `index.ts`)
   or through the shared kernel. There are currently **0 route→route imports**, so
   the starting boundary is clean — keep it that way.
3. The shared kernel (`src/shared/**` — formerly `lib/middleware/utils/services`)
   may be imported by anyone but must not import from `modules/**`.
4. One Prisma schema remains the single source of truth (`prisma/schema.prisma`).
   Module data ownership is enforced by convention/review until/unless a module is
   extracted.

## Migration recipe (per module dev) — DO THIS UNDER A COMPILER

The repo currently uses **196 relative `../` imports** and a **decorative `@/*`
alias** (declared in tsconfig, 0 usages, no runtime resolver). Naively moving a file
into `modules/<x>/` breaks its `../middleware`, `../utils`, etc. imports. Fix the
alias **once**, then moves become trivial and depth-independent.

### Step 0 — make the `@/*` alias real (one-time, Dev 1 or SA, verify first)
- Dev dependency: `tsconfig-paths` and `tsc-alias`.
- `nodemon`/ts-node: run with `-r tsconfig-paths/register`.
- Build script: `prisma generate && tsc && tsc-alias` (rewrites `@/` → relative in
  `dist/` so `node dist/index.js` resolves at runtime).
- Verify: `npm ci && npm run build && npm start` boots; `npm test` passes.

### Step 1 — move your module (repeat per file)
```
git mv src/routes/<file>.ts src/modules/<module>/routes/<file>.ts
```
Then rewrite that file's shared imports to the alias:
`from '../middleware/x'` → `from '@/shared/middleware/x'` (and lib/utils/services/
database likewise). Same-dir (`./`) imports are unaffected.

### Step 2 — expose the module
Create `src/modules/<module>/index.ts` that imports the module's routers and the
exact middleware they need, and exports one mounted `Router`. Preserve **every**
per-route guard from the current `index.ts` — note the subtle ones:
`authLimiter` on `/api/auth`, `authorizeRoles(...pmoRoles)` on `/api/pipeline`,
and the duplicate path aliases (`/smes`+`/sme`, `/report`+`/reports`,
`/advisory`+`/advisory-services`+`/advisors`).

### Step 3 — wire the composition root (SA integrates)
`index.ts` replaces the flat 44-line mount block with one `app.use()` per module.
The vestigial `isTradingService` mode branch (leftover from the trade-api split) is
now dead and should be removed here.

### Step 4 — verify (NON-NEGOTIABLE before merge)
`npm run build` (tsc must be clean) **and** `npm test` (auth/RBAC/tenant-isolation
suites must stay green). No module merges on an unverified build.

## Sequencing

Step 0 is a shared prerequisite — land and verify it first, then Devs 1–5 migrate
their modules in parallel (module folders are disjoint, so no merge conflicts;
only `index.ts` is shared and is owned by the SA/integrator).
