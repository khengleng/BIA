import type { Metadata } from 'next'
import HomeContent from '@/components/public/HomeContent'

export const metadata: Metadata = {
  title: 'CamboBia — Where Cambodian businesses meet capital and expertise',
  description:
    'CamboBia helps growing Cambodian businesses build credible profiles, connect with potential investors, and access trusted professional advisors.',
}

export default function HomePage() {
  return <HomeContent />
}
