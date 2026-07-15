import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  FileText,
  Search,
  MessagesSquare,
  Building2,
  TrendingUp,
  Briefcase,
  ShieldCheck,
  BadgeCheck,
  Users,
  CheckCircle2,
} from 'lucide-react'
import PublicLayout from '@/components/public/PublicLayout'

export const metadata: Metadata = {
  title: 'How CamboBia works — from credible profile to trusted connection',
  description:
    'A clear walkthrough of how CamboBia works for businesses, investors, and advisors: create a credible profile, discover and connect, and engage with confidence.',
}

const STEPS = [
  {
    icon: FileText,
    title: 'Create a credible profile',
    body: 'Businesses, investors, and advisors build structured profiles that show who they are, what they offer, and what they’re looking for — with verification signals attached.',
  },
  {
    icon: Search,
    title: 'Discover and connect',
    body: 'Investors filter and save opportunities; businesses and advisors find each other through a trusted, searchable directory built around clear, comparable information.',
  },
  {
    icon: MessagesSquare,
    title: 'Engage with confidence',
    body: 'Message, ask questions, and progress conversations — with verification and trust signals visible throughout, so you always know who you’re talking to.',
  },
]

const ROLES = [
  {
    icon: Building2,
    title: 'For businesses',
    lede: 'Present your company credibly and reach people who can help you grow.',
    href: '/for-businesses',
    cta: 'Explore for businesses',
    points: [
      'Build a structured business profile: sector, stage, location, and traction.',
      'Complete verification steps to earn distinct, explained trust signals.',
      'Present your funding needs and the story behind them.',
      'Connect with advisors to strengthen your profile before you raise.',
      'Increase visibility to investors browsing the opportunities directory.',
    ],
  },
  {
    icon: TrendingUp,
    title: 'For investors',
    lede: 'Find and evaluate Cambodian businesses with the information you need up front.',
    href: '/for-investors',
    cta: 'Explore for investors',
    points: [
      'Browse and filter businesses by sector, stage, location, and funding need.',
      'Review verification information before you decide to reach out.',
      'Save opportunities and keep track of the businesses you’re following.',
      'Message businesses directly to ask questions and request more detail.',
      'Make your own decisions — CamboBia informs, it does not advise or guarantee.',
    ],
  },
  {
    icon: Briefcase,
    title: 'For advisors',
    lede: 'Show your credentials and receive requests from growing businesses.',
    href: '/for-advisors',
    cta: 'Explore for advisors',
    points: [
      'Create a professional profile that showcases your expertise and services.',
      'Verify your credentials to stand out with a clear trust signal.',
      'Receive advisory requests from businesses that match your specialisms.',
      'Help businesses prepare credible profiles and funding materials.',
      'Build a reputation through genuine, verifiable engagements.',
    ],
  },
]

const VERIFICATION = [
  {
    icon: BadgeCheck,
    label: 'Email verified',
    body: 'Confirms the account holder controls the email address on file.',
  },
  {
    icon: Users,
    label: 'Identity verified',
    body: 'Confirms a real person is behind the account through identity checks.',
  },
  {
    icon: Building2,
    label: 'Business verified',
    body: 'Confirms business registration details for a company profile.',
  },
  {
    icon: Briefcase,
    label: 'Credentials verified',
    body: 'Confirms an advisor’s professional qualifications and standing.',
  },
]

