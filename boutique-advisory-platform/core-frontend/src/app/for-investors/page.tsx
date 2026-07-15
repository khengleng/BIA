import type { Metadata } from 'next'
import ForInvestorsContent from './content'

export const metadata: Metadata = {
  title: 'For investors — Discover credible Cambodian businesses | CamboBia',
  description:
    'CamboBia helps investors discover Cambodian businesses, filter opportunities, save profiles, track interests, and review verification information before making contact.',
}

export default function ForInvestorsPage() {
  return <ForInvestorsContent />
}
