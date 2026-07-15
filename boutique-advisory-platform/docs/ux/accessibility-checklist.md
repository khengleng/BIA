# CamboBia — Accessibility Checklist (WCAG 2.1 AA target)

## Phase 1 public site — baseline applied
- [x] Semantic HTML (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, `<ol>`/`<dl>` where meaningful)
- [x] One `<h1>` per page, correct heading order
- [x] Visible focus states (`.cb-public :focus-visible` → 2px teal outline)
- [x] `aria-label` on nav landmarks; `aria-expanded` on the mobile menu toggle
- [x] Accessible FAQ (native `<details>`/`<summary>`, zero-JS)
- [x] Contact form: label/id pairs, `aria-required`, `aria-invalid`, `aria-describedby` error wiring, `role="alert"`/`role="status"`, no duplicate submit
- [x] Color contrast: ink/body text on light surfaces meets AA; primary teal on white for interactive text
- [x] Touch targets ≥ ~40px on mobile nav/CTAs
- [x] No horizontal page scroll at mobile widths
- [x] `prefers-reduced-motion` respected globally (transitions only)
- [x] Khmer-safe font stack (Noto Sans Khmer fallback)

## To verify / complete (Phase 2)
- [ ] Automated axe run on every public + auth page
- [ ] Full keyboard-only pass (tab order, skip-to-content link)
- [ ] Screen-reader pass (NVDA/VoiceOver) on auth + onboarding
- [ ] Contrast audit of the authenticated (dark) app
- [ ] Accessible dialogs/dropdowns in the app (focus trap, ESC, return focus)
- [ ] Reduced-motion audit of any app animations
- [ ] Form error summaries on long forms
- [ ] `lang` attribute switches with language selector (partially wired)

## Standing rules
Do not ship blank screens, raw JSON, or stack traces. Every data page needs
loading/empty/error/unauthorized states (Phase 2 rollout across the app).
