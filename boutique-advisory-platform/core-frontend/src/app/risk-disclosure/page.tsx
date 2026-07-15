import LegalPage from '@/components/public/LegalPage'

export const metadata = { title: 'Risk Disclosure — CamboBia' }

export default function RiskDisclosurePage() {
  return (
    <LegalPage
      title="Risk Disclosure"
      version="1.0"
      effectiveDate="15 July 2026"
      intro="Please read this Risk Disclosure carefully. CamboBia is a connection and information platform. It is important to understand what CamboBia does — and does not — do before you make any decision."
      sections={[
        { heading: 'CamboBia does not guarantee outcomes', paragraphs: [
          'CamboBia does not guarantee that a business will receive funding, that an investor will find suitable opportunities, that an advisor will perform to expectation, or that any business will succeed. We provide a platform to connect and inform — not a guarantee of results.' ] },
        { heading: 'Not financial, legal, or investment advice', paragraphs: [
          'Information on the platform is for general purposes and is not investment, legal, tax, or financial advice. You should seek independent professional advice before making financial or legal decisions.' ] },
        { heading: 'Investment involves risk', paragraphs: [
          'Investing in businesses — especially small and growing businesses — carries significant risk, including the risk of losing your entire investment. Past performance is not an indicator of future results. Only invest what you can afford to lose.',
          'Early-stage and private-business investments can be illiquid, meaning you may not be able to sell or exit your position easily or at all.' ] },
        { heading: 'Verification has limits', paragraphs: [
          'Verification signals indicate that specific checks were performed at a point in time. They are not a guarantee of a user’s honesty, solvency, legality, or future conduct. Always do your own due diligence.' ] },
        { heading: 'Your responsibility', paragraphs: [
          'You are responsible for your own decisions and for conducting appropriate due diligence before entering into any agreement with another user. Any agreement you reach is between you and the other party.' ] },
        { heading: 'Fraud awareness', paragraphs: [
          'Be cautious of anyone who pressures you, promises guaranteed returns, or asks you to transact outside the platform. Report suspicious activity to us so we can investigate. See our Trust Center for guidance.' ] },
        { heading: 'Regulatory status', paragraphs: [
          'CamboBia operates as a connection and information platform. Where activities require licensing or regulatory approval, those are addressed separately, and certain features may be limited until such requirements are met.' ] },
        { heading: 'Contact', paragraphs: [
          'If you have questions about this disclosure, contact contact@cambobia.com.' ] },
      ]}
    />
  )
}
