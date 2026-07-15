'use client'

// NOTE: km/zh translations are working drafts pending native-speaker review.

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
import { useLang } from '@/i18n/public-content'

const CONTENT = {
  en: {
    heroBadge: 'About CamboBia',
    heroTitle: 'Where Cambodian businesses meet capital and expertise',
    heroSub:
      'Our mission is simple: help credible Cambodian businesses connect with the investors and advisors who can help them grow — on a platform built around trust, transparency, and local context.',
    whyTitle: 'Why CamboBia exists',
    whyP1:
      'Cambodia’s small and medium enterprises are the backbone of the economy — yet many struggle to access growth capital and trusted professional advice. Capable businesses stay invisible to investors, and investors struggle to find and evaluate credible opportunities.',
    whyP2:
      'The gap isn’t only about money. It’s a trust gap: it’s hard to know who is genuine, what has been verified, and where to start a conversation safely. CamboBia was built to close that gap — with structured profiles, distinct verification signals, and honest expectations about what a connection can and cannot do.',
    gapHeading: 'The gap we address',
    gaps: [
      {
        term: 'A financing gap',
        desc: 'Growing businesses often can’t reach investors who’d be interested — and lack a credible way to present themselves.',
      },
      {
        term: 'A trust gap',
        desc: 'Without clear verification, it’s hard to know who is genuine or where it’s safe to begin.',
      },
      {
        term: 'An expertise gap',
        desc: 'Many businesses need advisory support to become investment-ready, but don’t know where to find qualified help.',
      },
    ],
    valuesTitle: 'What we value',
    valuesSub: 'Three principles guide every decision we make about the platform.',
    values: [
      {
        title: 'Trust',
        body: 'We build distinct, explained verification into every profile so people know exactly who they’re dealing with — never a single vague badge.',
      },
      {
        title: 'Transparency',
        body: 'We’re clear about what we do, what we don’t, and the limits of what any connection can promise. No hidden incentives, no inflated claims.',
      },
      {
        title: 'Local expertise',
        body: 'We’re built for Cambodia’s market, businesses, and advisors — with the local context that generic global platforms miss.',
      },
    ],
    honestBadge: 'Honest by design',
    honestTitle: 'What we are — and what we are not',
    honestSub: 'Being clear about our limits is part of being trustworthy.',
    weAreHeading: 'We are',
    weAreNotHeading: 'We are not',
    weAre: [
      'A connection platform that helps businesses, investors, and advisors find each other.',
      'An information platform that presents structured, comparable profiles and verification signals.',
      'A directory where investors can discover and follow Cambodian businesses.',
      'A place for advisors to show credentials and receive genuine requests.',
    ],
    weAreNot: [
      'A bank, lender, or provider of any financial product.',
      'A broker, dealer, or intermediary that arranges or executes transactions.',
      'An investment, legal, tax, or financial adviser — we don’t give advice.',
      'A guarantor of funding, returns, valuations, or any particular outcome.',
    ],
    riskLead: 'CamboBia connects and informs; the decisions are always yours. Please review our',
    riskLink: 'Risk Disclosure',
    riskTrail: 'before acting on anything you find on the platform.',
    rolesTitle: 'Built for three roles',
    rolesSub: 'One trusted marketplace serving Cambodia’s businesses, investors, and advisors.',
    learnMore: 'Learn more',
    audiences: [
      { title: 'Businesses', body: 'Build credibility and reach people who can help you grow.' },
      { title: 'Investors', body: 'Discover and evaluate Cambodian businesses with better information.' },
      { title: 'Advisors', body: 'Show your expertise and connect with businesses that need it.' },
    ],
    contactTitle: 'Want to know more?',
    contactSub: 'We’d love to hear from you — whether you’re a business, an investor, an advisor, or a partner.',
    contactCtaPrimary: 'Contact our team',
    contactCtaSecondary: 'See how it works',
  },
  km: {
    heroBadge: 'អំពី CamboBia',
    heroTitle: 'កន្លែងដែលអាជីវកម្មកម្ពុជាជួបនឹងដើមទុន និងជំនាញ',
    heroSub:
      'បេសកកម្មរបស់យើងសាមញ្ញ៖ ជួយអាជីវកម្មកម្ពុជាគួរឱ្យទុកចិត្តភ្ជាប់ជាមួយវិនិយោគិន និងអ្នកប្រឹក្សាដែលអាចជួយពួកគេរីកចម្រើន — នៅលើវេទិកាដែលបង្កើតឡើងជុំវិញការទុកចិត្ត តម្លាភាព និងបរិបទក្នុងស្រុក។',
    whyTitle: 'ហេតុអ្វី CamboBia មានវត្តមាន',
    whyP1:
      'សហគ្រាសធុនតូច និងមធ្យមរបស់កម្ពុជាគឺជាឆ្អឹងខ្នងនៃសេដ្ឋកិច្ច — ប៉ុន្តែជាច្រើនកំពុងតស៊ូដើម្បីទទួលបានដើមទុនកំណើន និងការប្រឹក្សាវិជ្ជាជីវៈដែលអាចទុកចិត្តបាន។ អាជីវកម្មដែលមានសមត្ថភាពនៅតែមើលមិនឃើញចំពោះវិនិយោគិន ហើយវិនិយោគិនកំពុងតស៊ូដើម្បីស្វែងរក និងវាយតម្លៃឱកាសគួរឱ្យទុកចិត្ត។',
    whyP2:
      'គម្លាតនេះមិនមែនគ្រាន់តែអំពីប្រាក់ទេ។ វាជាគម្លាតទំនុកចិត្ត៖ វាពិបាកក្នុងការដឹងថាអ្នកណាពិត អ្វីត្រូវបានផ្ទៀងផ្ទាត់ និងកន្លែងណាដែលត្រូវចាប់ផ្តើមការសន្ទនាដោយសុវត្ថិភាព។ CamboBia ត្រូវបានបង្កើតឡើងដើម្បីបំពេញគម្លាតនោះ — ជាមួយប្រវត្តិរូបមានរចនាសម្ព័ន្ធ សញ្ញាផ្ទៀងផ្ទាត់ដាច់ដោយឡែក និងការរំពឹងទុកដោយស្មោះត្រង់អំពីអ្វីដែលការតភ្ជាប់អាចធ្វើ និងមិនអាចធ្វើបាន។',
    gapHeading: 'គម្លាតដែលយើងដោះស្រាយ',
    gaps: [
      {
        term: 'គម្លាតហិរញ្ញប្បទាន',
        desc: 'អាជីវកម្មដែលកំពុងរីកចម្រើនជាញឹកញាប់មិនអាចទាក់ទងវិនិយោគិនដែលមានចំណាប់អារម្មណ៍ — ហើយខ្វះមធ្យោបាយគួរឱ្យទុកចិត្តក្នុងការបង្ហាញខ្លួន។',
      },
      {
        term: 'គម្លាតទំនុកចិត្ត',
        desc: 'បើគ្មានការផ្ទៀងផ្ទាត់ច្បាស់លាស់ វាពិបាកក្នុងការដឹងថាអ្នកណាពិត ឬកន្លែងណាដែលមានសុវត្ថិភាពដើម្បីចាប់ផ្តើម។',
      },
      {
        term: 'គម្លាតជំនាញ',
        desc: 'អាជីវកម្មជាច្រើនត្រូវការការគាំទ្រប្រឹក្សាដើម្បីត្រៀមខ្លួនសម្រាប់ការវិនិយោគ ប៉ុន្តែមិនដឹងកន្លែងណាដើម្បីរកជំនួយដែលមានគុណវុឌ្ឍិ។',
      },
    ],
    valuesTitle: 'អ្វីដែលយើងឱ្យតម្លៃ',
    valuesSub: 'គោលការណ៍បីដឹកនាំរាល់ការសម្រេចចិត្តដែលយើងធ្វើអំពីវេទិកា។',
    values: [
      {
        title: 'ការទុកចិត្ត',
        body: 'យើងបង្កើតការផ្ទៀងផ្ទាត់ដាច់ដោយឡែក និងមានការពន្យល់ចូលទៅក្នុងប្រវត្តិរូបនីមួយៗ ដូច្នេះមនុស្សដឹងច្បាស់ថាពួកគេកំពុងទាក់ទងជាមួយអ្នកណា — មិនមែនស្លាកតែមួយមិនច្បាស់ឡើយ។',
      },
      {
        title: 'តម្លាភាព',
        body: 'យើងច្បាស់លាស់អំពីអ្វីដែលយើងធ្វើ អ្វីដែលយើងមិនធ្វើ និងដែនកំណត់នៃអ្វីដែលការតភ្ជាប់ណាមួយអាចសន្យា។ គ្មានការលើកទឹកចិត្តលាក់កំបាំង គ្មានការអះអាងបំផ្លើសឡើយ។',
      },
      {
        title: 'ជំនាញក្នុងស្រុក',
        body: 'យើងបង្កើតឡើងសម្រាប់ទីផ្សារ អាជីវកម្ម និងអ្នកប្រឹក្សារបស់កម្ពុជា — ជាមួយបរិបទក្នុងស្រុកដែលវេទិកាសកលទូទៅមើលរំលង។',
      },
    ],
    honestBadge: 'ស្មោះត្រង់តាមការរចនា',
    honestTitle: 'អ្វីដែលយើងជា — និងអ្វីដែលយើងមិនមែន',
    honestSub: 'ការច្បាស់លាស់អំពីដែនកំណត់របស់យើងគឺជាផ្នែកមួយនៃភាពគួរឱ្យទុកចិត្ត។',
    weAreHeading: 'យើងជា',
    weAreNotHeading: 'យើងមិនមែនជា',
    weAre: [
      'វេទិកាភ្ជាប់ទំនាក់ទំនងដែលជួយអាជីវកម្ម វិនិយោគិន និងអ្នកប្រឹក្សាស្វែងរកគ្នាទៅវិញទៅមក។',
      'វេទិកាព័ត៌មានដែលបង្ហាញប្រវត្តិរូបមានរចនាសម្ព័ន្ធ អាចប្រៀបធៀបបាន និងសញ្ញាផ្ទៀងផ្ទាត់។',
      'បញ្ជីមួយដែលវិនិយោគិនអាចស្វែងរក និងតាមដានអាជីវកម្មកម្ពុជា។',
      'កន្លែងសម្រាប់អ្នកប្រឹក្សាបង្ហាញលិខិតបញ្ជាក់ និងទទួលសំណើពិតប្រាកដ។',
    ],
    weAreNot: [
      'ធនាគារ អ្នកឱ្យខ្ចី ឬអ្នកផ្តល់ផលិតផលហិរញ្ញវត្ថុណាមួយ។',
      'ឈ្មួញកណ្តាល អ្នកជួញដូរ ឬអន្តរការីដែលរៀបចំ ឬអនុវត្តប្រតិបត្តិការ។',
      'ទីប្រឹក្សាវិនិយោគ ច្បាប់ ពន្ធ ឬហិរញ្ញវត្ថុ — យើងមិនផ្តល់ការប្រឹក្សាឡើយ។',
      'អ្នកធានាមូលនិធិ ប្រាក់ចំណេញ តម្លៃ ឬលទ្ធផលជាក់លាក់ណាមួយ។',
    ],
    riskLead: 'CamboBia ភ្ជាប់ទំនាក់ទំនង និងផ្តល់ព័ត៌មាន ការសម្រេចចិត្តតែងតែជារបស់អ្នក។ សូមពិនិត្យ',
    riskLink: 'ការបង្ហាញអំពីហានិភ័យ',
    riskTrail: 'របស់យើងមុនពេលធ្វើសកម្មភាពលើអ្វីដែលអ្នករកឃើញនៅលើវេទិកា។',
    rolesTitle: 'បង្កើតឡើងសម្រាប់តួនាទីបី',
    rolesSub: 'ទីផ្សារគួរឱ្យទុកចិត្តតែមួយបម្រើអាជីវកម្ម វិនិយោគិន និងអ្នកប្រឹក្សារបស់កម្ពុជា។',
    learnMore: 'ស្វែងយល់បន្ថែម',
    audiences: [
      { title: 'អាជីវកម្ម', body: 'បង្កើតភាពគួរឱ្យទុកចិត្ត និងទាក់ទងអ្នកដែលអាចជួយអ្នករីកចម្រើន។' },
      { title: 'វិនិយោគិន', body: 'ស្វែងរក និងវាយតម្លៃអាជីវកម្មកម្ពុជាជាមួយព័ត៌មានប្រសើរជាងមុន។' },
      { title: 'អ្នកប្រឹក្សា', body: 'បង្ហាញជំនាញរបស់អ្នក និងភ្ជាប់ជាមួយអាជីវកម្មដែលត្រូវការវា។' },
    ],
    contactTitle: 'ចង់ដឹងបន្ថែមទេ?',
    contactSub: 'យើងចង់ឮពីអ្នក — មិនថាអ្នកជាអាជីវកម្ម វិនិយោគិន អ្នកប្រឹក្សា ឬដៃគូ។',
    contactCtaPrimary: 'ទាក់ទងក្រុមការងាររបស់យើង',
    contactCtaSecondary: 'មើលរបៀបដំណើរការ',
  },
  zh: {
    heroBadge: '关于 CamboBia',
    heroTitle: '柬埔寨企业与资本、专业知识相遇的地方',
    heroSub:
      '我们的使命很简单：帮助可信的柬埔寨企业与能助其成长的投资者和顾问建立联系——在一个围绕信任、透明和本地情境打造的平台上。',
    whyTitle: 'CamboBia 为何存在',
    whyP1:
      '柬埔寨的中小企业是经济的支柱——然而许多企业难以获得成长资本和值得信赖的专业建议。有能力的企业对投资者而言仍不可见，而投资者也难以找到和评估可信的商机。',
    whyP2:
      '这一鸿沟不只关乎资金，更是一道信任鸿沟：很难知道谁是真实的、什么已经过验证，以及从何处安全地开始对话。CamboBia 的建立正是为了弥合这一鸿沟——以结构化的资料、独立的验证信号，以及对一次连接能做什么、不能做什么的诚实预期。',
    gapHeading: '我们要解决的鸿沟',
    gaps: [
      {
        term: '融资鸿沟',
        desc: '成长中的企业往往无法接触到会感兴趣的投资者——也缺乏可信的方式来展示自己。',
      },
      {
        term: '信任鸿沟',
        desc: '没有清晰的验证，很难知道谁是真实的，或从何处开始才安全。',
      },
      {
        term: '专业鸿沟',
        desc: '许多企业需要咨询支持才能做好投资准备，却不知道去哪里找到合格的帮助。',
      },
    ],
    valuesTitle: '我们所珍视的',
    valuesSub: '三条原则指引着我们关于平台的每一个决定。',
    values: [
      {
        title: '信任',
        body: '我们在每份资料中构建独立、有说明的验证，让人们确切知道自己在与谁打交道——绝不使用单一含糊的标签。',
      },
      {
        title: '透明',
        body: '我们清楚说明我们做什么、不做什么，以及任何连接所能承诺的限度。没有隐藏的动机，没有夸大的说法。',
      },
      {
        title: '本地专长',
        body: '我们为柬埔寨的市场、企业和顾问而打造——具备通用型全球平台所忽略的本地情境。',
      },
    ],
    honestBadge: '以诚实为设计',
    honestTitle: '我们是什么——以及我们不是什么',
    honestSub: '清楚说明我们的限度，是值得信赖的一部分。',
    weAreHeading: '我们是',
    weAreNotHeading: '我们不是',
    weAre: [
      '一个帮助企业、投资者和顾问相互找到对方的连接平台。',
      '一个呈现结构化、可比较资料和验证信号的信息平台。',
      '一个投资者可以发现并关注柬埔寨企业的目录。',
      '一个让顾问展示资质并接收真实请求的地方。',
    ],
    weAreNot: [
      '银行、放贷方或任何金融产品的提供者。',
      '安排或执行交易的经纪商、交易商或中介。',
      '投资、法律、税务或财务顾问——我们不提供建议。',
      '融资、回报、估值或任何特定结果的担保方。',
    ],
    riskLead: 'CamboBia 负责连接与提供信息；决定始终由您做出。在依据平台上的任何内容采取行动之前，请查看我们的',
    riskLink: '风险披露',
    riskTrail: '。',
    rolesTitle: '为三种角色打造',
    rolesSub: '一个值得信赖的市场，服务于柬埔寨的企业、投资者和顾问。',
    learnMore: '了解更多',
    audiences: [
      { title: '企业', body: '建立可信度，并接触能帮助您成长的人。' },
      { title: '投资者', body: '凭借更好的信息发现并评估柬埔寨企业。' },
      { title: '顾问', body: '展示您的专长，并与需要它的企业建立联系。' },
    ],
    contactTitle: '想了解更多？',
    contactSub: '无论您是企业、投资者、顾问还是合作伙伴，我们都很乐意听到您的声音。',
    contactCtaPrimary: '联系我们的团队',
    contactCtaSecondary: '了解运作方式',
  },
} as const

