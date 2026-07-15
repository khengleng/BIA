import type { Metadata } from 'next'
import AboutContent from './content'

export const metadata: Metadata = {
  title: 'About CamboBia — connecting Cambodian businesses with capital and expertise',
  description:
    'CamboBia exists to close Cambodia’s SME financing and trust gap by connecting businesses, investors, and advisors on a credible, transparent platform.',
}

export default function AboutPage() {
  return <AboutContent />
}
