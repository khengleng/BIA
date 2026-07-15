import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
  Bookmark,
  Eye,
  MessagesSquare,
  BadgeCheck,
  TrendingUp,
  Building2,
  Users,
  ListChecks,
  HelpCircle,
} from 'lucide-react'
import PublicLayout from '@/components/public/PublicLayout'

export const metadata: Metadata = {
  title: 'For investors — Discover credible Cambodian businesses | CamboBia',
  description:
    'CamboBia helps investors discover Cambodian businesses, filter opportunities, save profiles, track interests, and review verification information before making contact.',
}

const BENEFITS = [
  {
    icon: Search,
    title: 'Discover Cambodian businesses',
    body: 'Browse a structured directory of SMEs across sectors and stages, each presented in a consistent, comparable format.',
  },
  {
    icon: Filter,
    title: 'Filter to what fits you',
    body: 'Narrow opportunities by sector, stage, location, and funding need so you spend time only on what matches your thesis.',
  },
  {
    icon: Bookmark,
    title: 'Save profiles and shortlist',
    body: 'Bookmark businesses that interest you and build a shortlist you can revisit and compare at your own pace.',
  },
  {
    icon: ListChecks,
    title: 'Track your interests',
    body: 'Keep tabs on the opportunities you’re following, and stay organised across everything in your pipeline.',
  },
  {
    icon: BadgeCheck,
    title: 'Review verification information',
    body: 'See distinct email, identity, and business verification signals — and advisor reviews — before you decide to engage.',
  },
  {
    icon: MessagesSquare,
    title: 'Contact relevant businesses',
    body: 'Reach out directly to businesses that fit, and start conversations with trust signals visible throughout.',
  },
]

const STEPS = [
  {
    icon: Users,
    title: 'Create your investor profile',
    body: 'Register for free and set up a profile that reflects your interests, so relevant businesses understand who you are.',
  },
  {
    icon: Filter,
    title: 'Discover and filter opportunities',
    body: 'Explore the directory, filter to your criteria, and save the businesses worth a closer look.',
  },
  {
    icon: MessagesSquare,
    title: 'Review, track, and connect',
    body: 'Review verification information, track your shortlist, and reach out to the businesses you want to engage with.',
  },
]

const TRUST = [
  'Distinct email, identity, and business verification — see exactly what was checked',
  'Advisor-reviewed business information for added context',
  'Clear reporting channels for suspicious activity',
  'Honest limitations — we surface information, we don’t guarantee returns',
]

const FAQ = [
  {
    q: 'Does CamboBia guarantee returns or vet deals for me?',
    a: 'No. CamboBia surfaces information and verification signals to help you make your own decisions. It does not provide investment advice, guarantee returns, or replace your own due diligence.',
  },
  {
    q: 'What does the verification information tell me?',
    a: 'You’ll see distinct signals — email, identity, and business verification, plus advisor reviews where available — so you know exactly what has been checked, rather than relying on a single vague badge.',
  },
  {
    q: 'How much does it cost to browse?',
    a: 'Creating an investor profile and exploring businesses is free. You can filter, save, and track opportunities before deciding whether to make contact.',
  },
  {
    q: 'Can I stay anonymous until I’m ready to connect?',
    a: 'You control your profile and when you reach out. Businesses see your interest when you choose to contact them, so you can research on your own terms first.',
  },
]

export default function ForInvestorsPage() {
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
              <TrendingUp className="h-3.5 w-3.5" /> For investors
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">
              Discover credible Cambodian businesses, with verification you can see.
            </h1>
            <p className="mt-5 max-w-xl text-lg" style={{ color: 'var(--cb-body)' }}>
              CamboBia gives investors a structured way to find, filter, and follow Cambodian SMEs —
              and to review clear verification information before you ever make contact.
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
              Free to create a profile · No returns or outcomes guaranteed
            </p>
          </div>

          {/* Illustrative discovery card */}
          <div
            className="rounded-2xl border p-6 shadow-sm"
            style={{ borderColor: 'var(--cb-line)', background: '#fff', boxShadow: 'var(--cb-shadow)' }}
          >
            <div className="flex items-center gap-2 rounded-lg border px-3 py-2.5" style={{ borderColor: 'var(--cb-line)' }}>
              <Search className="h-4 w-4" style={{ color: 'var(--cb-muted)' }} />
              <span className="text-sm" style={{ color: 'var(--cb-muted)' }}>
                Agriculture · Growth stage · Kampong Cham
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {[
                { name: 'Angkor Foods Co.', tag: '3/4 verified', meta: 'Agriculture · $250k need' },
                { name: 'Tonle Fresh Produce', tag: 'Verified', meta: 'Agri-processing · $120k need' },
                { name: 'Bassac Organics', tag: '2/4 verified', meta: 'Export · $300k need' },
              ].map((c) => (
                <div
                  key={c.name}
                  className="flex items-center justify-between rounded-lg border px-4 py-3"
                  style={{ borderColor: 'var(--cb-line)' }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white"
                      style={{ background: 'var(--cb-primary)' }}
                    >
                      {c.name.charAt(0)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--cb-ink)' }}>
                        {c.name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--cb-muted)' }}>
                        {c.meta}
                      </p>
                    </div>
                  </div>
                  <span
                    className="rounded-full px-2.5 py-1 text-xs font-bold"
                    style={{ background: 'var(--cb-primary-soft)', color: 'var(--cb-primary-dark)' }}
                  >
                    {c.tag}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-xs" style={{ color: 'var(--cb-muted)' }}>
              Illustrative results — not real listings
            </p>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="cb-wrap py-16 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Promising businesses are hard to find — and harder to trust
          </h2>
          <p className="mt-5 text-lg" style={{ color: 'var(--cb-body)' }}>
            For investors interested in Cambodia’s SMEs, deal flow is fragmented, information is
            inconsistent, and it’s difficult to know what has actually been verified. CamboBia brings
            opportunities into one structured directory, with distinct verification signals you can
            review — so you can research and shortlist with clarity before you reach out.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ background: '#fff', borderTop: '1px solid var(--cb-line)', borderBottom: '1px solid var(--cb-line)' }}>
        <div className="cb-wrap py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">What you get with CamboBia</h2>
            <p className="mt-4 text-lg" style={{ color: 'var(--cb-muted)' }}>
              The tools to discover, evaluate, and follow opportunities on your own terms.
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
          <h2 className="text-3xl font-bold sm:text-4xl">How it works for investors</h2>
          <p className="mt-4 text-lg" style={{ color: 'var(--cb-muted)' }}>
            A clear path from discovery to connection.
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
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Information you can actually evaluate</h2>
              <p className="mt-4 text-lg" style={{ color: 'var(--cb-body)' }}>
                We show distinct, explained verification signals — never a single ambiguous “verified”
                label — so you always know what has been checked before you engage.
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
                { icon: Eye, label: 'Advisor reviewed' },
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
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to discover your next opportunity?</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Explore Cambodian businesses, filter to your criteria, and review verification information before you connect.
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
