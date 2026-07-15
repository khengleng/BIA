# CamboBia — Acquisition Funnel & Analytics Taxonomy

Status: **specification / foundation** (event wiring is Phase 1 follow-up — not yet emitting).

## Privacy rules (enforced in any implementation)
Never send to analytics: passwords, identity numbers, uploaded documents,
financial documents, private messages, or full business-sensitive data. Use
role + coarse categories, not raw PII. Respect consent (marketing analytics is
opt-in and separate from essential service telemetry).

## Funnel stages
1. **Acquisition** — homepage / audience-page views
2. **Activation** — registration started → role selected → completed → email verified
3. **Onboarding** — onboarding started → step completed → completed → profile published
4. **Engagement** — opportunity viewed, business saved, advisor contacted, enquiry created
5. **Support** — support contacted

## Events
| Event | Key properties (non-sensitive) |
|---|---|
| `homepage_viewed` | referrer, utm_source/medium/campaign, locale |
| `audience_page_viewed` | audience (`business`\|`investor`\|`advisor`) |
| `registration_started` | source, locale |
| `role_selected` | role |
| `registration_completed` | role |
| `verification_email_sent` | role |
| `email_verified` | role |
| `onboarding_started` | role |
| `onboarding_step_completed` | role, step_key, step_index |
| `onboarding_abandoned` | role, last_step |
| `onboarding_completed` | role |
| `profile_published` | role |
| `opportunity_viewed` | sector, stage (no business identity) |
| `business_saved` | sector, stage |
| `advisor_contacted` | advisor_category |
| `investor_enquiry_created` | sector, stage |
| `support_contacted` | topic |

## Attribution
Capture `utm_*` on first public landing; persist to registration completion for
lead-source reporting. Store campaign/source at the funnel level, not against
sensitive records.

## Conversion metrics
- Homepage → registration_started (%)
- registration_started → completed (%)
- completed → email_verified (%)
- email_verified → onboarding_completed (%)
- onboarding_completed → profile_published (%)
- audience_page → registration_started, by audience

## Implementation notes
Add a thin `track(event, props)` wrapper with a consent gate and a PII denylist;
choose a privacy-respecting provider (self-hosted or consented). Emit from the
public pages (Phase 1 routes), the auth flow, and onboarding (Phase 2).