export default function HowItWorksPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(180deg,#fff, var(--cb-surface))' }}>
        <div className="cb-wrap py-20 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: 'var(--cb-primary-soft)', color: 'var(--cb-primary-dark)' }}
            >
              <ShieldCheck className="h-3.5 w-3.5" /> How it works
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">
              From a credible profile to a trusted connection
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg" style={{ color: 'var(--cb-body)' }}>
              CamboBia gives businesses, investors, and advisors a clear, structured place to find one
              another. We help you connect and stay informed — we don’t guarantee funding, returns, or
              any particular outcome.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold text-white shadow-sm"
                style={{ background: 'var(--cb-primary)' }}
              >
                Create your profile <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/opportunities"
                className="inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-3.5 text-base font-semibold"
                style={{ borderColor: 'var(--cb-line)', color: 'var(--cb-ink)', background: '#fff' }}
              >
                Browse opportunities
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Shared 3 steps */}
      <section className="cb-wrap py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">The same three steps for everyone</h2>
          <p className="mt-4 text-lg" style={{ color: 'var(--cb-muted)' }}>
            Whether you’re raising, investing, or advising, the journey follows one credible path.
          </p>
        </div>
        <ol className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              className="rounded-2xl border p-7"
              style={{ borderColor: 'var(--cb-line)', background: '#fff', boxShadow: 'var(--cb-shadow-sm)' }}
            >
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
            </li>
          ))}
        </ol>
      </section>

      {/* Per-role breakdown */}
      <section style={{ background: '#fff', borderTop: '1px solid var(--cb-line)', borderBottom: '1px solid var(--cb-line)' }}>
        <div className="cb-wrap py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">What each role does</h2>
            <p className="mt-4 text-lg" style={{ color: 'var(--cb-muted)' }}>
              One platform, three journeys. Here’s what the path looks like for you.
            </p>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {ROLES.map(role => (
              <div
                key={role.title}
                className="flex flex-col rounded-2xl border p-7"
                style={{ borderColor: 'var(--cb-line)', background: 'var(--cb-surface)', boxShadow: 'var(--cb-shadow-sm)' }}
              >
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: 'var(--cb-primary-soft)' }}
                >
                  <role.icon className="h-6 w-6" style={{ color: 'var(--cb-primary)' }} />
                </span>
                <h3 className="mt-5 text-xl font-bold">{role.title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--cb-body)' }}>
                  {role.lede}
                </p>
                <ul className="mt-5 flex-1 space-y-3">
                  {role.points.map(p => (
                    <li key={p} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--cb-body)' }}>
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" style={{ color: 'var(--cb-primary)' }} />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={role.href}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold"
                  style={{ color: 'var(--cb-primary)' }}
                >
                  {role.cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verification / trust explainer */}
      <section className="cb-wrap py-20">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div>
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: 'var(--cb-accent-soft)', color: 'var(--cb-accent)' }}
            >
              <ShieldCheck className="h-3.5 w-3.5" /> How verification works
            </span>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Trust signals you can actually read</h2>
            <p className="mt-4 text-lg" style={{ color: 'var(--cb-body)' }}>
              Instead of a single vague “verified” badge, CamboBia uses distinct, clearly explained
              checks. Each one tells you exactly what was confirmed — and what it does not claim.
            </p>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--cb-muted)' }}>
              Verification helps you decide who to trust and where to start a conversation. It is not a
              recommendation, an endorsement, or a promise of quality, performance, or outcome. Always do
              your own review before making any decision or commitment.
            </p>
            <Link
              href="/trust"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold"
              style={{ color: 'var(--cb-primary)' }}
            >
              Visit the Trust Center <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {VERIFICATION.map(v => (
              <div
                key={v.label}
                className="rounded-2xl border p-6"
                style={{ borderColor: 'var(--cb-line)', background: '#fff', boxShadow: 'var(--cb-shadow-sm)' }}
              >
                <v.icon className="h-7 w-7" style={{ color: 'var(--cb-primary)' }} />
                <p className="mt-3 text-sm font-semibold" style={{ color: 'var(--cb-ink)' }}>
                  {v.label}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed" style={{ color: 'var(--cb-muted)' }}>
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section style={{ background: 'var(--cb-primary)' }}>
        <div className="cb-wrap py-16 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to get started?</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Create your credible profile in minutes and join a trusted marketplace built for Cambodian growth.
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
              href="/faq"
              className="inline-flex items-center justify-center rounded-xl border px-6 py-3.5 text-base font-semibold text-white"
              style={{ borderColor: 'rgba(255,255,255,0.4)' }}
            >
              Read the FAQ
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
