import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BadgeCheck, Building2, Lock, MapPin, Search, ShieldCheck, SlidersHorizontal } from 'lucide-react'
import PublicLayout from '@/components/public/PublicLayout'

export const metadata: Metadata = {
  title: 'Opportunities — CamboBia',
  description:
    'Discover credible Cambodian businesses seeking capital and expertise. Create a free account to browse live opportunities with verification you can see.',
}

// Illustrative examples only — real, live opportunities are visible to signed-in
// members. These are not actual listings.
const SAMPLES = [
  { name: 'Angkor Foods Co.', sector: 'Agriculture', stage: 'Growth', location: 'Siem Reap', need: '$250,000', use: 'Expand processing capacity', verified: 3 },
  { name: 'Mekong Logistics', sector: 'Logistics', stage: 'Early', location: 'Phnom Penh', need: '$120,000', use: 'Fleet & warehouse', verified: 2 },
  { name: 'Bassac Handicraft', sector: 'Manufacturing', stage: 'Growth', location: 'Kandal', need: '$80,000', use: 'Export expansion', verified: 4 },
  { name: 'Tonle Tech', sector: 'Technology', stage: 'Seed', location: 'Phnom Penh', need: '$150,000', use: 'Product & hiring', verified: 2 },
  { name: 'Kampot Pepper Estate', sector: 'Agriculture', stage: 'Growth', location: 'Kampot', need: '$200,000', use: 'Land & certification', verified: 3 },
  { name: 'Riel Retail Group', sector: 'Retail', stage: 'Established', location: 'Phnom Penh', need: '$300,000', use: 'New locations', verified: 3 },
]

const SECTORS = ['All sectors', 'Agriculture', 'Manufacturing', 'Technology', 'Logistics', 'Retail', 'Services']
const STAGES = ['All stages', 'Seed', 'Early', 'Growth', 'Established']

