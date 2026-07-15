import type { Metadata } from 'next'
import ForAdvisorsContent from './content'

export const metadata: Metadata = {
  title: 'For advisors — Showcase your expertise and support SMEs | CamboBia',
  description:
    'CamboBia helps professional advisors build a credible profile, showcase their credentials, offer services, connect with businesses, and manage advisory requests and consultations.',
}

export default function ForAdvisorsPage() {
  return <ForAdvisorsContent />
}
