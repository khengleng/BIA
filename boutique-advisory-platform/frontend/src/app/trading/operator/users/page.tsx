'use client'

import TradingOperatorModulePage from '@/components/trading/operator/TradingOperatorModulePage'

export default function TradingOperatorUsersPage() {
  return (
    <TradingOperatorModulePage
      title="Operator Account Management"
      description="Manage platform-operator accounts for the trading exchange independently from cambobia.com tenant users."
      metrics={[
        { label: 'Scope', value: 'Trade Platform', tone: 'neutral' },
        { label: 'Managed Roles', value: 'Admin / FinOps / CX / Auditor', tone: 'neutral' },
      ]}
      actions={[
        {
          href: '/trading/operator/role-lifecycle',
          title: 'Role Grants',
          description: 'Assign or revoke least-privilege grants for trading operations.',
        },
        {
          href: '/trading/operator/audit',
          title: 'Access Audit',
          description: 'Review privileged access changes and operator activity logs.',
        },
      ]}
      note="Use this module for exchange operator governance only. Investor/SME/advisor account workflows remain on cambobia.com."
    />
  )
}
