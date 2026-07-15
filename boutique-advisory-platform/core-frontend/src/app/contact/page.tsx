// NOTE: km/zh translations are working drafts pending native-speaker review.
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
import { useLang } from '@/i18n/public-content'

/** Enquiry topics shown in the form's select. Kept as a const so the mailto
 *  cards and the form stay in sync. Values are stable (English) keys; the
 *  visible labels are translated via CONTENT[lang].topicLabels. */
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

/** Language-independent metadata for the direct-contact cards: icon + the
 *  mailto subject (kept in English so enquiries reach the team consistently). */
const DIRECT_CARD_META: { icon: typeof Building2; subject: string }[] = [
  { icon: Building2, subject: 'Sales enquiry' },
  { icon: Handshake, subject: 'Partnership enquiry' },
  { icon: Landmark, subject: 'Institutional investor enquiry' },
  { icon: Briefcase, subject: 'Advisor onboarding' },
]

const EMAIL = 'contact@cambobia.com'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Status = 'idle' | 'submitting' | 'success' | 'error'
type FieldErrors = Partial<Record<'name' | 'email' | 'topic' | 'message', string>>

const CONTENT = {
  en: {
    heroBadge: 'We’re here to help',
    heroTitle: 'Contact CamboBia',
    heroSub:
      'Questions about businesses, investing, advising, or partnerships? Send us a message and the right person on our team will get back to you.',
    successTitle: 'Thanks — we’ll get back to you',
    successBody:
      'Your message is on its way to our team. We typically reply within two business days. In the meantime, you can learn how we keep the platform trustworthy in our Trust Center.',
    sendAnother: 'Send another message',
    visitTrust: 'Visit the Trust Center',
    formTitle: 'Send us a message',
    requiredPre: 'Fields marked with ',
    requiredPost: ' are required.',
    errorPre: 'Something went wrong sending your message. Please try again, or email us at ',
    errorPost: '.',
    labelName: 'Name',
    labelEmail: 'Email',
    labelCompany: 'Company',
    optional: '(optional)',
    labelTopic: 'Enquiry type',
    topicPlaceholder: 'Choose an enquiry type…',
    labelMessage: 'Message',
    submit: 'Send message',
    submitting: 'Sending…',
    privacyNote: 'We’ll only use your details to respond to your enquiry.',
    errName: 'Please enter your name.',
    errEmailRequired: 'Please enter your email address.',
    errEmailInvalid: 'Please enter a valid email address.',
    errTopic: 'Please choose an enquiry type.',
    errMessage: 'Please enter a message.',
    reachTitle: 'Reach us directly',
    location: 'Phnom Penh, Cambodia',
    spottedPre: 'Spotted something suspicious? See our ',
    trustCenter: 'Trust Center',
    spottedPost: ' for how to report a concern.',
    talkTeam: 'Talk to the right team',
    reportTitle: 'Report a concern',
    reportBody:
      'Suspicious profile, misleading info, impersonation, or fraud? Choose “Report a concern” in the form above and tell us what you saw.',
    topicLabels: {
      'General': 'General',
      'For businesses': 'For businesses',
      'For investors': 'For investors',
      'For advisors': 'For advisors',
      'Partnership': 'Partnership',
      'Institutional investor': 'Institutional investor',
      'Advisor onboarding': 'Advisor onboarding',
      'Press': 'Press',
      'Report a concern': 'Report a concern',
    } as Record<Topic, string>,
    directCards: [
      {
        title: 'Contact sales',
        body: 'Exploring CamboBia for your business or team? We’ll walk you through profiles, verification, and getting seen by investors.',
      },
      {
        title: 'Partnership enquiry',
        body: 'Chambers, accelerators, banks, and ecosystem partners — let’s talk about how we can support Cambodian SMEs together.',
      },
      {
        title: 'Institutional investor enquiry',
        body: 'Funds, family offices, and DFIs looking for structured access to verified Cambodian opportunities can reach our team directly.',
      },
      {
        title: 'Advisor onboarding',
        body: 'Accountants, lawyers, and consultants who want to offer services — get help setting up a credentialed advisor profile.',
      },
    ],
  },
  km: {
    heroBadge: 'យើងនៅទីនេះដើម្បីជួយ',
    heroTitle: 'ទាក់ទង CamboBia',
    heroSub:
      'មានសំណួរអំពីអាជីវកម្ម ការវិនិយោគ ការប្រឹក្សា ឬភាពជាដៃគូ? ផ្ញើសារមកយើង ហើយបុគ្គលត្រឹមត្រូវនៅក្នុងក្រុមការងាររបស់យើងនឹងឆ្លើយតបទៅអ្នកវិញ។',
    successTitle: 'អរគុណ — យើងនឹងឆ្លើយតបទៅអ្នកវិញ',
    successBody:
      'សាររបស់អ្នកកំពុងធ្វើដំណើរទៅកាន់ក្រុមការងាររបស់យើង។ ជាធម្មតាយើងឆ្លើយតបក្នុងរយៈពេលពីរថ្ងៃធ្វើការ។ ក្នុងពេលនោះ អ្នកអាចស្វែងយល់ពីរបៀបដែលយើងរក្សាវេទិកាឱ្យគួរឱ្យទុកចិត្តនៅមជ្ឈមណ្ឌលទំនុកចិត្តរបស់យើង។',
    sendAnother: 'ផ្ញើសារមួយទៀត',
    visitTrust: 'ចូលមើលមជ្ឈមណ្ឌលទំនុកចិត្ត',
    formTitle: 'ផ្ញើសារមកយើង',
    requiredPre: 'វាលដែលមានសញ្ញា ',
    requiredPost: ' គឺត្រូវបំពេញ។',
    errorPre: 'មានបញ្ហាក្នុងការផ្ញើសាររបស់អ្នក។ សូមព្យាយាមម្តងទៀត ឬផ្ញើអ៊ីមែលមកយើងតាមរយៈ ',
    errorPost: '។',
    labelName: 'ឈ្មោះ',
    labelEmail: 'អ៊ីមែល',
    labelCompany: 'ក្រុមហ៊ុន',
    optional: '(ស្រេចចិត្ត)',
    labelTopic: 'ប្រភេទសំណួរ',
    topicPlaceholder: 'ជ្រើសរើសប្រភេទសំណួរ…',
    labelMessage: 'សារ',
    submit: 'ផ្ញើសារ',
    submitting: 'កំពុងផ្ញើ…',
    privacyNote: 'យើងនឹងប្រើព័ត៌មានរបស់អ្នកតែដើម្បីឆ្លើយតបទៅសំណួររបស់អ្នកប៉ុណ្ណោះ។',
    errName: 'សូមបញ្ចូលឈ្មោះរបស់អ្នក។',
    errEmailRequired: 'សូមបញ្ចូលអាសយដ្ឋានអ៊ីមែលរបស់អ្នក។',
    errEmailInvalid: 'សូមបញ្ចូលអាសយដ្ឋានអ៊ីមែលត្រឹមត្រូវ។',
    errTopic: 'សូមជ្រើសរើសប្រភេទសំណួរ។',
    errMessage: 'សូមបញ្ចូលសារ។',
    reachTitle: 'ទាក់ទងយើងដោយផ្ទាល់',
    location: 'រាជធានីភ្នំពេញ ប្រទេសកម្ពុជា',
    spottedPre: 'ឃើញអ្វីគួរឱ្យសង្ស័យ? សូមមើល',
    trustCenter: 'មជ្ឈមណ្ឌលទំនុកចិត្ត',
    spottedPost: 'របស់យើងសម្រាប់របៀបរាយការណ៍ការព្រួយបារម្ភ។',
    talkTeam: 'និយាយជាមួយក្រុមការងារត្រឹមត្រូវ',
    reportTitle: 'រាយការណ៍ការព្រួយបារម្ភ',
    reportBody:
      'ប្រវត្តិរូបគួរឱ្យសង្ស័យ ព័ត៌មានភ័ន្តច្រឡំ ការក្លែងបន្លំ ឬការបោកប្រាស់? ជ្រើសរើស “រាយការណ៍ការព្រួយបារម្ភ” នៅក្នុងទម្រង់ខាងលើ ហើយប្រាប់យើងនូវអ្វីដែលអ្នកបានឃើញ។',
    topicLabels: {
      'General': 'ទូទៅ',
      'For businesses': 'សម្រាប់អាជីវកម្ម',
      'For investors': 'សម្រាប់វិនិយោគិន',
      'For advisors': 'សម្រាប់អ្នកប្រឹក្សា',
      'Partnership': 'ភាពជាដៃគូ',
      'Institutional investor': 'វិនិយោគិនស្ថាប័ន',
      'Advisor onboarding': 'ការចុះឈ្មោះអ្នកប្រឹក្សា',
      'Press': 'សារព័ត៌មាន',
      'Report a concern': 'រាយការណ៍ការព្រួយបារម្ភ',
    } as Record<Topic, string>,
    directCards: [
      {
        title: 'ទាក់ទងផ្នែកលក់',
        body: 'កំពុងស្វែងយល់ពី CamboBia សម្រាប់អាជីវកម្ម ឬក្រុមរបស់អ្នក? យើងនឹងណែនាំអ្នកអំពីប្រវត្តិរូប ការផ្ទៀងផ្ទាត់ និងការធ្វើឱ្យវិនិយោគិនមើលឃើញអ្នក។',
      },
      {
        title: 'សំណួរភាពជាដៃគូ',
        body: 'សភាពាណិជ្ជកម្ម កម្មវិធីបង្កើនល្បឿន ធនាគារ និងដៃគូប្រព័ន្ធអេកូ — តោះនិយាយអំពីរបៀបដែលយើងអាចគាំទ្រ SME កម្ពុជាជាមួយគ្នា។',
      },
      {
        title: 'សំណួរវិនិយោគិនស្ថាប័ន',
        body: 'មូលនិធិ ការិយាល័យគ្រួសារ និង DFI ដែលស្វែងរកការចូលដំណើរការមានរចនាសម្ព័ន្ធទៅកាន់ឱកាសកម្ពុជាដែលបានផ្ទៀងផ្ទាត់ អាចទាក់ទងក្រុមការងាររបស់យើងដោយផ្ទាល់។',
      },
      {
        title: 'ការចុះឈ្មោះអ្នកប្រឹក្សា',
        body: 'គណនេយ្យករ មេធាវី និងអ្នកប្រឹក្សាដែលចង់ផ្តល់សេវាកម្ម — ទទួលបានជំនួយក្នុងការរៀបចំប្រវត្តិរូបអ្នកប្រឹក្សាដែលមានលិខិតបញ្ជាក់។',
      },
    ],
  },
  zh: {
    heroBadge: '我们随时提供帮助',
    heroTitle: '联系 CamboBia',
    heroSub:
      '有关于企业、投资、咨询或合作的疑问吗？给我们发送消息，我们团队中合适的人员会回复您。',
    successTitle: '谢谢——我们会回复您',
    successBody:
      '您的消息正在发送给我们的团队。我们通常在两个工作日内回复。在此期间，您可以在我们的信任中心了解我们如何保持平台的可信度。',
    sendAnother: '再发送一条消息',
    visitTrust: '访问信任中心',
    formTitle: '给我们发送消息',
    requiredPre: '标有 ',
    requiredPost: ' 的字段为必填项。',
    errorPre: '发送您的消息时出错。请重试，或发送电子邮件至 ',
    errorPost: '。',
    labelName: '姓名',
    labelEmail: '电子邮件',
    labelCompany: '公司',
    optional: '（选填）',
    labelTopic: '咨询类型',
    topicPlaceholder: '选择咨询类型…',
    labelMessage: '留言',
    submit: '发送消息',
    submitting: '发送中…',
    privacyNote: '我们仅会使用您的信息来回复您的咨询。',
    errName: '请输入您的姓名。',
    errEmailRequired: '请输入您的电子邮件地址。',
    errEmailInvalid: '请输入有效的电子邮件地址。',
    errTopic: '请选择咨询类型。',
    errMessage: '请输入留言内容。',
    reachTitle: '直接联系我们',
    location: '柬埔寨金边',
    spottedPre: '发现可疑情况？请查看我们的',
    trustCenter: '信任中心',
    spottedPost: '了解如何举报问题。',
    talkTeam: '联系合适的团队',
    reportTitle: '举报问题',
    reportBody:
      '可疑资料、误导信息、冒充或欺诈？请在上方表单中选择"举报问题"，并告诉我们您所看到的情况。',
    topicLabels: {
      'General': '综合',
      'For businesses': '面向企业',
      'For investors': '面向投资者',
      'For advisors': '面向顾问',
      'Partnership': '合作',
      'Institutional investor': '机构投资者',
      'Advisor onboarding': '顾问入驻',
      'Press': '媒体',
      'Report a concern': '举报问题',
    } as Record<Topic, string>,
    directCards: [
      {
        title: '联系销售',
        body: '正在为您的企业或团队了解 CamboBia？我们将为您介绍资料、验证以及如何被投资者看到。',
      },
      {
        title: '合作咨询',
        body: '商会、加速器、银行和生态系统伙伴——让我们谈谈如何共同支持柬埔寨中小企业。',
      },
      {
        title: '机构投资者咨询',
        body: '寻求结构化渠道接触经过验证的柬埔寨商机的基金、家族办公室和开发性金融机构，可直接联系我们的团队。',
      },
      {
        title: '顾问入驻',
        body: '希望提供服务的会计师、律师和顾问——获取帮助以建立一份经过资质认证的顾问资料。',
      },
    ],
  },
}

