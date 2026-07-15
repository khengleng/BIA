'use client'

import Link from 'next/link'
import { ArrowRight, Building2, TrendingUp, Briefcase, ShieldCheck, BadgeCheck, FileText, Users, Search, MessagesSquare } from 'lucide-react'
import PublicLayout from '@/components/public/PublicLayout'
import { usePublicContent } from '@/i18n/public-content'

export default function HomeContent() {
  const c = usePublicContent()
  const h = c.home

  const audiences = [
    { href: '/for-businesses', icon: Building2, title: h.aBizTitle, body: h.aBizBody, cta: h.aBizCta },
    { href: '/for-investors', icon: TrendingUp, title: h.aInvTitle, body: h.aInvBody, cta: h.aInvCta },
    { href: '/for-advisors', icon: Briefcase, title: h.aAdvTitle, body: h.aAdvBody, cta: h.aAdvCta },
  ]
  const steps = [
    { icon: FileText, title: h.step1Title, body: h.step1Body },
    { icon: Search, title: h.step2Title, body: h.step2Body },
    { icon: MessagesSquare, title: h.step3Title, body: h.step3Body },
  ]
  const badges = [
    { icon: BadgeCheck, label: h.badgeEmail },
    { icon: Users, label: h.badgeIdentity },
    { icon: Building2, label: h.badgeBusiness },
    { icon: Briefcase, label: h.badgeCredentials },
  ]

  return (
    <PublicLayout>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(180deg,#fff, var(--cb-surface))' }}>
        <div className="cb-wrap grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'var(--cb-primary-soft)', color: 'var(--cb-primary-dark)' }}>
              <ShieldCheck className="h-3.5 w-3.5" /> {h.badge}
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">{h.headline}</h1>
            <p className="mt-5 max-w-xl text-lg" style={{ color: 'var(--cb-body)' }}>{h.sub}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/auth/register" className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold text-white shadow-sm" style={{ background: 'var(--cb-primary)' }}>
                {h.ctaPrimary} <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/how-it-works" className="inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-3.5 text-base font-semibold" style={{ borderColor: 'var(--cb-line)', color: 'var(--cb-ink)', background: '#fff' }}>
                {h.ctaSecondary}
              </Link>
            </div>
            <p className="mt-4 text-sm" style={{ color: 'var(--cb-muted)' }}>{h.free}</p>
          </div>

          <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--cb-line)', background: '#fff', boxShadow: 'var(--cb-shadow)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl font-bold text-white" style={{ background: 'var(--cb-primary)' }}>A</span>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--cb-ink)' }}>Angkor Foods Co.</p>
                  <p className="text-sm" style={{ color: 'var(--cb-muted)' }}>Agriculture · Growth · Siem Reap</p>
                </div>
              </div>
              <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: 'var(--cb-primary-soft)', color: 'var(--cb-primary-dark)' }}>3/4</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {badges.map(b => (
                <div key={b.label} className="flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: 'var(--cb-line)' }}>
                  <b.icon className="h-4 w-4 flex-none" style={{ color: 'var(--cb-primary)' }} />
                  <span style={{ color: 'var(--cb-body)' }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Audiences */}
      <section className="cb-wrap py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">{h.audiencesTitle}</h2>
          <p className="mt-4 text-lg" style={{ color: 'var(--cb-muted)' }}>{h.audiencesSub}</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {audiences.map(a => (
            <div key={a.href} className="flex flex-col rounded-2xl border p-7" style={{ borderColor: 'var(--cb-line)', background: '#fff', boxShadow: 'var(--cb-shadow-sm)' }}>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: 'var(--cb-primary-soft)' }}><a.icon className="h-6 w-6" style={{ color: 'var(--cb-primary)' }} /></span>
              <h3 className="mt-5 text-xl font-bold">{a.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed" style={{ color: 'var(--cb-body)' }}>{a.body}</p>
              <Link href={a.href} className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--cb-primary)' }}>{a.cta} <ArrowRight className="h-4 w-4" /></Link>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: '#fff', borderTop: '1px solid var(--cb-line)', borderBottom: '1px solid var(--cb-line)' }}>
        <div className="cb-wrap py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">{h.howTitle}</h2>
            <p className="mt-4 text-lg" style={{ color: 'var(--cb-muted)' }}>{h.howSub}</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
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
            <Link href="/how-it-works" className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--cb-primary)' }}>{h.howMore} <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="cb-wrap py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'var(--cb-accent-soft)', color: 'var(--cb-accent)' }}><ShieldCheck className="h-3.5 w-3.5" /> {h.trustBadge}</span>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">{h.trustTitle}</h2>
            <p className="mt-4 text-lg" style={{ color: 'var(--cb-body)' }}>{h.trustSub}</p>
            <ul className="mt-6 space-y-3">
              {[h.trustP1, h.trustP2, h.trustP3, h.trustP4].map(t => (
                <li key={t} className="flex items-start gap-3 text-sm" style={{ color: 'var(--cb-body)' }}><BadgeCheck className="mt-0.5 h-5 w-5 flex-none" style={{ color: 'var(--cb-primary)' }} /> {t}</li>
              ))}
            </ul>
            <Link href="/trust" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--cb-primary)' }}>{h.trustCta} <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {badges.map(b => (
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
          <h2 className="text-3xl font-bold text-white sm:text-4xl">{h.finalTitle}</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg" style={{ color: 'rgba(255,255,255,0.85)' }}>{h.finalSub}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/auth/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold" style={{ color: 'var(--cb-primary-dark)' }}>{h.ctaPrimary} <ArrowRight className="h-5 w-5" /></Link>
            <Link href="/contact" className="inline-flex items-center justify-center rounded-xl border px-6 py-3.5 text-base font-semibold text-white" style={{ borderColor: 'rgba(255,255,255,0.4)' }}>{h.finalCtaSecondary}</Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
