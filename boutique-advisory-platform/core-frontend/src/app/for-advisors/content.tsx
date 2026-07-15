'use client'

// NOTE: km/zh translations are working drafts pending native-speaker review.

import Link from 'next/link'
import {
  ArrowRight,
  ShieldCheck,
  Briefcase,
  BadgeCheck,
  FileText,
  Handshake,
  Inbox,
  CalendarClock,
  Award,
  Users,
  Building2,
  MessagesSquare,
  HelpCircle,
} from 'lucide-react'
import PublicLayout from '@/components/public/PublicLayout'
import { useLang } from '@/i18n/public-content'

const CONTENT = {
  en: {
    badge: 'For professional advisors',
    headline: 'Showcase your expertise. Support Cambodia’s growing businesses.',
    sub: 'CamboBia gives professional advisors a credible profile to display their credentials, offer services, and connect with SMEs that are actively looking for guidance.',
    ctaPrimary: 'Create your profile',
    ctaSecondary: 'See how it works',
    free: 'Free to create a profile · No engagements or income guaranteed',
    card: {
      name: 'Sophea Chan, CPA',
      meta: 'Financial advisory · Phnom Penh',
      status: 'Credentials verified',
      badges: ['Email verified', 'Identity verified', 'Credentials verified', 'Services listed'],
      focusLabel: 'Focus areas',
      focusValue: 'Financial preparation · Fundraising readiness · SME strategy',
      illustrative: 'Illustrative profile — not a real listing',
    },
    problemTitle: 'Your expertise is valuable — if the right businesses can find it',
    problemBody:
      'Many capable advisors rely on word of mouth, and Cambodia’s growing SMEs often don’t know where to turn for trusted guidance. CamboBia connects the two: a credible, verifiable profile that shows your credentials and services, and a structured way for businesses to reach you with advisory requests.',
    benefitsTitle: 'What you get with CamboBia',
    benefitsSub:
      'Everything you need to present your expertise and connect with businesses that need it.',
    benefits: [
      {
        title: 'A professional advisor profile',
        body: 'Present your background, focus areas, and experience in a structured profile that businesses can trust at a glance.',
      },
      {
        title: 'Showcase your credentials',
        body: 'Display qualifications and expertise with distinct credential verification, so clients know exactly what has been confirmed.',
      },
      {
        title: 'Offer your services',
        body: 'Describe the advisory services you provide — from financial preparation to strategy — so the right businesses find you.',
      },
      {
        title: 'Connect with growing businesses',
        body: 'Get discovered by Cambodian SMEs that are actively looking for guidance to strengthen and grow.',
      },
      {
        title: 'Receive advisory requests',
        body: 'Businesses can reach out directly with requests, so relevant opportunities come to you in one organised place.',
      },
      {
        title: 'Manage consultations',
        body: 'Keep track of your advisory conversations and consultations, and stay organised across your engagements.',
      },
    ],
    howTitle: 'How it works for advisors',
    howSub: 'A clear path from profile to advisory requests.',
    steps: [
      {
        title: 'Create your advisor profile',
        body: 'Register for free and build a profile covering your expertise, services, and the businesses you’re best placed to help.',
      },
      {
        title: 'Verify your credentials',
        body: 'Complete credential verification so businesses can trust your qualifications through a distinct, explained signal.',
      },
      {
        title: 'Receive requests and advise',
        body: 'Get discovered, receive advisory requests, and manage consultations with growing businesses in one place.',
      },
    ],
    howMore: 'See the full walkthrough',
    trustBadge: 'Built on trust',
    trustTitle: 'Credentials businesses can trust',
    trustBody:
      'Your reputation matters. CamboBia uses distinct, explained verification signals — so businesses know exactly what has been confirmed about your credentials.',
    trust: [
      'Distinct credential verification — a clear signal, not a vague “verified” label',
      'You control the services you offer and the requests you accept',
      'Transparent profiles help businesses find the right fit',
      'Honest limitations — we connect you with businesses, we don’t guarantee engagements',
    ],
    trustCta: 'Visit the Trust Center',
    trustBadges: ['Email verified', 'Identity verified', 'Credentials verified', 'Business network'],
    faqBadge: 'Common questions',
    faqTitle: 'Frequently asked questions',
    faq: [
      {
        q: 'What kinds of advisors is CamboBia for?',
        a: 'CamboBia is for professional advisors who support SMEs — for example in finance, strategy, legal, operations, or fundraising preparation. If you help businesses grow, you can build a profile.',
      },
      {
        q: 'How does credential verification work?',
        a: 'You can complete credential verification so your qualifications appear as a distinct, explained signal on your profile — helping businesses trust your expertise without relying on a single ambiguous badge.',
      },
      {
        q: 'Does CamboBia guarantee I’ll get clients?',
        a: 'No. CamboBia helps you become discoverable and receive advisory requests, but whether any engagement happens depends on you and the businesses you connect with.',
      },
      {
        q: 'How much does it cost to create a profile?',
        a: 'Creating your advisor profile is free. You can showcase your credentials, list your services, and start receiving requests without an upfront charge.',
      },
    ],
    finalTitle: 'Ready to put your expertise to work?',
    finalSub:
      'Showcase your credentials, offer your services, and connect with Cambodian businesses that need your guidance.',
    finalCtaPrimary: 'Create your profile',
    finalCtaSecondary: 'See how it works',
  },
  km: {
    badge: 'សម្រាប់អ្នកប្រឹក្សាជំនាញ',
    headline: 'បង្ហាញជំនាញរបស់អ្នក។ គាំទ្រអាជីវកម្មកម្ពុជាដែលកំពុងរីកចម្រើន។',
    sub: 'CamboBia ផ្តល់ឱ្យអ្នកប្រឹក្សាជំនាញនូវប្រវត្តិរូបគួរឱ្យទុកចិត្តដើម្បីបង្ហាញលិខិតបញ្ជាក់ ផ្តល់សេវាកម្ម និងភ្ជាប់ជាមួយអាជីវកម្មខ្នាតតូច និងមធ្យមដែលកំពុងស្វែងរកការណែនាំយ៉ាងសកម្ម។',
    ctaPrimary: 'បង្កើតប្រវត្តិរូបរបស់អ្នក',
    ctaSecondary: 'មើលរបៀបដំណើរការ',
    free: 'បង្កើតប្រវត្តិរូបដោយឥតគិតថ្លៃ · មិនធានាកិច្ចការ ឬចំណូល',
    card: {
      name: 'Sophea Chan, CPA',
      meta: 'ការប្រឹក្សាហិរញ្ញវត្ថុ · ភ្នំពេញ',
      status: 'លិខិតបញ្ជាក់បានផ្ទៀងផ្ទាត់',
      badges: ['អ៊ីមែលបានផ្ទៀងផ្ទាត់', 'អត្តសញ្ញាណបានផ្ទៀងផ្ទាត់', 'លិខិតបញ្ជាក់បានផ្ទៀងផ្ទាត់', 'សេវាកម្មបានចុះបញ្ជី'],
      focusLabel: 'ផ្នែកផ្តោតសំខាន់',
      focusValue: 'ការរៀបចំហិរញ្ញវត្ថុ · ការត្រៀមខ្លួនរកមូលនិធិ · យុទ្ធសាស្ត្រ SME',
      illustrative: 'ប្រវត្តិរូបគំរូ — មិនមែនជាបញ្ជីពិត',
    },
    problemTitle: 'ជំនាញរបស់អ្នកមានតម្លៃ — ប្រសិនបើអាជីវកម្មត្រឹមត្រូវអាចរកឃើញវា',
    problemBody:
      'អ្នកប្រឹក្សាដែលមានសមត្ថភាពជាច្រើនពឹងផ្អែកលើការនិយាយផ្ទាល់មាត់ ហើយអាជីវកម្មខ្នាតតូច និងមធ្យមកម្ពុជាដែលកំពុងរីកចម្រើនច្រើនតែមិនដឹងថាត្រូវទៅរកការណែនាំគួរឱ្យទុកចិត្តនៅឯណា។ CamboBia ភ្ជាប់ភាគីទាំងពីរ៖ ប្រវត្តិរូបគួរឱ្យទុកចិត្ត និងអាចផ្ទៀងផ្ទាត់បានដែលបង្ហាញលិខិតបញ្ជាក់ និងសេវាកម្មរបស់អ្នក និងមធ្យោបាយមានរចនាសម្ព័ន្ធសម្រាប់អាជីវកម្មទាក់ទងអ្នកជាមួយសំណើប្រឹក្សា។',
    benefitsTitle: 'អ្វីដែលអ្នកទទួលបានជាមួយ CamboBia',
    benefitsSub:
      'អ្វីៗគ្រប់យ៉ាងដែលអ្នកត្រូវការដើម្បីបង្ហាញជំនាញរបស់អ្នក និងភ្ជាប់ជាមួយអាជីវកម្មដែលត្រូវការវា។',
    benefits: [
      {
        title: 'ប្រវត្តិរូបអ្នកប្រឹក្សាជំនាញ',
        body: 'បង្ហាញប្រវត្តិ ផ្នែកផ្តោតសំខាន់ និងបទពិសោធន៍របស់អ្នកនៅក្នុងប្រវត្តិរូបមានរចនាសម្ព័ន្ធដែលអាជីវកម្មអាចទុកចិត្តបានក្នុងមួយភ្លែត។',
      },
      {
        title: 'បង្ហាញលិខិតបញ្ជាក់របស់អ្នក',
        body: 'បង្ហាញគុណវុឌ្ឍិ និងជំនាញជាមួយការផ្ទៀងផ្ទាត់លិខិតបញ្ជាក់ដាច់ដោយឡែក ដូច្នេះអតិថិជនដឹងច្បាស់ថាអ្វីត្រូវបានបញ្ជាក់។',
      },
      {
        title: 'ផ្តល់សេវាកម្មរបស់អ្នក',
        body: 'ពិពណ៌នាសេវាកម្មប្រឹក្សាដែលអ្នកផ្តល់ — ចាប់ពីការរៀបចំហិរញ្ញវត្ថុរហូតដល់យុទ្ធសាស្ត្រ — ដូច្នេះអាជីវកម្មត្រឹមត្រូវរកឃើញអ្នក។',
      },
      {
        title: 'ភ្ជាប់ជាមួយអាជីវកម្មដែលកំពុងរីកចម្រើន',
        body: 'ត្រូវបានរកឃើញដោយអាជីវកម្មខ្នាតតូច និងមធ្យមកម្ពុជាដែលកំពុងស្វែងរកការណែនាំដើម្បីពង្រឹង និងរីកចម្រើនយ៉ាងសកម្ម។',
      },
      {
        title: 'ទទួលសំណើប្រឹក្សា',
        body: 'អាជីវកម្មអាចទាក់ទងដោយផ្ទាល់ជាមួយសំណើ ដូច្នេះឱកាសពាក់ព័ន្ធមករកអ្នកនៅកន្លែងរៀបចំតែមួយ។',
      },
      {
        title: 'គ្រប់គ្រងការពិគ្រោះយោបល់',
        body: 'តាមដានការសន្ទនាប្រឹក្សា និងការពិគ្រោះយោបល់របស់អ្នក ហើយរៀបចំគ្រប់កិច្ចការរបស់អ្នក។',
      },
    ],
    howTitle: 'របៀបដែលវាដំណើរការសម្រាប់អ្នកប្រឹក្សា',
    howSub: 'ផ្លូវច្បាស់លាស់ពីប្រវត្តិរូបទៅសំណើប្រឹក្សា។',
    steps: [
      {
        title: 'បង្កើតប្រវត្តិរូបអ្នកប្រឹក្សារបស់អ្នក',
        body: 'ចុះឈ្មោះដោយឥតគិតថ្លៃ និងបង្កើតប្រវត្តិរូបគ្របដណ្តប់ជំនាញ សេវាកម្ម និងអាជីវកម្មដែលអ្នកសមបំផុតក្នុងការជួយ។',
      },
      {
        title: 'ផ្ទៀងផ្ទាត់លិខិតបញ្ជាក់របស់អ្នក',
        body: 'បំពេញការផ្ទៀងផ្ទាត់លិខិតបញ្ជាក់ ដូច្នេះអាជីវកម្មអាចទុកចិត្តគុណវុឌ្ឍិរបស់អ្នកតាមរយៈសញ្ញាដាច់ដោយឡែក និងមានការពន្យល់។',
      },
      {
        title: 'ទទួលសំណើ និងផ្តល់ការប្រឹក្សា',
        body: 'ត្រូវបានរកឃើញ ទទួលសំណើប្រឹក្សា និងគ្រប់គ្រងការពិគ្រោះយោបល់ជាមួយអាជីវកម្មដែលកំពុងរីកចម្រើននៅកន្លែងតែមួយ។',
      },
    ],
    howMore: 'មើលការណែនាំពេញលេញ',
    trustBadge: 'បង្កើតលើមូលដ្ឋានទំនុកចិត្ត',
    trustTitle: 'លិខិតបញ្ជាក់ដែលអាជីវកម្មអាចទុកចិត្តបាន',
    trustBody:
      'កេរ្តិ៍ឈ្មោះរបស់អ្នកមានសារៈសំខាន់។ CamboBia ប្រើសញ្ញាផ្ទៀងផ្ទាត់ដាច់ដោយឡែក និងមានការពន្យល់ — ដូច្នេះអាជីវកម្មដឹងច្បាស់ថាអ្វីត្រូវបានបញ្ជាក់អំពីលិខិតបញ្ជាក់របស់អ្នក។',
    trust: [
      'ការផ្ទៀងផ្ទាត់លិខិតបញ្ជាក់ដាច់ដោយឡែក — សញ្ញាច្បាស់លាស់ មិនមែនស្លាក “បានផ្ទៀងផ្ទាត់” មិនច្បាស់ឡើយ',
      'អ្នកគ្រប់គ្រងសេវាកម្មដែលអ្នកផ្តល់ និងសំណើដែលអ្នកទទួល',
      'ប្រវត្តិរូបតម្លាភាពជួយអាជីវកម្មរកឃើញភាពសមស្រប',
      'ដែនកំណត់ដោយស្មោះត្រង់ — យើងភ្ជាប់អ្នកជាមួយអាជីវកម្ម យើងមិនធានាកិច្ចការឡើយ',
    ],
    trustCta: 'ចូលមើលមជ្ឈមណ្ឌលទំនុកចិត្ត',
    trustBadges: ['អ៊ីមែលបានផ្ទៀងផ្ទាត់', 'អត្តសញ្ញាណបានផ្ទៀងផ្ទាត់', 'លិខិតបញ្ជាក់បានផ្ទៀងផ្ទាត់', 'បណ្តាញអាជីវកម្ម'],
    faqBadge: 'សំណួរទូទៅ',
    faqTitle: 'សំណួរដែលសួរញឹកញាប់',
    faq: [
      {
        q: 'តើ CamboBia សម្រាប់អ្នកប្រឹក្សាប្រភេទណាខ្លះ?',
        a: 'CamboBia គឺសម្រាប់អ្នកប្រឹក្សាជំនាញដែលគាំទ្រអាជីវកម្មខ្នាតតូច និងមធ្យម — ឧទាហរណ៍ផ្នែកហិរញ្ញវត្ថុ យុទ្ធសាស្ត្រ ច្បាប់ ប្រតិបត្តិការ ឬការត្រៀមខ្លួនរកមូលនិធិ។ ប្រសិនបើអ្នកជួយអាជីវកម្មរីកចម្រើន អ្នកអាចបង្កើតប្រវត្តិរូបបាន។',
      },
      {
        q: 'តើការផ្ទៀងផ្ទាត់លិខិតបញ្ជាក់ដំណើរការយ៉ាងណា?',
        a: 'អ្នកអាចបំពេញការផ្ទៀងផ្ទាត់លិខិតបញ្ជាក់ ដូច្នេះគុណវុឌ្ឍិរបស់អ្នកបង្ហាញជាសញ្ញាដាច់ដោយឡែក និងមានការពន្យល់នៅលើប្រវត្តិរូបរបស់អ្នក — ជួយអាជីវកម្មទុកចិត្តជំនាញរបស់អ្នកដោយមិនពឹងផ្អែកលើស្លាកតែមួយមិនច្បាស់។',
      },
      {
        q: 'តើ CamboBia ធានាថាខ្ញុំនឹងទទួលបានអតិថិជនឬ?',
        a: 'ទេ។ CamboBia ជួយឱ្យអ្នកអាចត្រូវបានរកឃើញ និងទទួលសំណើប្រឹក្សា ប៉ុន្តែថាតើកិច្ចការណាមួយកើតឡើងឬអត់ គឺអាស្រ័យលើអ្នក និងអាជីវកម្មដែលអ្នកភ្ជាប់ជាមួយ។',
      },
      {
        q: 'តើការបង្កើតប្រវត្តិរូបចំណាយប៉ុន្មាន?',
        a: 'ការបង្កើតប្រវត្តិរូបអ្នកប្រឹក្សារបស់អ្នកគឺឥតគិតថ្លៃ។ អ្នកអាចបង្ហាញលិខិតបញ្ជាក់ រាយសេវាកម្ម និងចាប់ផ្តើមទទួលសំណើ ដោយគ្មានការគិតថ្លៃជាមុន។',
      },
    ],
    finalTitle: 'ត្រៀមខ្លួនប្រើជំនាញរបស់អ្នកឱ្យមានប្រយោជន៍ហើយឬនៅ?',
    finalSub:
      'បង្ហាញលិខិតបញ្ជាក់របស់អ្នក ផ្តល់សេវាកម្មរបស់អ្នក និងភ្ជាប់ជាមួយអាជីវកម្មកម្ពុជាដែលត្រូវការការណែនាំរបស់អ្នក។',
    finalCtaPrimary: 'បង្កើតប្រវត្តិរូបរបស់អ្នក',
    finalCtaSecondary: 'មើលរបៀបដំណើរការ',
  },
  zh: {
    badge: '面向专业顾问',
    headline: '展示您的专业能力。支持柬埔寨成长中的企业。',
    sub: 'CamboBia 为专业顾问提供一份可信的资料，用以展示资质、提供服务，并与积极寻求指导的中小企业建立联系。',
    ctaPrimary: '创建您的资料',
    ctaSecondary: '了解运作方式',
    free: '免费创建资料 · 不保证任何合作或收入',
    card: {
      name: 'Sophea Chan, CPA',
      meta: '财务咨询 · 金边',
      status: '资质已验证',
      badges: ['电子邮件已验证', '身份已验证', '资质已验证', '已列出服务'],
      focusLabel: '专注领域',
      focusValue: '财务准备 · 融资准备 · 中小企业战略',
      illustrative: '示意资料——非真实列表',
    },
    problemTitle: '您的专业能力很有价值——前提是合适的企业能找到它',
    problemBody:
      '许多有能力的顾问依赖口碑，而柬埔寨成长中的中小企业往往不知道该向谁寻求值得信赖的指导。CamboBia 将两者连接起来：一份展示您资质和服务的可信、可验证资料，以及一种让企业以咨询请求联系您的结构化方式。',
    benefitsTitle: '使用 CamboBia 您将获得',
    benefitsSub: '一切所需，助您展示专业能力并与需要它的企业建立联系。',
    benefits: [
      {
        title: '专业顾问资料',
        body: '在结构化的资料中展示您的背景、专注领域和经验，让企业一目了然地信任。',
      },
      {
        title: '展示您的资质',
        body: '通过独立的资质验证展示资历和专业能力，让客户确切知道哪些内容已被确认。',
      },
      {
        title: '提供您的服务',
        body: '描述您提供的咨询服务——从财务准备到战略——让合适的企业找到您。',
      },
      {
        title: '与成长中的企业建立联系',
        body: '被积极寻求指导以增强实力和成长的柬埔寨中小企业发现。',
      },
      {
        title: '接收咨询请求',
        body: '企业可以直接以请求联系您，让相关商机汇集到一个井然有序的地方。',
      },
      {
        title: '管理咨询会谈',
        body: '跟踪您的咨询对话和会谈，让您的各项合作井然有序。',
      },
    ],
    howTitle: '顾问如何使用',
    howSub: '从资料到咨询请求，清晰的路径。',
    steps: [
      {
        title: '创建您的顾问资料',
        body: '免费注册并建立一份涵盖您的专业能力、服务以及您最能帮助的企业的资料。',
      },
      {
        title: '验证您的资质',
        body: '完成资质验证，让企业通过清晰、有说明的信号信任您的资历。',
      },
      {
        title: '接收请求并提供咨询',
        body: '被发现、接收咨询请求，并在一处管理与成长中企业的咨询会谈。',
      },
    ],
    howMore: '查看完整介绍',
    trustBadge: '建立在信任之上',
    trustTitle: '企业可以信任的资质',
    trustBody:
      '您的声誉至关重要。CamboBia 使用清晰、有说明的独立验证信号——让企业确切知道关于您资质的哪些内容已被确认。',
    trust: [
      '独立的资质验证——清晰的信号，而非含糊的"已验证"标签',
      '您掌控提供的服务以及接受的请求',
      '透明的资料帮助企业找到合适的匹配',
      '诚实的局限性——我们为您连接企业，不保证合作',
    ],
    trustCta: '访问信任中心',
    trustBadges: ['电子邮件已验证', '身份已验证', '资质已验证', '企业网络'],
    faqBadge: '常见问题',
    faqTitle: '常见问题解答',
    faq: [
      {
        q: 'CamboBia 面向哪些类型的顾问？',
        a: 'CamboBia 面向支持中小企业的专业顾问——例如财务、战略、法律、运营或融资准备方面。如果您帮助企业成长，就可以建立资料。',
      },
      {
        q: '资质验证如何运作？',
        a: '您可以完成资质验证，让您的资历在资料上显示为清晰、有说明的信号——帮助企业信任您的专业能力，而不必依赖单一含糊的标签。',
      },
      {
        q: 'CamboBia 保证我能获得客户吗？',
        a: '不。CamboBia 帮助您变得可被发现并接收咨询请求，但是否有合作发生取决于您以及您所联系的企业。',
      },
      {
        q: '创建资料需要多少费用？',
        a: '创建您的顾问资料是免费的。您可以展示资质、列出服务并开始接收请求，无需任何预付费用。',
      },
    ],
    finalTitle: '准备好让您的专业能力发挥作用了吗？',
    finalSub: '展示您的资质、提供您的服务，并与需要您指导的柬埔寨企业建立联系。',
    finalCtaPrimary: '创建您的资料',
    finalCtaSecondary: '了解运作方式',
  },
} as const

