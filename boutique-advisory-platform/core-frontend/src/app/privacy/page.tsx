import LegalPage from '@/components/public/LegalPage'

export const metadata = { title: 'Privacy Policy — CamboBia' }

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      version="1.0"
      effectiveDate="15 July 2026"
      intro="This Privacy Policy explains what information CamboBia collects, how we use it, and the choices you have. We aim to collect only what we need to run the platform and to keep your information secure."
      sections={[
        { heading: 'Information we collect', paragraphs: [
          'Account information you provide, such as your name, email, role, and password (stored securely, never in plain text).',
          'Profile information you choose to add, such as business details, investor preferences, or advisor credentials — some of which you decide to make public.',
          'Verification information used to confirm identity, business registration, or credentials where applicable.',
          'Usage information, such as pages viewed and actions taken, used to operate and improve the platform.' ] },
        { heading: 'How we use your information', paragraphs: [
          'To create and manage your account, display your profile as you choose, enable connections between users, verify information, prevent fraud, and improve the service.',
          'We use privacy-safe analytics to understand how the platform is used. We do not send passwords, identity numbers, uploaded documents, financial documents, or private messages to analytics tools.' ] },
        { heading: 'What is public vs private', paragraphs: [
          'You control which profile information is public. Sensitive personal information (such as identity numbers) is encrypted and never shown publicly. Private messages are visible only to the participants.' ] },
        { heading: 'Sharing', paragraphs: [
          'We share information with service providers who help us operate the platform (such as hosting, email, and verification providers) under appropriate confidentiality obligations. We do not sell your personal information.',
          'We may disclose information where required by law or to protect the platform and its users.' ] },
        { heading: 'Data security', paragraphs: [
          'We use encryption for sensitive data at rest and in transit, access controls, and audit logging. No system is perfectly secure, but we work to protect your information and to respond promptly to issues.' ] },
        { heading: 'Your choices', paragraphs: [
          'You can view and update your profile, control what is public, manage marketing preferences separately from required legal acceptances, and request account closure.',
          'Marketing communications are optional and separate from essential service messages. You can opt out at any time.' ] },
        { heading: 'Data retention', paragraphs: [
          'We keep information for as long as your account is active and as needed to provide the service, comply with legal obligations, and resolve disputes.' ] },
        { heading: 'Children', paragraphs: [
          'CamboBia is intended for users aged 18 and over and is not directed at children.' ] },
        { heading: 'Changes and contact', paragraphs: [
          'We may update this Policy and will post a new version number and effective date. For privacy questions or requests, contact contact@cambobia.com.' ] },
      ]}
    />
  )
}
