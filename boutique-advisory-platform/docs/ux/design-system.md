# CamboBia — Design System (Phase 1)

The public marketing/legal surface uses a centralized, light, professional brand
theme (the authenticated app remains dark). Tokens live in
`core-frontend/src/app/globals.css` under `:root` (prefix `--cb-*`). Do not
hardcode brand colors in components — reference the tokens.

## Tokens

| Token | Value | Use |
|---|---|---|
| `--cb-primary` | `#0f5257` | Primary brand (deep teal — trust, Cambodian jade); CTAs, links, accents |
| `--cb-primary-dark` | `#0b3d41` | Text on light brand chips, hovers |
| `--cb-primary-600` | `#14807f` | Brighter teal for gradients/bars |
| `--cb-primary-soft` | `#e4efee` | Tinted chip/section backgrounds |
| `--cb-accent` | `#b07d24` | Restrained gold (prosperity), used sparingly |
| `--cb-accent-soft` | `#f4ecda` | Gold chip background |
| `--cb-ink` | `#142a2c` | Headings / strongest text |
| `--cb-body` | `#37484b` | Body text |
| `--cb-muted` | `#5f7175` | Secondary / captions |
| `--cb-line` | `#e4ebea` | Borders / dividers |
| `--cb-paper` | `#ffffff` | Cards |
| `--cb-surface` | `#f5f8f7` | Page background |
| `--cb-surface-2` | `#eef3f2` | Hover / nested surface |
| `--cb-good/warn/danger` | greens/amber/clay | Semantic (separate from accent) |
| `--cb-radius` | `14px` | Card radius |
| `--cb-shadow` / `--cb-shadow-sm` | restrained | Elevation (no glow/glass) |
| `--cb-maxw` | `1160px` | Content width |
| `--cb-font` | Inter/system + Noto Sans Khmer | Body/UI; Khmer-safe fallback |

## Helpers
- `.cb-public` — wrapper that locks the light brand theme + font (overrides OS-dark body tokens). Applied by `PublicLayout`.
- `.cb-wrap` — max-width (1160px) centered container with 24px gutters.
- Focus: `.cb-public :focus-visible` → 2px teal outline.

## Components (`core-frontend/src/components/public/`)
- **PublicLayout** — wraps every public page: `.cb-public` + `PublicHeader` + `PublicFooter`.
- **PublicHeader** — sticky, logo, primary nav, language toggle, Log in / Create account, mobile drawer.
- **PublicFooter** — company/contact, product, audience, legal columns, honest-limitations line.
- **LegalPage** — printable, versioned legal renderer (title, version, effective date, TOC, sections, contact).

## Principles (the "avoid" list, enforced)
No gradients-as-decoration, no glass, no crypto styling, no cartoonish finance imagery, no tiny text, no weak contrast. Yes: clear hierarchy, generous spacing, restrained shadows, accessible contrast, subtle motion, honest empty/error states.

## Deferred (Phase 2)
Extract shared primitives used by the authenticated app (Button, Card, Badge, FormField, Alert, Toast, EmptyState, Skeleton, Stepper) into a single tokened library so the dark app and light public site share one system.
