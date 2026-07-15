'use client'

import { useEffect, useState } from 'react'
import { PieChart, Building2 } from 'lucide-react'
import { authorizedRequest } from '../lib/api'
import { useFormat } from '@/hooks/useFormat'

interface Shareholder { name: string; type: string; amount: number; ownershipPct: number | null }
interface CapData {
  deal: { title: string; smeName: string; roundAmount: number; equityPct: number | null; committed: number; fundedPct: number; postMoneyValuation: number | null }
  founders: { ownershipPct: number } | null
  shareholders: Shareholder[]
  amountsOnly: boolean
}

const COLORS = ['#0F5257', '#C68A2E', '#2C7A57', '#3B6EA5', '#8A5A8F', '#B0761A', '#4C8C7D', '#9A6B4B']

export default function CapTable({ dealId }: { dealId: string }) {
  const { formatCurrency } = useFormat()
  const [data, setData] = useState<CapData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const res = await authorizedRequest(`/api/cap-table/${dealId}`)
        if (res.ok) setData(await res.json())
      } catch { /* leave null */ } finally { setLoading(false) }
    })()
  }, [dealId])

  if (loading) return <section className="bg-gray-800 border border-gray-700 rounded-2xl p-6 text-gray-400 text-sm">Loading cap table…</section>
  if (!data) return null

  const rows: { label: string; sub: string; pct: number | null; amount: number | null; color: string }[] = []
  if (data.founders) rows.push({ label: 'Founders', sub: data.deal.smeName, pct: data.founders.ownershipPct, amount: null, color: '#4B5563' })
  data.shareholders.forEach((s, i) => rows.push({
    label: s.name, sub: s.type?.replace(/_/g, ' ') || 'Investor', pct: s.ownershipPct, amount: s.amount, color: COLORS[i % COLORS.length]
  }))

  return (
    <section className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white"><PieChart className="w-5 h-5 text-teal-400" /> Cap table</h2>
        <span className="text-xs text-gray-400">{data.deal.fundedPct}% funded</span>
      </div>

      {/* Round summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        <div><p className="text-[11px] uppercase tracking-wider text-gray-500">Round</p><p className="text-white font-semibold tabular-nums">{formatCurrency(data.deal.roundAmount, 'USD')}</p></div>
        <div><p className="text-[11px] uppercase tracking-wider text-gray-500">Committed</p><p className="text-white font-semibold tabular-nums">{formatCurrency(data.deal.committed, 'USD')}</p></div>
        <div><p className="text-[11px] uppercase tracking-wider text-gray-500">Equity sold</p><p className="text-white font-semibold tabular-nums">{data.deal.equityPct != null ? `${data.deal.equityPct}%` : '—'}</p></div>
        <div><p className="text-[11px] uppercase tracking-wider text-gray-500">Post-money</p><p className="text-white font-semibold tabular-nums">{data.deal.postMoneyValuation != null ? formatCurrency(data.deal.postMoneyValuation, 'USD') : '—'}</p></div>
      </div>

      {data.amountsOnly && (
        <p className="text-xs text-amber-300/80 mb-3">Set the deal&apos;s equity % to see ownership percentages and valuation.</p>
      )}

      {/* Ownership bar */}
      {!data.amountsOnly && (
        <div className="flex h-3 rounded-full overflow-hidden mb-4 border border-gray-700">
          {rows.filter(r => r.pct != null).map((r, i) => (
            <div key={i} style={{ width: `${r.pct}%`, background: r.color }} title={`${r.label}: ${r.pct}%`}></div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-xs uppercase tracking-wider text-left">
              <th className="pb-2 font-semibold">Holder</th>
              <th className="pb-2 font-semibold text-right">Invested</th>
              <th className="pb-2 font-semibold text-right">Ownership</th>
            </tr>
          </thead>
          <tbody className="text-gray-200">
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-gray-700/60">
                <td className="py-2 pr-2">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm flex-none" style={{ background: r.color }}></span>
                    <span>{r.label}{r.label === 'Founders' && <Building2 className="inline w-3 h-3 ml-1 text-gray-500" />}</span>
                  </span>
                  <span className="block text-xs text-gray-500 ml-[18px]">{r.sub}</span>
                </td>
                <td className="py-2 text-right tabular-nums">{r.amount != null ? formatCurrency(r.amount, 'USD') : '—'}</td>
                <td className="py-2 text-right tabular-nums font-medium">{r.pct != null ? `${r.pct}%` : '—'}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={3} className="py-3 text-gray-400">No committed investors yet.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 mt-3">Illustrative: founders hold residual equity; investor stakes are pro-rata of the equity sold this round.</p>
    </section>
  )
}
