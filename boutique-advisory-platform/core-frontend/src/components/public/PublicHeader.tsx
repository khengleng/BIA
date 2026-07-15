'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import i18n from '@/i18n'
import { usePublicContent } from '@/i18n/public-content'
import { Menu, X, Globe, ArrowRight } from 'lucide-react'

const NAV = [
  { href: '/how-it-works', key: 'howItWorks' },
  { href: '/for-businesses', key: 'forBusinesses' },
  { href: '/for-investors', key: 'forInvestors' },
  { href: '/for-advisors', key: 'forAdvisors' },
  { href: '/opportunities', key: 'opportunities' },
] as const

function CamboBiaLogo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="CamboBia home">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl font-bold text-white" style={{ background: 'var(--cb-primary)' }}>C</span>
      <span className="text-lg font-bold" style={{ color: 'var(--cb-ink)' }}>Cambo<span style={{ color: 'var(--cb-primary)' }}>Bia</span></span>
    </Link>
  )
}

function LangToggle() {
  // Deterministic 'en' initial render (avoids hydration mismatch); reflect the
  // real language after mount and stay in sync with changes.
  const [lang, setLang] = useState('en')
  useEffect(() => {
    setLang(i18n.language || 'en')
    const onChange = (lng: string) => setLang(lng)
    i18n.on('languageChanged', onChange)
    return () => { i18n.off('languageChanged', onChange) }
  }, [])
  const isKm = lang.startsWith('km')
  const next = isKm ? 'en' : 'km'
  return (
    <button
      onClick={() => i18n.changeLanguage(next)}
      className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--cb-surface-2)]"
      style={{ color: 'var(--cb-body)', borderColor: 'var(--cb-line)' }}
      aria-label={isKm ? 'ប្តូរទៅភាសាអង់គ្លេស' : 'Switch to Khmer'}
      title={isKm ? 'Switch to English' : 'ប្តូរទៅភាសាខ្មែរ'}
    >
      <Globe className="h-4 w-4" />
      {isKm ? 'English' : 'ខ្មែរ'}
    </button>
  )
}

export default function PublicHeader() {
  const [open, setOpen] = useState(false)
  const c = usePublicContent()

  return (
    <header className="sticky top-0 z-40 border-b backdrop-blur" style={{ borderColor: 'var(--cb-line)', background: 'rgba(255,255,255,0.88)' }}>
      <div className="cb-wrap flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <CamboBiaLogo />
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {NAV.map(item => (
              <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--cb-surface-2)]" style={{ color: 'var(--cb-body)' }}>
                {c.nav[item.key]}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <LangToggle />
          <Link href="/auth/login" className="rounded-lg px-3.5 py-2 text-sm font-semibold" style={{ color: 'var(--cb-ink)' }}>{c.nav.login}</Link>
          <Link href="/auth/register" className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors" style={{ background: 'var(--cb-primary)' }}>
            {c.nav.createAccount} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <button className="inline-flex items-center justify-center rounded-lg p-2 lg:hidden" onClick={() => setOpen(v => !v)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t lg:hidden" style={{ borderColor: 'var(--cb-line)', background: '#fff' }}>
          <nav className="cb-wrap flex flex-col gap-1 py-4" aria-label="Mobile">
            {NAV.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-base font-medium hover:bg-[var(--cb-surface-2)]" style={{ color: 'var(--cb-ink)' }}>
                {c.nav[item.key]}
              </Link>
            ))}
            <div className="mt-3 flex items-center gap-3 border-t pt-4" style={{ borderColor: 'var(--cb-line)' }}>
              <LangToggle />
              <Link href="/auth/login" onClick={() => setOpen(false)} className="flex-1 rounded-lg border px-4 py-2.5 text-center text-sm font-semibold" style={{ borderColor: 'var(--cb-line)', color: 'var(--cb-ink)' }}>{c.nav.login}</Link>
              <Link href="/auth/register" onClick={() => setOpen(false)} className="flex-1 rounded-lg px-4 py-2.5 text-center text-sm font-semibold text-white" style={{ background: 'var(--cb-primary)' }}>{c.nav.createAccount}</Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
