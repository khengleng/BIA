import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  ChevronDown,
  HelpCircle,
  Building2,
  TrendingUp,
  Briefcase,
  ShieldCheck,
  CreditCard,
  Sparkles,
} from 'lucide-react'
import PublicLayout from '@/components/public/PublicLayout'

export const metadata: Metadata = {
  title: 'Frequently asked questions — CamboBia',
  description:
    'Answers to common questions about CamboBia: how it works, verification, whether it’s free, safety and reporting, supported languages, and how to get in touch.',
}

type QA = { q: string; a: React.ReactNode }
type Group = { id: string; title: string; icon: typeof HelpCircle; items: QA[] }

const GROUPS: Group[] = [
  {
    id: 'general',
    title: 'General',
    icon: Sparkles,
    items: [
      {
        q: 'What is CamboBia?',
        a: 'CamboBia is a Cambodian marketplace that connects growing businesses with potential investors and professional advisors. We help you build a credible profile, discover the right people, and start trusted conversations. We are a connection and information platform — not a bank, broker, or adviser.',
      },
      {
        q: 'Is CamboBia free to use?',
        a: 'Creating an account and building a profile is free. Some optional premium features and services may be paid in the future, and any such pricing will always be shown clearly before you commit. You will never be charged without your explicit agreement.',
      },
      {
        q: 'Does CamboBia guarantee funding or returns?',
        a: 'No. CamboBia does not guarantee funding, investment, returns, valuations, or any particular outcome. We connect people and present information so you can make your own decisions. Every investment carries risk, and outcomes depend entirely on the parties involved.',
      },
      {
        q: 'Which languages does CamboBia support?',
        a: 'The platform is available in English today. Khmer language support is coming soon, and we are building CamboBia to serve Cambodian users in the language they’re most comfortable with.',
      },
      {
        q: 'How do I contact CamboBia?',
        a: (
          <>
            You can reach our team any time via our{' '}
            <Link href="/contact" className="underline" style={{ color: 'var(--cb-primary)' }}>
              contact page
            </Link>{' '}
            or by emailing{' '}
            <a href="mailto:contact@cambobia.com" className="underline" style={{ color: 'var(--cb-primary)' }}>
              contact@cambobia.com
            </a>
            . We’re based in Phnom Penh, Cambodia.
          </>
        ),
      },
    ],
  },
  {
    id: 'for-businesses',
    title: 'For businesses',
    icon: Building2,
    items: [
      {
        q: 'How do I list my business?',
        a: 'Create a free account, choose the business role, and complete your profile — sector, stage, location, traction, and your funding needs. Completing verification steps strengthens your credibility with investors and advisors browsing the platform.',
      },
      {
        q: 'Will investors definitely fund my business?',
        a: 'No. CamboBia increases your visibility and helps you present credibly, but it cannot promise interest, funding, or terms. Investors make their own independent decisions, and many factors outside the platform affect any outcome.',
      },
      {
        q: 'Can an advisor help me prepare before I raise?',
        a: (
          <>
            Yes. Many businesses work with advisors to strengthen their profile and funding materials before
            approaching investors. You can browse advisors and send requests directly — see{' '}
            <Link href="/for-advisors" className="underline" style={{ color: 'var(--cb-primary)' }}>
              For advisors
            </Link>{' '}
            for how it works.
          </>
        ),
      },
    ],
  },
  {
    id: 'for-investors',
    title: 'For investors',
    icon: TrendingUp,
    items: [
      {
        q: 'How do I find businesses to evaluate?',
        a: (
          <>
            Browse the{' '}
            <Link href="/opportunities" className="underline" style={{ color: 'var(--cb-primary)' }}>
              opportunities directory
            </Link>{' '}
            and filter by sector, stage, location, and funding need. You can save businesses you’re interested
            in and review their verification information before reaching out.
          </>
        ),
      },
      {
        q: 'Does CamboBia recommend or vet investments for me?',
        a: 'No. CamboBia does not provide investment advice, recommendations, or endorsements. Verification signals tell you what has been confirmed about a party — not whether an opportunity is a good one. Always carry out your own due diligence before making any decision.',
      },
      {
        q: 'What should I do before committing to anything?',
        a: (
          <>
            Do your own research, request additional information directly from the business, and consider
            independent professional advice. Please also read our{' '}
            <Link href="/risk-disclosure" className="underline" style={{ color: 'var(--cb-primary)' }}>
              Risk Disclosure
            </Link>
            , as all investments carry risk, including the possible loss of your capital.
          </>
        ),
      },
    ],
  },
  {
    id: 'for-advisors',
    title: 'For advisors',
    icon: Briefcase,
    items: [
      {
        q: 'How do I join as an advisor?',
        a: 'Create a free account, select the advisor role, and build a professional profile that shows your expertise, services, and experience. Verifying your credentials adds a distinct trust signal that helps businesses find and choose you with confidence.',
      },
      {
        q: 'How do businesses reach me?',
        a: 'Once your profile is live, businesses that match your specialisms can send you advisory requests. You choose which requests to accept and how you engage, directly with each business.',
      },
      {
        q: 'What does “credentials verified” mean?',
        a: 'It confirms that CamboBia has checked the professional qualifications or standing you provided. It is a factual confirmation of what was verified — not an endorsement of your services or a guarantee of results for clients.',
      },
    ],
  },
  {
    id: 'trust-safety',
    title: 'Trust & safety',
    icon: ShieldCheck,
    items: [
      {
        q: 'How does verification work?',
        a: (
          <>
            Instead of a single vague “verified” label, CamboBia uses distinct, clearly explained checks —
            such as email, identity, business registration, and advisor credentials. Each signal tells you
            exactly what was confirmed. Learn more in our{' '}
            <Link href="/trust" className="underline" style={{ color: 'var(--cb-primary)' }}>
              Trust Center
            </Link>
            .
          </>
        ),
      },
      {
        q: 'Does a verification badge mean an opportunity is safe or approved?',
        a: 'No. Verification confirms specific facts about a person or business — it is not a recommendation, endorsement, or guarantee of quality, safety, or outcome. You should always do your own review before acting.',
      },
      {
        q: 'How do I report suspicious activity?',
        a: (
          <>
            If you see anything suspicious, misleading, or unsafe, please report it immediately through our{' '}
            <Link href="/contact" className="underline" style={{ color: 'var(--cb-primary)' }}>
              contact page
            </Link>{' '}
            or by emailing{' '}
            <a href="mailto:trust@cambobia.com" className="underline" style={{ color: 'var(--cb-primary)' }}>
              trust@cambobia.com
            </a>
            . Include as much detail as you can. We take every report seriously and review them promptly.
          </>
        ),
      },
      {
        q: 'How is my personal information handled?',
        a: (
          <>
            We handle your data in line with our{' '}
            <Link href="/privacy" className="underline" style={{ color: 'var(--cb-primary)' }}>
              Privacy Policy
            </Link>
            , which explains what we collect, why, and the choices you have. We only share information as
            needed to operate the platform and as described there.
          </>
        ),
      },
    ],
  },
  {
    id: 'account-billing',
    title: 'Account & billing',
    icon: CreditCard,
    items: [
      {
        q: 'How do I create an account?',
        a: (
          <>
            Head to{' '}
            <Link href="/auth/register" className="underline" style={{ color: 'var(--cb-primary)' }}>
              create an account
            </Link>
            , choose your role, and verify your email to get started. You can complete the rest of your
            profile and additional verification steps at your own pace.
          </>
        ),
      },
      {
        q: 'Are there any fees or charges?',
        a: 'Creating a profile and using the core platform is free. If we introduce paid features or services, the price and terms will always be shown clearly and you’ll be asked to confirm before any charge is made.',
      },
      {
        q: 'How do I delete my account?',
        a: (
          <>
            You can request account deletion at any time from your account settings, or by contacting us via
            the{' '}
            <Link href="/contact" className="underline" style={{ color: 'var(--cb-primary)' }}>
              contact page
            </Link>
            . We’ll handle your request in line with our Privacy Policy.
          </>
        ),
      },
    ],
  },
]

