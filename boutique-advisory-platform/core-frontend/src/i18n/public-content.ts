'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Bilingual content for the public marketing surface (header, footer, homepage).
 * English is source-of-truth; the Khmer is a working translation that should be
 * reviewed by a native speaker before it is considered final. `usePublicContent`
 * returns the object for the active language and re-renders on language change.
 */
export const PUBLIC_CONTENT = {
  en: {
    nav: {
      howItWorks: 'How it works',
      forBusinesses: 'For businesses',
      forInvestors: 'For investors',
      forAdvisors: 'For advisors',
      opportunities: 'Opportunities',
      login: 'Log in',
      createAccount: 'Create account',
    },
    footer: {
      tagline: 'Where Cambodian businesses meet capital and expertise. Credible profiles, trusted connections, professional advice.',
      colPlatform: 'Platform',
      colAudience: 'Who it’s for',
      colCompany: 'Company',
      colLegal: 'Legal',
      trustSecurity: 'Trust & security',
      faq: 'FAQ',
      about: 'About CamboBia',
      contact: 'Contact',
      terms: 'Terms of Service',
      privacy: 'Privacy Policy',
      risk: 'Risk Disclosure',
      rights: 'All rights reserved.',
      disclaimer: 'CamboBia is a connection and information platform. It does not provide investment, legal, tax, or financial advice and does not guarantee funding, returns, or outcomes.',
    },
    home: {
      badge: 'A trusted marketplace for Cambodian growth',
      headline: 'Where Cambodian businesses meet capital and expertise',
      sub: 'CamboBia helps growing businesses build credible profiles, connect with potential investors, and access trusted professional advisors.',
      ctaPrimary: 'Create your profile',
      ctaSecondary: 'See how it works',
      free: 'Free to create a profile · No investment or funding guaranteed',
      audiencesTitle: 'One platform, three ways to grow',
      audiencesSub: 'Whether you’re raising, investing, or advising — CamboBia gives you a credible, trusted place to connect.',
      aBizTitle: 'For businesses',
      aBizBody: 'Build a credible business profile, connect with advisors, present your funding needs, and increase your visibility to potential investors.',
      aBizCta: 'Grow your business',
      aInvTitle: 'For investors',
      aInvBody: 'Discover and filter businesses, save opportunities, track your interests, and review verification information before you connect.',
      aInvCta: 'Discover businesses',
      aAdvTitle: 'For advisors',
      aAdvBody: 'Create a professional profile, show your credentials, offer services, and receive advisory requests from growing businesses.',
      aAdvCta: 'Offer your expertise',
      howTitle: 'How CamboBia works',
      howSub: 'A clear, credible path from profile to connection.',
      step1Title: 'Create a credible profile',
      step1Body: 'Businesses, investors and advisors build verified profiles that show who they are and what they’re looking for.',
      step2Title: 'Discover and connect',
      step2Body: 'Investors filter and save opportunities; advisors and businesses find each other through a trusted, structured directory.',
      step3Title: 'Engage with confidence',
      step3Body: 'Message, ask questions, and progress conversations with verification and trust signals visible throughout.',
      howMore: 'See the full walkthrough',
      trustBadge: 'Built on trust',
      trustTitle: 'Trust you can see, at every step',
      trustSub: 'We use distinct, explained verification signals — never a single vague “verified” label — so everyone knows exactly what has been checked.',
      trustP1: 'Separate email, identity, business, and credential verification',
      trustP2: 'Advisor-reviewed business information',
      trustP3: 'Clear reporting for suspicious activity',
      trustP4: 'Honest limitations — we connect, we don’t guarantee outcomes',
      trustCta: 'Visit the Trust Center',
      finalTitle: 'Ready to build your credible profile?',
      finalSub: 'Join Cambodian businesses, investors, and advisors building trusted connections on CamboBia.',
      finalCtaSecondary: 'Talk to our team',
      badgeEmail: 'Email verified',
      badgeIdentity: 'Identity verified',
      badgeBusiness: 'Business verified',
      badgeCredentials: 'Credentials verified',
    },
  },
  km: {
    nav: {
      howItWorks: 'របៀបដំណើរការ',
      forBusinesses: 'សម្រាប់អាជីវកម្ម',
      forInvestors: 'សម្រាប់វិនិយោគិន',
      forAdvisors: 'សម្រាប់អ្នកប្រឹក្សា',
      opportunities: 'ឱកាស',
      login: 'ចូល',
      createAccount: 'បង្កើតគណនី',
    },
    footer: {
      tagline: 'កន្លែងដែលអាជីវកម្មកម្ពុជាជួបនឹងដើមទុន និងជំនាញ។ ប្រវត្តិរូបគួរឱ្យទុកចិត្ត ការតភ្ជាប់ដែលអាចទុកចិត្តបាន និងការប្រឹក្សាដោយអ្នកជំនាញ។',
      colPlatform: 'វេទិកា',
      colAudience: 'សម្រាប់នរណា',
      colCompany: 'ក្រុមហ៊ុន',
      colLegal: 'ផ្លូវច្បាប់',
      trustSecurity: 'ការទុកចិត្ត និងសុវត្ថិភាព',
      faq: 'សំណួរ​ចម្លើយ',
      about: 'អំពី CamboBia',
      contact: 'ទំនាក់ទំនង',
      terms: 'លក្ខខណ្ឌប្រើប្រាស់',
      privacy: 'គោលការណ៍ភាពឯកជន',
      risk: 'ការបង្ហាញអំពីហានិភ័យ',
      rights: 'រក្សាសិទ្ធិគ្រប់យ៉ាង។',
      disclaimer: 'CamboBia គឺជាវេទិកាភ្ជាប់ទំនាក់ទំនង និងព័ត៌មាន។ វាមិនផ្តល់ការប្រឹក្សាផ្នែកវិនិយោគ ច្បាប់ ពន្ធ ឬហិរញ្ញវត្ថុ ហើយមិនធានាការផ្តល់មូលនិធិ ប្រាក់ចំណេញ ឬលទ្ធផលឡើយ។',
    },
    home: {
      badge: 'ទីផ្សារដែលអាចទុកចិត្តបានសម្រាប់កំណើនកម្ពុជា',
      headline: 'កន្លែងដែលអាជីវកម្មកម្ពុជាជួបនឹងដើមទុន និងជំនាញ',
      sub: 'CamboBia ជួយអាជីវកម្មដែលកំពុងរីកចម្រើនបង្កើតប្រវត្តិរូបគួរឱ្យទុកចិត្ត ភ្ជាប់ជាមួយវិនិយោគិនសក្តានុពល និងទទួលបានអ្នកប្រឹក្សាជំនាញដែលអាចទុកចិត្តបាន។',
      ctaPrimary: 'បង្កើតប្រវត្តិរូបរបស់អ្នក',
      ctaSecondary: 'មើលរបៀបដំណើរការ',
      free: 'បង្កើតប្រវត្តិរូបដោយឥតគិតថ្លៃ · មិនធានាការវិនិយោគ ឬមូលនិធិ',
      audiencesTitle: 'វេទិកាតែមួយ បីមធ្យោបាយរីកចម្រើន',
      audiencesSub: 'មិនថាអ្នករកមូលនិធិ វិនិយោគ ឬផ្តល់ការប្រឹក្សា — CamboBia ផ្តល់ឱ្យអ្នកនូវកន្លែងគួរឱ្យទុកចិត្តដើម្បីភ្ជាប់ទំនាក់ទំនង។',
      aBizTitle: 'សម្រាប់អាជីវកម្ម',
      aBizBody: 'បង្កើតប្រវត្តិរូបអាជីវកម្មគួរឱ្យទុកចិត្ត ភ្ជាប់ជាមួយអ្នកប្រឹក្សា បង្ហាញតម្រូវការមូលនិធិ និងបង្កើនភាពមើលឃើញរបស់អ្នកចំពោះវិនិយោគិន។',
      aBizCta: 'ពង្រីកអាជីវកម្មរបស់អ្នក',
      aInvTitle: 'សម្រាប់វិនិយោគិន',
      aInvBody: 'ស្វែងរក និងត្រងអាជីវកម្ម រក្សាទុកឱកាស តាមដានចំណាប់អារម្មណ៍ និងពិនិត្យព័ត៌មានផ្ទៀងផ្ទាត់មុនពេលភ្ជាប់ទំនាក់ទំនង។',
      aInvCta: 'ស្វែងរកអាជីវកម្ម',
      aAdvTitle: 'សម្រាប់អ្នកប្រឹក្សា',
      aAdvBody: 'បង្កើតប្រវត្តិរូបជំនាញ បង្ហាញលិខិតបញ្ជាក់ ផ្តល់សេវាកម្ម និងទទួលសំណើប្រឹក្សាពីអាជីវកម្មដែលកំពុងរីកចម្រើន។',
      aAdvCta: 'ផ្តល់ជំនាញរបស់អ្នក',
      howTitle: 'របៀបដែល CamboBia ដំណើរការ',
      howSub: 'ផ្លូវច្បាស់លាស់ និងគួរឱ្យទុកចិត្តពីប្រវត្តិរូបទៅការតភ្ជាប់។',
      step1Title: 'បង្កើតប្រវត្តិរូបគួរឱ្យទុកចិត្ត',
      step1Body: 'អាជីវកម្ម វិនិយោគិន និងអ្នកប្រឹក្សាបង្កើតប្រវត្តិរូបដែលបានផ្ទៀងផ្ទាត់ ដែលបង្ហាញពីអត្តសញ្ញាណ និងអ្វីដែលពួកគេកំពុងស្វែងរក។',
      step2Title: 'ស្វែងរក និងភ្ជាប់ទំនាក់ទំនង',
      step2Body: 'វិនិយោគិនត្រង និងរក្សាទុកឱកាស អ្នកប្រឹក្សា និងអាជីវកម្មស្វែងរកគ្នាតាមរយៈបញ្ជីដែលមានរចនាសម្ព័ន្ធ និងគួរឱ្យទុកចិត្ត។',
      step3Title: 'ចូលរួមដោយទំនុកចិត្ត',
      step3Body: 'ផ្ញើសារ សួរសំណួរ និងបន្តការសន្ទនាដោយមានសញ្ញាផ្ទៀងផ្ទាត់ និងទំនុកចិត្តបង្ហាញពេញមួយដំណើរការ។',
      howMore: 'មើលការណែនាំពេញលេញ',
      trustBadge: 'បង្កើតលើមូលដ្ឋានទំនុកចិត្ត',
      trustTitle: 'ទំនុកចិត្តដែលអ្នកអាចមើលឃើញ នៅគ្រប់ជំហាន',
      trustSub: 'យើងប្រើសញ្ញាផ្ទៀងផ្ទាត់ដាច់ដោយឡែក និងមានការពន្យល់ច្បាស់លាស់ — មិនមែនស្លាក “បានផ្ទៀងផ្ទាត់” តែមួយមិនច្បាស់ឡើយ — ដូច្នេះមនុស្សគ្រប់គ្នាដឹងច្បាស់ថាអ្វីត្រូវបានពិនិត្យ។',
      trustP1: 'ការផ្ទៀងផ្ទាត់អ៊ីមែល អត្តសញ្ញាណ អាជីវកម្ម និងលិខិតបញ្ជាក់ដាច់ដោយឡែក',
      trustP2: 'ព័ត៌មានអាជីវកម្មដែលបានពិនិត្យដោយអ្នកប្រឹក្សា',
      trustP3: 'ការរាយការណ៍ច្បាស់លាស់សម្រាប់សកម្មភាពគួរឱ្យសង្ស័យ',
      trustP4: 'ដែនកំណត់ដោយស្មោះត្រង់ — យើងភ្ជាប់ទំនាក់ទំនង យើងមិនធានាលទ្ធផលឡើយ',
      trustCta: 'ចូលមើលមជ្ឈមណ្ឌលទំនុកចិត្ត',
      finalTitle: 'ត្រៀមខ្លួនបង្កើតប្រវត្តិរូបគួរឱ្យទុកចិត្តរបស់អ្នកហើយឬនៅ?',
      finalSub: 'ចូលរួមជាមួយអាជីវកម្ម វិនិយោគិន និងអ្នកប្រឹក្សាកម្ពុជាដែលកំពុងបង្កើតការតភ្ជាប់គួរឱ្យទុកចិត្តនៅលើ CamboBia។',
      finalCtaSecondary: 'និយាយជាមួយក្រុមការងាររបស់យើង',
      badgeEmail: 'អ៊ីមែលបានផ្ទៀងផ្ទាត់',
      badgeIdentity: 'អត្តសញ្ញាណបានផ្ទៀងផ្ទាត់',
      badgeBusiness: 'អាជីវកម្មបានផ្ទៀងផ្ទាត់',
      badgeCredentials: 'លិខិតបញ្ជាក់បានផ្ទៀងផ្ទាត់',
    },
  },
} as const

export type PublicContent = (typeof PUBLIC_CONTENT)['en']

export function usePublicContent(): PublicContent {
  const { i18n } = useTranslation()
  // The server can't know the visitor's saved language, so it always renders
  // English. Match that on the first client paint (mounted=false) to avoid a
  // hydration text mismatch (React #418), then switch to the real language.
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const isKm = mounted && (i18n.language || 'en').startsWith('km')
  return PUBLIC_CONTENT[isKm ? 'km' : 'en']
}
