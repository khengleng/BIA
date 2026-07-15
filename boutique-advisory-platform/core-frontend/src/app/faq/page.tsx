import type { Metadata } from 'next'
import FaqContent from './content'

export const metadata: Metadata = {
  title: 'Frequently asked questions — CamboBia',
  description:
    'Answers to common questions about CamboBia: how it works, verification, whether it’s free, safety and reporting, supported languages, and how to get in touch.',
}

export default function FaqPage() {
  return <FaqContent />
}
