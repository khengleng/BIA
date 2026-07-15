import type { Metadata } from 'next'
import HowItWorksContent from './content'

export const metadata: Metadata = {
  title: 'How CamboBia works — from credible profile to trusted connection',
  description:
    'A clear walkthrough of how CamboBia works for businesses, investors, and advisors: create a credible profile, discover and connect, and engage with confidence.',
}

export default function HowItWorksPage() {
  return <HowItWorksContent />
}