export default function ContactPage() {
  const t = CONTENT[useLang()]

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
    if (!name.trim()) next.name = t.errName
    if (!email.trim()) next.email = t.errEmailRequired
    else if (!EMAIL_RE.test(email.trim())) next.email = t.errEmailInvalid
    if (!topic) next.topic = t.errTopic
    if (!message.trim()) next.message = t.errMessage
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
              <Mail className="h-3.5 w-3.5" /> {t.heroBadge}
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">{t.heroTitle}</h1>
            <p className="mt-5 text-lg" style={{ color: 'var(--cb-body)' }}>
              {t.heroSub}
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
                  <h2 className="mt-5 text-2xl font-bold">{t.successTitle}</h2>
                  <p className="mx-auto mt-3 max-w-md text-sm" style={{ color: 'var(--cb-body)' }}>
                    {t.successBody}
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
                      {t.sendAnother}
                    </button>
                    <Link
                      href="/trust"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold"
                      style={{ borderColor: 'var(--cb-line)', color: 'var(--cb-ink)', background: '#fff' }}
                    >
                      {t.visitTrust} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold">{t.formTitle}</h2>
                  <p className="mt-2 text-sm" style={{ color: 'var(--cb-muted)' }}>
                    {t.requiredPre}<span aria-hidden="true">*</span>{t.requiredPost}
                  </p>

                  {status === 'error' && (
                    <div
                      className="mt-5 flex items-start gap-3 rounded-xl border p-4 text-sm"
                      role="alert"
                      style={{ borderColor: 'var(--cb-danger)', background: '#fdf3f1', color: 'var(--cb-danger)' }}
                    >
                      <AlertCircle className="mt-0.5 h-5 w-5 flex-none" />
                      <span>{t.errorPre}{EMAIL}{t.errorPost}</span>
                    </div>
                  )}

                  <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
                    {/* Name */}
                    <div>
                      <label htmlFor={fid('name')} className="block text-sm font-semibold" style={{ color: 'var(--cb-ink)' }}>
                        {t.labelName} <span aria-hidden="true">*</span>
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
                          {t.labelEmail} <span aria-hidden="true">*</span>
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
                          {t.labelCompany} <span style={{ color: 'var(--cb-muted)' }}>{t.optional}</span>
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
                        {t.labelTopic} <span aria-hidden="true">*</span>
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
                          {t.topicPlaceholder}
                        </option>
                        {TOPICS.map((tp) => (
                          <option key={tp} value={tp}>
                            {t.topicLabels[tp]}
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
                        {t.labelMessage} <span aria-hidden="true">*</span>
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
                            <Loader2 className="h-5 w-5 animate-spin" /> {t.submitting}
                          </>
                        ) : (
                          <>
                            {t.submit} <Send className="h-4 w-4" />
                          </>
                        )}
                      </button>
                      <p className="text-xs" style={{ color: 'var(--cb-muted)' }}>
                        {t.privacyNote}
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
              <h2 className="text-lg font-bold">{t.reachTitle}</h2>
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
                  {t.location}
                </p>
              </div>
              <p className="mt-5 rounded-xl p-3 text-xs" style={{ background: 'var(--cb-surface)', color: 'var(--cb-muted)' }}>
                {t.spottedPre}
                <Link href="/trust" className="font-semibold hover:underline" style={{ color: 'var(--cb-primary)' }}>
                  {t.trustCenter}
                </Link>
                {t.spottedPost}
              </p>
            </div>

            <p className="mt-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--cb-muted)' }}>
              {t.talkTeam}
            </p>
            <div className="mt-3 space-y-3">
              {DIRECT_CARD_META.map((c, i) => (
                <a
                  key={c.subject}
                  href={`mailto:${EMAIL}?subject=${encodeURIComponent(c.subject)}`}
                  className="flex gap-4 rounded-2xl border p-5 transition-shadow hover:shadow-sm"
                  style={{ borderColor: 'var(--cb-line)', background: '#fff' }}
                >
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl" style={{ background: 'var(--cb-primary-soft)' }}>
                    <c.icon className="h-5 w-5" style={{ color: 'var(--cb-primary)' }} />
                  </span>
                  <span>
                    <span className="flex items-center gap-1.5 text-sm font-bold" style={{ color: 'var(--cb-ink)' }}>
                      {t.directCards[i].title} <ArrowRight className="h-3.5 w-3.5" style={{ color: 'var(--cb-primary)' }} />
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed" style={{ color: 'var(--cb-body)' }}>
                      {t.directCards[i].body}
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
                  {t.reportTitle}
                </span>
                <span className="mt-1 block text-xs leading-relaxed" style={{ color: 'var(--cb-body)' }}>
                  {t.reportBody}
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
