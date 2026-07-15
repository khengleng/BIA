'use client'

import { Printer } from 'lucide-react'
import PublicLayout from './PublicLayout'

export interface LegalSection { heading: string; paragraphs: string[] }
export interface LegalPageProps {
  title: string
  version: string
  effectiveDate: string
  intro: string
  sections: LegalSection[]
}

/** Consistent, printable, mobile-friendly renderer for legal documents.
 *  Every legal page shows title, version, effective date, company + contact,
 *  a table of contents, and clear headings — and is publicly accessible. */
export default function LegalPage({ title, version, effectiveDate, intro, sections }: LegalPageProps) {
  return (
    <PublicLayout>
      <div className="cb-wrap py-14" style={{ maxWidth: 860 }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold sm:text-4xl">{title}</h1>
            <p className="mt-3 text-sm" style={{ color: 'var(--cb-muted)' }}>
              Version {version} · Effective {effectiveDate} · CamboBia (Cambodia)
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium print:hidden"
            style={{ borderColor: 'var(--cb-line)', color: 'var(--cb-ink)', background: '#fff' }}
          >
            <Printer className="h-4 w-4" /> Print / Save PDF
          </button>
        </div>

        <p className="mt-6 text-base leading-relaxed" style={{ color: 'var(--cb-body)' }}>{intro}</p>

        {/* Table of contents */}
        <nav className="mt-8 rounded-xl border p-5 print:hidden" style={{ borderColor: 'var(--cb-line)', background: '#fff' }} aria-label="Contents">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--cb-muted)' }}>Contents</p>
          <ol className="mt-3 space-y-1.5">
            {sections.map((s, i) => (
              <li key={s.heading}>
                <a href={`#s-${i + 1}`} className="text-sm hover:underline" style={{ color: 'var(--cb-primary)' }}>{i + 1}. {s.heading}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-10 space-y-9">
          {sections.map((s, i) => (
            <section key={s.heading} id={`s-${i + 1}`}>
              <h2 className="text-xl font-bold">{i + 1}. {s.heading}</h2>
              <div className="mt-3 space-y-3">
                {s.paragraphs.map((p, j) => (
                  <p key={j} className="text-[15px] leading-relaxed" style={{ color: 'var(--cb-body)' }}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-xl border p-5" style={{ borderColor: 'var(--cb-line)', background: 'var(--cb-surface)' }}>
          <p className="text-sm" style={{ color: 'var(--cb-body)' }}>
            <strong>Questions about this document?</strong> Contact us at{' '}
            <a href="mailto:contact@cambobia.com" className="underline" style={{ color: 'var(--cb-primary)' }}>contact@cambobia.com</a>.
          </p>
          <p className="mt-3 text-xs" style={{ color: 'var(--cb-muted)' }}>
            This document is a plain-language template provided for transparency and is pending final legal review. It does not constitute legal advice.
          </p>
        </div>
      </div>
    </PublicLayout>
  )
}
