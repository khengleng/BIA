import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  ShieldCheck,
  Eye,
  MapPin,
  Handshake,
  Check,
  X,
  Building2,
  TrendingUp,
  Briefcase,
} from 'lucide-react'
import PublicLayout from '@/components/public/PublicLayout'

export const metadata: Metadata = {
  title: 'About CamboBia — connecting Cambodian businesses with capital and expertise',
  description:
    'CamboBia exists to close Cambodia’s SME financing and trust gap by connecting businesses, investors, and advisors on a credible, transparent platform.',
}

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Trust',
    body: 'We build distinct, explained verification into every profile so people know exactly who they’re dealing with — never a single vague badge.',
  },
  {
    icon: Eye,
    title: 'Transparency',
    body: 'We’re clear about what we do, what we don’t, and the limits of what any connection can promise. No hidden incentives, no inflated claims.',
  },
  {
    icon: MapPin,
    title: 'Local expertise',
    body: 'We’re built for Cambodia’s market, businesses, and advisors — with the local context that generic global platforms miss.',
  },
]

const WE_ARE = [
  'A connection platform that helps businesses, investors, and advisors find each other.',
  'An information platform that presents structured, comparable profiles and verification signals.',
  'A directory where investors can discover and follow Cambodian businesses.',
  'A place for advisors to show credentials and receive genuine requests.',
]

const WE_ARE_NOT = [
  'A bank, lender, or provider of any financial product.',
  'A broker, dealer, or intermediary that arranges or executes transactions.',
  'An investment, legal, tax, or financial adviser — we don’t give advice.',
  'A guarantor of funding, returns, valuations, or any particular outcome.',
]

const AUDIENCES = [
  { icon: Building2, title: 'Businesses', body: 'Build credibility and reach people who can help you grow.', href: '/for-businesses' },
  { icon: TrendingUp, title: 'Investors', body: 'Discover and evaluate Cambodian businesses with better information.', href: '/for-investors' },
  { icon: Briefcase, title: 'Advisors', body: 'Show your expertise and connect with businesses that need it.', href: '/for-advisors' },
]

