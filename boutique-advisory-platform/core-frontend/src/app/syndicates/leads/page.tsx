'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Crown, Users, Layers, Percent, ArrowRight } from 'lucide-react'
import DashboardLayout from '../../../components/layout/DashboardLayout'
import { authorizedRequest } from '../../../lib/api'
import { useFormat } from '@/hooks/useFormat'

interface Lead {
  investorId: string
  name: string
  type: string
  syndicatesLed: number
  totalTarget: number
  totalRaised: number
  followers: number
  avgCarryFee: number
}

export default function SyndicateLeadsPage() {
  const { formatCurrency, formatNumber } = useFormat()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const res = await authorizedRequest('/api/syndicates/leads')
        if (res.ok) setLeads((await res.json()).leads || [])
        else setError('Could not load syndicate leads. Please try again.')
      } catch {
        setError('Could not reach the server. Please try again.')
      } finally { setLoading(false) }
    })()
  }, [])

  const rankStyle = (i: number) =>
    i === 0 ? 'text-amber-300 bg-amber-500/10 border-amber-500/40'
      : i === 1 ? 'text-gray-200 bg-gray-500/10 border-gray-400/40'
        : i === 2 ? 'text-orange-300 bg-orange-500/10 border-orange-500/40'
          : 'text-gray-400 bg-gray-700/30 border-gray-700'

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/15 text-amber-300"><Crown className="w-6 h-6" /></div>
          <div>
            <h1 className="text-3xl font-bold text-white">Syndicate Leads</h1>
            <p className="text-gray-400 mt-1">Back deals alongside proven leads. Ranked by capital raised and track record.</p>
          </div>
        </div>

        {loading && <div className="text-gray-300">Loading leads…</div>}
        {error && !loading && <div className="bg-amber-600/10 border border-amber-500/30 text-amber-300 rounded-xl px-5 py-4">{error}</div>}

        {!loading && !error && leads.length === 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center text-gray-400">
            No syndicate leads yet. Once investors start leading syndicates, they&apos;ll appear here ranked by track record.
          </div>
        )}

        {!loading && !error && leads.length > 0 && (
          <div className="space-y-4">
            {leads.map((lead, i) => (
              <div key={lead.investorId} className="bg-gray-800 border border-gray-700 rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-5">
                <div className="flex items-center gap-4 md:w-64 flex-none">
                  <span className={`flex-none w-9 h-9 rounded-full border flex items-center justify-center text-sm font-bold tabular-nums ${rankStyle(i)}`}>{i + 1}</span>
                  <div>
                    <p className="text-white font-semibold">{lead.name}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{lead.type?.replace(/_/g, ' ')}</p>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-gray-500 flex items-center gap-1"><Layers className="w-3 h-3" /> Syndicates</p>
                    <p className="text-white font-semibold tabular-nums">{formatNumber(lead.syndicatesLed)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-gray-500">Raised</p>
                    <p className="text-white font-semibold tabular-nums">{formatCurrency(lead.totalRaised, 'USD')}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-gray-500 flex items-center gap-1"><Users className="w-3 h-3" /> Followers</p>
                    <p className="text-white font-semibold tabular-nums">{formatNumber(lead.followers)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-gray-500 flex items-center gap-1"><Percent className="w-3 h-3" /> Avg carry</p>
                    <p className="text-white font-semibold tabular-nums">{lead.avgCarryFee}%</p>
                  </div>
                </div>

                <Link href="/syndicates" className="flex-none inline-flex items-center gap-1 text-teal-400 hover:text-teal-300 text-sm font-medium">
                  Their syndicates <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
