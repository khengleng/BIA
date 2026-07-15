import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Building2, TrendingUp, Briefcase, ShieldCheck, BadgeCheck, FileText, Users, Search, MessagesSquare } from 'lucide-react'
import PublicLayout from '@/components/public/PublicLayout'

export const metadata: Metadata = {
  title: 'CamboBia — Where Cambodian businesses meet capital and expertise',
  description:
    'CamboBia helps growing Cambodian businesses build credible profiles, connect with potential investors, and access trusted professional advisors.',
}

const AUDIENCES = [
  {
    href: '/for-businesses',
    icon: Building2,
    title: 'For businesses',
    body: 'Build a credible business profile, connect with advisors, present your funding needs, and increase your visibility to potential investors.',
    cta: 'Grow your business',
  },
  {
    href: '/for-investors',
    icon: TrendingUp,
    title: 'For investors',
    body: 'Discover and filter businesses, save opportunities, track your interests, and review verification information before you connect.',
    cta: 'Discover businesses',
  },
  {
    href: '/for-advisors',
    icon: Briefcase,
    title: 'For advisors',
    body: 'Create a professional profile, show your credentials, offer services, and receive advisory requests from growing businesses.',
    cta: 'Offer your expertise',
  },
]

const STEPS = [
  { icon: FileText, title: 'Create a credible profile', body: 'Businesses, investors and advisors build verified profiles that show who they are and what they’re looking for.' },
  { icon: Search, title: 'Discover and connect', body: 'Investors filter and save opportunities; advisors and businesses find each other through a trusted, structured directory.' },
  { icon: MessagesSquare, title: 'Engage with confidence', body: 'Message, ask questions, and progress conversations with verification and trust signals visible throughout.' },
]

const BADGES = [
  { icon: BadgeCheck, label: 'Email verified' },
  { icon: Users, label: 'Identity verified' },
  { icon: Building2, label: 'Business verified' },
  { icon: Briefcase, label: 'Credentials verified' },
]

