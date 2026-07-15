'use client'

// NOTE: km/zh translations are working drafts pending native-speaker review.

import Link from 'next/link'
import {
  ArrowRight,
  FileText,
  Search,
  MessagesSquare,
  Building2,
  TrendingUp,
  Briefcase,
  ShieldCheck,
  BadgeCheck,
  Users,
  CheckCircle2,
} from 'lucide-react'
import PublicLayout from '@/components/public/PublicLayout'
import { useLang } from '@/i18n/public-content'

const CONTENT = {
  en: {
    heroBadge: 'How it works',
    heroTitle: 'From a credible profile to a trusted connection',
    heroSub:
      'CamboBia gives businesses, investors, and advisors a clear, structured place to find one another. We help you connect and stay informed — we don’t guarantee funding, returns, or any particular outcome.',
    heroCtaPrimary: 'Create your profile',
    heroCtaSecondary: 'Browse opportunities',
    stepsTitle: 'The same three steps for everyone',
    stepsSub: 'Whether you’re raising, investing, or advising, the journey follows one credible path.',
    steps: [
      {
        title: 'Create a credible profile',
        body: 'Businesses, investors, and advisors build structured profiles that show who they are, what they offer, and what they’re looking for — with verification signals attached.',
      },
      {
        title: 'Discover and connect',
        body: 'Investors filter and save opportunities; businesses and advisors find each other through a trusted, searchable directory built around clear, comparable information.',
      },
      {
        title: 'Engage with confidence',
        body: 'Message, ask questions, and progress conversations — with verification and trust signals visible throughout, so you always know who you’re talking to.',
      },
    ],
    rolesTitle: 'What each role does',
    rolesSub: 'One platform, three journeys. Here’s what the path looks like for you.',
    roles: [
      {
        title: 'For businesses',
        lede: 'Present your company credibly and reach people who can help you grow.',
        cta: 'Explore for businesses',
        points: [
          'Build a structured business profile: sector, stage, location, and traction.',
          'Complete verification steps to earn distinct, explained trust signals.',
          'Present your funding needs and the story behind them.',
          'Connect with advisors to strengthen your profile before you raise.',
          'Increase visibility to investors browsing the opportunities directory.',
        ],
      },
      {
        title: 'For investors',
        lede: 'Find and evaluate Cambodian businesses with the information you need up front.',
        cta: 'Explore for investors',
        points: [
          'Browse and filter businesses by sector, stage, location, and funding need.',
          'Review verification information before you decide to reach out.',
          'Save opportunities and keep track of the businesses you’re following.',
          'Message businesses directly to ask questions and request more detail.',
          'Make your own decisions — CamboBia informs, it does not advise or guarantee.',
        ],
      },
      {
        title: 'For advisors',
        lede: 'Show your credentials and receive requests from growing businesses.',
        cta: 'Explore for advisors',
        points: [
          'Create a professional profile that showcases your expertise and services.',
          'Verify your credentials to stand out with a clear trust signal.',
          'Receive advisory requests from businesses that match your specialisms.',
          'Help businesses prepare credible profiles and funding materials.',
          'Build a reputation through genuine, verifiable engagements.',
        ],
      },
    ],
    verifyBadge: 'How verification works',
    verifyTitle: 'Trust signals you can actually read',
    verifyLede:
      'Instead of a single vague “verified” badge, CamboBia uses distinct, clearly explained checks. Each one tells you exactly what was confirmed — and what it does not claim.',
    verifyNote:
      'Verification helps you decide who to trust and where to start a conversation. It is not a recommendation, an endorsement, or a promise of quality, performance, or outcome. Always do your own review before making any decision or commitment.',
    verifyCta: 'Visit the Trust Center',
    verification: [
      { label: 'Email verified', body: 'Confirms the account holder controls the email address on file.' },
      { label: 'Identity verified', body: 'Confirms a real person is behind the account through identity checks.' },
      { label: 'Business verified', body: 'Confirms business registration details for a company profile.' },
      { label: 'Credentials verified', body: 'Confirms an advisor’s professional qualifications and standing.' },
    ],
    finalTitle: 'Ready to get started?',
    finalSub:
      'Create your credible profile in minutes and join a trusted marketplace built for Cambodian growth.',
    finalCtaPrimary: 'Create your profile',
    finalCtaSecondary: 'Read the FAQ',
  },
  km: {
    heroBadge: 'របៀបដំណើរការ',
    heroTitle: 'ពីប្រវត្តិរូបគួរឱ្យទុកចិត្តទៅការតភ្ជាប់ដែលអាចទុកចិត្តបាន',
    heroSub:
      'CamboBia ផ្តល់ឱ្យអាជីវកម្ម វិនិយោគិន និងអ្នកប្រឹក្សានូវកន្លែងច្បាស់លាស់ និងមានរចនាសម្ព័ន្ធដើម្បីស្វែងរកគ្នាទៅវិញទៅមក។ យើងជួយអ្នកភ្ជាប់ទំនាក់ទំនង និងទទួលបានព័ត៌មាន — យើងមិនធានាការផ្តល់មូលនិធិ ប្រាក់ចំណេញ ឬលទ្ធផលជាក់លាក់ណាមួយឡើយ។',
    heroCtaPrimary: 'បង្កើតប្រវត្តិរូបរបស់អ្នក',
    heroCtaSecondary: 'រកមើលឱកាស',
    stepsTitle: 'ជំហានទាំងបីដូចគ្នាសម្រាប់មនុស្សគ្រប់គ្នា',
    stepsSub: 'មិនថាអ្នករកមូលនិធិ វិនិយោគ ឬផ្តល់ការប្រឹក្សា ដំណើរនេះដើរតាមផ្លូវគួរឱ្យទុកចិត្តតែមួយ។',
    steps: [
      {
        title: 'បង្កើតប្រវត្តិរូបគួរឱ្យទុកចិត្ត',
        body: 'អាជីវកម្ម វិនិយោគិន និងអ្នកប្រឹក្សាបង្កើតប្រវត្តិរូបមានរចនាសម្ព័ន្ធ ដែលបង្ហាញពីអត្តសញ្ញាណរបស់ពួកគេ អ្វីដែលពួកគេផ្តល់ជូន និងអ្វីដែលពួកគេស្វែងរក — ភ្ជាប់ជាមួយសញ្ញាផ្ទៀងផ្ទាត់។',
      },
      {
        title: 'ស្វែងរក និងភ្ជាប់ទំនាក់ទំនង',
        body: 'វិនិយោគិនត្រង និងរក្សាទុកឱកាស អាជីវកម្ម និងអ្នកប្រឹក្សាស្វែងរកគ្នាតាមរយៈបញ្ជីដែលអាចស្វែងរកបាន និងគួរឱ្យទុកចិត្ត ដែលបង្កើតឡើងជុំវិញព័ត៌មានច្បាស់លាស់ និងអាចប្រៀបធៀបបាន។',
      },
      {
        title: 'ចូលរួមដោយទំនុកចិត្ត',
        body: 'ផ្ញើសារ សួរសំណួរ និងបន្តការសន្ទនា — ដោយមានសញ្ញាផ្ទៀងផ្ទាត់ និងទំនុកចិត្តបង្ហាញពេញមួយដំណើរការ ដូច្នេះអ្នកតែងតែដឹងថាអ្នកកំពុងនិយាយជាមួយអ្នកណា។',
      },
    ],
    rolesTitle: 'តួនាទីនីមួយៗធ្វើអ្វី',
    rolesSub: 'វេទិកាតែមួយ បីដំណើរ។ នេះជាផ្លូវសម្រាប់អ្នក។',
    roles: [
      {
        title: 'សម្រាប់អាជីវកម្ម',
        lede: 'បង្ហាញក្រុមហ៊ុនរបស់អ្នកឱ្យគួរឱ្យទុកចិត្ត និងទាក់ទងអ្នកដែលអាចជួយអ្នករីកចម្រើន។',
        cta: 'ស្វែងយល់សម្រាប់អាជីវកម្ម',
        points: [
          'បង្កើតប្រវត្តិរូបអាជីវកម្មមានរចនាសម្ព័ន្ធ៖ វិស័យ ដំណាក់កាល ទីតាំង និងវឌ្ឍនភាព។',
          'បំពេញជំហានផ្ទៀងផ្ទាត់ដើម្បីទទួលបានសញ្ញាទំនុកចិត្តដាច់ដោយឡែក និងមានការពន្យល់។',
          'បង្ហាញតម្រូវការមូលនិធិរបស់អ្នក និងរឿងរ៉ាវនៅពីក្រោយវា។',
          'ភ្ជាប់ជាមួយអ្នកប្រឹក្សាដើម្បីពង្រឹងប្រវត្តិរូបរបស់អ្នកមុនពេលអ្នករកមូលនិធិ។',
          'បង្កើនភាពមើលឃើញចំពោះវិនិយោគិនដែលកំពុងរកមើលបញ្ជីឱកាស។',
        ],
      },
      {
        title: 'សម្រាប់វិនិយោគិន',
        lede: 'ស្វែងរក និងវាយតម្លៃអាជីវកម្មកម្ពុជាជាមួយព័ត៌មានដែលអ្នកត្រូវការតាំងពីដំបូង។',
        cta: 'ស្វែងយល់សម្រាប់វិនិយោគិន',
        points: [
          'រកមើល និងត្រងអាជីវកម្មតាមវិស័យ ដំណាក់កាល ទីតាំង និងតម្រូវការមូលនិធិ។',
          'ពិនិត្យព័ត៌មានផ្ទៀងផ្ទាត់មុនពេលអ្នកសម្រេចទាក់ទង។',
          'រក្សាទុកឱកាស និងតាមដានអាជីវកម្មដែលអ្នកកំពុងតាមដាន។',
          'ផ្ញើសារទៅអាជីវកម្មដោយផ្ទាល់ដើម្បីសួរសំណួរ និងស្នើសុំព័ត៌មានលម្អិតបន្ថែម។',
          'ធ្វើការសម្រេចចិត្តដោយខ្លួនឯង — CamboBia ផ្តល់ព័ត៌មាន វាមិនផ្តល់ការប្រឹក្សា ឬធានាឡើយ។',
        ],
      },
      {
        title: 'សម្រាប់អ្នកប្រឹក្សា',
        lede: 'បង្ហាញលិខិតបញ្ជាក់របស់អ្នក និងទទួលសំណើពីអាជីវកម្មដែលកំពុងរីកចម្រើន។',
        cta: 'ស្វែងយល់សម្រាប់អ្នកប្រឹក្សា',
        points: [
          'បង្កើតប្រវត្តិរូបជំនាញដែលបង្ហាញជំនាញ និងសេវាកម្មរបស់អ្នក។',
          'ផ្ទៀងផ្ទាត់លិខិតបញ្ជាក់របស់អ្នកដើម្បីលេចធ្លោជាមួយសញ្ញាទំនុកចិត្តច្បាស់លាស់។',
          'ទទួលសំណើប្រឹក្សាពីអាជីវកម្មដែលត្រូវនឹងជំនាញឯកទេសរបស់អ្នក។',
          'ជួយអាជីវកម្មរៀបចំប្រវត្តិរូបគួរឱ្យទុកចិត្ត និងឯកសារមូលនិធិ។',
          'បង្កើតកេរ្តិ៍ឈ្មោះតាមរយៈការចូលរួមពិតប្រាកដ និងអាចផ្ទៀងផ្ទាត់បាន។',
        ],
      },
    ],
    verifyBadge: 'របៀបដែលការផ្ទៀងផ្ទាត់ដំណើរការ',
    verifyTitle: 'សញ្ញាទំនុកចិត្តដែលអ្នកអាចអានបានពិតប្រាកដ',
    verifyLede:
      'ជំនួសឱ្យស្លាក “បានផ្ទៀងផ្ទាត់” តែមួយមិនច្បាស់ CamboBia ប្រើការត្រួតពិនិត្យដាច់ដោយឡែក និងមានការពន្យល់ច្បាស់លាស់។ ការត្រួតពិនិត្យនីមួយៗប្រាប់អ្នកយ៉ាងច្បាស់ថាអ្វីត្រូវបានបញ្ជាក់ — និងអ្វីដែលវាមិនអះអាង។',
    verifyNote:
      'ការផ្ទៀងផ្ទាត់ជួយអ្នកសម្រេចថាត្រូវទុកចិត្តអ្នកណា និងកន្លែងណាដែលត្រូវចាប់ផ្តើមការសន្ទនា។ វាមិនមែនជាការណែនាំ ការគាំទ្រ ឬការសន្យាអំពីគុណភាព ដំណើរការ ឬលទ្ធផលឡើយ។ តែងតែធ្វើការពិនិត្យដោយខ្លួនឯងមុនពេលធ្វើការសម្រេចចិត្ត ឬការប្តេជ្ញាណាមួយ។',
    verifyCta: 'ចូលមើលមជ្ឈមណ្ឌលទំនុកចិត្ត',
    verification: [
      { label: 'អ៊ីមែលបានផ្ទៀងផ្ទាត់', body: 'បញ្ជាក់ថាម្ចាស់គណនីគ្រប់គ្រងអាសយដ្ឋានអ៊ីមែលដែលបានចុះបញ្ជី។' },
      { label: 'អត្តសញ្ញាណបានផ្ទៀងផ្ទាត់', body: 'បញ្ជាក់ថាមានមនុស្សពិតនៅពីក្រោយគណនីតាមរយៈការត្រួតពិនិត្យអត្តសញ្ញាណ។' },
      { label: 'អាជីវកម្មបានផ្ទៀងផ្ទាត់', body: 'បញ្ជាក់ព័ត៌មានចុះបញ្ជីអាជីវកម្មសម្រាប់ប្រវត្តិរូបក្រុមហ៊ុន។' },
      { label: 'លិខិតបញ្ជាក់បានផ្ទៀងផ្ទាត់', body: 'បញ្ជាក់គុណវុឌ្ឍិវិជ្ជាជីវៈ និងឋានៈរបស់អ្នកប្រឹក្សា។' },
    ],
    finalTitle: 'ត្រៀមខ្លួនចាប់ផ្តើមហើយឬនៅ?',
    finalSub:
      'បង្កើតប្រវត្តិរូបគួរឱ្យទុកចិត្តរបស់អ្នកក្នុងរយៈពេលពីរបីនាទី ហើយចូលរួមទីផ្សារគួរឱ្យទុកចិត្តដែលបង្កើតឡើងសម្រាប់កំណើនកម្ពុជា។',
    finalCtaPrimary: 'បង្កើតប្រវត្តិរូបរបស់អ្នក',
    finalCtaSecondary: 'អានសំណួរចម្លើយ',
  },
  zh: {
    heroBadge: '运作方式',
    heroTitle: '从可信的资料到值得信赖的连接',
    heroSub:
      'CamboBia 为企业、投资者和顾问提供一个清晰、结构化的地方来相互找到对方。我们帮助您建立联系并保持知情——我们不保证融资、回报或任何特定结果。',
    heroCtaPrimary: '创建您的资料',
    heroCtaSecondary: '浏览商机',
    stepsTitle: '每个人都是同样的三个步骤',
    stepsSub: '无论您是融资、投资还是提供咨询，这段旅程都遵循同一条可信的路径。',
    steps: [
      {
        title: '建立可信的资料',
        body: '企业、投资者和顾问建立结构化的资料，展示他们是谁、能提供什么以及在寻找什么——并附有验证信号。',
      },
      {
        title: '发现并建立联系',
        body: '投资者筛选并保存商机；企业和顾问通过一个值得信赖、可搜索的目录相互找到对方，该目录围绕清晰、可比较的信息构建。',
      },
      {
        title: '充满信心地互动',
        body: '发送消息、提出问题并推进对话——在整个过程中验证和信任信号都清晰可见，让您始终知道自己在与谁交谈。',
      },
    ],
    rolesTitle: '每个角色做什么',
    rolesSub: '一个平台，三段旅程。这是为您准备的路径。',
    roles: [
      {
        title: '面向企业',
        lede: '可信地展示您的公司，并接触能帮助您成长的人。',
        cta: '了解面向企业',
        points: [
          '建立结构化的企业资料：行业、阶段、地点和业务进展。',
          '完成验证步骤，赢得独立、有说明的信任信号。',
          '展示您的融资需求及其背后的故事。',
          '在融资前与顾问建立联系，强化您的资料。',
          '提升在浏览商机目录的投资者中的曝光度。',
        ],
      },
      {
        title: '面向投资者',
        lede: '预先获得所需信息，寻找并评估柬埔寨企业。',
        cta: '了解面向投资者',
        points: [
          '按行业、阶段、地点和融资需求浏览并筛选企业。',
          '在决定联系之前查看验证信息。',
          '保存商机并跟踪您正在关注的企业。',
          '直接向企业发送消息以提出问题并索取更多细节。',
          '自行做出决定——CamboBia 提供信息，不提供建议或保证。',
        ],
      },
      {
        title: '面向顾问',
        lede: '展示您的资质，并接收成长中企业的请求。',
        cta: '了解面向顾问',
        points: [
          '创建专业资料，展示您的专长和服务。',
          '验证您的资质，以清晰的信任信号脱颖而出。',
          '接收与您专业领域匹配的企业的咨询请求。',
          '帮助企业准备可信的资料和融资材料。',
          '通过真实、可验证的合作建立声誉。',
        ],
      },
    ],
    verifyBadge: '验证如何运作',
    verifyTitle: '您真正能读懂的信任信号',
    verifyLede:
      'CamboBia 不使用单一含糊的"已验证"标签，而是采用独立、说明清晰的核查。每一项都明确告诉您已确认了什么——以及它并未声称什么。',
    verifyNote:
      '验证帮助您决定信任谁以及从何处开始对话。它不是推荐、背书，也不是对质量、表现或结果的承诺。在做出任何决定或承诺之前，请务必自行审查。',
    verifyCta: '访问信任中心',
    verification: [
      { label: '电子邮件已验证', body: '确认账户持有人掌控登记在案的电子邮件地址。' },
      { label: '身份已验证', body: '通过身份核查确认账户背后是真实的人。' },
      { label: '企业已验证', body: '确认公司资料的企业注册详情。' },
      { label: '资质已验证', body: '确认顾问的专业资格和声誉。' },
    ],
    finalTitle: '准备好开始了吗？',
    finalSub: '几分钟内创建您可信的资料，加入一个为柬埔寨成长而打造的值得信赖的市场。',
    finalCtaPrimary: '创建您的资料',
    finalCtaSecondary: '阅读常见问题',
  },
} as const