export default function AboutPage() {
  return (
    <PublicLayout>
      {/* Hero / mission */}
      <section style={{ background: 'linear-gradient(180deg,#fff, var(--cb-surface))' }}>
        <div className="cb-wrap py-20 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: 'var(--cb-primary-soft)', color: 'var(--cb-primary-dark)' }}
            >
              <Handshake className="h-3.5 w-3.5" /> About CamboBia
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">
              Where Cambodian businesses meet capital and expertise
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg" style={{ color: 'var(--cb-body)' }}>
              Our mission is simple: help credible Cambodian businesses connect with the investors and
              advisors who can help them grow — on a platform built around trust, transparency, and local
              context.
            </p>
          </div>
        </div>
      </section>

      {/* Why we exist */}
      <section className="cb-wrap py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">Why CamboBia exists</h2>
            <p className="mt-5 text-lg leading-relaxed" style={{ color: 'var(--cb-body)' }}>
              Cambodia’s small and medium enterprises are the backbone of the economy — yet many struggle
              to access growth capital and trusted professional advice. Capable businesses stay invisible
              to investors, and investors struggle to find and evaluate credible opportunities.
            </p>
            <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--cb-body)' }}>
              The gap isn’t only about money. It’s a trust gap: it’s hard to know who is genuine, what has
              been verified, and where to start a conversation safely. CamboBia was built to close that gap
              — with structured profiles, distinct verification signals, and honest expectations about what
              a connection can and cannot do.
            </p>
          </div>
          <div
            className="rounded-2xl border p-8"
            style={{ borderColor: 'var(--cb-line)', background: '#fff', boxShadow: 'var(--cb-shadow)' }}
          >
            <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--cb-muted)' }}>
              The gap we address
            </h3>
            <dl className="mt-6 space-y-6">
              <div>
                <dt className="text-base font-bold" style={{ color: 'var(--cb-ink)' }}>
                  A financing gap
                </dt>
                <dd className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--cb-body)' }}>
                  Growing businesses often can’t reach investors who’d be interested — and lack a credible
                  way to present themselves.
                </dd>
              </div>
              <div>
                <dt className="text-base font-bold" style={{ color: 'var(--cb-ink)' }}>
                  A trust gap
                </dt>
                <dd className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--cb-body)' }}>
                  Without clear verification, it’s hard to know who is genuine or where it’s safe to begin.
                </dd>
              </div>
              <div>
                <dt className="text-base font-bold" style={{ color: 'var(--cb-ink)' }}>
                  An expertise gap
                </dt>
                <dd className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--cb-body)' }}>
                  Many businesses need advisory support to become investment-ready, but don’t know where to
                  find qualified help.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ background: '#fff', borderTop: '1px solid var(--cb-line)', borderBottom: '1px solid var(--cb-line)' }}>
        <div className="cb-wrap py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">What we value</h2>
            <p className="mt-4 text-lg" style={{ color: 'var(--cb-muted)' }}>
              Three principles guide every decision we make about the platform.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {VALUES.map(v => (
              <div
                key={v.title}
                className="rounded-2xl border p-7"
                style={{ borderColor: 'var(--cb-line)', background: 'var(--cb-surface)', boxShadow: 'var(--cb-shadow-sm)' }}
              >
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: 'var(--cb-primary-soft)' }}
                >
                  <v.icon className="h-6 w-6" style={{ color: 'var(--cb-primary)' }} />
                </span>
                <h3 className="mt-5 text-xl font-bold">{v.title}</h3>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--cb-body)' }}>
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we are / are not */}
      <section className="cb-wrap py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: 'var(--cb-accent-soft)', color: 'var(--cb-accent)' }}
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Honest by design
          </span>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">What we are — and what we are not</h2>
          <p className="mt-4 text-lg" style={{ color: 'var(--cb-muted)' }}>
            Being clear about our limits is part of being trustworthy.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div
            className="rounded-2xl border p-7"
            style={{ borderColor: 'var(--cb-line)', background: '#fff', boxShadow: 'var(--cb-shadow-sm)' }}
          >
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ background: 'var(--cb-primary-soft)' }}
              >
                <Check className="h-4 w-4" style={{ color: 'var(--cb-primary)' }} />
              </span>
              We are
            </h3>
            <ul className="mt-5 space-y-3">
              {WE_ARE.map(item => (
                <li key={item} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--cb-body)' }}>
                  <Check className="mt-0.5 h-4 w-4 flex-none" style={{ color: 'var(--cb-good)' }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div
            className="rounded-2xl border p-7"
            style={{ borderColor: 'var(--cb-line)', background: '#fff', boxShadow: 'var(--cb-shadow-sm)' }}
          >
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ background: 'var(--cb-accent-soft)' }}
              >
                <X className="h-4 w-4" style={{ color: 'var(--cb-accent)' }} />
              </span>
              We are not
            </h3>
            <ul className="mt-5 space-y-3">
              {WE_ARE_NOT.map(item => (
                <li key={item} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--cb-body)' }}>
                  <X className="mt-0.5 h-4 w-4 flex-none" style={{ color: 'var(--cb-danger)' }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-relaxed" style={{ color: 'var(--cb-muted)' }}>
          CamboBia connects and informs; the decisions are always yours. Please review our{' '}
          <Link href="/risk-disclosure" className="underline" style={{ color: 'var(--cb-primary)' }}>
            Risk Disclosure
          </Link>{' '}
          before acting on anything you find on the platform.
        </p>
      </section>

      {/* Who it's for */}
      <section style={{ background: 'var(--cb-surface)', borderTop: '1px solid var(--cb-line)' }}>
        <div className="cb-wrap py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Built for three roles</h2>
            <p className="mt-4 text-lg" style={{ color: 'var(--cb-muted)' }}>
              One trusted marketplace serving Cambodia’s businesses, investors, and advisors.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {AUDIENCES.map(a => (
              <Link
                key={a.href}
                href={a.href}
                className="flex flex-col rounded-2xl border p-7"
                style={{ borderColor: 'var(--cb-line)', background: '#fff', boxShadow: 'var(--cb-shadow-sm)' }}
              >
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: 'var(--cb-primary-soft)' }}
                >
                  <a.icon className="h-6 w-6" style={{ color: 'var(--cb-primary)' }} />
                </span>
                <h3 className="mt-5 text-xl font-bold">{a.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed" style={{ color: 'var(--cb-body)' }}>
                  {a.body}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--cb-primary)' }}>
                  Learn more <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section style={{ background: 'var(--cb-primary)' }}>
        <div className="cb-wrap py-16 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Want to know more?</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg" style={{ color: 'rgba(255,255,255,0.85)' }}>
            We’d love to hear from you — whether you’re a business, an investor, an advisor, or a partner.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold"
              style={{ color: 'var(--cb-primary-dark)' }}
            >
              Contact our team <ArrowRight className="h-5 w-5" />
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
