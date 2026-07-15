'use client'

import Link from 'next/link'
import { ShieldCheck, Mail, MapPin } from 'lucide-react'
import { usePublicContent } from '@/i18n/public-content'

export default function PublicFooter() {
  const c = usePublicContent()

  const cols: { title: string; links: { href: string; label: string }[] }[] = [
    { title: c.footer.colPlatform, links: [
      { href: '/how-it-works', label: c.nav.howItWorks },
      { href: '/opportunities', label: c.nav.opportunities },
      { href: '/trust', label: c.footer.trustSecurity },
      { href: '/faq', label: c.footer.faq },
    ]},
    { title: c.footer.colAudience, links: [
      { href: '/for-businesses', label: c.nav.forBusinesses },
      { href: '/for-investors', label: c.nav.forInvestors },
      { href: '/for-advisors', label: c.nav.forAdvisors },
    ]},
    { title: c.footer.colCompany, links: [
      { href: '/about', label: c.footer.about },
      { href: '/contact', label: c.footer.contact },
    ]},
    { title: c.footer.colLegal, links: [
      { href: '/terms', label: c.footer.terms },
      { href: '/privacy', label: c.footer.privacy },
      { href: '/risk-disclosure', label: c.footer.risk },
    ]},
  ]

  return (
    <footer className="border-t" style={{ borderColor: 'var(--cb-line)', background: '#fff' }}>
      <div className="cb-wrap py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl font-bold text-white" style={{ background: 'var(--cb-primary)' }}>C</span>
              <span className="text-lg font-bold" style={{ color: 'var(--cb-ink)' }}>Cambo<span style={{ color: 'var(--cb-primary)' }}>Bia</span></span>
            </div>
            <p className="mt-4 max-w-xs text-sm" style={{ color: 'var(--cb-muted)' }}>{c.footer.tagline}</p>
            <div className="mt-5 space-y-2 text-sm" style={{ color: 'var(--cb-muted)' }}>
              <a href="mailto:contact@cambobia.com" className="flex items-center gap-2 hover:underline"><Mail className="h-4 w-4" /> contact@cambobia.com</a>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Phnom Penh, Cambodia</p>
              <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" style={{ color: 'var(--cb-primary)' }} /> <Link href="/trust" className="hover:underline">{c.footer.trustSecurity}</Link></p>
            </div>
          </div>

          {cols.map(col => (
            <div key={col.title}>
              <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--cb-ink)' }}>{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map(l => (
                  <li key={l.href}><Link href={l.href} className="text-sm hover:underline" style={{ color: 'var(--cb-muted)' }}>{l.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t pt-6 text-sm sm:flex-row sm:items-center" style={{ borderColor: 'var(--cb-line)', color: 'var(--cb-muted)' }}>
          <p>© 2026 CamboBia. {c.footer.rights}</p>
          <p className="max-w-2xl text-xs">{c.footer.disclaimer} <Link href="/risk-disclosure" className="underline">{c.footer.risk}</Link>.</p>
        </div>
      </div>
    </footer>
  )
}
