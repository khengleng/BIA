import type { Metadata } from 'next'
import ForBusinessesContent from './content'

export const metadata: Metadata = {
  title: 'For businesses — Build a credible profile and get discovered | CamboBia',
  description:
    'CamboBia helps Cambodian SMEs build a credible business profile, connect with trusted advisors, present funding needs clearly, and increase visibility to potential investors.',
}

export default function ForBusinessesPage() {
  return <ForBusinessesContent />
}
