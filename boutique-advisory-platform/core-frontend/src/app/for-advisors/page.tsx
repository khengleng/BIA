import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  ShieldCheck,
  Briefcase,
  BadgeCheck,
  FileText,
  Handshake,
  Inbox,
  CalendarClock,
  Award,
  Users,
  Building2,
  MessagesSquare,
  HelpCircle,
} from 'lucide-react'
import PublicLayout from '@/components/public/PublicLayout'

export const metadata: Metadata = {
  title: 'For advisors — Showcase your expertise and support SMEs | CamboBia',
  description:
    'CamboBia helps professional advisors build a credible profile, showcase their credentials, offer services, connect with businesses, and manage advisory requests and consultations.',
}

const BENEFITS = [
  {
    icon: FileText,
    title: 'A professional advisor profile',
    body: 'Present your background, focus areas, and experience in a structured profile that businesses can trust at a glance.',
  },
  {
    icon: Award,
    title: 'Showcase your credentials',
    body: 'Display qualifications and expertise with distinct credential verification, so clients know exactly what has been confirmed.',
  },
  {
    icon: Briefcase,
    title: 'Offer your services',
    body: 'Describe the advisory services you provide — from financial preparation to strategy — so the right businesses find you.',
  },
  {
    icon: Handshake,
    title: 'Connect with growing businesses',
    body: 'Get discovered by Cambodian SMEs that are actively looking for guidance to strengthen and grow.',
  },
  {
    icon: Inbox,
    title: 'Receive advisory requests',
    body: 'Businesses can reach out directly with requests, so relevant opportunities come to you in one organised place.',
  },
  {
    icon: CalendarClock,
    title: 'Manage consultations',
    body: 'Keep track of your advisory conversations and consultations, and stay organised across your engagements.',
  },
]

const STEPS = [
  {
    icon: FileText,
    title: 'Create your advisor profile',
    body: 'Register for free and build a profile covering your expertise, services, and the businesses you’re best placed to help.',
  },
  {
    icon: BadgeCheck,
    title: 'Verify your credentials',
    body: 'Complete credential verification so businesses can trust your qualifications through a distinct, explained signal.',
  },
  {
    icon: MessagesSquare,
    title: 'Receive requests and advise',
    body: 'Get discovered, receive advisory requests, and manage consultations with growing businesses in one place.',
  },
]

const TRUST = [
  'Distinct credential verification — a clear signal, not a vague “verified” label',
  'You control the services you offer and the requests you accept',
  'Transparent profiles help businesses find the right fit',
  'Honest limitations — we connect you with businesses, we don’t guarantee engagements',
]

const FAQ = [
  {
    q: 'What kinds of advisors is CamboBia for?',
    a: 'CamboBia is for professional advisors who support SMEs — for example in finance, strategy, legal, operations, or fundraising preparation. If you help businesses grow, you can build a profile.',
  },
  {
    q: 'How does credential verification work?',
    a: 'You can complete credential verification so your qualifications appear as a distinct, explained signal on your profile — helping businesses trust your expertise without relying on a single ambiguous badge.',
  },
  {
    q: 'Does CamboBia guarantee I’ll get clients?',
    a: 'No. CamboBia helps you become discoverable and receive advisory requests, but whether any engagement happens depends on you and the businesses you connect with.',
  },
  {
    q: 'How much does it cost to create a profile?',
    a: 'Creating your advisor profile is free. You can showcase your credentials, list your services, and start receiving requests without an upfront charge.',
  },
]

export default function ForAdvisorsPage() {
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
              <Briefcase className="h-3.5 w-3.5" /> For professional advisors
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">
              Showcase your expertise. Support Cambodia’s growing businesses.
            </h1>
            <p className="mt-5 max-w-xl text-lg" style={{ color: 'var(--cb-body)' }}>
              CamboBia gives professional advisors a credible profile to display their credentials,
              offer services, and connect with SMEs that are actively looking for guidance.
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
              Free to create a profile · No engagements or income guaranteed
            </p>
          </div>

          {/* Illustrative advisor card */}
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
                  S
                </span>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--cb-ink)' }}>
                    Sophea Chan, CPA
                  </p>
                  <p className="text-sm" style={{ color: 'var(--cb-muted)' }}>
                    Financial advisory · Phnom Penh
                  </p>
                </div>
              </div>
              <span
                className="rounded-full px-2.5 py-1 text-xs font-bold"
                style={{ background: 'var(--cb-primary-soft)', color: 'var(--cb-primary-dark)' }}
              >
                Credentials verified
              </span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                { icon: BadgeCheck, label: 'Email verified' },
                { icon: Users, label: 'Identity verified' },
                { icon: Award, label: 'Credentials verified' },
                { icon: Briefcase, label: 'Services listed' },
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
                Focus areas
              </p>
              <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--cb-ink)' }}>
                Financial preparation · Fundraising readiness · SME strategy
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
            Your expertise is valuable — if the right businesses can find it
          </h2>
          <p className="mt-5 text-lg" style={{ color: 'var(--cb-body)' }}>
            Many capable advisors rely on word of mouth, and Cambodia’s growing SMEs often don’t know
            where to turn for trusted guidance. CamboBia connects the two: a credible, verifiable
            profile that shows your credentials and services, and a structured way for businesses to
            reach you with advisory requests.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ background: '#fff', borderTop: '1px solid var(--cb-line)', borderBottom: '1px solid var(--cb-line)' }}>
        <div className="cb-wrap py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">What you get with CamboBia</h2>
            <p className="mt-4 text-lg" style={{ color: 'var(--cb-muted)' }}>
              Everything you need to present your expertise and connect with businesses that need it.
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
          <h2 className="text-3xl font-bold sm:text-4xl">How it works for advisors</h2>
          <p className="mt-4 text-lg" style={{ color: 'var(--cb-muted)' }}>
            A clear path from profile to advisory requests.
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
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Credentials businesses can trust</h2>
              <p className="mt-4 text-lg" style={{ color: 'var(--cb-body)' }}>
                Your reputation matters. CamboBia uses distinct, explained verification signals — so
                businesses know exactly what has been confirmed about your credentials.
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
                { icon: Award, label: 'Credentials verified' },
                { icon: Building2, label: 'Business network' },
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
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to put your expertise to work?</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Showcase your credentials, offer your services, and connect with Cambodian businesses that need your guidance.
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
