'use client'

import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { ShieldCheck, KeyRound, History, Users, AlertTriangle } from 'lucide-react'

const controls = [
  {
    title: 'Session Governance',
    description: 'Review and revoke active operator sessions across browsers and devices.',
    href: '/trading/sessions',
    cta: 'Manage Sessions',
    icon: Users,
  },
  {
    title: 'Role & Access Controls',
    description: 'Apply least-privilege role grants for trading operations and compliance.',
    href: '/trading/operator/role-lifecycle',
    cta: 'Open Role Lifecycle',
    icon: KeyRound,
  },
  {
    title: 'Security Audit Trail',
    description: 'Inspect immutable access and policy change logs for investigations.',
    href: '/trading/operator/audit',
    cta: 'Open Audit Trail',
    icon: History,
  },
]

export default function TradingOperatorSecurityPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-blue-400 mt-1" />
            <div>
              <h1 className="text-3xl font-bold text-white">Trading Platform Security</h1>
              <p className="text-gray-400 mt-2">
                Configure operator-level safeguards for listing controls, transaction oversight, and incident response.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {controls.map((control) => {
            const Icon = control.icon
            return (
              <div key={control.title} className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <Icon className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-semibold text-white mt-4">{control.title}</h2>
                <p className="text-gray-400 mt-2">{control.description}</p>
                <Link
                  href={control.href}
                  className="inline-flex mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                >
                  {control.cta}
                </Link>
              </div>
            )
          })}
        </div>

        <div className="bg-amber-900/20 border border-amber-700/40 rounded-xl p-5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-300 mt-0.5" />
          <p className="text-amber-100 text-sm">
            Trading operator credentials should not be used for investor trading actions. Use operator roles only for
            platform governance, compliance, and operational controls.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