const STEP_ICONS = [FileText, Search, MessagesSquare]
const ROLE_ICONS = [Building2, TrendingUp, Briefcase]
const ROLE_HREFS = ['/for-businesses', '/for-investors', '/for-advisors']
const VERIFICATION_ICONS = [BadgeCheck, Users, Building2, Briefcase]

export default function HowItWorksContent() {
  const t = CONTENT[useLang()]

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
              <ShieldCheck className="h-3.5 w-3.5" /> {t.heroBadge}
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">
              {t.heroTitle}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg" style={{ color: 'var(--cb-body)' }}>
              {t.heroSub}
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold text-white shadow-sm"
                style={{ background: 'var(--cb-primary)' }}
              >
                {t.heroCtaPrimary} <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/opportunities"
                className="inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-3.5 text-base font-semibold"
                style={{ borderColor: 'var(--cb-line)', color: 'var(--cb-ink)', background: '#fff' }}
              >
                {t.heroCtaSecondary}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Shared 3 steps */}
      <section className="cb-wrap py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">{t.stepsTitle}</h2>
          <p className="mt-4 text-lg" style={{ color: 'var(--cb-muted)' }}>
            {t.stepsSub}
          </p>
        </div>
        <ol className="mt-12 grid gap-8 md:grid-cols-3">
          {t.steps.map((s, i) => {
            const Icon = STEP_ICONS[i]
            return (
              <li
                key={s.title}
                className="rounded-2xl border p-7"
                style={{ borderColor: 'var(--cb-line)', background: '#fff', boxShadow: 'var(--cb-shadow-sm)' }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ background: 'var(--cb-primary)' }}
                  >
                    {i + 1}
                  </span>
                  <Icon className="h-5 w-5" style={{ color: 'var(--cb-primary)' }} />
                </div>
                <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--cb-body)' }}>
                  {s.body}
                </p>
              </li>
            )
          })}
        </ol>
      </section>

      {/* Per-role breakdown */}
      <section style={{ background: '#fff', borderTop: '1px solid var(--cb-line)', borderBottom: '1px solid var(--cb-line)' }}>
        <div className="cb-wrap py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">{t.rolesTitle}</h2>
            <p className="mt-4 text-lg" style={{ color: 'var(--cb-muted)' }}>
              {t.rolesSub}
            </p>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {t.roles.map((role, i) => {
              const Icon = ROLE_ICONS[i]
              return (
                <div
                  key={role.title}
                  className="flex flex-col rounded-2xl border p-7"
                  style={{ borderColor: 'var(--cb-line)', background: 'var(--cb-surface)', boxShadow: 'var(--cb-shadow-sm)' }}
                >
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ background: 'var(--cb-primary-soft)' }}
                  >
                    <Icon className="h-6 w-6" style={{ color: 'var(--cb-primary)' }} />
                  </span>
                  <h3 className="mt-5 text-xl font-bold">{role.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--cb-body)' }}>
                    {role.lede}
                  </p>
                  <ul className="mt-5 flex-1 space-y-3">
                    {role.points.map(p => (
                      <li key={p} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--cb-body)' }}>
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" style={{ color: 'var(--cb-primary)' }} />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={ROLE_HREFS[i]}
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold"
                    style={{ color: 'var(--cb-primary)' }}
                  >
                    {role.cta} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Verification / trust explainer */}
      <section className="cb-wrap py-20">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div>
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: 'var(--cb-accent-soft)', color: 'var(--cb-accent)' }}
            >
              <ShieldCheck className="h-3.5 w-3.5" /> {t.verifyBadge}
            </span>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">{t.verifyTitle}</h2>
            <p className="mt-4 text-lg" style={{ color: 'var(--cb-body)' }}>
              {t.verifyLede}
            </p>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--cb-muted)' }}>
              {t.verifyNote}
            </p>
            <Link
              href="/trust"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold"
              style={{ color: 'var(--cb-primary)' }}
            >
              {t.verifyCta} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {t.verification.map((v, i) => {
              const Icon = VERIFICATION_ICONS[i]
              return (
                <div
                  key={v.label}
                  className="rounded-2xl border p-6"
                  style={{ borderColor: 'var(--cb-line)', background: '#fff', boxShadow: 'var(--cb-shadow-sm)' }}
                >
                  <Icon className="h-7 w-7" style={{ color: 'var(--cb-primary)' }} />
                  <p className="mt-3 text-sm font-semibold" style={{ color: 'var(--cb-ink)' }}>
                    {v.label}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed" style={{ color: 'var(--cb-muted)' }}>
                    {v.body}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section style={{ background: 'var(--cb-primary)' }}>
        <div className="cb-wrap py-16 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">{t.finalTitle}</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg" style={{ color: 'rgba(255,255,255,0.85)' }}>
            {t.finalSub}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold"
              style={{ color: 'var(--cb-primary-dark)' }}
            >
              {t.finalCtaPrimary} <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/faq"
              className="inline-flex items-center justify-center rounded-xl border px-6 py-3.5 text-base font-semibold text-white"
              style={{ borderColor: 'rgba(255,255,255,0.4)' }}
            >
              {t.finalCtaSecondary}
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
