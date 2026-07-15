'use client'

// NOTE: km/zh translations are working drafts pending native-speaker review.

import Link from 'next/link'
import {
  ArrowRight,
  ShieldCheck,
  FileText,
  Search,
  MessagesSquare,
  Building2,
  Users,
  BadgeCheck,
  Eye,
  Briefcase,
  Target,
  HelpCircle,
} from 'lucide-react'
import PublicLayout from '@/components/public/PublicLayout'
import { useLang } from '@/i18n/public-content'

const CONTENT = {
  en: {
    badge: 'For business owners',
    headline: 'Build a credible profile. Get discovered by the right investors.',
    sub: 'CamboBia gives growing Cambodian businesses a trusted place to present who they are, connect with professional advisors, and increase visibility to potential investors.',
    ctaPrimary: 'Create your profile',
    ctaSecondary: 'See how it works',
    free: 'Free to create a profile · No investment or funding guaranteed',
    card: {
      name: 'Mekong Textiles Ltd.',
      meta: 'Manufacturing · Growth stage · Phnom Penh',
      status: 'Verified',
      badges: ['Email verified', 'Identity verified', 'Business verified', 'Advisor reviewed'],
      fundingLabel: 'Funding need',
      fundingAmount: '$180,000',
      fundingNote: '· to add a second production line',
      illustrative: 'Illustrative profile — not a real listing',
    },
    problemTitle: 'Good businesses often stay invisible to the right people',
    problemBody:
      'Many Cambodian SMEs are ready to grow but lack a credible way to be seen. Investors can’t easily find them, information is scattered and hard to trust, and preparing a professional story takes expertise most owners don’t have on hand. CamboBia gives you a structured, verifiable profile — so your business is presented clearly and taken seriously.',
    benefitsTitle: 'What you get with CamboBia',
    benefitsSub:
      'Everything you need to present your business with credibility and connect with the right people.',
    benefits: [
      {
        title: 'A credible business profile',
        body: 'Present your company, team, and traction in a structured profile that investors and advisors can actually understand and trust.',
      },
      {
        title: 'Verification you can show',
        body: 'Layer distinct email, identity, and business verification signals so serious counterparts know your information has been checked.',
      },
      {
        title: 'Access to trusted advisors',
        body: 'Find and connect with professional advisors who can help you prepare, sharpen your story, and strengthen your fundamentals.',
      },
      {
        title: 'Present your funding needs',
        body: 'Clearly state what you’re raising and why — from working capital to expansion — in a format investors are used to reviewing.',
      },
      {
        title: 'Increase investor visibility',
        body: 'Appear in a structured directory where investors filter, save, and track the businesses that match their interests.',
      },
      {
        title: 'Manage conversations in one place',
        body: 'Receive and respond to inbound interest and advisory requests, and keep every relevant conversation organised.',
      },
    ],
    howTitle: 'How it works for businesses',
    howSub: 'A clear, credible path from profile to connection.',
    steps: [
      {
        title: 'Create your business profile',
        body: 'Register for free and build a profile covering your business, sector, stage, team, and what you’re looking for.',
      },
      {
        title: 'Get verified and discovered',
        body: 'Complete verification steps to strengthen credibility, then appear in searches when investors and advisors filter opportunities.',
      },
      {
        title: 'Connect and progress conversations',
        body: 'Respond to interest, work with advisors, and move relevant conversations forward with trust signals visible throughout.',
      },
    ],
    howMore: 'See the full walkthrough',
    trustBadge: 'Built on trust',
    trustTitle: 'Credibility that investors can see',
    trustBody:
      'Trust is the currency of any deal. CamboBia gives you distinct, explained verification signals so counterparts know exactly what has been checked about your business.',
    trust: [
      'Separate email, identity, and business verification — never a single vague “verified” label',
      'Advisor-reviewed business information for added credibility',
      'You control what you present and who you engage with',
      'Honest limitations — we help you connect, we don’t guarantee funding',
    ],
    trustCta: 'Visit the Trust Center',
    trustBadges: ['Email verified', 'Identity verified', 'Business verified', 'Advisor reviewed'],
    faqBadge: 'Common questions',
    faqTitle: 'Frequently asked questions',
    faq: [
      {
        q: 'Does CamboBia guarantee I’ll raise funding?',
        a: 'No. CamboBia is a marketplace that helps you build credibility and connect with potential investors and advisors. Whether any funding happens depends entirely on those parties and your own conversations.',
      },
      {
        q: 'How much does it cost to create a profile?',
        a: 'Creating your business profile is free. You can build your profile, complete verification steps, and become discoverable without any upfront charge.',
      },
      {
        q: 'What does verification actually check?',
        a: 'We use distinct, explained signals — email, identity, and business verification — so counterparts know exactly what has been confirmed, rather than relying on a single ambiguous badge.',
      },
      {
        q: 'Do I need an advisor to use CamboBia?',
        a: 'No. Working with an advisor is optional. Many businesses use CamboBia to strengthen their profile and connect with advisors when they’re ready, at their own pace.',
      },
    ],
    finalTitle: 'Ready to get your business discovered?',
    finalSub:
      'Build a credible profile, connect with advisors, and increase your visibility to potential investors.',
    finalCtaPrimary: 'Create your profile',
    finalCtaSecondary: 'See how it works',
  },
  km: {
    badge: 'សម្រាប់ម្ចាស់អាជីវកម្ម',
    headline: 'បង្កើតប្រវត្តិរូបគួរឱ្យទុកចិត្ត។ ត្រូវបានរកឃើញដោយវិនិយោគិនត្រឹមត្រូវ។',
    sub: 'CamboBia ផ្តល់ឱ្យអាជីវកម្មកម្ពុជាដែលកំពុងរីកចម្រើននូវកន្លែងគួរឱ្យទុកចិត្តដើម្បីបង្ហាញអំពីខ្លួន ភ្ជាប់ជាមួយអ្នកប្រឹក្សាជំនាញ និងបង្កើនភាពមើលឃើញចំពោះវិនិយោគិនសក្តានុពល។',
    ctaPrimary: 'បង្កើតប្រវត្តិរូបរបស់អ្នក',
    ctaSecondary: 'មើលរបៀបដំណើរការ',
    free: 'បង្កើតប្រវត្តិរូបដោយឥតគិតថ្លៃ · មិនធានាការវិនិយោគ ឬមូលនិធិ',
    card: {
      name: 'Mekong Textiles Ltd.',
      meta: 'ផលិតកម្ម · ដំណាក់កាលរីកចម្រើន · ភ្នំពេញ',
      status: 'បានផ្ទៀងផ្ទាត់',
      badges: ['អ៊ីមែលបានផ្ទៀងផ្ទាត់', 'អត្តសញ្ញាណបានផ្ទៀងផ្ទាត់', 'អាជីវកម្មបានផ្ទៀងផ្ទាត់', 'អ្នកប្រឹក្សាបានពិនិត្យ'],
      fundingLabel: 'តម្រូវការមូលនិធិ',
      fundingAmount: '$180,000',
      fundingNote: '· ដើម្បីបន្ថែមខ្សែផលិតកម្មទីពីរ',
      illustrative: 'ប្រវត្តិរូបគំរូ — មិនមែនជាបញ្ជីពិត',
    },
    problemTitle: 'អាជីវកម្មល្អៗ ជាញឹកញាប់នៅតែមើលមិនឃើញចំពោះមនុស្សត្រឹមត្រូវ',
    problemBody:
      'អាជីវកម្មខ្នាតតូច និងមធ្យមកម្ពុជាជាច្រើនត្រៀមខ្លួនរីកចម្រើន ប៉ុន្តែខ្វះមធ្យោបាយគួរឱ្យទុកចិត្តដើម្បីត្រូវបានគេមើលឃើញ។ វិនិយោគិនមិនអាចរកឃើញពួកគេបានងាយស្រួល ព័ត៌មានខ្ចាត់ខ្ចាយ និងពិបាកទុកចិត្ត ហើយការរៀបចំរឿងរ៉ាវប្រកបដោយវិជ្ជាជីវៈត្រូវការជំនាញដែលម្ចាស់អាជីវកម្មភាគច្រើនមិនមាន។ CamboBia ផ្តល់ឱ្យអ្នកនូវប្រវត្តិរូបដែលមានរចនាសម្ព័ន្ធ និងអាចផ្ទៀងផ្ទាត់បាន — ដូច្នេះអាជីវកម្មរបស់អ្នកត្រូវបានបង្ហាញយ៉ាងច្បាស់ និងទទួលបានការយកចិត្តទុកដាក់។',
    benefitsTitle: 'អ្វីដែលអ្នកទទួលបានជាមួយ CamboBia',
    benefitsSub:
      'អ្វីៗគ្រប់យ៉ាងដែលអ្នកត្រូវការដើម្បីបង្ហាញអាជីវកម្មរបស់អ្នកដោយភាពគួរឱ្យទុកចិត្ត និងភ្ជាប់ជាមួយមនុស្សត្រឹមត្រូវ។',
    benefits: [
      {
        title: 'ប្រវត្តិរូបអាជីវកម្មគួរឱ្យទុកចិត្ត',
        body: 'បង្ហាញក្រុមហ៊ុន ក្រុមការងារ និងវឌ្ឍនភាពរបស់អ្នកនៅក្នុងប្រវត្តិរូបដែលមានរចនាសម្ព័ន្ធ ដែលវិនិយោគិន និងអ្នកប្រឹក្សាអាចយល់ និងទុកចិត្តបាន។',
      },
      {
        title: 'ការផ្ទៀងផ្ទាត់ដែលអ្នកអាចបង្ហាញ',
        body: 'ដាក់សញ្ញាផ្ទៀងផ្ទាត់ដាច់ដោយឡែកសម្រាប់អ៊ីមែល អត្តសញ្ញាណ និងអាជីវកម្ម ដើម្បីឱ្យដៃគូធ្ងន់ធ្ងរដឹងថាព័ត៌មានរបស់អ្នកត្រូវបានពិនិត្យ។',
      },
      {
        title: 'ការចូលដំណើរការទៅកាន់អ្នកប្រឹក្សាដែលអាចទុកចិត្តបាន',
        body: 'ស្វែងរក និងភ្ជាប់ជាមួយអ្នកប្រឹក្សាជំនាញដែលអាចជួយអ្នករៀបចំ បន្លិចរឿងរ៉ាវរបស់អ្នក និងពង្រឹងមូលដ្ឋានគ្រឹះ។',
      },
      {
        title: 'បង្ហាញតម្រូវការមូលនិធិរបស់អ្នក',
        body: 'បញ្ជាក់ច្បាស់អំពីអ្វីដែលអ្នកកំពុងរកមូលនិធិ និងហេតុអ្វី — ចាប់ពីដើមទុនបង្វិលរហូតដល់ការពង្រីក — ក្នុងទម្រង់ដែលវិនិយោគិនធ្លាប់ពិនិត្យ។',
      },
      {
        title: 'បង្កើនភាពមើលឃើញចំពោះវិនិយោគិន',
        body: 'បង្ហាញនៅក្នុងបញ្ជីដែលមានរចនាសម្ព័ន្ធ ដែលវិនិយោគិនត្រង រក្សាទុក និងតាមដានអាជីវកម្មដែលត្រូវនឹងចំណាប់អារម្មណ៍របស់ពួកគេ។',
      },
      {
        title: 'គ្រប់គ្រងការសន្ទនានៅកន្លែងតែមួយ',
        body: 'ទទួល និងឆ្លើយតបចំពោះចំណាប់អារម្មណ៍ និងសំណើប្រឹក្សាចូល ហើយរៀបចំរាល់ការសន្ទនាដែលពាក់ព័ន្ធ។',
      },
    ],
    howTitle: 'របៀបដែលវាដំណើរការសម្រាប់អាជីវកម្ម',
    howSub: 'ផ្លូវច្បាស់លាស់ និងគួរឱ្យទុកចិត្តពីប្រវត្តិរូបទៅការតភ្ជាប់។',
    steps: [
      {
        title: 'បង្កើតប្រវត្តិរូបអាជីវកម្មរបស់អ្នក',
        body: 'ចុះឈ្មោះដោយឥតគិតថ្លៃ និងបង្កើតប្រវត្តិរូបគ្របដណ្តប់អាជីវកម្ម វិស័យ ដំណាក់កាល ក្រុមការងារ និងអ្វីដែលអ្នកកំពុងស្វែងរក។',
      },
      {
        title: 'ទទួលបានការផ្ទៀងផ្ទាត់ និងត្រូវបានរកឃើញ',
        body: 'បំពេញជំហានផ្ទៀងផ្ទាត់ដើម្បីពង្រឹងភាពគួរឱ្យទុកចិត្ត បន្ទាប់មកបង្ហាញនៅក្នុងការស្វែងរកនៅពេលវិនិយោគិន និងអ្នកប្រឹក្សាត្រងឱកាស។',
      },
      {
        title: 'ភ្ជាប់ និងបន្តការសន្ទនា',
        body: 'ឆ្លើយតបចំពោះចំណាប់អារម្មណ៍ ធ្វើការជាមួយអ្នកប្រឹក្សា និងជំរុញការសន្ទនាដែលពាក់ព័ន្ធទៅមុខ ដោយមានសញ្ញាទំនុកចិត្តបង្ហាញពេញមួយដំណើរការ។',
      },
    ],
    howMore: 'មើលការណែនាំពេញលេញ',
    trustBadge: 'បង្កើតលើមូលដ្ឋានទំនុកចិត្ត',
    trustTitle: 'ភាពគួរឱ្យទុកចិត្តដែលវិនិយោគិនអាចមើលឃើញ',
    trustBody:
      'ទំនុកចិត្តគឺជារូបិយវត្ថុនៃកិច្ចព្រមព្រៀងណាមួយ។ CamboBia ផ្តល់ឱ្យអ្នកនូវសញ្ញាផ្ទៀងផ្ទាត់ដាច់ដោយឡែក និងមានការពន្យល់ ដូច្នេះដៃគូដឹងច្បាស់ថាអ្វីត្រូវបានពិនិត្យអំពីអាជីវកម្មរបស់អ្នក។',
    trust: [
      'ការផ្ទៀងផ្ទាត់អ៊ីមែល អត្តសញ្ញាណ និងអាជីវកម្មដាច់ដោយឡែក — មិនមែនស្លាក “បានផ្ទៀងផ្ទាត់” តែមួយមិនច្បាស់ឡើយ',
      'ព័ត៌មានអាជីវកម្មដែលបានពិនិត្យដោយអ្នកប្រឹក្សា ដើម្បីបន្ថែមភាពគួរឱ្យទុកចិត្ត',
      'អ្នកគ្រប់គ្រងអ្វីដែលអ្នកបង្ហាញ និងអ្នកណាដែលអ្នកទាក់ទង',
      'ដែនកំណត់ដោយស្មោះត្រង់ — យើងជួយអ្នកភ្ជាប់ទំនាក់ទំនង យើងមិនធានាមូលនិធិឡើយ',
    ],
    trustCta: 'ចូលមើលមជ្ឈមណ្ឌលទំនុកចិត្ត',
    trustBadges: ['អ៊ីមែលបានផ្ទៀងផ្ទាត់', 'អត្តសញ្ញាណបានផ្ទៀងផ្ទាត់', 'អាជីវកម្មបានផ្ទៀងផ្ទាត់', 'អ្នកប្រឹក្សាបានពិនិត្យ'],
    faqBadge: 'សំណួរទូទៅ',
    faqTitle: 'សំណួរដែលសួរញឹកញាប់',
    faq: [
      {
        q: 'តើ CamboBia ធានាថាខ្ញុំនឹងរកបានមូលនិធិឬ?',
        a: 'ទេ។ CamboBia គឺជាទីផ្សារដែលជួយអ្នកបង្កើតភាពគួរឱ្យទុកចិត្ត និងភ្ជាប់ជាមួយវិនិយោគិន និងអ្នកប្រឹក្សាសក្តានុពល។ ថាតើមូលនិធិណាមួយកើតឡើងឬអត់ គឺអាស្រ័យទាំងស្រុងលើភាគីទាំងនោះ និងការសន្ទនាផ្ទាល់ខ្លួនរបស់អ្នក។',
      },
      {
        q: 'តើការបង្កើតប្រវត្តិរូបចំណាយប៉ុន្មាន?',
        a: 'ការបង្កើតប្រវត្តិរូបអាជីវកម្មរបស់អ្នកគឺឥតគិតថ្លៃ។ អ្នកអាចបង្កើតប្រវត្តិរូប បំពេញជំហានផ្ទៀងផ្ទាត់ និងអាចត្រូវបានរកឃើញ ដោយគ្មានការគិតថ្លៃជាមុន។',
      },
      {
        q: 'តើការផ្ទៀងផ្ទាត់ពិតជាពិនិត្យអ្វីខ្លះ?',
        a: 'យើងប្រើសញ្ញាដាច់ដោយឡែក និងមានការពន្យល់ — ការផ្ទៀងផ្ទាត់អ៊ីមែល អត្តសញ្ញាណ និងអាជីវកម្ម — ដូច្នេះដៃគូដឹងច្បាស់ថាអ្វីត្រូវបានបញ្ជាក់ ជាជាងពឹងផ្អែកលើស្លាកតែមួយមិនច្បាស់។',
      },
      {
        q: 'តើខ្ញុំត្រូវការអ្នកប្រឹក្សាដើម្បីប្រើ CamboBia ឬ?',
        a: 'ទេ។ ការធ្វើការជាមួយអ្នកប្រឹក្សាគឺជាជម្រើស។ អាជីវកម្មជាច្រើនប្រើ CamboBia ដើម្បីពង្រឹងប្រវត្តិរូបរបស់ពួកគេ និងភ្ជាប់ជាមួយអ្នកប្រឹក្សានៅពេលពួកគេត្រៀមរួច តាមល្បឿនផ្ទាល់ខ្លួន។',
      },
    ],
    finalTitle: 'ត្រៀមខ្លួនធ្វើឱ្យអាជីវកម្មរបស់អ្នកត្រូវបានរកឃើញហើយឬនៅ?',
    finalSub:
      'បង្កើតប្រវត្តិរូបគួរឱ្យទុកចិត្ត ភ្ជាប់ជាមួយអ្នកប្រឹក្សា និងបង្កើនភាពមើលឃើញរបស់អ្នកចំពោះវិនិយោគិនសក្តានុពល។',
    finalCtaPrimary: 'បង្កើតប្រវត្តិរូបរបស់អ្នក',
    finalCtaSecondary: 'មើលរបៀបដំណើរការ',
  },
  zh: {
    badge: '面向企业主',
    headline: '建立可信的资料。被合适的投资者发现。',
    sub: 'CamboBia 为成长中的柬埔寨企业提供一个值得信赖的地方，展示自己是谁、与专业顾问建立联系，并提升在潜在投资者中的曝光度。',
    ctaPrimary: '创建您的资料',
    ctaSecondary: '了解运作方式',
    free: '免费创建资料 · 不保证任何投资或融资',
    card: {
      name: 'Mekong Textiles Ltd.',
      meta: '制造业 · 成长阶段 · 金边',
      status: '已验证',
      badges: ['电子邮件已验证', '身份已验证', '企业已验证', '顾问已审核'],
      fundingLabel: '融资需求',
      fundingAmount: '$180,000',
      fundingNote: '· 用于增设第二条生产线',
      illustrative: '示意资料——非真实列表',
    },
    problemTitle: '优秀的企业往往对合适的人保持隐形',
    problemBody:
      '许多柬埔寨中小企业已准备好成长，却缺乏可信的方式被看见。投资者难以找到他们，信息分散且难以信任，而准备一份专业的介绍需要大多数企业主并不具备的专业能力。CamboBia 为您提供一份结构化、可验证的资料——让您的企业得到清晰的呈现并被认真对待。',
    benefitsTitle: '使用 CamboBia 您将获得',
    benefitsSub: '一切所需，助您以可信的方式展示企业并与合适的人建立联系。',
    benefits: [
      {
        title: '可信的企业资料',
        body: '在结构化的资料中展示您的公司、团队和进展，让投资者和顾问真正能够理解并信任。',
      },
      {
        title: '可展示的验证',
        body: '叠加独立的电子邮件、身份和企业验证信号，让认真的对方知道您的信息已经过核实。',
      },
      {
        title: '接触值得信赖的顾问',
        body: '寻找并联系专业顾问，他们可以帮助您做好准备、完善您的故事并夯实基本面。',
      },
      {
        title: '展示您的融资需求',
        body: '清晰说明您在融资什么以及原因——从营运资金到扩张——以投资者习惯审阅的格式呈现。',
      },
      {
        title: '提升投资者曝光度',
        body: '出现在结构化的目录中，投资者在此筛选、保存并跟踪符合其兴趣的企业。',
      },
      {
        title: '在一处管理对话',
        body: '接收并回应主动的兴趣和咨询请求，让每一段相关对话井然有序。',
      },
    ],
    howTitle: '企业如何使用',
    howSub: '从资料到连接，清晰而可信的路径。',
    steps: [
      {
        title: '创建您的企业资料',
        body: '免费注册并建立一份涵盖您的业务、行业、阶段、团队以及您所寻求内容的资料。',
      },
      {
        title: '获得验证并被发现',
        body: '完成验证步骤以增强可信度，随后当投资者和顾问筛选商机时出现在搜索结果中。',
      },
      {
        title: '建立联系并推进对话',
        body: '回应兴趣、与顾问合作，并在全过程可见信任信号的情况下推进相关对话。',
      },
    ],
    howMore: '查看完整介绍',
    trustBadge: '建立在信任之上',
    trustTitle: '投资者看得见的可信度',
    trustBody:
      '信任是任何交易的通货。CamboBia 为您提供清晰、有说明的独立验证信号，让对方确切知道关于您企业的哪些内容已被核实。',
    trust: [
      '独立的电子邮件、身份和企业验证——绝非单一含糊的"已验证"标签',
      '经顾问审核的企业信息，增添可信度',
      '您掌控展示什么以及与谁互动',
      '诚实的局限性——我们帮助您建立连接，不保证融资',
    ],
    trustCta: '访问信任中心',
    trustBadges: ['电子邮件已验证', '身份已验证', '企业已验证', '顾问已审核'],
    faqBadge: '常见问题',
    faqTitle: '常见问题解答',
    faq: [
      {
        q: 'CamboBia 保证我能融到资吗？',
        a: '不。CamboBia 是一个市场，帮助您建立可信度并与潜在投资者和顾问建立联系。是否有融资发生，完全取决于这些各方以及您自己的对话。',
      },
      {
        q: '创建资料需要多少费用？',
        a: '创建您的企业资料是免费的。您可以建立资料、完成验证步骤并变得可被发现，无需任何预付费用。',
      },
      {
        q: '验证究竟核实什么？',
        a: '我们使用清晰、有说明的独立信号——电子邮件、身份和企业验证——让对方确切知道哪些内容已被确认，而不是依赖单一含糊的标签。',
      },
      {
        q: '使用 CamboBia 需要顾问吗？',
        a: '不。与顾问合作是可选的。许多企业使用 CamboBia 来增强其资料，并在准备好时按自己的节奏与顾问建立联系。',
      },
    ],
    finalTitle: '准备好让您的企业被发现了吗？',
    finalSub: '建立可信的资料、与顾问建立联系，并提升您在潜在投资者中的曝光度。',
    finalCtaPrimary: '创建您的资料',
    finalCtaSecondary: '了解运作方式',
  },
} as const

export default function ForBusinessesContent() {
  const t = CONTENT[useLang()]

  const benefitIcons = [FileText, BadgeCheck, Briefcase, Target, Eye, MessagesSquare]
  const stepIcons = [FileText, Search, MessagesSquare]
  const cardBadgeIcons = [BadgeCheck, Users, Building2, Briefcase]

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
              <Building2 className="h-3.5 w-3.5" /> {t.badge}
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

          {/* Illustrative profile card */}
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
                  M
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
                {t.card.fundingLabel}
              </p>
              <p className="mt-1 text-lg font-bold" style={{ color: 'var(--cb-ink)' }}>
                {t.card.fundingAmount}{' '}
                <span className="text-sm font-normal" style={{ color: 'var(--cb-muted)' }}>
                  {t.card.fundingNote}
                </span>
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
                const Icon = cardBadgeIcons[i]
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
