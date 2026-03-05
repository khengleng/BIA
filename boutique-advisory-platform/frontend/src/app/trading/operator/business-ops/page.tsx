'use client'

import TradingOperatorModulePage from '@/components/trading/operator/TradingOperatorModulePage'

export default function TradingOperatorBusinessOpsPage() {
  return (
    <TradingOperatorModulePage
      title="Trading Business Operations"
      description="Monitor exchange growth KPIs, liquidity depth, and operating readiness for the secondary market business."
      actions={[
        {
          href: '/trading/operator/analytics',
          title: 'Liquidity Analytics',
          description: 'Inspect listing depth, execution velocity, and trader conversion.',
        },
        {
          href: '/trading/operator/reports',
          title: 'Operational Reports',
          description: 'Review operator-ready reports across trading activity and demand.',
        },
      ]}
    />
  )
}