export default function ForAdvisorsContent() {
  const t = CONTENT[useLang()]

  const benefitIcons = [FileText, Award, Briefcase, Handshake, Inbox, CalendarClock]
  const stepIcons = [FileText, BadgeCheck, MessagesSquare]
  const cardBadgeIcons = [BadgeCheck, Users, Award, Briefcase]
  const trustBadgeIcons = [BadgeCheck, Users, Award, Building2]

  return (
    <PublicLayout>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(180deg,#fff, var(--cb-surface))' }}>
        <div className="cb-wrap grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: 'var(--cb-primary-soft)', color: 'var(--cb-primary-dark)' }}
            >
              <Briefcase className="h-3.5 w-3.5" /> {t.badge}
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">
              {t.headline}
            </h1>
            <p className="mt-5 max-w-xl text-lg" style={{ color: 'var(--cb-body)' }}>
              {t.sub}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold text-white shadow-sm"
                style={{ background: 'var(--cb-primary)' }}
              >
                {t.ctaPrimary} <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-3.5 text-base font-semibold"
                style={{ borderColor: 'var(--cb-line)', color: 'var(--cb-ink)', background: '#fff' }}
              >
                {t.ctaSecondary}
              </Link>
            </div>
            <p className="mt-4 text-sm" style={{ color: 'var(--cb-muted)' }}>
              {t.free}
            </p>
          </div>

          {/* Illustrative advisor card */}
          <div
            className="rounded-2xl border p-6 shadow-sm"
            style={{ borderColor: 'var(--cb-line)', background: '#fff', boxShadow: 'var(--cb-shadow)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-xl font-bold text-white"
                  style={{ background: 'var(--cb-primary)' }}
                >
                  S
                </span>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--cb-ink)' }}>
                    {t.card.name}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--cb-muted)' }}>
                    {t.card.meta}
                  </p>
                </div>
              </div>
              <span
                className="rounded-full px-2.5 py-1 text-xs font-bold"
                style={{ background: 'var(--cb-primary-soft)', color: 'var(--cb-primary-dark)' }}
              >
                {t.card.status}
              </span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {t.card.badges.map((label, i) => {
                const Icon = cardBadgeIcons[i]
                return (
                  <div
                    key={label}
                    className="flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm"
                    style={{ borderColor: 'var(--cb-line)' }}
                  >
                    <Icon className="h-4 w-4" style={{ color: 'var(--cb-primary)' }} />
                    <span style={{ color: 'var(--cb-body)' }}>{label}</span>
                  </div>
                )
              })}
            </div>
            <div className="mt-5 rounded-lg p-4" style={{ background: 'var(--cb-surface)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--cb-muted)' }}>
                {t.card.focusLabel}
              </p>
              <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--cb-ink)' }}>
                {t.card.focusValue}
              </p>
            </div>
            <p className="mt-3 text-center text-xs" style={{ color: 'var(--cb-muted)' }}>
              {t.card.illustrative}
            </p>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="cb-wrap py-16 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">{t.problemTitle}</h2>
          <p className="mt-5 text-lg" style={{ color: 'var(--cb-body)' }}>
            {t.problemBody}
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ background: '#fff', borderTop: '1px solid var(--cb-line)', borderBottom: '1px solid var(--cb-line)' }}>
        <div className="cb-wrap py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">{t.benefitsTitle}</h2>
            <p className="mt-4 text-lg" style={{ color: 'var(--cb-muted)' }}>
              {t.benefitsSub}
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {t.benefits.map((b, i) => {
              const Icon = benefitIcons[i]
              return (
                <div
                  key={b.title}
                  className="flex flex-col rounded-2xl border p-7"
                  style={{ borderColor: 'var(--cb-line)', background: '#fff', boxShadow: 'var(--cb-shadow-sm)' }}
                >
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ background: 'var(--cb-primary-soft)' }}
                  >
                    <Icon className="h-6 w-6" style={{ color: 'var(--cb-primary)' }} />
                  </span>
                  <h3 className="mt-5 text-xl font-bold">{b.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed" style={{ color: 'var(--cb-body)' }}>
                    {b.body}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="cb-wrap py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">{t.howTitle}</h2>
          <p className="mt-4 text-lg" style={{ color: 'var(--cb-muted)' }}>
            {t.howSub}
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {t.steps.map((s, i) => {
            const Icon = stepIcons[i]
            return (
              <div key={s.title}>
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
              </div>
            )
          })}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: 'var(--cb-primary)' }}
          >
            {t.howMore} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Trust */}
      <section style={{ background: '#fff', borderTop: '1px solid var(--cb-line)', borderBottom: '1px solid var(--cb-line)' }}>
        <div className="cb-wrap py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: 'var(--cb-accent-soft)', color: 'var(--cb-accent)' }}
              >
                <ShieldCheck className="h-3.5 w-3.5" /> {t.trustBadge}
              </span>
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">{t.trustTitle}</h2>
              <p className="mt-4 text-lg" style={{ color: 'var(--cb-body)' }}>
                {t.trustBody}
              </p>
              <ul className="mt-6 space-y-3">
                {t.trust.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm" style={{ color: 'var(--cb-body)' }}>
                    <BadgeCheck className="mt-0.5 h-5 w-5 flex-none" style={{ color: 'var(--cb-primary)' }} /> {point}
                  </li>
                ))}
              </ul>
              <Link
                href="/trust"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold"
                style={{ color: 'var(--cb-primary)' }}
              >
                {t.trustCta} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {t.trustBadges.map((label, i) => {
                const Icon = trustBadgeIcons[i]
                return (
                  <div
                    key={label}
                    className="rounded-2xl border p-6 text-center"
                    style={{ borderColor: 'var(--cb-line)', background: '#fff', boxShadow: 'var(--cb-shadow-sm)' }}
                  >
                    <Icon className="mx-auto h-8 w-8" style={{ color: 'var(--cb-primary)' }} />
                    <p className="mt-3 text-sm font-semibold" style={{ color: 'var(--cb-ink)' }}>
                      {label}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="cb-wrap py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: 'var(--cb-primary-soft)', color: 'var(--cb-primary-dark)' }}
          >
            <HelpCircle className="h-3.5 w-3.5" /> {t.faqBadge}
          </span>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">{t.faqTitle}</h2>
        </div>
        <div className="mx-auto mt-12 max-w-3xl space-y-4">
          {t.faq.map((f) => (
            <div
              key={f.q}
              className="rounded-2xl border p-6"
              style={{ borderColor: 'var(--cb-line)', background: '#fff', boxShadow: 'var(--cb-shadow-sm)' }}
            >
              <h3 className="text-lg font-bold">{f.q}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--cb-body)' }}>
                {f.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
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
              href="/how-it-works"
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