const VALUE_ICONS = [ShieldCheck, Eye, MapPin]
const AUDIENCE_ICONS = [Building2, TrendingUp, Briefcase]
const AUDIENCE_HREFS = ['/for-businesses', '/for-investors', '/for-advisors']

export default function AboutContent() {
  const t = CONTENT[useLang()]

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
              <Handshake className="h-3.5 w-3.5" /> {t.heroBadge}
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">
              {t.heroTitle}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg" style={{ color: 'var(--cb-body)' }}>
              {t.heroSub}
            </p>
          </div>
        </div>
      </section>

      {/* Why we exist */}
      <section className="cb-wrap py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">{t.whyTitle}</h2>
            <p className="mt-5 text-lg leading-relaxed" style={{ color: 'var(--cb-body)' }}>
              {t.whyP1}
            </p>
            <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--cb-body)' }}>
              {t.whyP2}
            </p>
          </div>
          <div
            className="rounded-2xl border p-8"
            style={{ borderColor: 'var(--cb-line)', background: '#fff', boxShadow: 'var(--cb-shadow)' }}
          >
            <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--cb-muted)' }}>
              {t.gapHeading}
            </h3>
            <dl className="mt-6 space-y-6">
              {t.gaps.map(g => (
                <div key={g.term}>
                  <dt className="text-base font-bold" style={{ color: 'var(--cb-ink)' }}>
                    {g.term}
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--cb-body)' }}>
                    {g.desc}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ background: '#fff', borderTop: '1px solid var(--cb-line)', borderBottom: '1px solid var(--cb-line)' }}>
        <div className="cb-wrap py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">{t.valuesTitle}</h2>
            <p className="mt-4 text-lg" style={{ color: 'var(--cb-muted)' }}>
              {t.valuesSub}
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {t.values.map((v, i) => {
              const Icon = VALUE_ICONS[i]
              return (
                <div
                  key={v.title}
                  className="rounded-2xl border p-7"
                  style={{ borderColor: 'var(--cb-line)', background: 'var(--cb-surface)', boxShadow: 'var(--cb-shadow-sm)' }}
                >
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ background: 'var(--cb-primary-soft)' }}
                  >
                    <Icon className="h-6 w-6" style={{ color: 'var(--cb-primary)' }} />
                  </span>
                  <h3 className="mt-5 text-xl font-bold">{v.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--cb-body)' }}>
                    {v.body}
                  </p>
                </div>
              )
            })}
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
            <ShieldCheck className="h-3.5 w-3.5" /> {t.honestBadge}
          </span>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">{t.honestTitle}</h2>
          <p className="mt-4 text-lg" style={{ color: 'var(--cb-muted)' }}>
            {t.honestSub}
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
              {t.weAreHeading}
            </h3>
            <ul className="mt-5 space-y-3">
              {t.weAre.map(item => (
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
              {t.weAreNotHeading}
            </h3>
            <ul className="mt-5 space-y-3">
              {t.weAreNot.map(item => (
                <li key={item} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--cb-body)' }}>
                  <X className="mt-0.5 h-4 w-4 flex-none" style={{ color: 'var(--cb-danger)' }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-relaxed" style={{ color: 'var(--cb-muted)' }}>
          {t.riskLead}{' '}
          <Link href="/risk-disclosure" className="underline" style={{ color: 'var(--cb-primary)' }}>
            {t.riskLink}
          </Link>{' '}
          {t.riskTrail}
        </p>
      </section>

      {/* Who it's for */}
      <section style={{ background: 'var(--cb-surface)', borderTop: '1px solid var(--cb-line)' }}>
        <div className="cb-wrap py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">{t.rolesTitle}</h2>
            <p className="mt-4 text-lg" style={{ color: 'var(--cb-muted)' }}>
              {t.rolesSub}
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {t.audiences.map((a, i) => {
              const Icon = AUDIENCE_ICONS[i]
              return (
                <Link
                  key={AUDIENCE_HREFS[i]}
                  href={AUDIENCE_HREFS[i]}
                  className="flex flex-col rounded-2xl border p-7"
                  style={{ borderColor: 'var(--cb-line)', background: '#fff', boxShadow: 'var(--cb-shadow-sm)' }}
                >
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ background: 'var(--cb-primary-soft)' }}
                  >
                    <Icon className="h-6 w-6" style={{ color: 'var(--cb-primary)' }} />
                  </span>
                  <h3 className="mt-5 text-xl font-bold">{a.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed" style={{ color: 'var(--cb-body)' }}>
                    {a.body}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--cb-primary)' }}>
                    {t.learnMore} <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section style={{ background: 'var(--cb-primary)' }}>
        <div className="cb-wrap py-16 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">{t.contactTitle}</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg" style={{ color: 'rgba(255,255,255,0.85)' }}>
            {t.contactSub}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold"
              style={{ color: 'var(--cb-primary-dark)' }}
            >
              {t.contactCtaPrimary} <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center rounded-xl border px-6 py-3.5 text-base font-semibold text-white"
              style={{ borderColor: 'rgba(255,255,255,0.4)' }}
            >
              {t.contactCtaSecondary}
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
