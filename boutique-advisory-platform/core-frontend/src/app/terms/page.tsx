import LegalPage from '@/components/public/LegalPage'

export const metadata = { title: 'Terms of Service — CamboBia' }

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      version="1.0"
      effectiveDate="15 July 2026"
      intro="These Terms govern your use of the CamboBia platform. By creating an account or using the platform, you agree to these Terms. Please also read our Privacy Policy and Risk Disclosure."
      sections={[
        { heading: 'About CamboBia', paragraphs: [
          'CamboBia is a connection and information platform that helps Cambodian businesses, investors, and professional advisors create profiles and connect with one another.',
          'CamboBia is not a bank, broker, investment adviser, or financial institution. We do not provide investment, legal, tax, or financial advice, and we do not participate in or guarantee any transaction between users.' ] },
        { heading: 'Eligibility and accounts', paragraphs: [
          'You must be at least 18 years old and able to enter into a binding agreement to use CamboBia. You are responsible for the accuracy of the information you provide and for keeping your account credentials secure.',
          'You agree to provide truthful information and to keep your profile up to date. We may suspend or close accounts that provide false, misleading, or fraudulent information.' ] },
        { heading: 'Acceptable use', paragraphs: [
          'You agree not to misuse the platform, including by impersonating others, posting misleading information, attempting fraud, harvesting data, or interfering with the platform’s operation.',
          'You are responsible for your own communications and decisions. Any agreement you reach with another user is between you and that user.' ] },
        { heading: 'Verification and content', paragraphs: [
          'Verification signals (such as email, identity, business, or credential verification) indicate that certain checks were performed. They are not a guarantee of a user’s quality, solvency, legality, or future performance.',
          'You retain rights to the content you submit but grant CamboBia a licence to display it on the platform as needed to provide the service.' ] },
        { heading: 'No guarantees', paragraphs: [
          'CamboBia does not guarantee funding, investment, returns, advisor performance, business success, or any particular outcome. Use of the platform is at your own risk. See our Risk Disclosure.' ] },
        { heading: 'Fees', paragraphs: [
          'Certain features may carry fees, which will be disclosed before you incur them. Where payments are processed, they are handled by third-party providers subject to their own terms.' ] },
        { heading: 'Limitation of liability', paragraphs: [
          'To the maximum extent permitted by law, CamboBia is not liable for indirect, incidental, or consequential losses, or for losses arising from decisions you make based on information found on the platform.' ] },
        { heading: 'Suspension and termination', paragraphs: [
          'We may suspend or terminate access for breach of these Terms, suspected fraud, or legal reasons. You may close your account at any time.' ] },
        { heading: 'Changes to these Terms', paragraphs: [
          'We may update these Terms. We will post the updated version with a new version number and effective date. Continued use after changes take effect constitutes acceptance.' ] },
        { heading: 'Governing law and contact', paragraphs: [
          'These Terms are governed by the laws of the Kingdom of Cambodia. For questions, contact contact@cambobia.com.' ] },
      ]}
    />
  )
}
