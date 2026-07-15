'use client'

// NOTE: km/zh translations are working drafts pending native-speaker review.

import Link from 'next/link'
import {
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
  Bookmark,
  Eye,
  MessagesSquare,
  BadgeCheck,
  TrendingUp,
  Building2,
  Users,
  ListChecks,
  HelpCircle,
} from 'lucide-react'
import PublicLayout from '@/components/public/PublicLayout'
import { useLang } from '@/i18n/public-content'

const CONTENT = {
  en: {
    badge: 'For investors',
    headline: 'Discover credible Cambodian businesses, with verification you can see.',
    sub: 'CamboBia gives investors a structured way to find, filter, and follow Cambodian SMEs — and to review clear verification information before you ever make contact.',
    ctaPrimary: 'Create your profile',
    ctaSecondary: 'See how it works',
    free: 'Free to create a profile · No returns or outcomes guaranteed',
    searchPlaceholder: 'Agriculture · Growth stage · Kampong Cham',
    results: [
      { name: 'Angkor Foods Co.', tag: '3/4 verified', meta: 'Agriculture · $250k need' },
      { name: 'Tonle Fresh Produce', tag: 'Verified', meta: 'Agri-processing · $120k need' },
      { name: 'Bassac Organics', tag: '2/4 verified', meta: 'Export · $300k need' },
    ],
    illustrative: 'Illustrative results — not real listings',
    problemTitle: 'Promising businesses are hard to find — and harder to trust',
    problemBody:
      'For investors interested in Cambodia’s SMEs, deal flow is fragmented, information is inconsistent, and it’s difficult to know what has actually been verified. CamboBia brings opportunities into one structured directory, with distinct verification signals you can review — so you can research and shortlist with clarity before you reach out.',
    benefitsTitle: 'What you get with CamboBia',
    benefitsSub: 'The tools to discover, evaluate, and follow opportunities on your own terms.',
    benefits: [
      {
        title: 'Discover Cambodian businesses',
        body: 'Browse a structured directory of SMEs across sectors and stages, each presented in a consistent, comparable format.',
      },
      {
        title: 'Filter to what fits you',
        body: 'Narrow opportunities by sector, stage, location, and funding need so you spend time only on what matches your thesis.',
      },
      {
        title: 'Save profiles and shortlist',
        body: 'Bookmark businesses that interest you and build a shortlist you can revisit and compare at your own pace.',
      },
      {
        title: 'Track your interests',
        body: 'Keep tabs on the opportunities you’re following, and stay organised across everything in your pipeline.',
      },
      {
        title: 'Review verification information',
        body: 'See distinct email, identity, and business verification signals — and advisor reviews — before you decide to engage.',
      },
      {
        title: 'Contact relevant businesses',
        body: 'Reach out directly to businesses that fit, and start conversations with trust signals visible throughout.',
      },
    ],
    howTitle: 'How it works for investors',
    howSub: 'A clear path from discovery to connection.',
    steps: [
      {
        title: 'Create your investor profile',
        body: 'Register for free and set up a profile that reflects your interests, so relevant businesses understand who you are.',
      },
      {
        title: 'Discover and filter opportunities',
        body: 'Explore the directory, filter to your criteria, and save the businesses worth a closer look.',
      },
      {
        title: 'Review, track, and connect',
        body: 'Review verification information, track your shortlist, and reach out to the businesses you want to engage with.',
      },
    ],
    howMore: 'See the full walkthrough',
    trustBadge: 'Built on trust',
    trustTitle: 'Information you can actually evaluate',
    trustBody:
      'We show distinct, explained verification signals — never a single ambiguous “verified” label — so you always know what has been checked before you engage.',
    trust: [
      'Distinct email, identity, and business verification — see exactly what was checked',
      'Advisor-reviewed business information for added context',
      'Clear reporting channels for suspicious activity',
      'Honest limitations — we surface information, we don’t guarantee returns',
    ],
    trustCta: 'Visit the Trust Center',
    trustBadges: ['Email verified', 'Identity verified', 'Business verified', 'Advisor reviewed'],
    faqBadge: 'Common questions',
    faqTitle: 'Frequently asked questions',
    faq: [
      {
        q: 'Does CamboBia guarantee returns or vet deals for me?',
        a: 'No. CamboBia surfaces information and verification signals to help you make your own decisions. It does not provide investment advice, guarantee returns, or replace your own due diligence.',
      },
      {
        q: 'What does the verification information tell me?',
        a: 'You’ll see distinct signals — email, identity, and business verification, plus advisor reviews where available — so you know exactly what has been checked, rather than relying on a single vague badge.',
      },
      {
        q: 'How much does it cost to browse?',
        a: 'Creating an investor profile and exploring businesses is free. You can filter, save, and track opportunities before deciding whether to make contact.',
      },
      {
        q: 'Can I stay anonymous until I’m ready to connect?',
        a: 'You control your profile and when you reach out. Businesses see your interest when you choose to contact them, so you can research on your own terms first.',
      },
    ],
    finalTitle: 'Ready to discover your next opportunity?',
    finalSub:
      'Explore Cambodian businesses, filter to your criteria, and review verification information before you connect.',
    finalCtaPrimary: 'Create your profile',
    finalCtaSecondary: 'See how it works',
  },
  km: {
    badge: 'សម្រាប់វិនិយោគិន',
    headline: 'ស្វែងរកអាជីវកម្មកម្ពុជាគួរឱ្យទុកចិត្ត ជាមួយការផ្ទៀងផ្ទាត់ដែលអ្នកអាចមើលឃើញ។',
    sub: 'CamboBia ផ្តល់ឱ្យវិនិយោគិននូវមធ្យោបាយមានរចនាសម្ព័ន្ធដើម្បីស្វែងរក ត្រង និងតាមដានអាជីវកម្មខ្នាតតូច និងមធ្យមកម្ពុជា — និងដើម្បីពិនិត្យព័ត៌មានផ្ទៀងផ្ទាត់ច្បាស់លាស់មុនពេលអ្នកទាក់ទង។',
    ctaPrimary: 'បង្កើតប្រវត្តិរូបរបស់អ្នក',
    ctaSecondary: 'មើលរបៀបដំណើរការ',
    free: 'បង្កើតប្រវត្តិរូបដោយឥតគិតថ្លៃ · មិនធានាប្រាក់ចំណេញ ឬលទ្ធផល',
    searchPlaceholder: 'កសិកម្ម · ដំណាក់កាលរីកចម្រើន · កំពង់ចាម',
    results: [
      { name: 'Angkor Foods Co.', tag: 'ផ្ទៀងផ្ទាត់ ៣/៤', meta: 'កសិកម្ម · តម្រូវការ $250k' },
      { name: 'Tonle Fresh Produce', tag: 'បានផ្ទៀងផ្ទាត់', meta: 'កែច្នៃកសិកម្ម · តម្រូវការ $120k' },
      { name: 'Bassac Organics', tag: 'ផ្ទៀងផ្ទាត់ ២/៤', meta: 'នាំចេញ · តម្រូវការ $300k' },
    ],
    illustrative: 'លទ្ធផលគំរូ — មិនមែនជាបញ្ជីពិត',
    problemTitle: 'អាជីវកម្មដែលមានសក្តានុពលពិបាករក — ហើយកាន់តែពិបាកទុកចិត្ត',
    problemBody:
      'សម្រាប់វិនិយោគិនដែលចាប់អារម្មណ៍លើអាជីវកម្មខ្នាតតូច និងមធ្យមកម្ពុជា លំហូរកិច្ចព្រមព្រៀងបែកខ្ញែក ព័ត៌មានមិនស៊ីសង្វាក់គ្នា ហើយវាពិបាកដឹងថាអ្វីត្រូវបានផ្ទៀងផ្ទាត់ពិតប្រាកដ។ CamboBia នាំយកឱកាសចូលទៅក្នុងបញ្ជីមានរចនាសម្ព័ន្ធតែមួយ ជាមួយសញ្ញាផ្ទៀងផ្ទាត់ដាច់ដោយឡែកដែលអ្នកអាចពិនិត្យ — ដូច្នេះអ្នកអាចស្រាវជ្រាវ និងជ្រើសរើសដោយភាពច្បាស់លាស់មុនពេលអ្នកទាក់ទង។',
    benefitsTitle: 'អ្វីដែលអ្នកទទួលបានជាមួយ CamboBia',
    benefitsSub: 'ឧបករណ៍ដើម្បីស្វែងរក វាយតម្លៃ និងតាមដានឱកាសតាមលក្ខខណ្ឌផ្ទាល់ខ្លួនរបស់អ្នក។',
    benefits: [
      {
        title: 'ស្វែងរកអាជីវកម្មកម្ពុជា',
        body: 'រកមើលបញ្ជីមានរចនាសម្ព័ន្ធនៃអាជីវកម្មខ្នាតតូច និងមធ្យមឆ្លងកាត់វិស័យ និងដំណាក់កាលនានា ដែលនីមួយៗត្រូវបានបង្ហាញក្នុងទម្រង់ស៊ីសង្វាក់គ្នា និងអាចប្រៀបធៀបបាន។',
      },
      {
        title: 'ត្រងទៅអ្វីដែលសមនឹងអ្នក',
        body: 'បង្រួមឱកាសតាមវិស័យ ដំណាក់កាល ទីតាំង និងតម្រូវការមូលនិធិ ដូច្នេះអ្នកចំណាយពេលតែលើអ្វីដែលត្រូវនឹងគោលការណ៍របស់អ្នក។',
      },
      {
        title: 'រក្សាទុកប្រវត្តិរូប និងបញ្ជីខ្លី',
        body: 'ចំណាំអាជីវកម្មដែលអ្នកចាប់អារម្មណ៍ និងបង្កើតបញ្ជីខ្លីដែលអ្នកអាចត្រឡប់មកមើល និងប្រៀបធៀបតាមល្បឿនផ្ទាល់ខ្លួន។',
      },
      {
        title: 'តាមដានចំណាប់អារម្មណ៍របស់អ្នក',
        body: 'តាមដានឱកាសដែលអ្នកកំពុងតាមដាន ហើយរៀបចំគ្រប់យ៉ាងនៅក្នុងបណ្តាញការងាររបស់អ្នក។',
      },
      {
        title: 'ពិនិត្យព័ត៌មានផ្ទៀងផ្ទាត់',
        body: 'មើលសញ្ញាផ្ទៀងផ្ទាត់ដាច់ដោយឡែកសម្រាប់អ៊ីមែល អត្តសញ្ញាណ និងអាជីវកម្ម — និងការពិនិត្យរបស់អ្នកប្រឹក្សា — មុនពេលអ្នកសម្រេចចិត្តទាក់ទង។',
      },
      {
        title: 'ទាក់ទងអាជីវកម្មពាក់ព័ន្ធ',
        body: 'ទាក់ទងដោយផ្ទាល់ទៅអាជីវកម្មដែលសម និងចាប់ផ្តើមការសន្ទនាដោយមានសញ្ញាទំនុកចិត្តបង្ហាញពេញមួយដំណើរការ។',
      },
    ],
    howTitle: 'របៀបដែលវាដំណើរការសម្រាប់វិនិយោគិន',
    howSub: 'ផ្លូវច្បាស់លាស់ពីការស្វែងរកទៅការតភ្ជាប់។',
    steps: [
      {
        title: 'បង្កើតប្រវត្តិរូបវិនិយោគិនរបស់អ្នក',
        body: 'ចុះឈ្មោះដោយឥតគិតថ្លៃ និងរៀបចំប្រវត្តិរូបដែលឆ្លុះបញ្ចាំងចំណាប់អារម្មណ៍របស់អ្នក ដូច្នេះអាជីវកម្មពាក់ព័ន្ធយល់ថាអ្នកជានរណា។',
      },
      {
        title: 'ស្វែងរក និងត្រងឱកាស',
        body: 'រុករកបញ្ជី ត្រងទៅតាមលក្ខខណ្ឌរបស់អ្នក និងរក្សាទុកអាជីវកម្មដែលសមនឹងមើលឱ្យកាន់តែជិត។',
      },
      {
        title: 'ពិនិត្យ តាមដាន និងភ្ជាប់',
        body: 'ពិនិត្យព័ត៌មានផ្ទៀងផ្ទាត់ តាមដានបញ្ជីខ្លីរបស់អ្នក និងទាក់ទងអាជីវកម្មដែលអ្នកចង់ទាក់ទង។',
      },
    ],
    howMore: 'មើលការណែនាំពេញលេញ',
    trustBadge: 'បង្កើតលើមូលដ្ឋានទំនុកចិត្ត',
    trustTitle: 'ព័ត៌មានដែលអ្នកអាចវាយតម្លៃបានពិតប្រាកដ',
    trustBody:
      'យើងបង្ហាញសញ្ញាផ្ទៀងផ្ទាត់ដាច់ដោយឡែក និងមានការពន្យល់ — មិនមែនស្លាក “បានផ្ទៀងផ្ទាត់” តែមួយមិនច្បាស់ឡើយ — ដូច្នេះអ្នកតែងតែដឹងថាអ្វីត្រូវបានពិនិត្យមុនពេលអ្នកទាក់ទង។',
    trust: [
      'ការផ្ទៀងផ្ទាត់អ៊ីមែល អត្តសញ្ញាណ និងអាជីវកម្មដាច់ដោយឡែក — មើលច្បាស់ថាអ្វីត្រូវបានពិនិត្យ',
      'ព័ត៌មានអាជីវកម្មដែលបានពិនិត្យដោយអ្នកប្រឹក្សា ដើម្បីបន្ថែមបរិបទ',
      'ឆានែលរាយការណ៍ច្បាស់លាស់សម្រាប់សកម្មភាពគួរឱ្យសង្ស័យ',
      'ដែនកំណត់ដោយស្មោះត្រង់ — យើងបង្ហាញព័ត៌មាន យើងមិនធានាប្រាក់ចំណេញឡើយ',
    ],
    trustCta: 'ចូលមើលមជ្ឈមណ្ឌលទំនុកចិត្ត',
    trustBadges: ['អ៊ីមែលបានផ្ទៀងផ្ទាត់', 'អត្តសញ្ញាណបានផ្ទៀងផ្ទាត់', 'អាជីវកម្មបានផ្ទៀងផ្ទាត់', 'អ្នកប្រឹក្សាបានពិនិត្យ'],
    faqBadge: 'សំណួរទូទៅ',
    faqTitle: 'សំណួរដែលសួរញឹកញាប់',
    faq: [
      {
        q: 'តើ CamboBia ធានាប្រាក់ចំណេញ ឬពិនិត្យកិច្ចព្រមព្រៀងជំនួសអ្នកឬ?',
        a: 'ទេ។ CamboBia បង្ហាញព័ត៌មាន និងសញ្ញាផ្ទៀងផ្ទាត់ដើម្បីជួយអ្នកធ្វើការសម្រេចចិត្តផ្ទាល់ខ្លួន។ វាមិនផ្តល់ការប្រឹក្សាវិនិយោគ មិនធានាប្រាក់ចំណេញ ឬជំនួសការត្រួតពិនិត្យផ្ទាល់ខ្លួនរបស់អ្នកឡើយ។',
      },
      {
        q: 'តើព័ត៌មានផ្ទៀងផ្ទាត់ប្រាប់អ្នកនូវអ្វី?',
        a: 'អ្នកនឹងឃើញសញ្ញាដាច់ដោយឡែក — ការផ្ទៀងផ្ទាត់អ៊ីមែល អត្តសញ្ញាណ និងអាជីវកម្ម បូករួមទាំងការពិនិត្យរបស់អ្នកប្រឹក្សានៅកន្លែងដែលមាន — ដូច្នេះអ្នកដឹងច្បាស់ថាអ្វីត្រូវបានពិនិត្យ ជាជាងពឹងផ្អែកលើស្លាកតែមួយមិនច្បាស់។',
      },
      {
        q: 'តើការរុករកចំណាយប៉ុន្មាន?',
        a: 'ការបង្កើតប្រវត្តិរូបវិនិយោគិន និងស្វែងរកអាជីវកម្មគឺឥតគិតថ្លៃ។ អ្នកអាចត្រង រក្សាទុក និងតាមដានឱកាសមុនពេលសម្រេចថាតើត្រូវទាក់ទងឬអត់។',
      },
      {
        q: 'តើខ្ញុំអាចនៅអនាមិករហូតដល់ខ្ញុំត្រៀមរួចដើម្បីភ្ជាប់បានឬ?',
        a: 'អ្នកគ្រប់គ្រងប្រវត្តិរូបរបស់អ្នក និងពេលដែលអ្នកទាក់ទង។ អាជីវកម្មឃើញចំណាប់អារម្មណ៍របស់អ្នកនៅពេលអ្នកជ្រើសរើសទាក់ទងពួកគេ ដូច្នេះអ្នកអាចស្រាវជ្រាវតាមលក្ខខណ្ឌផ្ទាល់ខ្លួនជាមុនសិន។',
      },
    ],
    finalTitle: 'ត្រៀមខ្លួនស្វែងរកឱកាសបន្ទាប់របស់អ្នកហើយឬនៅ?',
    finalSub:
      'រុករកអាជីវកម្មកម្ពុជា ត្រងទៅតាមលក្ខខណ្ឌរបស់អ្នក និងពិនិត្យព័ត៌មានផ្ទៀងផ្ទាត់មុនពេលអ្នកភ្ជាប់។',
    finalCtaPrimary: 'បង្កើតប្រវត្តិរូបរបស់អ្នក',
    finalCtaSecondary: 'មើលរបៀបដំណើរការ',
  },
  zh: {
    badge: '面向投资者',
    headline: '发现可信的柬埔寨企业，验证一目了然。',
    sub: 'CamboBia 为投资者提供一种结构化方式来查找、筛选和关注柬埔寨中小企业——并在您联系之前审阅清晰的验证信息。',
    ctaPrimary: '创建您的资料',
    ctaSecondary: '了解运作方式',
    free: '免费创建资料 · 不保证任何回报或结果',
    searchPlaceholder: '农业 · 成长阶段 · 磅湛',
    results: [
      { name: 'Angkor Foods Co.', tag: '3/4 已验证', meta: '农业 · 需求 $250k' },
      { name: 'Tonle Fresh Produce', tag: '已验证', meta: '农产品加工 · 需求 $120k' },
      { name: 'Bassac Organics', tag: '2/4 已验证', meta: '出口 · 需求 $300k' },
    ],
    illustrative: '示意结果——非真实列表',
    problemTitle: '有潜力的企业难以寻找——更难以信任',
    problemBody:
      '对于关注柬埔寨中小企业的投资者而言，交易机会分散、信息不一致，而且难以知道究竟哪些内容已被核实。CamboBia 将商机汇入一个结构化的目录，配以您可以审阅的独立验证信号——让您在联系之前清晰地研究并筛选。',
    benefitsTitle: '使用 CamboBia 您将获得',
    benefitsSub: '按自己的方式发现、评估和关注商机的工具。',
    benefits: [
      {
        title: '发现柬埔寨企业',
        body: '浏览一个涵盖各行业和阶段的中小企业结构化目录，每家企业都以一致、可比较的格式呈现。',
      },
      {
        title: '筛选出适合您的',
        body: '按行业、阶段、地点和融资需求缩小商机范围，让您只把时间花在符合您投资理念的机会上。',
      },
      {
        title: '保存资料并建立候选名单',
        body: '收藏让您感兴趣的企业，建立一个可以按自己节奏回顾和比较的候选名单。',
      },
      {
        title: '跟踪您的兴趣',
        body: '密切关注您正在跟进的商机，让您管道中的一切井然有序。',
      },
      {
        title: '审阅验证信息',
        body: '在决定互动前，查看独立的电子邮件、身份和企业验证信号——以及顾问审核。',
      },
      {
        title: '联系相关企业',
        body: '直接联系符合条件的企业，在全过程可见信任信号的情况下开始对话。',
      },
    ],
    howTitle: '投资者如何使用',
    howSub: '从发现到连接，清晰的路径。',
    steps: [
      {
        title: '创建您的投资者资料',
        body: '免费注册并建立一份反映您兴趣的资料，让相关企业了解您是谁。',
      },
      {
        title: '发现并筛选商机',
        body: '浏览目录，按您的标准筛选，并保存值得深入了解的企业。',
      },
      {
        title: '审阅、跟踪并建立联系',
        body: '审阅验证信息、跟踪您的候选名单，并联系您想要互动的企业。',
      },
    ],
    howMore: '查看完整介绍',
    trustBadge: '建立在信任之上',
    trustTitle: '您真正能够评估的信息',
    trustBody:
      '我们展示清晰、有说明的独立验证信号——绝非单一含糊的"已验证"标签——让您在互动之前始终知道哪些内容已被核实。',
    trust: [
      '独立的电子邮件、身份和企业验证——确切看到核实了什么',
      '经顾问审核的企业信息，增添背景参考',
      '针对可疑活动的清晰举报渠道',
      '诚实的局限性——我们呈现信息，不保证回报',
    ],
    trustCta: '访问信任中心',
    trustBadges: ['电子邮件已验证', '身份已验证', '企业已验证', '顾问已审核'],
    faqBadge: '常见问题',
    faqTitle: '常见问题解答',
    faq: [
      {
        q: 'CamboBia 会保证回报或替我审查交易吗？',
        a: '不。CamboBia 呈现信息和验证信号，帮助您做出自己的决定。它不提供投资建议、不保证回报，也不替代您自己的尽职调查。',
      },
      {
        q: '验证信息告诉我什么？',
        a: '您会看到独立的信号——电子邮件、身份和企业验证，以及在可用时的顾问审核——让您确切知道哪些内容已被核实，而不是依赖单一含糊的标签。',
      },
      {
        q: '浏览需要多少费用？',
        a: '创建投资者资料并探索企业是免费的。您可以在决定是否联系之前筛选、保存并跟踪商机。',
      },
      {
        q: '在我准备好联系之前可以保持匿名吗？',
        a: '您掌控自己的资料以及何时联系。企业只有在您选择联系他们时才会看到您的兴趣，因此您可以先按自己的方式进行研究。',
      },
    ],
    finalTitle: '准备好发现您的下一个商机了吗？',
    finalSub: '探索柬埔寨企业、按您的标准筛选，并在联系之前审阅验证信息。',
    finalCtaPrimary: '创建您的资料',
    finalCtaSecondary: '了解运作方式',
  },
} as const

