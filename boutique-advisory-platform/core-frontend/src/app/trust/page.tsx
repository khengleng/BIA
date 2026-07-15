import type { Metadata } from 'next'
import TrustContent from './content'

export const metadata: Metadata = {
  title: 'Trust Center — How CamboBia keeps the marketplace credible',
  description:
    'How CamboBia protects accounts, verifies identity, business, investor and advisor credentials, safeguards your data, prevents scams, and handles reports — plus an honest account of what we do and don’t guarantee.',
}

export default function TrustPage() {
  return <TrustContent />
}