export default function OpportunitiesPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(180deg,#fff, var(--cb-surface))' }}>
        <div className="cb-wrap py-16 lg:py-20">
          <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'var(--cb-primary-soft)', color: 'var(--cb-primary-dark)' }}>
            <ShieldCheck className="h-3.5 w-3.5" /> Verification you can see
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">
            Discover credible Cambodian businesses
          </h1>
          <p className="mt-5 max-w-2xl text-lg" style={{ color: 'var(--cb-body)' }}>
            Browse businesses seeking capital and expertise, filter by sector and stage, and review verification before you connect. Create a free account to see live opportunities.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/auth/register" className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold text-white shadow-sm" style={{ background: 'var(--cb-primary)' }}>
              Create a free account <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/for-investors" className="inline-flex items-center justify-center rounded-xl border px-6 py-3.5 text-base font-semibold" style={{ borderColor: 'var(--cb-line)', color: 'var(--cb-ink)', background: '#fff' }}>
              How it works for investors
            </Link>
          </div>
        </div>
      </section>

      {/* Filters (preview) + samples */}
      <section className="cb-wrap py-14">
        {/* Filter bar — illustrative preview of the signed-in browsing experience */}
        <div className="rounded-2xl border p-4 sm:p-5" style={{ borderColor: 'var(--cb-line)', background: '#fff', boxShadow: 'var(--cb-shadow-sm)' }}>
          <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--cb-ink)' }}>
            <SlidersHorizontal className="h-4 w-4" style={{ color: 'var(--cb-primary)' }} /> Filter opportunities
          </div>
          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex flex-1 items-center gap-2 rounded-lg border px-3 py-2" style={{ borderColor: 'var(--cb-line)', background: 'var(--cb-surface)' }}>
              <Search className="h-4 w-4" style={{ color: 'var(--cb-muted)' }} />
              <span className="text-sm" style={{ color: 'var(--cb-muted)' }}>Search businesses…</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SECTORS.slice(0, 4).map((s, i) => (
                <span key={s} className="rounded-full border px-3 py-1.5 text-xs font-medium" style={{ borderColor: i === 0 ? 'var(--cb-primary)' : 'var(--cb-line)', color: i === 0 ? 'var(--cb-primary-dark)' : 'var(--cb-muted)', background: i === 0 ? 'var(--cb-primary-soft)' : '#fff' }}>{s}</span>
              ))}
              {STAGES.slice(1, 3).map((s) => (
                <span key={s} className="rounded-full border px-3 py-1.5 text-xs font-medium" style={{ borderColor: 'var(--cb-line)', color: 'var(--cb-muted)' }}>{s}</span>
              ))}
            </div>
          </div>
          <p className="mt-3 text-xs" style={{ color: 'var(--cb-muted)' }}>Live filtering and search are available to signed-in members.</p>
        </div>

        {/* Sample grid */}
        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-lg font-bold">Example opportunities</h2>
          <span className="text-xs font-medium" style={{ color: 'var(--cb-muted)' }}>Illustrative — not live listings</span>
        </div>

        <div className="relative mt-4">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="false">
            {SAMPLES.map((o) => (
              <article key={o.name} className="flex flex-col rounded-2xl border p-5" style={{ borderColor: 'var(--cb-line)', background: '#fff', boxShadow: 'var(--cb-shadow-sm)' }}>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl font-bold text-white" style={{ background: 'var(--cb-primary)' }}>{o.name.charAt(0)}</span>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--cb-ink)' }}>{o.name}</p>
                    <p className="flex items-center gap-1 text-xs" style={{ color: 'var(--cb-muted)' }}><MapPin className="h-3 w-3" /> {o.location}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: 'var(--cb-surface-2)', color: 'var(--cb-body)' }}>{o.sector}</span>
                  <span className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: 'var(--cb-surface-2)', color: 'var(--cb-body)' }}>{o.stage} stage</span>
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: 'var(--cb-primary-soft)', color: 'var(--cb-primary-dark)' }}><BadgeCheck className="h-3 w-3" /> {o.verified}/4 verified</span>
                </div>
                <div className="mt-4 rounded-lg p-3" style={{ background: 'var(--cb-surface)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--cb-muted)' }}>Funding need</p>
                  <p className="mt-0.5 font-bold" style={{ color: 'var(--cb-ink)' }}>{o.need} <span className="text-xs font-normal" style={{ color: 'var(--cb-muted)' }}>· {o.use}</span></p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--cb-primary)' }}>
                  <Building2 className="h-4 w-4" /> View profile
                </span>
              </article>
            ))}
          </div>

          {/* Sign-in gate overlay */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center" style={{ height: '60%', background: 'linear-gradient(180deg, transparent, var(--cb-surface) 78%)' }}>
            <div className="pointer-events-auto mt-auto mb-6 flex max-w-md flex-col items-center rounded-2xl border p-6 text-center" style={{ borderColor: 'var(--cb-line)', background: '#fff', boxShadow: 'var(--cb-shadow)' }}>
              <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: 'var(--cb-primary-soft)' }}><Lock className="h-5 w-5" style={{ color: 'var(--cb-primary)' }} /></span>
              <h3 className="mt-3 text-lg font-bold">See live opportunities</h3>
              <p className="mt-1.5 text-sm" style={{ color: 'var(--cb-body)' }}>Create a free account to browse real businesses, filter by your criteria, save profiles, and connect.</p>
              <div className="mt-4 flex w-full flex-col gap-2 sm:flex-row">
                <Link href="/auth/register" className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white" style={{ background: 'var(--cb-primary)' }}>Create account</Link>
                <Link href="/auth/login" className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold" style={{ borderColor: 'var(--cb-line)', color: 'var(--cb-ink)' }}>Log in</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ background: 'var(--cb-primary)' }}>
        <div className="cb-wrap py-14 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Ready to explore real opportunities?</h2>
          <p className="mx-auto mt-3 max-w-xl" style={{ color: 'rgba(255,255,255,0.85)' }}>Join CamboBia to browse verified Cambodian businesses and connect with confidence.</p>
          <Link href="/auth/register" className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold" style={{ color: 'var(--cb-primary-dark)' }}>
            Create your free account <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </PublicLayout>
  )
}