export default function ForInvestorsContent() {
  const t = CONTENT[useLang()]

  const benefitIcons = [Search, Filter, Bookmark, ListChecks, BadgeCheck, MessagesSquare]
  const stepIcons = [Users, Filter, MessagesSquare]
  const trustBadgeIcons = [BadgeCheck, Users, Building2, Eye]

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
              <TrendingUp className="h-3.5 w-3.5" /> {t.badge}
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

          {/* Illustrative discovery card */}
          <div
            className="rounded-2xl border p-6 shadow-sm"
            style={{ borderColor: 'var(--cb-line)', background: '#fff', boxShadow: 'var(--cb-shadow)' }}
          >
            <div className="flex items-center gap-2 rounded-lg border px-3 py-2.5" style={{ borderColor: 'var(--cb-line)' }}>
              <Search className="h-4 w-4" style={{ color: 'var(--cb-muted)' }} />
              <span className="text-sm" style={{ color: 'var(--cb-muted)' }}>
                {t.searchPlaceholder}
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {t.results.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center justify-between rounded-lg border px-4 py-3"
                  style={{ borderColor: 'var(--cb-line)' }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white"
                      style={{ background: 'var(--cb-primary)' }}
                    >
                      {c.name.charAt(0)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--cb-ink)' }}>
                        {c.name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--cb-muted)' }}>
                        {c.meta}
                      </p>
                    </div>
                  </div>
                  <span
                    className="rounded-full px-2.5 py-1 text-xs font-bold"
                    style={{ background: 'var(--cb-primary-soft)', color: 'var(--cb-primary-dark)' }}
                  >
                    {c.tag}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-xs" style={{ color: 'var(--cb-muted)' }}>
              {t.illustrative}
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