export default function FaqPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(180deg,#fff, var(--cb-surface))' }}>
        <div className="cb-wrap py-20 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: 'var(--cb-primary-soft)', color: 'var(--cb-primary-dark)' }}
            >
              <HelpCircle className="h-3.5 w-3.5" /> Frequently asked questions
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">
              Questions? We’ve got answers
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg" style={{ color: 'var(--cb-body)' }}>
              Everything you need to know about how CamboBia works, what we verify, and where our
              responsibilities begin and end. Can’t find your answer?{' '}
              <Link href="/contact" className="font-semibold underline" style={{ color: 'var(--cb-primary)' }}>
                Get in touch
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Quick nav */}
      <section className="cb-wrap pt-14">
        <nav aria-label="FAQ categories" className="flex flex-wrap justify-center gap-2.5">
          {GROUPS.map(g => (
            <a
              key={g.id}
              href={`#${g.id}`}
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--cb-surface-2)]"
              style={{ borderColor: 'var(--cb-line)', background: '#fff', color: 'var(--cb-body)' }}
            >
              <g.icon className="h-4 w-4" style={{ color: 'var(--cb-primary)' }} />
              {g.title}
            </a>
          ))}
        </nav>
      </section>

      {/* Groups */}
      <section className="cb-wrap py-16">
        <div className="mx-auto max-w-3xl space-y-14">
          {GROUPS.map(group => (
            <div key={group.id} id={group.id} className="scroll-mt-24">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: 'var(--cb-primary-soft)' }}
                >
                  <group.icon className="h-5 w-5" style={{ color: 'var(--cb-primary)' }} />
                </span>
                <h2 className="text-2xl font-bold">{group.title}</h2>
              </div>
              <div className="mt-5 space-y-3">
                {group.items.map((item, i) => (
                  <details
                    key={i}
                    className="group rounded-2xl border"
                    style={{ borderColor: 'var(--cb-line)', background: '#fff', boxShadow: 'var(--cb-shadow-sm)' }}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-base font-semibold [&::-webkit-details-marker]:hidden">
                      <span style={{ color: 'var(--cb-ink)' }}>{item.q}</span>
                      <ChevronDown
                        className="h-5 w-5 flex-none transition-transform duration-200 group-open:rotate-180"
                        style={{ color: 'var(--cb-primary)' }}
                        aria-hidden="true"
                      />
                    </summary>
                    <div className="px-5 pb-5 text-sm leading-relaxed" style={{ color: 'var(--cb-body)' }}>
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--cb-primary)' }}>
        <div className="cb-wrap py-16 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Still have questions?</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Our team is happy to help. Reach out and we’ll get back to you.
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
              href="/auth/register"
              className="inline-flex items-center justify-center rounded-xl border px-6 py-3.5 text-base font-semibold text-white"
              style={{ borderColor: 'rgba(255,255,255,0.4)' }}
            >
              Create your profile
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