export default function HomePage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(180deg,#fff, var(--cb-surface))' }}>
        <div className="cb-wrap grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'var(--cb-primary-soft)', color: 'var(--cb-primary-dark)' }}>
              <ShieldCheck className="h-3.5 w-3.5" /> A trusted marketplace for Cambodian growth
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">
              Where Cambodian businesses meet capital and expertise
            </h1>
            <p className="mt-5 max-w-xl text-lg" style={{ color: 'var(--cb-body)' }}>
              CamboBia helps growing businesses build credible profiles, connect with potential investors, and access trusted professional advisors.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/auth/register" className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold text-white shadow-sm" style={{ background: 'var(--cb-primary)' }}>
                Create your profile <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/how-it-works" className="inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-3.5 text-base font-semibold" style={{ borderColor: 'var(--cb-line)', color: 'var(--cb-ink)', background: '#fff' }}>
                See how it works
              </Link>
            </div>
            <p className="mt-4 text-sm" style={{ color: 'var(--cb-muted)' }}>Free to create a profile · No investment or funding guaranteed</p>
          </div>

          {/* Trust preview card */}
          <div className="rounded-2xl border p-6 shadow-sm" style={{ borderColor: 'var(--cb-line)', background: '#fff', boxShadow: 'var(--cb-shadow)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl font-bold text-white" style={{ background: 'var(--cb-primary)' }}>A</span>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--cb-ink)' }}>Angkor Foods Co.</p>
                  <p className="text-sm" style={{ color: 'var(--cb-muted)' }}>Agriculture · Growth stage · Siem Reap</p>
                </div>
              </div>
              <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: 'var(--cb-primary-soft)', color: 'var(--cb-primary-dark)' }}>3/4 verified</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {BADGES.map(b => (
                <div key={b.label} className="flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: 'var(--cb-line)' }}>
                  <b.icon className="h-4 w-4" style={{ color: 'var(--cb-primary)' }} />
                  <span style={{ color: 'var(--cb-body)' }}>{b.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-lg p-4" style={{ background: 'var(--cb-surface)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--cb-muted)' }}>Funding need</p>
              <p className="mt-1 text-lg font-bold" style={{ color: 'var(--cb-ink)' }}>$250,000 <span className="text-sm font-normal" style={{ color: 'var(--cb-muted)' }}>· to expand processing capacity</span></p>
            </div>
            <p className="mt-3 text-center text-xs" style={{ color: 'var(--cb-muted)' }}>Illustrative profile — not a real listing</p>
          </div>
        </div>
      </section>

      {/* Audiences */}
      <section className="cb-wrap py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">One platform, three ways to grow</h2>
          <p className="mt-4 text-lg" style={{ color: 'var(--cb-muted)' }}>Whether you’re raising, investing, or advising — CamboBia gives you a credible, trusted place to connect.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {AUDIENCES.map(a => (
            <div key={a.href} className="flex flex-col rounded-2xl border p-7" style={{ borderColor: 'var(--cb-line)', background: '#fff', boxShadow: 'var(--cb-shadow-sm)' }}>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: 'var(--cb-primary-soft)' }}>
                <a.icon className="h-6 w-6" style={{ color: 'var(--cb-primary)' }} />
              </span>
              <h3 className="mt-5 text-xl font-bold">{a.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed" style={{ color: 'var(--cb-body)' }}>{a.body}</p>
              <Link href={a.href} className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--cb-primary)' }}>
                {a.cta} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: '#fff', borderTop: '1px solid var(--cb-line)', borderBottom: '1px solid var(--cb-line)' }}>
        <div className="cb-wrap py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">How CamboBia works</h2>
            <p className="mt-4 text-lg" style={{ color: 'var(--cb-muted)' }}>A clear, credible path from profile to connection.</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title}>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: 'var(--cb-primary)' }}>{i + 1}</span>
                  <s.icon className="h-5 w-5" style={{ color: 'var(--cb-primary)' }} />
                </div>
                <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--cb-body)' }}>{s.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/how-it-works" className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--cb-primary)' }}>
              See the full walkthrough <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="cb-wrap py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'var(--cb-accent-soft)', color: 'var(--cb-accent)' }}>
              <ShieldCheck className="h-3.5 w-3.5" /> Built on trust
            </span>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Trust you can see, at every step</h2>
            <p className="mt-4 text-lg" style={{ color: 'var(--cb-body)' }}>
              We use distinct, explained verification signals — never a single vague “verified” label — so everyone knows exactly what has been checked.
            </p>
            <ul className="mt-6 space-y-3">
              {['Separate email, identity, business, and credential verification','Advisor-reviewed business information','Clear reporting for suspicious activity','Honest limitations — we connect, we don’t guarantee outcomes'].map(t => (
                <li key={t} className="flex items-start gap-3 text-sm" style={{ color: 'var(--cb-body)' }}>
                  <BadgeCheck className="mt-0.5 h-5 w-5 flex-none" style={{ color: 'var(--cb-primary)' }} /> {t}
                </li>
              ))}
            </ul>
            <Link href="/trust" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--cb-primary)' }}>
              Visit the Trust Center <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {BADGES.map(b => (
              <div key={b.label} className="rounded-2xl border p-6 text-center" style={{ borderColor: 'var(--cb-line)', background: '#fff', boxShadow: 'var(--cb-shadow-sm)' }}>
                <b.icon className="mx-auto h-8 w-8" style={{ color: 'var(--cb-primary)' }} />
                <p className="mt-3 text-sm font-semibold" style={{ color: 'var(--cb-ink)' }}>{b.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ background: 'var(--cb-primary)' }}>
        <div className="cb-wrap py-16 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to build your credible profile?</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Join Cambodian businesses, investors, and advisors building trusted connections on CamboBia.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/auth/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold" style={{ color: 'var(--cb-primary-dark)' }}>
              Create your profile <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center rounded-xl border px-6 py-3.5 text-base font-semibold text-white" style={{ borderColor: 'rgba(255,255,255,0.4)' }}>
              Talk to our team
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
