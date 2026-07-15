'use client'

import { useState, useId } from 'react'
import Link from 'next/link'
import {
  Mail,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building2,
  Handshake,
  Landmark,
  Briefcase,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react'
import PublicLayout from '@/components/public/PublicLayout'

/** Enquiry topics shown in the form's select. Kept as a const so the mailto
 *  cards and the form stay in sync. */
const TOPICS = [
  'General',
  'For businesses',
  'For investors',
  'For advisors',
  'Partnership',
  'Institutional investor',
  'Advisor onboarding',
  'Press',
  'Report a concern',
] as const

type Topic = (typeof TOPICS)[number]

const DIRECT_CARDS: {
  icon: typeof Building2
  title: string
  body: string
  subject: string
}[] = [
  {
    icon: Building2,
    title: 'Contact sales',
    body: 'Exploring CamboBia for your business or team? We’ll walk you through profiles, verification, and getting seen by investors.',
    subject: 'Sales enquiry',
  },
  {
    icon: Handshake,
    title: 'Partnership enquiry',
    body: 'Chambers, accelerators, banks, and ecosystem partners — let’s talk about how we can support Cambodian SMEs together.',
    subject: 'Partnership enquiry',
  },
  {
    icon: Landmark,
    title: 'Institutional investor enquiry',
    body: 'Funds, family offices, and DFIs looking for structured access to verified Cambodian opportunities can reach our team directly.',
    subject: 'Institutional investor enquiry',
  },
  {
    icon: Briefcase,
    title: 'Advisor onboarding',
    body: 'Accountants, lawyers, and consultants who want to offer services — get help setting up a credentialed advisor profile.',
    subject: 'Advisor onboarding',
  },
]

const EMAIL = 'contact@cambobia.com'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Status = 'idle' | 'submitting' | 'success' | 'error'
type FieldErrors = Partial<Record<'name' | 'email' | 'topic' | 'message', string>>

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [topic, setTopic] = useState<Topic | ''>('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<Status>('idle')

  const uid = useId()
  const fid = (name: string) => `${uid}-${name}`

  function validate(): FieldErrors {
    const next: FieldErrors = {}
    if (!name.trim()) next.name = 'Please enter your name.'
    if (!email.trim()) next.email = 'Please enter your email address.'
    else if (!EMAIL_RE.test(email.trim())) next.email = 'Please enter a valid email address.'
    if (!topic) next.topic = 'Please choose an enquiry type.'
    if (!message.trim()) next.message = 'Please enter a message.'
    return next
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'submitting') return // no duplicate submit

    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) {
      // Move focus to the first field in error for accessibility.
      const first = ['name', 'email', 'topic', 'message'].find((k) => k in found)
      if (first) document.getElementById(fid(first))?.focus()
      return
    }

    setStatus('submitting')
    try {
      // There is no backend endpoint yet — simulate a network round-trip so the
      // full submitting -> success flow is exercised.
      // TODO: wire to /api/contact when the endpoint exists
      await new Promise((resolve) => setTimeout(resolve, 900))
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  const inputStyle = { borderColor: 'var(--cb-line)', background: '#fff', color: 'var(--cb-ink)' }

  return (
    <PublicLayout>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(180deg,#fff, var(--cb-surface))' }}>
        <div className="cb-wrap py-16 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: 'var(--cb-primary-soft)', color: 'var(--cb-primary-dark)' }}
            >
              <Mail className="h-3.5 w-3.5" /> We’re here to help
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">Contact CamboBia</h1>
            <p className="mt-5 text-lg" style={{ color: 'var(--cb-body)' }}>
              Questions about businesses, investing, advising, or partnerships? Send us a message and the right person on
              our team will get back to you.
            </p>
          </div>
        </div>
      </section>

      {/* Form + direct details */}
      <section className="cb-wrap py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-5 lg:gap-12">
          {/* Form */}
          <div className="lg:col-span-3">
            <div
              className="rounded-2xl border p-7 sm:p-9"
              style={{ borderColor: 'var(--cb-line)', background: '#fff', boxShadow: 'var(--cb-shadow)' }}
            >
              {status === 'success' ? (
                <div className="py-6 text-center" role="status" aria-live="polite">
                  <span
                    className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
                    style={{ background: 'var(--cb-primary-soft)' }}
                  >
                    <CheckCircle2 className="h-8 w-8" style={{ color: 'var(--cb-primary)' }} />
                  </span>
                  <h2 className="mt-5 text-2xl font-bold">Thanks — we’ll get back to you</h2>
                  <p className="mx-auto mt-3 max-w-md text-sm" style={{ color: 'var(--cb-body)' }}>
                    Your message is on its way to our team. We typically reply within two business days. In the meantime,
                    you can learn how we keep the platform trustworthy in our Trust Center.
                  </p>
                  <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => {
                        setName('')
                        setEmail('')
                        setCompany('')
                        setTopic('')
                        setMessage('')
                        setErrors({})
                        setStatus('idle')
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white"
                      style={{ background: 'var(--cb-primary)' }}
                    >
                      Send another message
                    </button>
                    <Link
                      href="/trust"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold"
                      style={{ borderColor: 'var(--cb-line)', color: 'var(--cb-ink)', background: '#fff' }}
                    >
                      Visit the Trust Center <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold">Send us a message</h2>
                  <p className="mt-2 text-sm" style={{ color: 'var(--cb-muted)' }}>
                    Fields marked with <span aria-hidden="true">*</span> are required.
                  </p>

                  {status === 'error' && (
                    <div
                      className="mt-5 flex items-start gap-3 rounded-xl border p-4 text-sm"
                      role="alert"
                      style={{ borderColor: 'var(--cb-danger)', background: '#fdf3f1', color: 'var(--cb-danger)' }}
                    >
                      <AlertCircle className="mt-0.5 h-5 w-5 flex-none" />
                      <span>Something went wrong sending your message. Please try again, or email us at {EMAIL}.</span>
                    </div>
                  )}

                  <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
                    {/* Name */}
                    <div>
                      <label htmlFor={fid('name')} className="block text-sm font-semibold" style={{ color: 'var(--cb-ink)' }}>
                        Name <span aria-hidden="true">*</span>
                      </label>
                      <input
                        id={fid('name')}
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                        aria-required="true"
                        aria-invalid={errors.name ? true : undefined}
                        aria-describedby={errors.name ? fid('name-err') : undefined}
                        className="mt-1.5 w-full rounded-xl border px-4 py-3 text-sm outline-none"
                        style={inputStyle}
                      />
                      {errors.name && (
                        <p id={fid('name-err')} className="mt-1.5 flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--cb-danger)' }}>
                          <AlertCircle className="h-3.5 w-3.5" /> {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Email + Company */}
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor={fid('email')} className="block text-sm font-semibold" style={{ color: 'var(--cb-ink)' }}>
                          Email <span aria-hidden="true">*</span>
                        </label>
                        <input
                          id={fid('email')}
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          autoComplete="email"
                          inputMode="email"
                          aria-required="true"
                          aria-invalid={errors.email ? true : undefined}
                          aria-describedby={errors.email ? fid('email-err') : undefined}
                          className="mt-1.5 w-full rounded-xl border px-4 py-3 text-sm outline-none"
                          style={inputStyle}
                        />
                        {errors.email && (
                          <p id={fid('email-err')} className="mt-1.5 flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--cb-danger)' }}>
                            <AlertCircle className="h-3.5 w-3.5" /> {errors.email}
                          </p>
                        )}
                      </div>
                      <div>
                        <label htmlFor={fid('company')} className="block text-sm font-semibold" style={{ color: 'var(--cb-ink)' }}>
                          Company <span style={{ color: 'var(--cb-muted)' }}>(optional)</span>
                        </label>
                        <input
                          id={fid('company')}
                          type="text"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          autoComplete="organization"
                          className="mt-1.5 w-full rounded-xl border px-4 py-3 text-sm outline-none"
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    {/* Topic */}
                    <div>
                      <label htmlFor={fid('topic')} className="block text-sm font-semibold" style={{ color: 'var(--cb-ink)' }}>
                        Enquiry type <span aria-hidden="true">*</span>
                      </label>
                      <select
                        id={fid('topic')}
                        value={topic}
                        onChange={(e) => setTopic(e.target.value as Topic)}
                        aria-required="true"
                        aria-invalid={errors.topic ? true : undefined}
                        aria-describedby={errors.topic ? fid('topic-err') : undefined}
                        className="mt-1.5 w-full rounded-xl border px-4 py-3 text-sm outline-none"
                        style={inputStyle}
                      >
                        <option value="" disabled>
                          Choose an enquiry type…
                        </option>
                        {TOPICS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      {errors.topic && (
                        <p id={fid('topic-err')} className="mt-1.5 flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--cb-danger)' }}>
                          <AlertCircle className="h-3.5 w-3.5" /> {errors.topic}
                        </p>
                      )}
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor={fid('message')} className="block text-sm font-semibold" style={{ color: 'var(--cb-ink)' }}>
                        Message <span aria-hidden="true">*</span>
                      </label>
                      <textarea
                        id={fid('message')}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={5}
                        aria-required="true"
                        aria-invalid={errors.message ? true : undefined}
                        aria-describedby={errors.message ? fid('message-err') : undefined}
                        className="mt-1.5 w-full resize-y rounded-xl border px-4 py-3 text-sm outline-none"
                        style={inputStyle}
                      />
                      {errors.message && (
                        <p id={fid('message-err')} className="mt-1.5 flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--cb-danger)' }}>
                          <AlertCircle className="h-3.5 w-3.5" /> {errors.message}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <button
                        type="submit"
                        disabled={status === 'submitting'}
                        className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-70"
                        style={{ background: 'var(--cb-primary)' }}
                      >
                        {status === 'submitting' ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" /> Sending…
                          </>
                        ) : (
                          <>
                            Send message <Send className="h-4 w-4" />
                          </>
                        )}
                      </button>
                      <p className="text-xs" style={{ color: 'var(--cb-muted)' }}>
                        We’ll only use your details to respond to your enquiry.
                      </p>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* Direct details */}
          <div className="lg:col-span-2">
            <div
              className="rounded-2xl border p-7"
              style={{ borderColor: 'var(--cb-line)', background: '#fff', boxShadow: 'var(--cb-shadow-sm)' }}
            >
              <h2 className="text-lg font-bold">Reach us directly</h2>
              <div className="mt-4 space-y-3 text-sm">
                <a href={`mailto:${EMAIL}`} className="flex items-center gap-3 hover:underline" style={{ color: 'var(--cb-body)' }}>
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg" style={{ background: 'var(--cb-primary-soft)' }}>
                    <Mail className="h-4 w-4" style={{ color: 'var(--cb-primary)' }} />
                  </span>
                  {EMAIL}
                </a>
                <p className="flex items-center gap-3" style={{ color: 'var(--cb-body)' }}>
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg" style={{ background: 'var(--cb-primary-soft)' }}>
                    <MapPin className="h-4 w-4" style={{ color: 'var(--cb-primary)' }} />
                  </span>
                  Phnom Penh, Cambodia
                </p>
              </div>
              <p className="mt-5 rounded-xl p-3 text-xs" style={{ background: 'var(--cb-surface)', color: 'var(--cb-muted)' }}>
                Spotted something suspicious? See our{' '}
                <Link href="/trust" className="font-semibold hover:underline" style={{ color: 'var(--cb-primary)' }}>
                  Trust Center
                </Link>{' '}
                for how to report a concern.
              </p>
            </div>

            <p className="mt-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--cb-muted)' }}>
              Talk to the right team
            </p>
            <div className="mt-3 space-y-3">
              {DIRECT_CARDS.map((c) => (
                <a
                  key={c.title}
                  href={`mailto:${EMAIL}?subject=${encodeURIComponent(c.subject)}`}
                  className="flex gap-4 rounded-2xl border p-5 transition-shadow hover:shadow-sm"
                  style={{ borderColor: 'var(--cb-line)', background: '#fff' }}
                >
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl" style={{ background: 'var(--cb-primary-soft)' }}>
                    <c.icon className="h-5 w-5" style={{ color: 'var(--cb-primary)' }} />
                  </span>
                  <span>
                    <span className="flex items-center gap-1.5 text-sm font-bold" style={{ color: 'var(--cb-ink)' }}>
                      {c.title} <ArrowRight className="h-3.5 w-3.5" style={{ color: 'var(--cb-primary)' }} />
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed" style={{ color: 'var(--cb-body)' }}>
                      {c.body}
                    </span>
                  </span>
                </a>
              ))}
            </div>

            <div
              className="mt-3 flex gap-4 rounded-2xl border p-5"
              style={{ borderColor: 'var(--cb-line)', background: 'var(--cb-surface)' }}
            >
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl" style={{ background: '#fff' }}>
                <ShieldAlert className="h-5 w-5" style={{ color: 'var(--cb-accent)' }} />
              </span>
              <span>
                <span className="block text-sm font-bold" style={{ color: 'var(--cb-ink)' }}>
                  Report a concern
                </span>
                <span className="mt-1 block text-xs leading-relaxed" style={{ color: 'var(--cb-body)' }}>
                  Suspicious profile, misleading info, impersonation, or fraud? Choose “Report a concern” in the form
                  above and tell us what you saw.
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
