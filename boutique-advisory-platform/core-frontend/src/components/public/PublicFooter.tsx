'use client'

import Link from 'next/link'
import { ShieldCheck, Mail, MapPin } from 'lucide-react'

const COLS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: 'Platform',
    links: [
      { href: '/how-it-works', label: 'How it works' },
      { href: '/opportunities', label: 'Opportunities' },
      { href: '/trust', label: 'Trust & security' },
      { href: '/faq', label: 'FAQ' },
    ],
  },
  {
    title: 'Who it’s for',
    links: [
      { href: '/for-businesses', label: 'For businesses' },
      { href: '/for-investors', label: 'For investors' },
      { href: '/for-advisors', label: 'For advisors' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About CamboBia' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/terms', label: 'Terms of Service' },
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/risk-disclosure', label: 'Risk Disclosure' },
    ],
  },
]

export default function PublicFooter() {
  return (
    <footer className="border-t" style={{ borderColor: 'var(--cb-line)', background: '#fff' }}>
      <div className="cb-wrap py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          {/* Brand + contact */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl font-bold text-white" style={{ background: 'var(--cb-primary)' }}>C</span>
              <span className="text-lg font-bold" style={{ color: 'var(--cb-ink)' }}>Cambo<span style={{ color: 'var(--cb-primary)' }}>Bia</span></span>
            </div>
            <p className="mt-4 max-w-xs text-sm" style={{ color: 'var(--cb-muted)' }}>
              Where Cambodian businesses meet capital and expertise. Credible profiles, trusted connections, professional advice.
            </p>
            <div className="mt-5 space-y-2 text-sm" style={{ color: 'var(--cb-muted)' }}>
              <a href="mailto:contact@cambobia.com" className="flex items-center gap-2 hover:underline"><Mail className="h-4 w-4" /> contact@cambobia.com</a>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Phnom Penh, Cambodia</p>
              <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" style={{ color: 'var(--cb-primary)' }} /> <Link href="/trust" className="hover:underline">Trust &amp; security</Link></p>
            </div>
          </div>

          {COLS.map(col => (
            <div key={col.title}>
              <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--cb-ink)' }}>{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm hover:underline" style={{ color: 'var(--cb-muted)' }}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t pt-6 text-sm sm:flex-row sm:items-center" style={{ borderColor: 'var(--cb-line)', color: 'var(--cb-muted)' }}>
          <p>© {2026} CamboBia. All rights reserved.</p>
          <p className="max-w-2xl text-xs">
            CamboBia is a connection and information platform. It does not provide investment, legal, tax, or financial advice and does not guarantee funding, returns, or outcomes. See our <Link href="/risk-disclosure" className="underline">Risk Disclosure</Link>.
          </p>
        </div>
      </div>
    </footer>
  )
}
