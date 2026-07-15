import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  ShieldCheck,
  FileText,
  Search,
  MessagesSquare,
  Building2,
  Users,
  BadgeCheck,
  Eye,
  Briefcase,
  Target,
  HelpCircle,
} from 'lucide-react'
import PublicLayout from '@/components/public/PublicLayout'

export const metadata: Metadata = {
  title: 'For businesses — Build a credible profile and get discovered | CamboBia',
  description:
    'CamboBia helps Cambodian SMEs build a credible business profile, connect with trusted advisors, present funding needs clearly, and increase visibility to potential investors.',
}

const BENEFITS = [
  {
    icon: FileText,
    title: 'A credible business profile',
    body: 'Present your company, team, and traction in a structured profile that investors and advisors can actually understand and trust.',
  },
  {
    icon: BadgeCheck,
    title: 'Verification you can show',
    body: 'Layer distinct email, identity, and business verification signals so serious counterparts know your information has been checked.',
  },
  {
    icon: Briefcase,
    title: 'Access to trusted advisors',
    body: 'Find and connect with professional advisors who can help you prepare, sharpen your story, and strengthen your fundamentals.',
  },
  {
    icon: Target,
    title: 'Present your funding needs',
    body: 'Clearly state what you’re raising and why — from working capital to expansion — in a format investors are used to reviewing.',
  },
  {
    icon: Eye,
    title: 'Increase investor visibility',
    body: 'Appear in a structured directory where investors filter, save, and track the businesses that match their interests.',
  },
  {
    icon: MessagesSquare,
    title: 'Manage conversations in one place',
    body: 'Receive and respond to inbound interest and advisory requests, and keep every relevant conversation organised.',
  },
]

const STEPS = [
  {
    icon: FileText,
    title: 'Create your business profile',
    body: 'Register for free and build a profile covering your business, sector, stage, team, and what you’re looking for.',
  },
  {
    icon: Search,
    title: 'Get verified and discovered',
    body: 'Complete verification steps to strengthen credibility, then appear in searches when investors and advisors filter opportunities.',
  },
  {
    icon: MessagesSquare,
    title: 'Connect and progress conversations',
    body: 'Respond to interest, work with advisors, and move relevant conversations forward with trust signals visible throughout.',
  },
]

const TRUST = [
  'Separate email, identity, and business verification — never a single vague “verified” label',
  'Advisor-reviewed business information for added credibility',
  'You control what you present and who you engage with',
  'Honest limitations — we help you connect, we don’t guarantee funding',
]

const FAQ = [
  {
    q: 'Does CamboBia guarantee I’ll raise funding?',
    a: 'No. CamboBia is a marketplace that helps you build credibility and connect with potential investors and advisors. Whether any funding happens depends entirely on those parties and your own conversations.',
  },
  {
    q: 'How much does it cost to create a profile?',
    a: 'Creating your business profile is free. You can build your profile, complete verification steps, and become discoverable without any upfront charge.',
  },
  {
    q: 'What does verification actually check?',
    a: 'We use distinct, explained signals — email, identity, and business verification — so counterparts know exactly what has been confirmed, rather than relying on a single ambiguous badge.',
  },
  {
    q: 'Do I need an advisor to use CamboBia?',
    a: 'No. Working with an advisor is optional. Many businesses use CamboBia to strengthen their profile and connect with advisors when they’re ready, at their own pace.',
  },
]

