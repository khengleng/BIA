import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ShieldCheck,
  BadgeCheck,
  Mail,
  UserCheck,
  Building2,
  TrendingUp,
  Briefcase,
  Lock,
  ShieldAlert,
  Flag,
  Gavel,
  LifeBuoy,
  AlertTriangle,
  ArrowRight,
  UserX,
  FileWarning,
  UserRound,
  Ban,
  ImageOff,
  HelpCircle,
} from 'lucide-react'
import PublicLayout from '@/components/public/PublicLayout'

export const metadata: Metadata = {
  title: 'Trust Center — How CamboBia keeps the marketplace credible',
  description:
    'How CamboBia protects accounts, verifies identity, business, investor and advisor credentials, safeguards your data, prevents scams, and handles reports — plus an honest account of what we do and don’t guarantee.',
}

/** The four distinct verification badges. Each is explained on its own — we
 *  never collapse them into a single vague "Verified". */
const BADGES = [
  {
    icon: BadgeCheck,
    label: 'Email verified',
    what: 'The account holder confirmed control of their email address by clicking a one-time link.',
    means: 'You can reach a real, monitored inbox — but on its own this says nothing about who the person is.',
  },
  {
    icon: UserCheck,
    label: 'Identity verified',
    what: 'A named individual submitted government-issued ID, which our team checked against the profile details.',
    means: 'A real person stands behind this profile. It does not vouch for any business or professional claims they make.',
  },
  {
    icon: Building2,
    label: 'Business verified',
    what: 'We reviewed registration or licensing documents confirming the business legally exists in Cambodia.',
    means: 'The company is a registered entity. It is not an audit, valuation, or endorsement of its performance.',
  },
  {
    icon: Briefcase,
    label: 'Credentials verified',
    what: 'An advisor’s professional qualifications, licences, or memberships were checked against issuing bodies where possible.',
    means: 'The advisor holds the credentials shown. It is not a guarantee of the quality or outcome of their advice.',
  },
] as const

const SECTIONS = [
  {
    icon: Lock,
    title: 'Account security',
    body: 'Passwords are stored using strong one-way hashing, sessions are protected, and sensitive actions require re-authentication. We encourage strong, unique passwords and will add extra sign-in protections over time. You are always in control of your own account access.',
  },
  {
    icon: UserCheck,
    title: 'Identity verification',
    body: 'Individuals can verify that a real person stands behind a profile by submitting government-issued identification, which our team reviews before the Identity verified badge is granted. This reduces anonymous and impersonating accounts.',
  },
  {
    icon: Building2,
    title: 'Business verification',
    body: 'Businesses can confirm they are a genuine, registered Cambodian entity by providing registration or licensing documents. We check that the company legally exists — this is a factual check, not an audit, valuation, or endorsement.',
  },
  {
    icon: TrendingUp,
    title: 'Investor verification',
    body: 'Investors verify their email and identity so businesses know they are engaging with real people. Where an investor represents an institution, we review supporting details. Verification confirms who someone is — it never implies a commitment to invest.',
  },
  {
    icon: Briefcase,
    title: 'Advisor credential verification',
    body: 'Advisors submit professional qualifications, licences, or memberships, which we check against issuing bodies where possible. The Credentials verified badge confirms the advisor holds what they claim — it is not a rating of their advice.',
  },
  {
    icon: Lock,
    title: 'Data privacy',
    body: 'We collect only what we need to run the marketplace, and we are clear about how it is used. Verification documents are handled carefully and are not shown publicly. You can review and manage your information, and control much of what appears on your profile. See our Privacy Policy for full detail.',
  },
  {
    icon: ShieldAlert,
    title: 'Scam prevention',
    body: 'Distinct verification signals, reporting tools, and human review make it harder for bad actors to operate. Be cautious of anyone who pressures you, asks for money or fees to “unlock” an opportunity, or wants to move off-platform quickly — and tell us if you see it.',
  },
  {
    icon: Flag,
    title: 'How to report',
    body: 'If something looks wrong — a suspicious profile, misleading claims, impersonation, or a fraud attempt — you can report it to our team. Reports are treated seriously and confidentially. The fastest route is our contact form with the “Report a concern” enquiry type.',
  },
  {
    icon: Gavel,
    title: 'Moderation',
    body: 'We review reported content and profiles against our standards. Depending on what we find, we may request more information, edit or remove content, add or remove badges, or suspend accounts. We aim to be fair, consistent, and proportionate.',
  },
  {
    icon: LifeBuoy,
    title: 'Support process',
    body: 'Reach us through the contact form or by email. We acknowledge enquiries, route them to the right team, and aim to respond within two business days. Safety and fraud reports are prioritised.',
  },
]

