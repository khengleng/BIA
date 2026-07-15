# CamboBia — Public Route Inventory

Access enforced in `core-frontend/src/middleware.ts`.

## Public (no authentication) — Phase 1, shipped
| Route | Purpose | Status |
|---|---|---|
| `/` | Marketing homepage (authed users → `/dashboard`) | ✅ |
| `/how-it-works` | Cross-role walkthrough | ✅ |
| `/for-businesses` | SME audience landing | ✅ |
| `/for-investors` | Investor audience landing | ✅ |
| `/for-advisors` | Advisor audience landing | ✅ |
| `/opportunities` | Public opportunities teaser | ⏳ Phase 3 (route allowlisted; page not built) |
| `/about` | Company / mission | ✅ |
| `/contact` | Contact + enquiry form (no backend yet) | ✅ |
| `/faq` | FAQ (accessible accordion) | ✅ |
| `/trust` | Trust Center (4 verification badges + reporting) | ✅ |
| `/terms` | Terms of Service (versioned, printable) | ✅ |
| `/privacy` | Privacy Policy | ✅ |
| `/risk-disclosure` | Risk Disclosure | ✅ |
| `/auth/login`, `/auth/register`, `/auth/forgot-password` | Auth entry (existing) | ✅ existing |

## Protected (auth required) — unchanged
`/dashboard`, `/smes/*`, `/investors/*`, `/investor/*`, `/advisory/*`, `/deals/*`,
`/syndicates/*`, `/referrals`, `/sme/*`, admin routes, etc. All redirect to
`/auth/login` when unauthenticated (verified: 307).

## Middleware logic
1. `/api/health` → allow.
2. `/` → authed: redirect `/dashboard`; else render homepage.
3. `publicPrefixes` allowlist → always allow.
4. `staticCorePrefixes` (`/auth`, `/_next`, assets) → allow.
5. `coreProtectedPrefixes` → require session cookie.
6. Fallback → require session cookie (redirect to `/auth/login`).

## Notes
- `/opportunities` is allowlisted so it won't 404-to-login once built; a public
  teaser + authed depth is Phase 3.
- SEO: add `sitemap.xml`/`robots.txt` entries for the public routes (Phase 2).