export default function ForBusinessesPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(180deg,#fff, var(--cb-surface))' }}>
        <div className="cb-wrap grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: 'var(--cb-primary-soft)', color: 'var(--cb-primary-dark)' }}
            >
              <Building2 className="h-3.5 w-3.5" /> For business owners
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">
              Build a credible profile. Get discovered by the right investors.
            </h1>
            <p className="mt-5 max-w-xl text-lg" style={{ color: 'var(--cb-body)' }}>
              CamboBia gives growing Cambodian businesses a trusted place to present who they are,
              connect with professional advisors, and increase visibility to potential investors.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold text-white shadow-sm"
                style={{ background: 'var(--cb-primary)' }}
              >
                Create your profile <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-3.5 text-base font-semibold"
                style={{ borderColor: 'var(--cb-line)', color: 'var(--cb-ink)', background: '#fff' }}
              >
                See how it works
              </Link>
            </div>
            <p className="mt-4 text-sm" style={{ color: 'var(--cb-muted)' }}>
              Free to create a profile · No investment or funding guaranteed
            </p>
          </div>

          {/* Illustrative profile card */}
          <div
            className="rounded-2xl border p-6 shadow-sm"
            style={{ borderColor: 'var(--cb-line)', background: '#fff', boxShadow: 'var(--cb-shadow)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-xl font-bold text-white"
                  style={{ background: 'var(--cb-primary)' }}
                >
                  M
                </span>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--cb-ink)' }}>
                    Mekong Textiles Ltd.
                  </p>
                  <p className="text-sm" style={{ color: 'var(--cb-muted)' }}>
                    Manufacturing · Growth stage · Phnom Penh
                  </p>
                </div>
              </div>
              <span
                className="rounded-full px-2.5 py-1 text-xs font-bold"
                style={{ background: 'var(--cb-primary-soft)', color: 'var(--cb-primary-dark)' }}
              >
                Verified
              </span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                { icon: BadgeCheck, label: 'Email verified' },
                { icon: Users, label: 'Identity verified' },
                { icon: Building2, label: 'Business verified' },
                { icon: Briefcase, label: 'Advisor reviewed' },
              ].map((b) => (
                <div
                  key={b.label}
                  className="flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm"
                  style={{ borderColor: 'var(--cb-line)' }}
                >
                  <b.icon className="h-4 w-4" style={{ color: 'var(--cb-primary)' }} />
                  <span style={{ color: 'var(--cb-body)' }}>{b.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-lg p-4" style={{ background: 'var(--cb-surface)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--cb-muted)' }}>
                Funding need
              </p>
              <p className="mt-1 text-lg font-bold" style={{ color: 'var(--cb-ink)' }}>
                $180,000{' '}
                <span className="text-sm font-normal" style={{ color: 'var(--cb-muted)' }}>
                  · to add a second production line
                </span>
              </p>
            </div>
            <p className="mt-3 text-center text-xs" style={{ color: 'var(--cb-muted)' }}>
              Illustrative profile — not a real listing
            </p>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="cb-wrap py-16 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Good businesses often stay invisible to the right people
          </h2>
          <p className="mt-5 text-lg" style={{ color: 'var(--cb-body)' }}>
            Many Cambodian SMEs are ready to grow but lack a credible way to be seen. Investors can’t
            easily find them, information is scattered and hard to trust, and preparing a professional
            story takes expertise most owners don’t have on hand. CamboBia gives you a structured,
            verifiable profile — so your business is presented clearly and taken seriously.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ background: '#fff', borderTop: '1px solid var(--cb-line)', borderBottom: '1px solid var(--cb-line)' }}>
        <div className="cb-wrap py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">What you get with CamboBia</h2>
            <p className="mt-4 text-lg" style={{ color: 'var(--cb-muted)' }}>
              Everything you need to present your business with credibility and connect with the right people.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="flex flex-col rounded-2xl border p-7"
                style={{ borderColor: 'var(--cb-line)', background: '#fff', boxShadow: 'var(--cb-shadow-sm)' }}
              >
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: 'var(--cb-primary-soft)' }}
                >
                  <b.icon className="h-6 w-6" style={{ color: 'var(--cb-primary)' }} />
                </span>
                <h3 className="mt-5 text-xl font-bold">{b.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed" style={{ color: 'var(--cb-body)' }}>
                  {b.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="cb-wrap py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">How it works for businesses</h2>
          <p className="mt-4 text-lg" style={{ color: 'var(--cb-muted)' }}>
            A clear, credible path from profile to connection.
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title}>
              <div className="flex items-center gap-3">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: 'var(--cb-primary)' }}
                >
                  {i + 1}
                </span>
                <s.icon className="h-5 w-5" style={{ color: 'var(--cb-primary)' }} />
              </div>
              <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--cb-body)' }}>
                {s.body}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: 'var(--cb-primary)' }}
          >
            See the full walkthrough <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Trust */}
      <section style={{ background: '#fff', borderTop: '1px solid var(--cb-line)', borderBottom: '1px solid var(--cb-line)' }}>
        <div className="cb-wrap py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: 'var(--cb-accent-soft)', color: 'var(--cb-accent)' }}
              >
                <ShieldCheck className="h-3.5 w-3.5" /> Built on trust
              </span>
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Credibility that investors can see</h2>
              <p className="mt-4 text-lg" style={{ color: 'var(--cb-body)' }}>
                Trust is the currency of any deal. CamboBia gives you distinct, explained verification
                signals so counterparts know exactly what has been checked about your business.
              </p>
              <ul className="mt-6 space-y-3">
                {TRUST.map((t) => (
                  <li key={t} className="flex items-start gap-3 text-sm" style={{ color: 'var(--cb-body)' }}>
                    <BadgeCheck className="mt-0.5 h-5 w-5 flex-none" style={{ color: 'var(--cb-primary)' }} /> {t}
                  </li>
                ))}
              </ul>
              <Link
                href="/trust"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold"
                style={{ color: 'var(--cb-primary)' }}
              >
                Visit the Trust Center <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: BadgeCheck, label: 'Email verified' },
                { icon: Users, label: 'Identity verified' },
                { icon: Building2, label: 'Business verified' },
                { icon: Briefcase, label: 'Advisor reviewed' },
              ].map((b) => (
                <div
                  key={b.label}
                  className="rounded-2xl border p-6 text-center"
                  style={{ borderColor: 'var(--cb-line)', background: '#fff', boxShadow: 'var(--cb-shadow-sm)' }}
                >
                  <b.icon className="mx-auto h-8 w-8" style={{ color: 'var(--cb-primary)' }} />
                  <p className="mt-3 text-sm font-semibold" style={{ color: 'var(--cb-ink)' }}>
                    {b.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="cb-wrap py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: 'var(--cb-primary-soft)', color: 'var(--cb-primary-dark)' }}
          >
            <HelpCircle className="h-3.5 w-3.5" /> Common questions
          </span>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Frequently asked questions</h2>
        </div>
        <div className="mx-auto mt-12 max-w-3xl space-y-4">
          {FAQ.map((f) => (
            <div
              key={f.q}
              className="rounded-2xl border p-6"
              style={{ borderColor: 'var(--cb-line)', background: '#fff', boxShadow: 'var(--cb-shadow-sm)' }}
            >
              <h3 className="text-lg font-bold">{f.q}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--cb-body)' }}>
                {f.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ background: 'var(--cb-primary)' }}>
        <div className="cb-wrap py-16 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to get your business discovered?</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Build a credible profile, connect with advisors, and increase your visibility to potential investors.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold"
              style={{ color: 'var(--cb-primary-dark)' }}
            >
              Create your profile <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center rounded-xl border px-6 py-3.5 text-base font-semibold text-white"
              style={{ borderColor: 'rgba(255,255,255,0.4)' }}
            >
              See how it works
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
