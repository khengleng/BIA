import type { Metadata } from 'next'
import OpportunitiesContent from './content'

export const metadata: Metadata = {
  title: 'Opportunities — CamboBia',
  description:
    'Discover credible Cambodian businesses seeking capital and expertise. Create a free account to browse live opportunities with verification you can see.',
}

export default function OpportunitiesPage() {
  return <OpportunitiesContent />
}
