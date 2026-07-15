# CamboBia — UX/UI Market-Readiness Audit

**Scope:** `https://bia.cambobia.com` (core-frontend, Next.js App Router).
**Date:** 15 Jul 2026. **Method:** direct code inspection of routes, `middleware.ts`, i18n, and role flows.
**Priorities:** P0 launch blocker · P1 important · P2 optimization · P3 future.

---

## Executive summary

The platform has a **real, feature-broad authenticated app** but **no public front door**. The single largest blocker: `middleware.ts` auth-walls the *entire* site — every route except `/auth/*` and static assets redirects unauthenticated visitors to `/auth/login`, and `/` itself hard-redirects to login. A visitor, partner, or institutional stakeholder literally cannot read what CamboBia is without creating an account. Legal pages (`/terms`, `/privacy`) exist but are unreachable for the same reason, which is also a compliance problem. The existing home component uses the exact dark "crypto/glass/gradient" style the brief asks us to avoid.

Phase 1 therefore centres on: **unlock the public site**, ship a **professional public marketing layer** (homepage, audience pages, legal, trust), and **polish the auth entry** — without disturbing the working authenticated app.

---

## P0 — Launch blockers

### P0-1 · Entire site is auth-walled; no public marketing site
- **Route/screen:** `/` and all non-`/auth` routes · **Role:** all prospective users (unauthenticated)
- **Problem:** `middleware.ts:54-57` redirects `/` → `/auth/login`; `middleware.ts:83-87` redirects *every* other non-auth, non-static route → `/auth/login`. There is no public allowlist.
- **Customer impact:** Nobody can learn what the platform does, who it's for, or whether it's trustworthy before committing to signup. Kills top-of-funnel entirely.
- **Business impact:** ~0% of paid/organic traffic can convert; no SEO surface; partners/institutions can't evaluate; no shareable links.
- **Solution:** Add a public-route allowlist to `middleware.ts`; make `/` render a marketing homepage.
- **Acceptance:** `/`, `/how-it-works`, `/for-*`, `/about`, `/contact`, `/faq`, `/trust`, `/opportunities`, `/terms`, `/privacy`, `/risk-disclosure` all return 200 to a logged-out visitor with no redirect.

### P0-2 · Legal pages inaccessible without login
- **Route:** `/terms`, `/privacy` (exist) · `/risk-disclosure` (missing) · **Role:** all
- **Problem:** Caught by the same auth wall; `/risk-disclosure` doesn't exist. Registration asks users to accept terms they cannot open.
- **Customer/Business impact:** Users forced to accept unread legal documents; consumer-protection and platform-liability exposure; blocks a lawful consent flow.
- **Solution:** Make all legal routes public; add `/risk-disclosure`; version + date each; link them from registration and footer.
- **Acceptance:** All three legal routes load publicly, show version + effective date, are printable and mobile-friendly, and open from the registration consent step without auth.

### P0-3 · Homepage uses off-brief visual style
- **Route:** `/` (`src/app/page.tsx`) · **Role:** all
- **Problem:** Dark radial gradients + glass + blue→purple gradient logo — the "crypto-style / excessive glass / gradient" look the brief says to avoid; reads as a dev template, not a trustworthy SME/investor marketplace.
- **Business impact:** Undermines trust with non-technical SMEs and institutional investors at first impression.
- **Solution:** Rebuild as a professional, light, trustworthy marketing homepage with clear hierarchy, restrained shadows, and the CamboBia positioning.
- **Acceptance:** New homepage matches the design-system tokens; passes the "avoid" list; renders the approved headline and three audience paths.

### P0-4 · No consistent public header/footer; missing marketing routes
- **Route:** `/how-it-works`, `/for-businesses`, `/for-investors`, `/for-advisors`, `/about`, `/contact`, `/faq`, `/trust`, `/opportunities` (all missing)
- **Problem:** No public navigation shell; audience and info pages don't exist.
- **Business impact:** No conversion paths for the three audiences; no way to explain value or trust.
- **Solution:** Reusable `PublicHeader` + `PublicFooter`; build the missing public pages.
- **Acceptance:** Every public page shares one header/footer; each audience page has headline, problem, benefits, how-it-works, trust, FAQ, and primary + secondary CTA.