const REPORTABLE = [
  { icon: UserX, label: 'Suspicious profile', note: 'A profile that looks fake, automated, or too good to be true.' },
  { icon: FileWarning, label: 'Misleading information', note: 'False, exaggerated, or unsupported claims about a business or person.' },
  { icon: UserRound, label: 'Impersonation', note: 'Someone pretending to be a person, company, or organisation they are not.' },
  { icon: Ban, label: 'Fraud attempt', note: 'Requests for upfront fees, off-platform payments, or other scam behaviour.' },
  { icon: ImageOff, label: 'Inappropriate content', note: 'Offensive, harmful, or irrelevant material that breaches our standards.' },
  { icon: HelpCircle, label: 'Other', note: 'Anything else that doesn’t feel right — when in doubt, tell us.' },
]

export default function TrustPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(180deg,#fff, var(--cb-surface))' }}>
        <div className="cb-wrap py-16 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: 'var(--cb-primary-soft)', color: 'var(--cb-primary-dark)' }}
            >
              <ShieldCheck className="h-3.5 w-3.5" /> Trust Center
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">
              Trust you can see — and understand
            </h1>
            <p className="mt-5 text-lg" style={{ color: 'var(--cb-body)' }}>
              CamboBia connects Cambodian businesses, investors, and advisors. Here is exactly how we protect accounts,
              verify who people are, safeguard your data, and act when something goes wrong — described plainly, with no
              vague promises.
            </p>
          </div>
        </div>
      </section>

      {/* Verification badges — each explained on its own */}
      <section className="cb-wrap py-16 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Four separate verification badges</h2>
          <p className="mt-4 text-lg" style={{ color: 'var(--cb-muted)' }}>
            We never use a single, vague “verified” label. Each badge means one specific thing was checked — so you know
            exactly what has, and hasn’t, been confirmed.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {BADGES.map((b) => (
            <div
              key={b.label}
              className="flex flex-col rounded-2xl border p-7"
              style={{ borderColor: 'var(--cb-line)', background: '#fff', boxShadow: 'var(--cb-shadow-sm)' }}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: 'var(--cb-primary-soft)' }}>
                  <b.icon className="h-6 w-6" style={{ color: 'var(--cb-primary)' }} />
                </span>
                <h3 className="text-lg font-bold">{b.label}</h3>
              </div>
              <div className="mt-5 space-y-3 text-sm leading-relaxed">
                <p style={{ color: 'var(--cb-body)' }}>
                  <span className="font-semibold" style={{ color: 'var(--cb-ink)' }}>What we check: </span>
                  {b.what}
                </p>
                <p style={{ color: 'var(--cb-body)' }}>
                  <span className="font-semibold" style={{ color: 'var(--cb-ink)' }}>What it means: </span>
                  {b.means}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How we protect the marketplace */}
      <section style={{ background: '#fff', borderTop: '1px solid var(--cb-line)', borderBottom: '1px solid var(--cb-line)' }}>
        <div className="cb-wrap py-16 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">How we protect the marketplace</h2>
            <p className="mt-4 text-lg" style={{ color: 'var(--cb-muted)' }}>
              Security, verification, privacy, and human oversight — the layers that keep CamboBia credible.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SECTIONS.map((s) => (
              <div
                key={s.title}
                className="rounded-2xl border p-6"
                style={{ borderColor: 'var(--cb-line)', background: '#fff', boxShadow: 'var(--cb-shadow-sm)' }}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: 'var(--cb-primary-soft)' }}>
                  <s.icon className="h-6 w-6" style={{ color: 'var(--cb-primary)' }} />
                </span>
                <h3 className="mt-5 text-lg font-bold">{s.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed" style={{ color: 'var(--cb-body)' }}>
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Report a concern */}
      <section className="cb-wrap py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-5 lg:gap-12">
          <div className="lg:col-span-2">
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: 'var(--cb-accent-soft)', color: 'var(--cb-accent)' }}
            >
              <Flag className="h-3.5 w-3.5" /> Report a concern
            </span>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">See something? Tell us.</h2>
            <p className="mt-4 text-lg" style={{ color: 'var(--cb-body)' }}>
              Your reports help keep everyone safe. Anything on this list can be reported — confidentially, and without
              needing to be certain. If it doesn’t feel right, let us know and our team will look into it.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold text-white shadow-sm"
              style={{ background: 'var(--cb-primary)' }}
            >
              Report a concern <ArrowRight className="h-5 w-5" />
            </Link>
            <p className="mt-3 text-sm" style={{ color: 'var(--cb-muted)' }}>
              Choose the “Report a concern” enquiry type on the contact form.
            </p>
          </div>
          <div className="lg:col-span-3">
            <div className="grid gap-4 sm:grid-cols-2">
              {REPORTABLE.map((r) => (
                <div
                  key={r.label}
                  className="flex gap-3 rounded-2xl border p-5"
                  style={{ borderColor: 'var(--cb-line)', background: '#fff', boxShadow: 'var(--cb-shadow-sm)' }}
                >
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg" style={{ background: 'var(--cb-primary-soft)' }}>
                    <r.icon className="h-4.5 w-4.5" style={{ color: 'var(--cb-primary)' }} />
                  </span>
                  <span>
                    <span className="block text-sm font-bold" style={{ color: 'var(--cb-ink)' }}>{r.label}</span>
                    <span className="mt-1 block text-xs leading-relaxed" style={{ color: 'var(--cb-body)' }}>{r.note}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Platform limitations — the honest bit */}
      <section style={{ background: 'var(--cb-surface)', borderTop: '1px solid var(--cb-line)' }}>
        <div className="cb-wrap py-16 lg:py-20">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: 'var(--cb-accent-soft)' }}>
                <AlertTriangle className="h-6 w-6" style={{ color: 'var(--cb-accent)' }} />
              </span>
              <h2 className="text-3xl font-bold sm:text-4xl">What we do — and don’t — guarantee</h2>
            </div>
            <p className="mt-5 text-lg" style={{ color: 'var(--cb-body)' }}>
              Being trustworthy means being honest about our limits. CamboBia is a marketplace that connects people and
              surfaces information. We are not a broker, dealer, adviser of record, or guarantor.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--cb-line)', background: '#fff', boxShadow: 'var(--cb-shadow-sm)' }}>
                <h3 className="flex items-center gap-2 text-lg font-bold">
                  <ShieldCheck className="h-5 w-5" style={{ color: 'var(--cb-good)' }} /> What we do
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm" style={{ color: 'var(--cb-body)' }}>
                  {[
                    'Help you build a credible, structured profile',
                    'Verify email, identity, business, and credentials as described',
                    'Connect businesses, investors, and advisors',
                    'Surface clear information and trust signals',
                    'Review reports and moderate the platform',
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2.5">
                      <BadgeCheck className="mt-0.5 h-4.5 w-4.5 flex-none" style={{ color: 'var(--cb-good)' }} /> {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--cb-line)', background: '#fff', boxShadow: 'var(--cb-shadow-sm)' }}>
                <h3 className="flex items-center gap-2 text-lg font-bold">
                  <Ban className="h-5 w-5" style={{ color: 'var(--cb-danger)' }} /> What we don’t
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm" style={{ color: 'var(--cb-body)' }}>
                  {[
                    'Guarantee that any business will raise funding',
                    'Guarantee investment returns or outcomes',
                    'Provide investment, legal, or tax advice ourselves',
                    'Audit, value, or endorse any business or opportunity',
                    'Hold, transfer, or guarantee any money between parties',
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2.5">
                      <Ban className="mt-0.5 h-4.5 w-4.5 flex-none" style={{ color: 'var(--cb-danger)' }} /> {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-6 rounded-xl p-4 text-sm leading-relaxed" style={{ background: '#fff', border: '1px solid var(--cb-line)', color: 'var(--cb-muted)' }}>
              Verification confirms facts at a point in time; it is not a recommendation. Always do your own due
              diligence before making any financial or business decision. For more, see our{' '}
              <Link href="/risk-disclosure" className="font-semibold hover:underline" style={{ color: 'var(--cb-primary)' }}>Risk Disclosure</Link>,{' '}
              <Link href="/terms" className="font-semibold hover:underline" style={{ color: 'var(--cb-primary)' }}>Terms of Service</Link>, and{' '}
              <Link href="/privacy" className="font-semibold hover:underline" style={{ color: 'var(--cb-primary)' }}>Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* Support CTA */}
      <section style={{ background: '#fff', borderTop: '1px solid var(--cb-line)' }}>
        <div className="cb-wrap py-16 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: 'var(--cb-primary-soft)' }}>
            <Mail className="h-6 w-6" style={{ color: 'var(--cb-primary)' }} />
          </span>
          <h2 className="mt-5 text-3xl font-bold sm:text-4xl">Still have a question about trust or safety?</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg" style={{ color: 'var(--cb-muted)' }}>
            Our team is here to help. Reach out and we’ll get back to you within two business days.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold text-white shadow-sm"
              style={{ background: 'var(--cb-primary)' }}
            >
              Contact our team <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="mailto:contact@cambobia.com"
              className="inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-3.5 text-base font-semibold"
              style={{ borderColor: 'var(--cb-line)', color: 'var(--cb-ink)', background: '#fff' }}
            >
              contact@cambobia.com
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
