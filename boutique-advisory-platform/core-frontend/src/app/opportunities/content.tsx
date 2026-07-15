'use client'

// NOTE: km/zh translations are working drafts pending native-speaker review.

import Link from 'next/link'
import { ArrowRight, BadgeCheck, Building2, Lock, MapPin, Search, ShieldCheck, SlidersHorizontal } from 'lucide-react'
import PublicLayout from '@/components/public/PublicLayout'
import { useLang } from '@/i18n/public-content'

// Illustrative examples only — real, live opportunities are visible to signed-in
// members. These are not actual listings. Company names are proper nouns and the
// funding figures are shared across languages; the descriptive fields are localized.
const SAMPLE_META = [
  { name: 'Angkor Foods Co.', need: '$250,000', verified: 3 },
  { name: 'Mekong Logistics', need: '$120,000', verified: 2 },
  { name: 'Bassac Handicraft', need: '$80,000', verified: 4 },
  { name: 'Tonle Tech', need: '$150,000', verified: 2 },
  { name: 'Kampot Pepper Estate', need: '$200,000', verified: 3 },
  { name: 'Riel Retail Group', need: '$300,000', verified: 3 },
]

const CONTENT = {
  en: {
    heroBadge: 'Verification you can see',
    heroTitle: 'Discover credible Cambodian businesses',
    heroSub:
      'Browse businesses seeking capital and expertise, filter by sector and stage, and review verification before you connect. Create a free account to see live opportunities.',
    heroCtaPrimary: 'Create a free account',
    heroCtaSecondary: 'How it works for investors',
    filterTitle: 'Filter opportunities',
    searchPlaceholder: 'Search businesses…',
    sectors: ['All sectors', 'Agriculture', 'Manufacturing', 'Technology', 'Logistics', 'Retail', 'Services'],
    stages: ['All stages', 'Seed', 'Early', 'Growth', 'Established'],
    filterNote: 'Live filtering and search are available to signed-in members.',
    examplesTitle: 'Example opportunities',
    illustrative: 'Illustrative — not live listings',
    stageWord: 'stage',
    verifiedWord: 'verified',
    fundingNeed: 'Funding need',
    viewProfile: 'View profile',
    gateTitle: 'See live opportunities',
    gateBody:
      'Create a free account to browse real businesses, filter by your criteria, save profiles, and connect.',
    gateCreate: 'Create account',
    gateLogin: 'Log in',
    finalTitle: 'Ready to explore real opportunities?',
    finalSub: 'Join CamboBia to browse verified Cambodian businesses and connect with confidence.',
    finalCta: 'Create your free account',
    samples: [
      { sector: 'Agriculture', stage: 'Growth', location: 'Siem Reap', use: 'Expand processing capacity' },
      { sector: 'Logistics', stage: 'Early', location: 'Phnom Penh', use: 'Fleet & warehouse' },
      { sector: 'Manufacturing', stage: 'Growth', location: 'Kandal', use: 'Export expansion' },
      { sector: 'Technology', stage: 'Seed', location: 'Phnom Penh', use: 'Product & hiring' },
      { sector: 'Agriculture', stage: 'Growth', location: 'Kampot', use: 'Land & certification' },
      { sector: 'Retail', stage: 'Established', location: 'Phnom Penh', use: 'New locations' },
    ],
  },
  km: {
    heroBadge: 'ការផ្ទៀងផ្ទាត់ដែលអ្នកអាចមើលឃើញ',
    heroTitle: 'ស្វែងរកអាជីវកម្មកម្ពុជាគួរឱ្យទុកចិត្ត',
    heroSub:
      'រកមើលអាជីវកម្មដែលកំពុងស្វែងរកដើមទុន និងជំនាញ ត្រងតាមវិស័យ និងដំណាក់កាល និងពិនិត្យការផ្ទៀងផ្ទាត់មុនពេលអ្នកភ្ជាប់ទំនាក់ទំនង។ បង្កើតគណនីឥតគិតថ្លៃដើម្បីមើលឱកាសផ្ទាល់។',
    heroCtaPrimary: 'បង្កើតគណនីឥតគិតថ្លៃ',
    heroCtaSecondary: 'របៀបដំណើរការសម្រាប់វិនិយោគិន',
    filterTitle: 'ត្រងឱកាស',
    searchPlaceholder: 'ស្វែងរកអាជីវកម្ម…',
    sectors: ['វិស័យទាំងអស់', 'កសិកម្ម', 'ផលិតកម្ម', 'បច្ចេកវិទ្យា', 'ភស្តុភារ', 'លក់រាយ', 'សេវាកម្ម'],
    stages: ['ដំណាក់កាលទាំងអស់', 'គ្រាប់ពូជ', 'ដំបូង', 'កំណើន', 'បង្កើតឡើង'],
    filterNote: 'ការត្រង និងស្វែងរកផ្ទាល់មានសម្រាប់សមាជិកដែលបានចូល។',
    examplesTitle: 'ឧទាហរណ៍ឱកាស',
    illustrative: 'ជាឧទាហរណ៍ — មិនមែនបញ្ជីផ្ទាល់ឡើយ',
    stageWord: 'ដំណាក់កាល',
    verifiedWord: 'បានផ្ទៀងផ្ទាត់',
    fundingNeed: 'តម្រូវការមូលនិធិ',
    viewProfile: 'មើលប្រវត្តិរូប',
    gateTitle: 'មើលឱកាសផ្ទាល់',
    gateBody:
      'បង្កើតគណនីឥតគិតថ្លៃដើម្បីរកមើលអាជីវកម្មពិត ត្រងតាមលក្ខណៈវិនិច្ឆ័យរបស់អ្នក រក្សាទុកប្រវត្តិរូប និងភ្ជាប់ទំនាក់ទំនង។',
    gateCreate: 'បង្កើតគណនី',
    gateLogin: 'ចូល',
    finalTitle: 'ត្រៀមខ្លួនស្វែងរកឱកាសពិតប្រាកដហើយឬនៅ?',
    finalSub: 'ចូលរួម CamboBia ដើម្បីរកមើលអាជីវកម្មកម្ពុជាដែលបានផ្ទៀងផ្ទាត់ និងភ្ជាប់ទំនាក់ទំនងដោយទំនុកចិត្ត។',
    finalCta: 'បង្កើតគណនីឥតគិតថ្លៃរបស់អ្នក',
    samples: [
      { sector: 'កសិកម្ម', stage: 'កំណើន', location: 'សៀមរាប', use: 'ពង្រីកសមត្ថភាពកែច្នៃ' },
      { sector: 'ភស្តុភារ', stage: 'ដំបូង', location: 'ភ្នំពេញ', use: 'យានយន្ត និងឃ្លាំង' },
      { sector: 'ផលិតកម្ម', stage: 'កំណើន', location: 'កណ្តាល', use: 'ការពង្រីកការនាំចេញ' },
      { sector: 'បច្ចេកវិទ្យា', stage: 'គ្រាប់ពូជ', location: 'ភ្នំពេញ', use: 'ផលិតផល និងការជ្រើសរើសបុគ្គលិក' },
      { sector: 'កសិកម្ម', stage: 'កំណើន', location: 'កំពត', use: 'ដី និងវិញ្ញាបនបត្រ' },
      { sector: 'លក់រាយ', stage: 'បង្កើតឡើង', location: 'ភ្នំពេញ', use: 'ទីតាំងថ្មី' },
    ],
  },
  zh: {
    heroBadge: '看得见的验证',
    heroTitle: '发现可信的柬埔寨企业',
    heroSub:
      '浏览寻求资本和专业知识的企业，按行业和阶段筛选，并在建立联系前查看验证信息。创建免费账户即可查看实时商机。',
    heroCtaPrimary: '创建免费账户',
    heroCtaSecondary: '面向投资者的运作方式',
    filterTitle: '筛选商机',
    searchPlaceholder: '搜索企业…',
    sectors: ['所有行业', '农业', '制造业', '科技', '物流', '零售', '服务业'],
    stages: ['所有阶段', '种子期', '初创期', '成长期', '成熟期'],
    filterNote: '实时筛选和搜索功能面向已登录会员开放。',
    examplesTitle: '示例商机',
    illustrative: '仅供说明——非实时列表',
    stageWord: '',
    verifiedWord: '已验证',
    fundingNeed: '融资需求',
    viewProfile: '查看资料',
    gateTitle: '查看实时商机',
    gateBody: '创建免费账户，浏览真实企业、按您的条件筛选、保存资料并建立联系。',
    gateCreate: '创建账户',
    gateLogin: '登录',
    finalTitle: '准备好探索真实商机了吗？',
    finalSub: '加入 CamboBia，浏览经过验证的柬埔寨企业，充满信心地建立联系。',
    finalCta: '创建您的免费账户',
    samples: [
      { sector: '农业', stage: '成长期', location: '暹粒', use: '扩大加工产能' },
      { sector: '物流', stage: '初创期', location: '金边', use: '车队与仓库' },
      { sector: '制造业', stage: '成长期', location: '干丹', use: '出口扩张' },
      { sector: '科技', stage: '种子期', location: '金边', use: '产品与招聘' },
      { sector: '农业', stage: '成长期', location: '贡布', use: '土地与认证' },
      { sector: '零售', stage: '成熟期', location: '金边', use: '新门店' },
    ],
  },
} as const