---

## P1 — Important

### P1-1 · Bilingual coverage is ~5% wired
- **Route:** all · **Role:** Khmer-first users (the majority of the domestic market)
- **Problem:** i18n now initializes and switches (fixed this cycle), but only ~9 files/89 call-sites use `t()`; most UI is hardcoded English. Marketing copy is English-only.
- **Impact:** Domestic SMEs/advisors get an English app; adoption barrier.
- **Solution:** Wire `t()` through onboarding, auth, dashboards, and public pages; commission **human-reviewed** Khmer (per brief: no unreviewed machine Khmer in production). Ship English public pages i18n-ready; add Khmer as reviewed content lands.
- **Acceptance:** Language selector persists; all Phase-1 public + auth strings are keyed; Khmer content flagged for human review before publish.

### P1-2 · Auth pages need state coverage & trust framing
- **Route:** `/auth/login`, `/auth/register`, `/auth/forgot-password` · **Role:** all
- **Problem:** Functional but single-column dev styling; incomplete state handling (unverified/suspended/rate-limited/expired-session), no split value/trust panel, no role-card registration, no Caps-Lock hint, raw-ish errors.
- **Impact:** Higher signup friction and drop-off; weaker trust at the highest-intent moment.
- **Solution:** Two-column login with value/trust panel; role-card registration with progressive steps; full state matrix; neutral password-recovery response.
- **Acceptance:** Every listed auth state renders a designed, non-raw message; keyboard-accessible with visible focus; no duplicate submit.

### P1-3 · Generic dashboard for all roles
- **Route:** `/dashboard` · **Role:** SME / Investor / Advisor
- **Problem:** One dashboard with role branches, not role-first experiences; primary next action not obvious.
- **Impact:** Users don't know what to do next; weak activation.
- **Solution:** Role-specific dashboards with a single primary action and role-relevant modules (completeness, verification, interest, requests).
- **Acceptance:** Each role sees a distinct layout with the specified primary action above the fold.

### P1-4 · Verification shown as a single vague signal
- **Role:** all · **Problem:** `certified` boolean + a new 0–3 verification level exist, but there's no user-facing badge system distinguishing Email / Identity / Business / Credentials, each explained.
- **Solution:** Distinct, explained badges + a Trust Center (`/trust`) + reporting flow.
- **Acceptance:** Four separate badges with tooltips; `/trust` explains each; report action available on profiles.

---

## P2 — Optimization

- **P2-1 · UI states:** Not every data page has skeleton/empty/error/unauthorized/offline states; some blank screens. → Standardize state components.
- **P2-2 · Accessibility:** No verified WCAG 2.1 AA pass — heading order, focus states, labels, reduced-motion, contrast need an audit. → Accessibility checklist + fixes.
- **P2-3 · Mobile:** Some oversized modals and non-responsive tables; needs 360/390/tablet/1366/1440 pass. → Bottom sheets, responsive tables, sticky primary actions.
- **P2-4 · Design tokens:** Styling values are hardcoded per-component (no central token file). → Centralize colors/type/spacing/radius/shadow/motion/breakpoints.
- **P2-5 · Analytics:** No acquisition-funnel instrumentation. → Event taxonomy + privacy-safe tracking.

## P3 — Future

- Opportunity browsing/discovery surface (`/opportunities` public teaser + authed depth).
- Social proof, demo requests, CRM integration, referral surfacing on public pages, guided tours, A/B hooks.
- Full onboarding save-and-resume across all roles with public profile preview.

---

## Phase plan (from the brief)
- **Phase 1 (this cycle):** public homepage + nav + footer, legal (terms/privacy/risk-disclosure), improved auth entry, language selector, validation, accessibility baseline, analytics foundation.
- **Phase 2:** role onboarding, Trust Center depth, verification UX, profile completeness, role dashboards.
- **Phase 3:** audience landing depth, opportunity browsing, social proof, contact-sales/demo, CRM hooks, referral, tours, A/B.

## Guardrails
Do not remove working authenticated functionality. Do not ship unreviewed machine Khmer as production copy. Do not leave legal pages gated. Do not present placeholders as production-ready.