export default function OpportunitiesContent() {
  const t = CONTENT[useLang()]
  const samples = SAMPLE_META.map((meta, i) => ({ ...meta, ...t.samples[i] }))

  return (
    <PublicLayout>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(180deg,#fff, var(--cb-surface))' }}>
        <div className="cb-wrap py-16 lg:py-20">
          <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'var(--cb-primary-soft)', color: 'var(--cb-primary-dark)' }}>
            <ShieldCheck className="h-3.5 w-3.5" /> {t.heroBadge}
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">
            {t.heroTitle}
          </h1>
          <p className="mt-5 max-w-2xl text-lg" style={{ color: 'var(--cb-body)' }}>
            {t.heroSub}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/auth/register" className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold text-white shadow-sm" style={{ background: 'var(--cb-primary)' }}>
              {t.heroCtaPrimary} <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/for-investors" className="inline-flex items-center justify-center rounded-xl border px-6 py-3.5 text-base font-semibold" style={{ borderColor: 'var(--cb-line)', color: 'var(--cb-ink)', background: '#fff' }}>
              {t.heroCtaSecondary}
            </Link>
          </div>
        </div>
      </section>

      {/* Filters (preview) + samples */}
      <section className="cb-wrap py-14">
        {/* Filter bar — illustrative preview of the signed-in browsing experience */}
        <div className="rounded-2xl border p-4 sm:p-5" style={{ borderColor: 'var(--cb-line)', background: '#fff', boxShadow: 'var(--cb-shadow-sm)' }}>
          <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--cb-ink)' }}>
            <SlidersHorizontal className="h-4 w-4" style={{ color: 'var(--cb-primary)' }} /> {t.filterTitle}
          </div>
          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex flex-1 items-center gap-2 rounded-lg border px-3 py-2" style={{ borderColor: 'var(--cb-line)', background: 'var(--cb-surface)' }}>
              <Search className="h-4 w-4" style={{ color: 'var(--cb-muted)' }} />
              <span className="text-sm" style={{ color: 'var(--cb-muted)' }}>{t.searchPlaceholder}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {t.sectors.slice(0, 4).map((s, i) => (
                <span key={s} className="rounded-full border px-3 py-1.5 text-xs font-medium" style={{ borderColor: i === 0 ? 'var(--cb-primary)' : 'var(--cb-line)', color: i === 0 ? 'var(--cb-primary-dark)' : 'var(--cb-muted)', background: i === 0 ? 'var(--cb-primary-soft)' : '#fff' }}>{s}</span>
              ))}
              {t.stages.slice(1, 3).map((s) => (
                <span key={s} className="rounded-full border px-3 py-1.5 text-xs font-medium" style={{ borderColor: 'var(--cb-line)', color: 'var(--cb-muted)' }}>{s}</span>
              ))}
            </div>
          </div>
          <p className="mt-3 text-xs" style={{ color: 'var(--cb-muted)' }}>{t.filterNote}</p>
        </div>

        {/* Sample grid */}
        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-lg font-bold">{t.examplesTitle}</h2>
          <span className="text-xs font-medium" style={{ color: 'var(--cb-muted)' }}>{t.illustrative}</span>
        </div>

        <div className="relative mt-4">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="false">
            {samples.map((o) => (
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
                  <span className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: 'var(--cb-surface-2)', color: 'var(--cb-body)' }}>{o.stage}{t.stageWord ? ` ${t.stageWord}` : ''}</span>
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: 'var(--cb-primary-soft)', color: 'var(--cb-primary-dark)' }}><BadgeCheck className="h-3 w-3" /> {o.verified}/4 {t.verifiedWord}</span>
                </div>
                <div className="mt-4 rounded-lg p-3" style={{ background: 'var(--cb-surface)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--cb-muted)' }}>{t.fundingNeed}</p>
                  <p className="mt-0.5 font-bold" style={{ color: 'var(--cb-ink)' }}>{o.need} <span className="text-xs font-normal" style={{ color: 'var(--cb-muted)' }}>· {o.use}</span></p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--cb-primary)' }}>
                  <Building2 className="h-4 w-4" /> {t.viewProfile}
                </span>
              </article>
            ))}
          </div>

          {/* Sign-in gate overlay */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center" style={{ height: '60%', background: 'linear-gradient(180deg, transparent, var(--cb-surface) 78%)' }}>
            <div className="pointer-events-auto mt-auto mb-6 flex max-w-md flex-col items-center rounded-2xl border p-6 text-center" style={{ borderColor: 'var(--cb-line)', background: '#fff', boxShadow: 'var(--cb-shadow)' }}>
              <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: 'var(--cb-primary-soft)' }}><Lock className="h-5 w-5" style={{ color: 'var(--cb-primary)' }} /></span>
              <h3 className="mt-3 text-lg font-bold">{t.gateTitle}</h3>
              <p className="mt-1.5 text-sm" style={{ color: 'var(--cb-body)' }}>{t.gateBody}</p>
              <div className="mt-4 flex w-full flex-col gap-2 sm:flex-row">
                <Link href="/auth/register" className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white" style={{ background: 'var(--cb-primary)' }}>{t.gateCreate}</Link>
                <Link href="/auth/login" className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold" style={{ borderColor: 'var(--cb-line)', color: 'var(--cb-ink)' }}>{t.gateLogin}</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ background: 'var(--cb-primary)' }}>
        <div className="cb-wrap py-14 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">{t.finalTitle}</h2>
          <p className="mx-auto mt-3 max-w-xl" style={{ color: 'rgba(255,255,255,0.85)' }}>{t.finalSub}</p>
          <Link href="/auth/register" className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold" style={{ color: 'var(--cb-primary-dark)' }}>
            {t.finalCta} <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </PublicLayout>
  )
}
